import os
import subprocess

from remember.backup import CloudBackup


MONGODB_STRING = os.getenv("MONGODB_STRING")
BACKUP_FILE = "/data/backup/mongodb.dump.gz"


def create_backup():
    """ Create a backup of the database. """
    if os.path.exists(BACKUP_FILE):
        os.remove(BACKUP_FILE)

    subprocess.run([
        "mongodump",
        f"--uri={MONGODB_STRING}",
        f"--archive={BACKUP_FILE}",
        "--gzip"
    ], check=True)


if __name__ == '__main__':
    create_backup()
    backup = CloudBackup()
    backup.backup_to_gcs(BACKUP_FILE)
    backup.backup_to_s3(BACKUP_FILE)
