from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from remember import Remember, Category

from ..dependencies import CategoryData, get_current_user


router = APIRouter(
    prefix="/category",
    tags=["category"],
    dependencies=[Depends(get_current_user)]
)
print('> Loading category router')


@router.get('/')
async def get_categories(user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    return app.get_categories(user_id=user["user_id"])


@router.get('/{category_id}')
async def get_category(category_id:str, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    return app.get_category(category_id=category_id, user_id=user["user_id"])


@router.post('/')
async def add_category(category: CategoryData, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    _category = Category(category.name, category.description)
    return app.add_category(category=_category, user_id=user["user_id"])


@router.delete('/{category_id}')
async def remove_category(category_id: str, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    return app.remove_category(category_id=category_id, user_id=user["user_id"])
