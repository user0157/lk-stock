from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for
from models.user_model import User
from models.data_model import db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    # ✅ 根据 Content-Type 安全获取数据
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "缺少用户名或密码"}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "用户名或密码错误"}), 401

    session["user_id"] = user.id

    # 浏览器表单登录 → 跳转
    if not request.is_json:
        return redirect(url_for("data.show_table"))

    # API 登录 → JSON
    return jsonify({"message": "登录成功"})

@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
