from typing import Annotated

from fastapi import APIRouter, Depends

from remember import Remember, Category

from ..dependencies import CategoryData, get_current_user
from ..utils import json_response_wrapper


router = APIRouter(
    prefix="/category",
    tags=["category"],
    dependencies=[Depends(get_current_user)]
)
print('> Loading category router')


@router.get('/')
async def get_categories(user: Annotated[dict, Depends(get_current_user)], meta:bool=False):
    app = Remember()
    out = app.get_categories(meta=meta, user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.get('/{category_id}')
async def get_category(category_id:str, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    out = app.get_category(category_id=category_id, user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.post('/')
async def add_category(category: CategoryData, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    category = Category(category.name, category.description)
    out = app.add_category(category=category, user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.put('/{category_id}')
async def update_category(category_id: str, category: CategoryData, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    out = app.update_category(category_id=category_id, user_id=user["user_id"], name=category.name, description=category.description)
    return json_response_wrapper(*out)


@router.delete('/{category_id}')
async def remove_category(category_id: str, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    out = app.remove_category(category_id=category_id, user_id=user["user_id"])
    return json_response_wrapper(*out)
