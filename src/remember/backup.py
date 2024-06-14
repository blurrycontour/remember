from datetime import datetime
import os

import boto3
from botocore.exceptions import ClientError
from google.cloud import storage


def backup_to_s3(file_path:str):
    """ Backup the data to S3 """
    bucket_name = "remember-app-bucket"

    object_name = os.path.basename(file_path)
    object_name_base = object_name
    object_name = f"{datetime.now().strftime('%Y-%m-%d--%H-00-00')}--{object_name}"

    s3_client = boto3.client(service_name='s3')

    try:
        s3_client.upload_file(file_path, bucket_name, object_name)
        s3_client.upload_file(file_path, bucket_name, object_name_base)
    except ClientError as e:
        print(f'Error: {e}')


def backup_to_gcs(file_path:str):
    """ Backup the data to GCS """
    bucket_name = "remember-app-bucket"

    object_name = os.path.basename(file_path)
    object_name_base = object_name
    object_name = f"{datetime.now().strftime('%Y-%m-%d--%H-00-00')}--{object_name}"

    credentials_file = os.path.expanduser("~/.gcp/credentials.json")
    storage_client = storage.Client.from_service_account_json(credentials_file)

    bucket = storage_client.bucket(bucket_name)

    blob = bucket.blob(object_name)
    blob.upload_from_filename(file_path)

    blob = bucket.blob(object_name_base)
    blob.upload_from_filename(file_path)


def download_from_gcs(file_path:str):
    """ Download the data from GCS """
    bucket_name = "remember-app-bucket"

    object_name = os.path.basename(file_path)

    credentials_file = os.path.expanduser("~/.gcp/credentials.json")
    storage_client = storage.Client.from_service_account_json(credentials_file)

    bucket = storage_client.bucket(bucket_name)

    blob = bucket.blob(object_name)

    blob.download_to_filename(file_path)
