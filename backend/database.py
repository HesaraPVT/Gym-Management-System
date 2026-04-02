from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "gym_tracker"

# Create MongoDB client
client = None
db = None

async def connect_db():
    """Connect to MongoDB"""
    global client, db
    try:
        print(f"[*] Connecting to MongoDB: {MONGODB_URL[:30]}...")
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=10000)
        db = client[DATABASE_NAME]
        # Verify connection
        await db.command("ping")
        print("[OK] Connected to MongoDB successfully")
        
        # Initialize collections
        await init_inventory_collections()
    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        print(f"\n[!] MongoDB Atlas Cluster is unreachable.")
        print(f"   Check:")
        print(f"   - Internet connection working")
        print(f"   - MongoDB Atlas cluster running")
        print(f"   - MONGODB_URL in .env correct")
        print(f"   - IP whitelist includes your IP")
        raise

async def close_db():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("[OK] Closed MongoDB connection")

async def init_inventory_collections():
    """Create inventory collections if they don't exist"""
    try:
        collections = await db.list_collection_names()
        
        # Create inventory collections if they don't exist
        if "inventory_products" not in collections:
            await db.create_collection("inventory_products")
            print("[OK] Created inventory_products collection")
        
        if "inventory_suppliers" not in collections:
            await db.create_collection("inventory_suppliers")
            print("[OK] Created inventory_suppliers collection")
        
        if "inventory_invoices" not in collections:
            await db.create_collection("inventory_invoices")
            print("[OK] Created inventory_invoices collection")
        
        if "inventory_stock_movements" not in collections:
            await db.create_collection("inventory_stock_movements")
            print("[OK] Created inventory_stock_movements collection")
        
        if "counters" not in collections:
            await db.create_collection("counters")
            # Initialize counters for auto-increment
            await db.counters.insert_one({"_id": "product_code", "sequence_value": 0})
            await db.counters.insert_one({"_id": "invoice_number", "sequence_value": 0})
            print("[OK] Created counters collection")
        
        print("[OK] All inventory collections are ready")
    except Exception as e:
        print(f"[!] Warning while initializing collections: {e}")


def get_db() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db

async def get_users_collection():
    """Get users collection"""
    return db["users"]

async def get_admins_collection():
    """Get admins collection"""
    return db["admins"]

async def get_trainers_collection():
    """Get trainers collection"""
    return db["trainers"]


