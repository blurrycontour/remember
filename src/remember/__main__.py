import argparse

from .card import FlashCard
from .app import Brainy

def main():
    card = FlashCard("Front", "Back")
    print(card)

def random():
    parser = argparse.ArgumentParser()
    parser.add_argument("--category", "-c", default=None, help="Category name")
    args = parser.parse_args()

    app = Brainy('data/cards.pkl')
    app.random(args.category, decorator=False)
