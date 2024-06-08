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
    return "Main Endpoint"


@router.post('/reload')
async def reload_backend():
    Path('./z.reload').touch()
    return "Reloading backend"


@router.get('/show')
async def show():
    app = Remember('/data/master.pkl')
    return app.get_all(verbose=True)
