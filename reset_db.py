from flask import Flask
from dotenv import load_dotenv
import os

from models.data_model import db
from models.user_model import User   # 👈 一定要 import

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 1800,
}

db.init_app(app)

DEFAULT_USERNAME = "admin"
DEFAULT_PASSWORD = "123456"  # ⚠️ 生产环境请改 / 用环境变量

if __name__ == "__main__":
    with app.app_context():
        # 🔥 重置数据库
        db.drop_all()
        db.create_all()
        print("🔥 数据库表已重建")

        # 👤 创建默认用户
        user = User(username=DEFAULT_USERNAME)
        user.set_password(DEFAULT_PASSWORD)

        db.session.add(user)
        db.session.commit()

        print("✅ 默认用户已创建：admin / 123456")
