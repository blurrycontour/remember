from typing import Annotated

from fastapi import APIRouter, Depends
from pathlib import Path

from remember import Remember

from ..dependencies import get_current_user


router = APIRouter(
    prefix="/main",
    tags=["main"],
    dependencies=[Depends(get_current_user)]
)
print('> Loading default router')


@router.get('/')
async def home():
    return "OK"


@router.post('/reload')
async def reload_backend():
    Path('./z.reload').touch()
    return "Reloading backend"


@router.get('/show')
async def show(user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    return app.get_all(user_id=user["user_id"])


@router.get('/random')
async def random(user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    return app.random(user_id=user["user_id"])


@router.get('/random/{category_id}')
async def random_from_category(category_id:str, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    return app.random(category_id=category_id, user_id=user["user_id"])
