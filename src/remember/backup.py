from datetime import datetime
import os

import boto3
from botocore.exceptions import ClientError


def backup_to_s3(file_path:str):
    """ Backup the data to S3 """
    bucket_name = "remember-app-bucket"

    object_name = os.path.basename(file_path)
    object_name = f"{datetime.now().strftime('%Y-%m-%d')}--{object_name}"

    s3_client = boto3.client(service_name='s3')

    try:
        s3_client.upload_file(file_path, bucket_name, object_name)
    except ClientError as e:
        print(f'Error: {e}')
