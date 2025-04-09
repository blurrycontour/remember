import os
from datetime import datetime

from fastapi import APIRouter, Request
import requests

from ..utils import json_response_wrapper


router = APIRouter(
    prefix="/public",
    tags=["public"]
)
print('> Loading public router')


@router.get('/')
async def home():
    return "OK"


@router.get('/build')
async def get_build_info():
    """ Get the build information """
    version = os.getenv('BUILD_VERSION', None)
    info = {
        "version": version,
        "date": datetime.strftime(datetime.now(), "%Y-%m-%d %H:%M:%S")
    }
    return json_response_wrapper(info, True)


@router.get('/ip-info')
async def get_ip_info(request: Request, language:str="en"):
    """ Get the ip information """
    find_ip_token = os.getenv('FIND_IP_TOKEN', None)

    # Get the client IP address
    client_ip = request.headers.get('X-Real-IP')
    print(f"Client IP: {client_ip}")

    if find_ip_token:
        url = f"https://api.findip.net/{client_ip}/?token={find_ip_token}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200 and response.json() is not None:
            data = response.json()
            out = {
                "ip": client_ip,
                "city": data["city"]["names"][language],
                "country": data["country"]["names"][language],
                "latitude": data["location"]["latitude"],
                "longitude": data["location"]["longitude"],
                "isp": data["traits"]["isp"],
                "tz": data["location"]["time_zone"],
                "language": language,
                "success": True
            }
            return json_response_wrapper(out, True)

    return json_response_wrapper("Unable to get IP information", False)
