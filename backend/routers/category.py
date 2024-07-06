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
async def get_categories():
    app = Remember('/data/master.pkl')
    return app.get_categories(verbose=True)


@router.get('/{category_id}')
async def get_category(category_id:str):
    app = Remember('/data/master.pkl')
    return app.get_category(category_id, verbose=True)


@router.post('/')
async def add_category(category: CategoryData):
    app = Remember('/data/master.pkl')
    _category = Category(category.name)
    return app.add_category(_category)


@router.delete('/{category_id}')
async def remove_category(category_id: str):
    app = Remember('/data/master.pkl')
    return app.remove_category(category_id)


@router.get('/id_to_name/{category_id}')
async def id_to_name(category_id:str):
    app = Remember('/data/master.pkl')
    for k,v in app.data.items():
        if k == category_id:
            return JSONResponse(content=v.name)
    return JSONResponse(content="Not Found", status_code=404)
