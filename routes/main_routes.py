from flask import Blueprint, redirect, url_for

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return redirect(url_for("data.show_table"))

@main_bp.route("/health")
def health():
    return "OK", 200
