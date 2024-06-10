from pydantic import BaseModel


class CardData(BaseModel):
    category: str
    front: str
    back: str

class CategoryData(BaseModel):
    name: str
    description: str = ""

class Code(BaseModel):
    code: str
