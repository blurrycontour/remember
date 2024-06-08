import pickle
import random
from typing import Dict

from .card import Category, FlashCard


class Brainy:
    def __init__(self, data_path:str):
        self.data:Dict[str, Category] = {}
        self.data_path = data_path
        self.load()


    def load(self):
        try:
            with open(self.data_path, 'rb') as f:
                self.data = pickle.load(f)
        except FileNotFoundError:
            print("No data file found, starting fresh.")
            self.data = {}


    def save(self):
        with open(self.data_path, 'wb') as f:
            pickle.dump(self.data, f)


    def __str__(self) -> str:
        return f"Brainy: {len(self.data)} categories"


    def add_category(self, category:Category):
        if category.name in self.data:
            print("Category already exists!")
            self.data[category.name].cards |= category.cards
        else:
            print(f"Creating category '{category.name}'")
            self.data[category.name] = category
        self.save()


    def add_card(self, category_name:str, card:FlashCard, create_if_not_exist:bool=False):
        if category_name not in self.data:
            print(f"Category '{category_name}' not found!")
            if not create_if_not_exist:
                return
            self.add_category(Category(category_name))
        category = self.data[category_name]
        category.add_card(card)
        self.save()


    def delete(self):
        self.data = {}
        self.save()


    def __show_category(self, category_name:str):
        if category_name in self.data:
            self.data[category_name].show()
        else:
            print(f"Category '{category_name}' not found!")


    def show(self, category_name:str=None):
        """ Show all cards in the category or all categories """
        if category_name:
            self.__show_category(category_name)
            return

        for category in self.data.values():
            print()
            print(f"[{category.name}]")
            print("-"*(2+len(category.name)))
            self.__show_category(category.name)

        print()


    def random(self, category_name:str=None, decorator:bool=True):
        """ Show a random card from the category or all categories """
        if self.data == {}:
            print("No data to show!")
            return
        if not category_name:
            category_name = random.choice(list(self.data.keys()))
        self.data[category_name].random(decorator=decorator)


    def __del__(self):
        self.save()
