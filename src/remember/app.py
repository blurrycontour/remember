import pickle
import random
from typing import Dict
import os
import pymongo

from .card import Category, FlashCard
from .backup import backup_to_s3, backup_to_gcs
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
        if self.categories.find_one({"user_id": user_id, "category_id": category.id}):
            print(f"Category '{category.name}' already exists!")
        else:
            print(f"adding category '{category.name}'")
            self.categories.insert_one({
                "user_id": user_id,
                "category_id": category.id,
                "category": category.to_dict()
            })

        return category.id


    def get_categories(self, user_id:str):
        """ Get all categories """
        items = self.categories.find({"user_id": user_id})
        return [item["category"] for item in items]


    def get_category(self, user_id:str, category_id:str=None, category_name:str=None):
        """ Get a category i.e. return list of cards in the category """
        assert category_id or category_name, "Category ID or Name required!"
        assert not (category_id and category_name), "Only one of Category ID or Name required!"
        if category_name:
            category_id = Category.name_to_id(category_name)

        # new
        _category = self.categories.find_one({"user_id": user_id, "category_id": category_id})
        if not _category:
            return f"Category ID '{category_id}' not found!"

        items = self.cards.find({"user_id": user_id, "category_id": category_id})
        return {
            "name": _category["category"]["Name"],
            "id": _category["category"]["ID"],
            "cards": [item["card"] for item in items]
        }


    def remove_category(self, category_id:str, user_id:str):
        """ Remove a category """
        if not self.categories.find_one({"user_id": user_id, "category_id": category_id}):
            print(f"Category ID '{category_id}' not found!")
            return False

        self.categories.delete_one({"user_id": user_id, "category_id": category_id})
        self.cards.delete_many({"user_id": user_id, "category_id": category_id})
        return category_id


    # =============== Card methods ===============
    def add_card(self, card:FlashCard, user_id:str):
        """ Add a card to the category """
        category_id = Category.name_to_id(card.category)

        if not self.categories.find_one({"user_id": user_id, "category_id": category_id}):
            print(f"Category '{card.category}' not found!")
            return False

        self.cards.insert_one({
            "user_id": user_id,
            "category_id": category_id,
            "card_id": card.id,
            "card": card.to_dict()
        })
        self.categories.update_one(
            {"user_id": user_id, "category_id": category_id},
            {"$inc": {"category.#Cards": 1}}
        )
        return card.id


    def get_card(self, card_id:str, user_id:str):
        """ Get a card by ID """
        card = self.cards.find_one({"user_id": user_id, "card_id": card_id})
        if card:
            return card["card"]
        return f"Card ID '{card_id}' not found!"


    def remove_card(self, card_id:int, user_id:str):
        """ Remove a card from the category """
        card = self.cards.find_one({"user_id": user_id, "card_id": card_id})
        if not card:
            print(f"Card with ID '{card_id}' not found!")
            return False

        self.cards.delete_one({
            "user_id": user_id,
            "card_id": card_id,
        })
        self.categories.update_one(
            {"user_id": user_id, "category_id": card["category_id"]},
            {"$inc": {"category.#Cards": -1}}
        )
        return card_id


    def get_all(self, user_id:str):
        """ Show all cards in all categories """
        _data = self.get_categories(user_id)
        for category in _data:
            category["Cards"] = self.get_category(category_id=category["ID"], user_id=user_id)["cards"]
        return _data


    def random(self, user_id:str, category_id:str=None, category_name:str=None):
        """ Show a random card from the category or all categories """
        assert not (category_id and category_name), "Only one of Category ID or Name required!"
        if category_name:
            category_id = Category.name_to_id(category_name)

        if category_id:
            _all_cards = self.get_category(category_id=category_id, user_id=user_id)
            all_cards = [{
                    "category_id": _all_cards["id"],
                    "card": item["card"]
                } for item in _all_cards["cards"]
            ]
        else:
            all_cards = [{
                    "category_id": item["category_id"],
                    "card": item["card"]
                } for item in self.cards.find({"user_id": user_id})
            ]

        if not all_cards:
            print("No data to show!")
            return None

        return random.choices(all_cards, k=1)[0]
