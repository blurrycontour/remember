import os
import random
from datetime import datetime

import pymongo

from .card import FlashCard
from .category import Category
from .singleton import SingletonMeta


class Remember(metaclass=SingletonMeta):
    """
    Class serving as the main interface to the application.
    """
    def __init__(self):
        self.connect()

    def connect(self):
        """ Connect to database """
        db_name = os.getenv('ENVIRONMENT').lower()
        mongodb_string = os.getenv('MONGODB_STRING')
        client = pymongo.MongoClient(mongodb_string)
        self.db = client[db_name]
        self.categories = self.db["categories"]
        self.cards = self.db["cards"]
        try:
            client.server_info()
            print("Connected to MongoDB")
        except pymongo.errors.ServerSelectionTimeoutError:
            print("Failed to connect to MongoDB")


    def __str__(self) -> str:
        return f"""Brainy:
        {self.categories.count_documents({})} categories,
        {self.cards.count_documents({})} cards
        """


    # =============== Category methods ===============
    def add_category(self, category:Category, user_id:str):
        """ Add a new category """
        if self.categories.find_one({"user_id": user_id, "category.name": category.name}):
            return f"Category '{category.name}' already exists!", False
        else:
            self.categories.insert_one({
                "user_id": user_id,
                "category": category.to_dict()
            })
        return f"Added category '{category.name}'", True


    def update_category(self, category_id:str, user_id:str, name:str, description:str):
        """ Update a category """
        _category = self.categories.find_one({"user_id": user_id, "category.id": category_id})
        if not _category:
            return f"Category ID '{category_id}' not found!", False

        self.categories.update_one(
            {"user_id": user_id, "category.id": category_id},
            {"$set": {"category.name": name, "category.description": description, "category.updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}
        )
        return f"Category ID '{category_id}' updated!", True


    def get_categories(self, user_id:str):
        """ Get all categories """
        items = self.categories.find({"user_id": user_id})
        return [item["category"] for item in items], True


    def get_category(self, user_id:str, category_id:str=None, only_category:bool=False):
        """ Get a category i.e. return list of cards in the category """
        _category = self.categories.find_one({"user_id": user_id, "category.id": category_id})

        if not _category:
            return f"Category ID '{category_id}' not found!", False

        if only_category:
            return _category["category"], True

        _cards = self.cards.find({"user_id": user_id, "card.category_id": category_id})
        return {
            "category": _category["category"],
            "cards": [_card["card"] for _card in _cards]
        }, True


    def remove_category(self, category_id:str, user_id:str):
        """ Remove a category """
        if not self.categories.find_one({"user_id": user_id, "category.id": category_id}):
            return f"Category ID '{category_id}' not found!", False

        self.categories.delete_one({"user_id": user_id, "category.id": category_id})
        self.cards.delete_many({"user_id": user_id, "card.category_id": category_id})
        return f"Category ID '{category_id}' removed!", True


    # =============== Card methods ===============
    def add_card(self, card:FlashCard, user_id:str):
        """ Add a card to the category """
        if not self.categories.find_one({"user_id": user_id, "category.id": card.category_id}):
            return f"Category ID '{card.category_id}' not found!", False

        self.cards.insert_one({
            "user_id": user_id,
            "card": card.to_dict()
        })
        self.categories.update_one(
            {"user_id": user_id, "category.id": card.category_id},
            {"$inc": {"category.#cards": 1}}
        )
        return f"Card ID '{card.id}' added to category ID '{card.category_id}'", True


    def update_card(self, card_id:str, user_id:str, front:str, back:str):
        """ Update a card """
        if not self.cards.find_one({"user_id": user_id, "card.id": card_id}):
            return f"Card ID '{card_id}' not found!", False

        self.cards.update_one(
            {"user_id": user_id, "card.id": card_id},
            {"$set": {"card.front": front, "card.back": back, "card.updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}
        )
        return f"Card ID '{card_id}' updated!", True


    def get_card(self, card_id:str, user_id:str):
        """ Get a card by ID """
        _card = self.cards.find_one({"user_id": user_id, "card.id": card_id})
        if not _card:
            return f"Card ID '{card_id}' not found!", False
        return _card["card"], True


    def remove_card(self, card_id:int, user_id:str):
        """ Remove a card from the category """
        _card = self.cards.find_one({"user_id": user_id, "card_id": card_id})
        if not _card:
            return f"Card with ID '{card_id}' not found!", False

        self.cards.delete_one({"user_id": user_id,"card.id": card_id})
        self.categories.update_one(
            {"user_id": user_id, "category.id": _card["card"]["category_id"]},
            {"$inc": {"category.#cards": -1}}
        )
        return f"Card ID '{card_id}' removed!", True


    def get_all(self, user_id:str):
        """ Show all cards in all categories """
        _data, _ = self.get_categories(user_id)
        for category in _data:
            category["cards"] = self.get_category(category_id=category["id"], user_id=user_id)[0]["cards"]
        return _data, True


    def random(self, user_id:str, category_id:str=None):
        """ Show a random card from the category or all categories """
        if category_id:
            _all_cards, _ = self.get_category(category_id=category_id, user_id=user_id)
            all_cards = [{
                    "category": _all_cards["category"],
                    "card": card
                } for card in _all_cards["cards"]
            ]
        else:
            all_cards = [{
                    "category": self.get_category(category_id=_card["card"]["category_id"], user_id=user_id, only_category=True)[0],
                    "card": _card["card"]
                } for _card in self.cards.find({"user_id": user_id})
            ]

        if not all_cards:
            return "No data to show!", False

        return random.choices(all_cards, k=1)[0], True
