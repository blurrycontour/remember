import os
import subprocess

from remember.backup import CloudBackup
from remember import TelegramBot
from remember.utils import try_except_decorator


MONGODB_STRING = os.getenv("MONGODB_STRING")
BACKUP_FILE = "/data/backup/mongodb.dump.gz"


@try_except_decorator(error_msg="Failed to create mongodump backup")
def create_backup():
    """ Create a backup of the database. """
    if os.path.exists(BACKUP_FILE):
        os.remove(BACKUP_FILE)

    subprocess.run([
        "mongodump",
        f"--uri={MONGODB_STRING}",
        f"--archive={BACKUP_FILE}",
        "--gzip",
        "--ssl",
        "--sslCAFile=/etc/ssl/mongodb/ca.pem",
        "--sslPEMKeyFile=/etc/ssl/mongodb/mongodb.pem",
        "--tlsInsecure",
    ], check=True)

    return True


if __name__ == '__main__':
    r1 = create_backup()

    backup = CloudBackup()
    size, r2 = backup.get_file_size(BACKUP_FILE)
    r3 = backup.backup_to_gcs(BACKUP_FILE)
    r4 = backup.backup_to_s3(BACKUP_FILE)

    # Notify status
    if all([r1,r2,r3,r4]):
        TelegramBot().send_notification(message=f"Backup finished\n\[{size}]")
    else:
        TelegramBot().send_notification(message="Backup failed!")
