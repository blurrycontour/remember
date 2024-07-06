from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
import hashlib

from remember import Remember, FlashCard

from ..dependencies import CardData, Code, get_current_user


router = APIRouter(
    prefix="/card",
    tags=["card"],
    dependencies=[Depends(get_current_user)]
)
print('> Loading card router')


@router.get('/{card_id}')
async def get_card(card_id: int):
    app = Remember('/data/master.pkl')
    return app.get_card(card_id, verbose=True)


@router.post('/')
async def add_card(card: CardData):
    app = Remember('/data/master.pkl')
    card = FlashCard(card.category, card.front, card.back)
    return app.add_card(card)


@router.delete('/{card_id}')
async def remove_card(card_id: str):
    app = Remember('/data/master.pkl')
    return app.remove_card(card_id)


@router.post('/check_code')
async def check_code(code: Code):
    hashed_code = hashlib.md5(f"{code.code}:salt@123456789".encode()).hexdigest()
    result = hashed_code == "747cdc2fb2e26e2c02b4f1f648e69f7b"
    return result
