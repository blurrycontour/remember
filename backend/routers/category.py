from fastapi import APIRouter

from remember import Remember, Category

from ..dependencies import CategoryData


router = APIRouter(
    prefix="/category",
    tags=["category"],
)
print('> Loading category router')


@router.get('/')
async def home():
    app = Remember('/data/master.pkl')
    return app.get_categories(verbose=True)


@router.get('/show/{category_id}')
async def show(category_id:str):
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
