from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from remember import Remember

from ..dependencies import get_current_user
from ..utils import json_response_wrapper


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
    app = Remember()
    out = app.accounts.add_user(user)
    return json_response_wrapper(*out)


@router.delete('/user')
async def delete_user(user: Annotated[dict, Depends(get_current_user)]):
    """
    Delete exisiting user.
    """
    app = Remember()
    out = app.accounts.delete_user(user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.get('/stats')
async def get_stats(user: Annotated[dict, Depends(get_current_user)]):
    """
    Get user stats.
    """
    app = Remember()
    out = app.statistics.get_stats(user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.delete('/stats')
async def reset_stats(user: Annotated[dict, Depends(get_current_user)]):
    """
    Reset user stats.
    """
    app = Remember()
    out = app.statistics.reset_stats(user_id=user["user_id"])
    return json_response_wrapper(*out)
