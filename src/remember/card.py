import random
from datetime import datetime
import hashlib


class FlashCard:
    """
    Flashcard class to represent a front and back side
    """
    def __init__(self, category_id:str, front:str, back:str):
        self.front = front
        self.back = back
        self.category_id = category_id
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.id = self.create_id()


    def create_id(self) -> str:
        """ Create a unique ID for the category """
        raw = f"card@{self.created_at}+{random.random()}"
        return hashlib.md5(raw.encode()).hexdigest()


    def __str__(self):
        return f"{self.front} : {self.back}"


    def to_dict(self) -> str:
        """ Return card information in dictionary format """
        return {
            "id": self.id,
            "front": self.front,
            "back": self.back,
            "category_id": self.category_id,
            "created": self.created_at,
            "updated": self.updated_at,
        }
