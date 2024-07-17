from pathlib import Path
from typing import Annotated
import os
from datetime import datetime

from fastapi import APIRouter, Depends

from remember import Remember

from ..dependencies import get_current_user
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
