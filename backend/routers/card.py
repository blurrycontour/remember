from fastapi import APIRouter
from fastapi.responses import JSONResponse

from remember import Remember, FlashCard

from ..dependencies import CardData


router = APIRouter(
    prefix="/card",
    tags=["card"],
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
