import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    API_PORT = int(os.getenv('API_PORT', 8000))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
    DB_FILE = os.getenv('DB_FILE', 'tasks.json')

settings = Settings()
