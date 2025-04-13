import io
import matplotlib.pyplot as plt


class Statistics:
    """ Class to handle user statistics """

    def __init__(self, db):
        self.stats = db["stats"]
        self.categories = db["categories"]
        self.cards = db["cards"]
        self.theme_config = {
            "dark": {
                "background": "#333333",
                "text": "#FFFFFF",
                "grid": "#FFFFFF",
                "green": "darkgreen",
                "blue": "darkblue",
            },
            "light": {
                "background": "#FFFFFF",
                "text": "#000000",
                "grid": "#000000",
                "green": "lightgreen",
                "blue": "skyblue",
            }
        }

    def update_operations(self, user_id:str, key:str):
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

        if "favorite" not in stats["card"]:
            self.stats.update_one(
                {"user_id":user_id},
                {"$set": {"card.favorite": 0}}
            )
            stats["card"]["favorite"] = 0
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
                "card.favorite": 0,
            }}
        )
        return "User statistics reset!", True


    def get_bar_chart(self, user_id: str, theme: str, width: int = 10, height: int = 6):
        """ Generate bar chart of category sizes with theme-specific colors """
        tc = self.theme_config.get(theme, self.theme_config["light"])

        # Get category sizes
        category_sizes = self.cards.aggregate([
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$card.category_id",
                "size_b": {"$sum": {"$bsonSize": "$$ROOT"}}
            }},
            {"$addFields": {
                "category_id": "$_id",
                "size_kb": {"$divide": ["$size_b", 1024]},
                "size_mb": {"$divide": ["$size_b", 1024 * 1024]}
            }}
        ])

        # Get all categories
        _categories = self.categories.find({"user_id": user_id})
        categories = [item["category"] for item in _categories]

        # Prepare data for category sizes bar chart
        category_names = []
        category_sizes_kb = []
        for item in category_sizes:
            for c in categories:
                if c["id"] == item["category_id"]:
                    category_names.append(c["name"])
                    category_sizes_kb.append(item["size_kb"])
                    break

        # Sort categories by size
        sorted_data = sorted(zip(category_sizes_kb, category_names), reverse=True)
        category_sizes_kb, category_names = zip(*sorted_data)

        # Generate category sizes bar chart as SVG
        plt.figure(figsize=(width, height))
        plt.rcParams['font.family'] = ['Noto Sans Devanagari', 'Noto Sans', 'DejaVu Sans']
        plt.barh(category_names, category_sizes_kb, color=tc["blue"], edgecolor=tc["grid"])
        plt.xlabel('Size (KB)', color=tc["text"], fontsize=15)
        plt.ylabel('Categories', color=tc["text"], fontsize=15)
        plt.gca().tick_params(colors=tc["text"], labelsize=15)
        for spine in plt.gca().spines.values():
            spine.set_edgecolor(tc["text"])
        plt.tight_layout()
        bar_chart_buffer = io.BytesIO()
        plt.savefig(bar_chart_buffer, format='svg', transparent=True)
        bar_chart_buffer.seek(0)
        plt.close()

        # Return raw SVG data
        return bar_chart_buffer.getvalue()


    def get_histogram(self, user_id: str, theme: str, width: int = 10, height: int = 6):
        """ Generate histogram of card sizes with theme-specific colors """
        tc = self.theme_config.get(theme, self.theme_config["light"])

        # Get card sizes histogram
        card_sizes = self.cards.aggregate([
            {"$match": {"user_id": user_id}},
            {"$project": {
                "size_b": {"$sum": {"$bsonSize": "$$ROOT"}}
            }},
            {"$addFields": {
                "size_kb": {"$divide": ["$size_b", 1024]},
                "size_mb": {"$divide": ["$size_b", 1024 * 1024]}
            }}
        ])

         # Prepare data for card sizes histogram
        card_sizes_kb = [item["size_kb"] for item in card_sizes]

        # Generate card sizes histogram as SVG
        plt.figure(figsize=(width, height))
        plt.rcParams['font.family'] = ['Noto Sans', 'DejaVu Sans']
        plt.hist(card_sizes_kb, color=tc["green"], edgecolor=tc["grid"])
        plt.xlabel('Card Size (KB)', color=tc["text"], fontsize=15)
        plt.ylabel('Frequency', color=tc["text"], fontsize=15)
        plt.gca().tick_params(colors=tc["text"], labelsize=15)
        for spine in plt.gca().spines.values():
            spine.set_edgecolor(tc["text"])
        plt.tight_layout()
        histogram_buffer = io.BytesIO()
        plt.savefig(histogram_buffer, format='svg', transparent=True)
        histogram_buffer.seek(0)
        plt.close()

        # Return raw SVG data
        return histogram_buffer.getvalue()
