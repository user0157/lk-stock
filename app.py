import os
from flask import Flask, redirect, url_for
from config import DATABASE_URL
from models.data_model import db
from routes.data_routes import data_bp
from routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)

    # 🔐 Secret Key（生产环境从 Render 环境变量读取）
    app.secret_key = os.getenv("SECRET_KEY", "dev")

    # 🗄️ 数据库配置
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # 🔒 SQLAlchemy 连接池（Render / Postgres 友好）
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_pre_ping": True,
        "pool_recycle": 1800,
    }

    # 初始化数据库
    db.init_app(app)

    # 创建表（小项目 / Demo 可用）
    with app.app_context():
        db.create_all()

    # 注册蓝图
    app.register_blueprint(auth_bp)
    app.register_blueprint(data_bp)

    # 根路径
    @app.route("/")
    def index():
        return redirect(url_for("data.show_table"))

    # Render 健康检查
    @app.route("/health")
    def health():
        return "OK", 200

    return app

app = create_app()

# ⚠️ 仅用于本地开发
# Render + gunicorn 不会执行这里
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
