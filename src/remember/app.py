import pickle
import random
from typing import Dict
import os
import pymongo

from .card import Category, FlashCard
from .backup import backup_to_s3, backup_to_gcs, download_from_gcs
from .singleton import SingletonMeta


class Remember(metaclass=SingletonMeta):
    def __init__(self, data_path:str):
        self.data:Dict[str, Category] = {}
        self.data_path = data_path
        self.load()
        # Connect to MongoDB
        db_name = os.getenv('ENV').lower()
        mongodb_string = os.getenv('MONGODB_STRING')
        client = pymongo.MongoClient(mongodb_string)
        self.db = client[db_name]
        self.categories = self.db["categories"]
        self.cards = self.db["cards"]


    def load(self):
        """ Load the data """
        print("Loading data...")
        if os.path.exists(self.data_path):
            print("Loading from local storage...")
            with open(self.data_path, 'rb') as f:
                self.data = pickle.load(f)
        else:
            try:
                print("Loading from GCS...")
                download_from_gcs(self.data_path)
                with open(self.data_path, 'rb') as f:
                    self.data = pickle.load(f)
            except Exception as e:
                print(f"Failed to download: {e}")
                self.data = {}


    def save(self):
        """ Save the data """
        with open(self.data_path, 'wb') as f:
            pickle.dump(self.data, f)

        try:
            backup_to_s3(self.data_path)
        except Exception as e:
            print(f"Backup to S3 failed: {e}")

        try:
            backup_to_gcs(self.data_path)
        except Exception as e:
            print(f"Backup to GCS failed: {e}")


    def delete(self):
        """ Delete all data """
        self.data = {}
        self.save()


    def __str__(self) -> str:
        return f"Brainy: {len(self.data)} categories"


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
            "cards": [item["card"] for item in items]
        }


    def remove_category(self, category_id:str, user_id:str):
        """ Remove a category """
        if not self.categories.find_one({"user_id": user_id, "category_id": category.id}):
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


    def get_card(self, card_id:str, verbose:bool=False):
        """ Get a card by ID """
        for category in self.data.values():
            if card_id in category.cards:
                if verbose:
                    return category.cards[card_id].info()
                else:
                    return str(category.cards[card_id])
        return f"Card ID '{card_id}' not found!"


    def remove_card(self, card_id:int, user_id:str):
        """ Remove a card from the category """
        _card = self.cards.find_one({"user_id": user_id, "card_id": card_id})
        if not _card:
            print(f"Card with ID '{card_id}' not found!")
            return False

        self.cards.delete_one({
            "user_id": user_id,
            "card_id": card_id,
        })
        self.categories.update_one(
            {"user_id": user_id, "category_id": _card.category_id},
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
            all_cards = self.get_category(category_id=category_id, user_id=user_id)["cards"]
        else:
            all_cards = list(self.cards.find({"user_id": user_id}))

        if not all_cards:
            print("No data to show!")
            return
        card = random.choices(all_cards, k=1)[0]
        return card
