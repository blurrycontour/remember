class Search:
    """ Class to handle search operations """

    def __init__(self, db):
        self.stats = db["stats"]
        self.categories = db["categories"]
        self.cards = db["cards"]


    def __call__(self, query:str, user_id:str, itype:str, category_id:str, start:str, end:str, page:int):
        """ Search for a item in the database """
        if itype in ["category", "categories"]:
            try:
                query_int = int(query)
            except ValueError:
                query_int = None

            items = self.categories.find({
                "user_id": user_id,
                "category.id": {"$regex": category_id},
                "$or": [
                    {"category.name": {"$regex": query, "$options": "i"}},
                    {"category.description": {"$regex": query, "$options": "i"}},
                    {"category.#cards": query_int} if query_int is not None else {}
                ]
            })
            return [item["category"] for item in items], True

        if itype in ["card", "cards"]:
            items = self.cards.find({
                "user_id": user_id,
                "card.category_id": {"$regex": category_id},
                "$or": [
                    {"card.front": {"$regex": query, "$options": "i"}},
                    {"card.back": {"$regex": query, "$options": "i"}}
                ]
            })
            return [item["card"] for item in items], True

        return [], False
