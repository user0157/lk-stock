from db import db
from sqlalchemy.dialects.postgresql import JSON

class DataRow(db.Model):
    __tablename__ = "data_rows"

    id = db.Column(db.Integer, primary_key=True)
    payload = db.Column(JSON, nullable=False)
