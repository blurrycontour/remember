import random
import time


class FlashCard:
    """
    Flashcard class to represent a front and back side
    """
    def __init__(self, front:str, back:str):
        self.front = front
        self.back = back
        self.created_at = time.time()
        self.category = None

    def __str__(self):
        return f"{self.front} : {self.back}"


class Category:
    """
    Category class to represent a category of flashcards
    """
    def __init__(self, name:str, description:str=None):
        self.name = name
        self.description = description
        self.created_at = time.time()
        self.cards = {}

    def add_card(self, card:FlashCard):
        """ Add a card to the category """
        if card.front in self.cards:
            print(f"Updating card in category '{self.name}'")
        else:
            print(f"Adding card to category '{self.name}'")
        card.category = self.name
        self.cards[card.front] = card

    def __str__(self):
        return f"{self.name} : {len(self.cards)} cards"

    def show(self):
        """ Show all cards in the category """
        for card in self.cards.values():
            print(card)

    def random(self, decorator:bool=True) -> FlashCard:
        """ Show a random card from the category """
        card = random.choice(list(self.cards.values()))
        if decorator:
            print("[Random Card]\n-------------")
        print(card)
