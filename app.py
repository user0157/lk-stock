from flask import Flask, redirect, url_for
from config import DATABASE_URL
from models.data_model import db
from routes.data_routes import data_bp
from routes.auth_routes import auth_bp   # ✅ 加这个

def create_app():
    app = Flask(__name__)

    app.secret_key = "CHANGE_THIS_TO_RANDOM_STRING"  # ✅ 必须有

    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # 🔒 数据库连接池配置
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_pre_ping": True,
        "pool_recycle": 1800,
    }

    db.init_app(app)

    with app.app_context():
        db.create_all()

    # ✅ 注册蓝图
    app.register_blueprint(auth_bp)   # 👈 很关键
    app.register_blueprint(data_bp)

    # ✅ 根路径重定向
    @app.route("/")
    def index():
        return redirect(url_for("data.show_table"))

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
