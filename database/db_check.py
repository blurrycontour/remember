import pymongo

myclient = pymongo.MongoClient("mongodb://localhost:9211/")

mydb = myclient["mydatabase"]

print(myclient.list_database_names())
