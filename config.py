import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
API_TOKEN = os.getenv("API_TOKEN")

if not DATABASE_URL:
    raise RuntimeError("数据库 URL 未在 .env 文件中定义")
