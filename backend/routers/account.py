from typing import Annotated

from fastapi import APIRouter, Depends

from ..dependencies import get_current_user


router = APIRouter(
    prefix="/account",
    tags=["account"],
)
print('> Loading account router')


@router.get('/')
async def home():
    return "OK"

@router.get('/user')
async def firebase_user(user: Annotated[dict, Depends(get_current_user)]):
    """
    Test endpoint that depends on authenticated firebase
    """
    return user
