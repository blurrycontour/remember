import random
from datetime import datetime
import hashlib


class Category:
    """
    Category class to represent a category of flashcards
    """
    def __init__(self, name:str, description:str=None):
        self.id = self.create_id()
        self.name = name
        self.description = description
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.cards = {}


    def __str__(self):
        return f"{self.name} : {self.description}"


    def create_id(self) -> str:
        """ Create a unique ID for the category """
        raw = f"category@{self.created_at}+{random.random()}"
        return hashlib.md5(raw.encode()).hexdigest()


    def to_dict(self) -> dict:
        """ Return category information in dictionary format """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created": self.created_at,
            "updated": self.updated_at,
            "#cards": len(self.cards),
        }
