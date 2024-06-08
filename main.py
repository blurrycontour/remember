"""
App for flashcard based memory training.
"""

from remember import (
    Brainy,
    Category,
    FlashCard
)

if __name__ == "__main__":
    app = Brainy('data/cards.pkl')
    # app.delete()

    app.add_category(Category("Puran"))
    app.add_card("Puran", FlashCard("4 Brahma Sons", "Sanak Sanandan Sanatan Sanatkumar"))
    app.add_card("Puran", FlashCard("9 Brahmas", "Bhrigu Atri Angira Pulastya Pulaha Kratu Vasishtha Daksha Marichi"))

    app.add_category(Category("Test"))
    app.add_card("Test", FlashCard("Question", "Answer"))

    app.show()

    app.random()
