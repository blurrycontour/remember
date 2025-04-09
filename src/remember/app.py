import os
import random
from datetime import datetime

import pymongo

from .card import FlashCard
from .category import Category
from .singleton import SingletonMeta
from .statistics import Statistics
from .accounts import Accounts
from .search import Search


class Remember(metaclass=SingletonMeta):
    """
    Class serving as the main interface to the application.
    """
    def __init__(self):
        self.connect()
        self.accounts = Accounts(self.db)
        self.statistics = Statistics(self.db)
        self.search = Search(self.db)


    def connect(self):
        """ Connect to database """
        db_name = os.getenv('ENVIRONMENT').lower()
        mongodb_string = os.getenv('MONGODB_STRING')
        print("Connecting to MongoDB")
        client = pymongo.MongoClient(
            mongodb_string,
            tls=True,
            tlsCAFile="/etc/ssl/mongodb/ca.pem",
            tlsCertificateKeyFile="/etc/ssl/mongodb/client.pem",
        )
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
        print("Name", category.name)
        if not category.name:
            return "Category name cannot be empty!", False
        if self.categories.find_one({"user_id": user_id, "category.name": category.name}):
            return f"Category '{category.name}' already exists!", False

        self.categories.insert_one({
            "user_id": user_id,
            "category": category.to_dict()
        })
        self.statistics.update_category_operations(user_id, "category.add")
        return f"Added category with ID: '{category.id}'", True


    def update_category(self, category_id:str, user_id:str, name:str, description:str, diary:bool, lightweight:bool=False):
        """ Update a category """
        _category = self.categories.find_one({"user_id": user_id, "category.id": category_id})
        if not _category:
            return f"Category ID '{category_id}' not found!", False

        if lightweight:
            self.categories.update_one(
                {"user_id": user_id, "category.id": category_id},
                {"$set": {
                    "category.updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                }
            )
        else:
            if not name:
                return "Category name cannot be empty!", False

            self.categories.update_one(
                {"user_id": user_id, "category.id": category_id},
                {"$set": {
                    "category.name": name,
                    "category.description": description,
                    "category.diary": diary,
                    "category.updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                }
            )
            self.statistics.update_category_operations(user_id, "category.update")

        return f"Category ID '{category_id}' updated!", True


    def get_categories(self, meta:bool, user_id:str):
        """ Get all categories """
        items = self.categories.find({"user_id": user_id})
        categories = [item["category"] for item in items]
        meta_categories = []
        if meta:
            meta_categories = [
                {
                    "id": "all",
                    "name": "[All Cards]",
                    "#cards": sum([_category["#cards"] for _category in categories])
                },
                {
                    "id": "favorites",
                    "name": "[Favorites]",
                    "#cards": sum([_category.get("#favorites", 0) for _category in categories])
                }
            ]
        return meta_categories + categories, True


    def get_category(self, user_id:str, category_id:str=None, only_category:bool=False):
        """ Get a category i.e. return list of cards in the category """
        if category_id == "all":
            return self.get_all(user_id)

        if category_id == "favorites":
            return self.get_favorites(user_id)

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
        self.statistics.update_category_operations(user_id, "category.delete")
        return f"Category ID '{category_id}' removed!", True


    # =============== Card methods ===============
    def add_card(self, card:FlashCard, user_id:str):
        """ Add a card to the category """
        if not card.front:
            return "Front of the card cannot be empty!", False
        if not card.back:
            return "Back of the card cannot be empty!", False
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
        self.statistics.update_category_operations(user_id, "card.add")

        # Set card's category updated time
        self.update_category(card.category_id, user_id, None, None, None, lightweight=True)

        return f"Card ID '{card.id}' added to category ID '{card.category_id}'", True


    def update_card(self, card_id:str, user_id:str, front:str, back:str):
        """ Update a card """
        if not front:
            return "Front of the card cannot be empty!", False
        if not back:
            return "Back of the card cannot be empty!", False
        if not self.cards.find_one({"user_id": user_id, "card.id": card_id}):
            return f"Card ID '{card_id}' not found!", False

        _card = self.cards.find_one_and_update(
            {"user_id": user_id, "card.id": card_id},
            {"$set": {
                "card.front": front,
                "card.back": back,
                "card.updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            }
        )
        self.statistics.update_category_operations(user_id, "card.update")

        # Set card's category updated time
        self.update_category(_card["card"]["category_id"], user_id, None, None, None, lightweight=True)

        return f"Card ID '{card_id}' updated!", True


    def get_card(self, card_id:str, user_id:str):
        """ Get a card by ID """
        _card = self.cards.find_one({"user_id": user_id, "card.id": card_id})
        if not _card:
            return f"Card ID '{card_id}' not found!", False
        return _card["card"], True


    def remove_card(self, card_id:int, user_id:str):
        """ Remove a card from the category """
        _card = self.cards.find_one({"user_id": user_id, "card.id": card_id})
        if not _card:
            return f"Card with ID '{card_id}' not found!", False

        self.cards.delete_one({"user_id": user_id,"card.id": card_id})
        self.categories.update_one(
            {"user_id": user_id, "category.id": _card["card"]["category_id"]},
            {"$inc": {"category.#cards": -1}}
        )
        self.statistics.update_category_operations(user_id, "card.delete")

        # Set card's category updated time
        self.update_category(_card["card"]["category_id"], user_id, None, None, None, lightweight=True)
        return f"Card ID '{card_id}' removed!", True


    def get_all(self, user_id:str):
        """ Show all cards in all categories """
        _cards = self.cards.find({"user_id": user_id})
        return {
                "category": {"name":"[All Cards]"},
                "cards": [_card["card"] for _card in _cards]
            }, True


    def get_favorites(self, user_id:str):
        """ Show all favorites cards """
        _cards = self.cards.find({"user_id": user_id, "card.favorite": True})
        return {
                "category": {"name":"[Favorite Cards]"},
                "cards": [_card["card"] for _card in _cards]
            }, True


    def random(self, category_ids:str, user_id:str):
        """Show a random card from the specified category or all categories."""
        category_ids = category_ids.split(",")

        query = {"user_id": user_id}
        # Adjust the query based on the category_id
        if "favorites" in category_ids:
            query["card.favorite"] = True
        if "all" not in category_ids and ["favorites"] != category_ids:
            query["card.category_id"] = {"$in": [cat_id for cat_id in category_ids]}

        # Fetch a random card directly from the database
        result = list(self.cards.aggregate([
            {"$match": query},
            {"$sample": {"size": 1}}
        ]))

        if not result:
            return "No card found!", False

        # Fetch the category details for the card
        random_card = result[0]["card"]
        category = self.get_category(
            user_id=user_id, category_id=random_card["category_id"], only_category=True
        )[0]

        return {"category": category, "card": random_card}, True


    def favorite_card(self, card_id:str, user_id:str):
        """ Mark a card as favorite/unfavorite """
        _card = self.cards.find_one({"user_id": user_id, "card.id": card_id})
        if not _card:
            return f"Card ID '{card_id}' not found!", False

        set_favorite_status = not _card["card"].get("favorite", False)
        _card = self.cards.find_one_and_update(
            {"user_id": user_id, "card.id": card_id},
            {"$set": {"card.favorite": set_favorite_status}}
        )

        # Update category.#favorites count by 1
        self.categories.update_one(
            {"user_id": user_id, "category.id": _card["card"]["category_id"]},
            {"$inc": {"category.#favorites": 1 if set_favorite_status else -1}}
        )

        self.statistics.update_category_operations(user_id, "card.favorite")
        return {"favorite": set_favorite_status}, True
