import argparse

from .card import FlashCard
from .category import Category
from .app import Remember

def main():
    card = FlashCard("Test", "Front", "Back")
    print(card)

def random():
    parser = argparse.ArgumentParser()
    parser.add_argument("--category", "-c", default=None, help="Category name")
    args = parser.parse_args()

    app = Remember('data/cards.pkl')
    app.random(args.category, decorator=False)
