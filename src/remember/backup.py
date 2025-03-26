from datetime import datetime
import os
import boto3
from google.cloud import storage

from .utils import try_except_decorator


class CloudBackup:
    """ Backup the data to cloud storage """
    def __init__(self, bucket_name:str=""):
        self.bucket_name = bucket_name
        if not bucket_name:
            self.bucket_name = os.getenv("BUCKET_NAME")
        if not self.bucket_name:
            print("No bucket name provided/found!")


    def __get_object_name(self, file_path:str, empty:bool=False):
        """ Get the object name for the file """
        if not os.path.exists(file_path) and not empty:
            raise FileNotFoundError(f"File does not exist: {file_path}")

        object_name = os.path.basename(file_path)
        object_name_base = object_name
        object_name = f"{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}_{object_name}"
        return object_name, object_name_base


    @try_except_decorator(error_msg="Error getting file size", except_return_value=(None, False))
    def get_file_size(self, file_path:str):
        """ Get backup file size """
        size = os.path.getsize(file_path)
        if size < 1024:
            size_h = f"{size >> 0} Bytes"
        elif size < 1024**2:
            size_h = f"{size >> 10} KB"
        elif size < 1024**3:
            size_h = f"{size >> 20} MB"
        else:
            size_h = f"{size >> 30} GB"

        return size_h, True


    @try_except_decorator(error_msg="Error backing up to S3")
    def backup_to_s3(self, file_path:str):
        """ Backup the data to S3 """
        object_name, object_name_base = self.__get_object_name(file_path)

        s3_client = boto3.client(service_name='s3')
        s3_client.upload_file(file_path, self.bucket_name, object_name)
        s3_client.upload_file(file_path, self.bucket_name, object_name_base)
        print(f"Backup uploaded to S3: {object_name}")
        return True


    @try_except_decorator(error_msg="Error backing up to GCS")
    def backup_to_gcs(self, file_path:str):
        """ Backup the data to GCS """
        object_name, object_name_base = self.__get_object_name(file_path)

        credentials_file = os.path.expanduser("~/.gcp/gcs-credentials.json")
        storage_client = storage.Client.from_service_account_json(credentials_file)

        bucket = storage_client.bucket(self.bucket_name)

        blob = bucket.blob(object_name)
        blob.upload_from_filename(file_path)

        blob = bucket.blob(object_name_base)
        blob.upload_from_filename(file_path)
        print(f"Backup uploaded to GCS: {object_name}")
        return True


    @try_except_decorator(error_msg="Error downloading from GCS")
    def download_from_gcs(self, file_path:str):
        """ Download the data from GCS """
        _, object_name = self.__get_object_name(file_path, empty=True)

        credentials_file = os.path.expanduser("~/.gcp/gcs-credentials.json")
        storage_client = storage.Client.from_service_account_json(credentials_file)

        bucket = storage_client.bucket(self.bucket_name)
        blob = bucket.blob(object_name)
        blob.download_to_filename(file_path)

        print(f"Backup downloaded from GCS: {object_name}")
        return True
