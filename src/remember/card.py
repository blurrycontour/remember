import random
from datetime import datetime
import hashlib
from typing import Union


class FlashCard:
    """
    Flashcard class to represent a front and back side
    """
    def __init__(self,  category:str, front:str, back:str):
        self.front = front
        self.back = back
        self.category = category
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
            "ID": self.id,
            "Category": self.category,
            "Front": self.front,
            "Back": self.back,
            "Created": self.created_at,
            "Updated": self.updated_at,
        }

    def update(self, back:str):
        """ Update the back side of the card """
        self.back = back
        self.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")


class Category:
    """
    Category class to represent a category of flashcards
    """
    def __init__(self, name:str, description:str=None):
        self.name = name
        self.description = description
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.id = self.create_id()
        self.cards = {}


    def __str__(self):
        return f"{self.name} : {len(self.cards)} cards"


    def create_id(self) -> str:
        """ Create a unique ID for the category """
        raw = f"category@{self.created_at}+{random.random()}"
        return hashlib.md5(raw.encode()).hexdigest()


    def to_dict(self, verbose:bool=True) -> dict:
        """ Return category information in dictionary format """
        if verbose:
            return {
                "ID": self.id,
                "Name": self.name,
                "Description": self.description,
                "Created": self.created_at,
                "Updated": self.updated_at,
                "#Cards": len(self.cards),
            }
        else:
            return {
                "Name": self.name,
                "#Cards": len(self.cards),
            }
