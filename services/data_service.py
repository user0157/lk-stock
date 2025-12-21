from db import db
from models.data_model import DataRow

def replace_data(data: list[dict]):
    try:
        db.session.query(DataRow).delete()

        for row in data:
            db.session.add(DataRow(payload=row))

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e

def get_all_data() -> list[dict]:
    rows = DataRow.query.all()
    return [r.payload for r in rows]

def has_data() -> bool:
    return DataRow.query.count() > 0
