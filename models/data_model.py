from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy(
    engine_options={
        "pool_pre_ping": True,   # 每次使用前检测连接
        "pool_recycle": 1800     # 30分钟回收连接，防止被 PG 断掉
    }
)

class DataRow(db.Model):
    __tablename__ = "data_rows"

    id = db.Column(db.Integer, primary_key=True)
    payload = db.Column(JSON, nullable=False)
