from functools import wraps
from flask import session, redirect, url_for, jsonify, request
from config import API_TOKEN

def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user_id" not in session:
            # 浏览器访问 → 跳登录页
            if request.accept_mimetypes.accept_html:
                return redirect(url_for("auth.login"))
            # API / AJAX → 返回 JSON
            return jsonify({"error": "未登录"}), 401

        return view(*args, **kwargs)
    return wrapped


def token_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401

        token = auth_header.split(" ", 1)[1]

        if token != API_TOKEN:
            return jsonify({"error": "Invalid token"}), 403

        return view(*args, **kwargs)
    return wrapped