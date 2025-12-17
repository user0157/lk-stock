from flask import Blueprint, request, jsonify, render_template
from services.data_service import replace_data, get_all_data, has_data
from utils.auth import login_required, token_required

data_bp = Blueprint("data", __name__)

@data_bp.route("/data", methods=["POST"])
@token_required
def receive_data():
    if not request.is_json:
        return jsonify({"error": "请发送 JSON 数据"}), 400

    payload = request.get_json()

    if not isinstance(payload, list) or not all(isinstance(i, dict) for i in payload):
        return jsonify({"error": "数据格式必须是字典列表"}), 400

    replace_data(payload)

    return jsonify({
        "message": "数据已成功替换",
        "total": len(payload)
    }), 200


@data_bp.route("/", methods=["GET"])
@login_required
def show_table():
    if not has_data():
        return "<h2>暂无可用数据</h2>"

    data = get_all_data()
    headers = data[0].keys()

    return render_template(
        "index.html",
        headers=headers,
        data=data
    )
