import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv("DB_HOST")
db = os.getenv("DB_NAME")
user = os.getenv("DB_USER")
pw = os.getenv("DB_PASSWORD")
port = os.getenv("DB_PORT", "5432")

print("Trying to connect with:")
print(f"HOST={host}, DB={db}, USER={user}, PASSWORD={pw}, PORT={port}")

try:
    conn = psycopg2.connect(
        host=host,
        database=db,
        user=user,
        password=pw,
        port=port
    )
    print("✅ Connected to PostgreSQL successfully!")
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)
