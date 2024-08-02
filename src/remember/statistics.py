class Statistics:
    """ Class to handle user statistics """

    def __init__(self, db):
        self.stats = db["stats"]
        self.categories = db["categories"]
        self.cards = db["cards"]


    def update_category_operations(self, user_id:str, key:str):
        """
        Update the operations of categories and cards
        key: str e.g. "category.add" or "card.update"
        """
        self.stats.update_one(
            {"user_id": user_id},
            {"$inc": {key: 1}}
        )


    def get_stats(self, user_id:str):
        """ Show the number of categories and cards """
        n_categories = self.categories.count_documents({"user_id": user_id})
        n_cards = self.cards.count_documents({"user_id": user_id})
        self.stats.update_one(
            {"user_id":user_id},
            {"$set": {"category.count": n_categories, "card.count": n_cards}}
        )

        _stats = self.stats.find_one({"user_id":user_id})
        if not _stats:
            return "No stats found!", False

        stats = _stats.copy()
        stats.pop("_id")
        stats.pop("user_id")

        return stats, True


    def reset_stats(self, user_id:str):
        """ Reset the statistics """
        self.stats.update_one(
            {"user_id": user_id},
            {"$set": {
                "category.add": 0,
                "category.update": 0,
                "category.delete": 0,
                "card.add": 0,
                "card.update": 0,
                "card.delete": 0,
            }}
        )
        return "User statistics reset!", True
