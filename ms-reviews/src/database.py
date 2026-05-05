from motor.motor_asyncio import AsyncIOMotorClient
import os

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.getenv("MONGO_DB", "reviews_db")]
    print(f"✅ MongoDB conectado: {mongo_url}")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db
