from typing import Annotated

from fastapi import APIRouter, Depends

from remember import FlashCard, Remember

from ..dependencies import CardData, get_current_user
from ..utils import json_response_wrapper


router = APIRouter(
    prefix="/card",
    tags=["card"],
    dependencies=[Depends(get_current_user)]
)
print('> Loading card router')


@router.get('/{card_id}')
async def get_card(card_id: str, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    out = app.get_card(card_id=card_id, user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.post('/')
async def add_card(card: CardData, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    card = FlashCard(card.category_id, card.front, card.back)
    out = app.add_card(card=card, user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.put('/{card_id}')
async def update_card(card_id:str, card: CardData, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    out = app.update_card(card_id=card_id, user_id=user["user_id"], front=card.front, back=card.back, category_id=card.category_id)
    return json_response_wrapper(*out)


@router.delete('/{card_id}')
async def remove_card(card_id: str, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    out = app.remove_card(card_id=card_id, user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.patch('/{card_id}/favorite')
async def favorite_card(card_id: str, user: Annotated[dict, Depends(get_current_user)]):
    app = Remember()
    out = app.favorite_card(card_id=card_id, user_id=user["user_id"])
    return json_response_wrapper(*out)
