from typing import Annotated

from fastapi import APIRouter, Depends
import pymongo
import os

from ..dependencies import get_current_user


router = APIRouter(
    prefix="/account",
    tags=["account"],
    dependencies=[Depends(get_current_user)]
)
print('> Loading account router')


@router.get('/')
async def home():
    """ Home """
    return "OK"


@router.get('/user')
async def firebase_user(user: Annotated[dict, Depends(get_current_user)]):
    """
    Get firebase user details
    """
    return user


@router.get('/login')
async def user_login(user: Annotated[dict, Depends(get_current_user)]):
    """
    Add user if not exists
    """
    try:
        db_name = os.getenv('ENV').lower()
        mongodb_string = os.getenv('MONGODB_STRING')
        client = pymongo.MongoClient(mongodb_string)
        db = client[db_name]
        collection = db["users"]
        collection.insert_one(user)
        user.pop('_id')
    except Exception as e:
        return f"Error adding user: {e}"

    return user
