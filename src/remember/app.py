import pickle
import random
from typing import Dict

from .card import Category, FlashCard
from .backup import backup_to_s3


class Remember:
    def __init__(self, data_path:str):
        self.data:Dict[str, Category] = {}
        self.data_path = data_path
        self.load()


    def load(self):
        """ Load the data """
        try:
            with open(self.data_path, 'rb') as f:
                self.data = pickle.load(f)
        except FileNotFoundError:
            print("No data file found, starting fresh.")
            self.data = {}


    def save(self):
        """ Save the data """
        backup_to_s3(self.data_path)
        with open(self.data_path, 'wb') as f:
            pickle.dump(self.data, f)


    def __str__(self) -> str:
        return f"Brainy: {len(self.data)} categories"


    def add_category(self, category:Category):
        """ Add a new category """
        if category.id in self.data:
            print("Category already exists!")
            self.data[category.id].cards |= category.cards
        else:
            print(f"Creating category '{category.name}'")
            self.data[category.id] = category
        self.save()
        return category.id


    def remove_category(self, category_id:str):
        """ Remove a category """
        if category_id in self.data:
            del self.data[category_id]
            self.save()
            return category_id
        print(f"Category ID '{category_id}' not found!")
        return False


    def add_card(self, card:FlashCard, create_if_not_exist:bool=False):
        """ Add a card to the category """
        category_id = Category.name_to_id(card.category)

        if category_id not in self.data:
            print(f"Category '{card.category}' not found!")
            if not create_if_not_exist:
                return False
            self.add_category(Category(card.category))
        self.data[category_id].add_card(card)
        self.save()
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


    def remove_card(self, card_id:int):
        """ Remove a card from the category """
        for category in self.data.values():
            if card_id in category.cards:
                del category.cards[card_id]
                self.save()
                return card_id
        print(f"Card with ID '{card_id}' not found!")
        return False


    def delete(self):
        """ Delete all data """
        self.data = {}
        self.save()


    def get_all(self, verbose:bool=False):
        """ Show all cards in all categories """
        _data = self.get_categories(verbose=verbose)
        print(_data)
        for category in _data:
            category["Cards"] = self.get_category(category_name=category["Name"], verbose=verbose)
        return _data


    def random(self, category_id:str=None, category_name:str=None, verbose:bool=False):
        """ Show a random card from the category or all categories """
        assert not (category_id and category_name), "Only one of Category ID or Name required!"
        if category_name:
            category_id = Category.name_to_id(category_name)

        if self.data == {}:
            print("No data to show!")
            return

        if not category_id:
            weights = [len(category.cards) for category in self.data.values()]
            category_id = random.choices(list(self.data.keys()), weights=weights)[0]
        card = self.data[category_id].random()
        return card.info() if verbose else str(card)


    def get_categories(self, verbose:bool=False):
        """ Get all categories """
        if verbose:
            return [
                    {
                        "ID": category.id,
                        "Name": category.name,
                        "Created": category.created_at,
                        "Updated": category.updated_at,
                        "#Cards": len(category.cards),
                    }
                    for category in self.data.values()
                ]
        else:
            return [
                {
                    "Name": category.name,
                    "#Cards": len(category.cards),
                }
                for category in self.data.values()
            ]


    def get_category(self, category_id:str=None, category_name:str=None, verbose:bool=False):
        """ Get a category """
        assert category_id or category_name, "Category ID or Name required!"
        assert not (category_id and category_name), "Only one of Category ID or Name required!"
        if category_name:
            category_id = Category.name_to_id(category_name)

        if category_id in self.data:
            return self.data[category_id].get_cards(verbose=verbose)
        return f"Category ID '{category_id}' not found!"
