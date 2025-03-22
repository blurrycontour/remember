class Accounts:
    """Class to manage user accounts."""

    def __init__(self, db):
        self.users_collection = db["users"]
        self.categories_collection = db["categories"]
        self.cards_collection = db["cards"]
        self.stats_collection = db["stats"]


    def add_user(self, user: dict):
        """Add user if not exists already."""
        try:
            _user = user.copy()
            _user["_id"] = _user["user_id"]
            # check of db_user exists
            if self.users_collection.find_one({"_id": _user["_id"]}):
                return {
                    "message": "User already exists!",
                    "user": user,
                }, True
            else:
                # add new user
                self.users_collection.insert_one(_user)
                self.stats_collection.insert_one({
                    "user_id": _user["user_id"],
                    "category": {"add": 0, "update": 0, "delete": 0, "count": 0},
                    "card": {"add": 0, "update": 0, "delete": 0, "count": 0, "favorite": 0},
                })
                return {
                    "message": "User added!",
                    "user": user,
                }, True

        except Exception as e:
            return {
                "message": f"Error adding user: {e}",
                "user": user,
            }, False


    def delete_user(self, user_id: str):
        """Delete exisiting user."""
        try:
            self.users_collection.delete_one({"_id": user_id})
            self.categories_collection.delete_many({"user_id": user_id})
            self.cards_collection.delete_many({"user_id": user_id})
            self.stats_collection.delete_one({"user_id": user_id})
            return {
                "message": "User deleted!",
                "user_id": user_id,
            }, True

        except Exception as e:
            return {
                "message": f"Error deleting user: {e}",
                "user_id": user_id,
            }, False
