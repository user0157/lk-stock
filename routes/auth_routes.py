from flask import (
    Blueprint,
    request,
    jsonify,
    session,
    render_template,
    redirect,
    url_for,
    flash,
)

from models.user_model import User
from services.security import (
    is_ip_blocked,
    record_login_failure,
    clear_failures,
)

import logging

auth_bp = Blueprint("auth", __name__)

# 日志配置（单机可用，生产建议 RotatingFileHandler）
logging.basicConfig(
    filename="login.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    data = request.get_json() if request.is_json else request.form

    username = data.get("username")
    password = data.get("password")

    # 获取真实 IP（支持反向代理）
    ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    ua = request.headers.get("User-Agent")

    # 1️⃣ 是否被封禁
    if is_ip_blocked(ip):
        logging.error(f"IP 已被封禁 | IP={ip} | UA={ua}")

        if request.is_json:
            return jsonify({"error": "尝试次数过多，请稍后再试"}), 403
        flash("尝试次数过多，请稍后再试", "error")
        return render_template("login.html"), 403

    # 2️⃣ 参数校验
    if not username or not password:
        logging.warning(
            f"登录失败（缺少参数） | 用户={username} | IP={ip}"
        )

        if request.is_json:
            return jsonify({"error": "缺少用户名或密码"}), 400
        flash("缺少用户名或密码", "error")
        return render_template("login.html"), 400

    # 3️⃣ 用户校验
    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        blocked = record_login_failure(ip)

        logging.warning(
            f"登录失败 | 用户={username} | IP={ip} | 封禁={blocked}"
        )

        if request.is_json:
            return jsonify({"error": "用户名或密码错误"}), 401
        flash("用户名或密码错误", "error")
        return render_template("login.html"), 401

    # 4️⃣ 登录成功
    session["user_id"] = user.id
    clear_failures(ip)

    logging.info(
        f"登录成功 | 用户={username} | IP={ip} | UA={ua}"
    )

    if request.is_json:
        return jsonify({"message": "登录成功"})

    flash("登录成功", "success")
    return redirect(url_for("data.show_table"))


@auth_bp.route("/logout")
def logout():
    user_id = session.get("user_id")
    session.clear()

    logging.info(f"用户登出 | user_id={user_id}")

    flash("已登出", "info")
    return redirect(url_for("auth.login"))
