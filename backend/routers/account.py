from typing import Annotated

from fastapi import APIRouter, Depends

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


@router.get('/test/{text}')
async def test_auth(text:str):
    """
    Test endpoint that depends on authenticated firebase
    """
    return text
