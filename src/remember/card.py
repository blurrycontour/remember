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
        self.id = hashlib.md5(f"{self.front}{self.category}".encode()).hexdigest()

    def __str__(self):
        return f"{self.front} : {self.back}"

    def info(self) -> str:
        """ Return complete card information """
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
        self.id = Category.name_to_id(self.name)
        self.cards = {}


    def __str__(self):
        return f"{self.name} : {len(self.cards)} cards"


    @staticmethod
    def name_to_id(name:str):
        """ Convert category name to id """
        return hashlib.md5(f"{name}".encode()).hexdigest()


    def add_card(self, card:FlashCard) -> Union[None, str]:
        """ Add a card to this category """
        assert card.category == self.name
        if card.id in self.cards:
            print(f"Updating card in category '{self.name}'")
            # TODO: Update the card conditionally (auth)
            # self.cards[card.id].update(card.back)
            return None
        else:
            print(f"Adding card to category '{self.name}'")
            self.cards[card.id] = card
            return card.id


    def get_cards(self, verbose:bool=False):
        """ Show all cards in the category """
        if verbose:
            return [card.info() for card in self.cards.values()]
        else:
            return [str(card) for card in self.cards.values()]


    def random(self) -> FlashCard:
        """ Show a random card from the category """
        card = random.choice(list(self.cards.values()))
        return card
