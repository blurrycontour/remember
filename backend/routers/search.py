from typing import Annotated

from fastapi import APIRouter, Depends

from remember import Remember

from ..dependencies import get_current_user
from ..utils import json_response_wrapper


router = APIRouter(
    prefix="/search",
    tags=["search"],
    dependencies=[Depends(get_current_user)]
)
print('> Loading search router')


@router.get('/')
async def search(
        user: Annotated[dict, Depends(get_current_user)],
        query: str = '', itype: str = 'card', category_id: str = '', start: str = None, end: str = None, page: int = 1
    ):
    app = Remember()
    out = app.search(
        user_id=user["user_id"],
        query=query,
        itype=itype,
        category_id='' if category_id == 'all' else category_id,
        start=start,
        end=end,
        page=page,
    )
    return json_response_wrapper(*out)
