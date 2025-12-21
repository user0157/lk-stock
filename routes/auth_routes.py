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

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        if request.is_json:
            return jsonify({"error": "缺少用户名或密码"}), 400
        flash("缺少用户名或密码", "error")
        return render_template("login.html"), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        if request.is_json:
            return jsonify({"error": "用户名或密码错误"}), 401
        flash("用户名或密码错误", "error")
        return render_template("login.html"), 401

    session["user_id"] = user.id

    if request.is_json:
        return jsonify({"message": "登录成功"})

    flash("登录成功", "success")
    return redirect(url_for("data.show_table"))


@auth_bp.route("/logout")
def logout():
    session.clear()
    flash("已登出", "info")
    return redirect(url_for("auth.login"))
