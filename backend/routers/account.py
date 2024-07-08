from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
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


@router.post('/user')
async def set_user(user: Annotated[dict, Depends(get_current_user)]):
    """
    Add user if not exists already.
    """
    try:
        db_name = os.getenv('ENVIRONMENT').lower()
        mongodb_string = os.getenv('MONGODB_STRING')
        client = pymongo.MongoClient(mongodb_string)
        db = client[db_name]
        collection = db["users"]
        db_user = user.copy()
        db_user["_id"] = db_user["user_id"]
        # check of db_user exists
        if collection.find_one({"_id": db_user["_id"]}):
            return JSONResponse(content={
                "message": "User already exists!",
                "user": user,
            }, status_code=200)
        else:
            collection.insert_one(db_user)
            return JSONResponse(content={
                "message": "User added!",
                "user": user,
            }, status_code=200)

    except Exception as e:
        return JSONResponse(content={
                "message": f"Error adding user: {e}",
                "user": user,
            }, status_code=500)
