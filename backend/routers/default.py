from fastapi import APIRouter
from pathlib import Path

from remember import Remember


router = APIRouter(
    prefix="/main",
    tags=["main"],
)
print('> Loading default router')


@router.get('/')
async def home():
    app = Remember('/data/master.pkl')
    return app.random(verbose=True)


@router.post('/reload')
async def reload_backend():
    Path('./z.reload').touch()
    return "Reloading backend"


@router.get('/show')
async def show():
    app = Remember('/data/master.pkl')
    return app.get_all(verbose=True)


@router.get('/random')
async def random():
    app = Remember('/data/master.pkl')
    return app.random(verbose=True)


@router.get('/random/{category_id}')
async def random_from_category(category_id:str):
    app = Remember('/data/master.pkl')
    return app.random(category_id=category_id, verbose=True)
