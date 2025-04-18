from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
import base64

from fastapi import APIRouter, Depends, Query, BackgroundTasks

from remember import Remember, TelegramBot

from ..dependencies import get_current_user
from ..utils import json_response_wrapper


router = APIRouter(
    prefix="/account",
    tags=["account"],
    dependencies=[Depends(get_current_user)]
)
print('> Loading account router')


@router.get('/')
async def home():
    """ Home """
    return "Are you lost?"


@router.post('/user')
async def set_user(
        user: Annotated[dict, Depends(get_current_user)],
        background_tasks: BackgroundTasks
    ):
    """
    Add user if not exists already.
    """
    app = Remember()
    out = app.accounts.add_user(user)

    if out[1] and out[0]["info"] == "added":
        background_tasks.add_task(
            TelegramBot().send_notification,
            f"""
    User *Added*
    \[name]  {user["name"]}
    \[email]  {user["email"]}
            """
        )

    return json_response_wrapper(*out)


@router.delete('/user')
async def delete_user(
        user: Annotated[dict, Depends(get_current_user)],
        background_tasks: BackgroundTasks
    ):
    """
    Delete exisiting user.
    """
    app = Remember()
    out = app.accounts.delete_user(user_id=user["user_id"])

    if out[1]:
        background_tasks.add_task(
            TelegramBot().send_notification,
            f"""
    User *Deleted*
    \[name]  {user["name"]}
    \[email]  {user["email"]}
            """
        )

    return json_response_wrapper(*out)


@router.get('/stats')
async def get_stats(user: Annotated[dict, Depends(get_current_user)]):
    """
    Get user stats.
    """
    app = Remember()
    out = app.statistics.get_stats(user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.get('/analytics')
async def get_analytics(user: Annotated[dict, Depends(get_current_user)], theme:str='light', width:int=10, height:int=6):
    """
    Get user analytics.
    """
    app = Remember()
    bar_chart = app.statistics.get_bar_chart(user_id=user["user_id"], theme=theme, width=width, height=height)
    histogram = app.statistics.get_histogram(user_id=user["user_id"], theme=theme, width=width, height=height)

    # Encode the SVG images as Base64 strings
    bar_chart_base64 = base64.b64encode(bar_chart).decode('utf-8')
    histogram_base64 = base64.b64encode(histogram).decode('utf-8')

    # Return both images in a JSON response
    return json_response_wrapper({
        "bar_chart": f"data:image/svg+xml;base64,{bar_chart_base64}",
        "histogram": f"data:image/svg+xml;base64,{histogram_base64}"
    }, True)


@router.delete('/stats')
async def reset_stats(user: Annotated[dict, Depends(get_current_user)]):
    """
    Reset user stats.
    """
    app = Remember()
    out = app.statistics.reset_stats(user_id=user["user_id"])
    return json_response_wrapper(*out)


@router.get('/token-info')
async def get_token_info(
    user: Annotated[dict, Depends(get_current_user)],
    tz_offset: Optional[int] = Query(None, description="Timezone offset in minutes")
):
    """
    Get some of the user's access token info.
    """
    iat = user.get("iat", None)
    exp = user.get("exp", None)

    time_fmt = '%Y-%m-%d %H:%M:%S %z'
    if tz_offset is not None:
        tz_delta = timezone(timedelta(minutes=tz_offset))
        iat_str = datetime.fromtimestamp(iat).astimezone(tz_delta).strftime(time_fmt) if iat else None
        exp_str = datetime.fromtimestamp(exp).astimezone(tz_delta).strftime(time_fmt) if exp else None
    else:
        iat_str = datetime.fromtimestamp(iat).astimezone().strftime(time_fmt) if iat else None
        exp_str = datetime.fromtimestamp(exp).astimezone().strftime(time_fmt) if exp else None

    token_info = {
        "iat": iat_str,
        "exp": exp_str,
    }
    return json_response_wrapper(token_info, True)
