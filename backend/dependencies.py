from firebase_admin import auth
from pydantic import BaseModel
from fastapi import Request, HTTPException


class CardData(BaseModel):
    category_id: str
    front: str
    back: str

class CategoryData(BaseModel):
    name: str
    description: str = ""

class Code(BaseModel):
    code: str



def get_current_user(request: Request):
    """Get the user details from Firebase, based on TokenID in the request

    :param request: The HTTP request
    """
    authorization = request.headers.get('Authorization')
    if not authorization:
        raise HTTPException(status_code=401, detail='Authorization header must be provided')

    try:
        token = authorization.split(' ')[1]
        user = auth.verify_id_token(token)
        return user
    except Exception as e:
        print(f"Error verifying token: {e}")
        raise HTTPException(status_code=401, detail='Invalid authentication token') from e
