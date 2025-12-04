from flask import Blueprint, jsonify, request
from db_connection import get_db_connection

user_bp = Blueprint("user", __name__)

# 🟢 Get all users
@user_bp.route("/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, role FROM users")
    users = cur.fetchall()
    cur.close()
    conn.close()

    user_list = [{"id": u[0], "username": u[1], "role": u[2]} for u in users]
    return jsonify(user_list)

# 🟢 Add new user (plain text password)
@user_bp.route("/users", methods=["POST"])
def add_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "staff")

    if not username or not password:
        return jsonify({"message": "⚠️ Username and password are required."}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check for duplicates
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"message": "❌ Username already exists."}), 400

    # Store password as plain text
    cur.execute(
        "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
        (username, password, role),
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "✅ User added successfully!"})

# 🟢 Login route (plain text password)
@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "⚠️ Please enter both username and password."}), 400

    # Debug prints to see what backend receives
    print("Login attempt:", username, password)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT role FROM users WHERE username = %s AND password = %s",
        (username, password),
    )
    user = cur.fetchone()
    print("Query result:", user)  # Debug

    cur.close()
    conn.close()

    if user:
        return jsonify({"message": "✅ Login successful!", "role": user[0]})
    else:
        return jsonify({"message": "❌ Invalid username or password."}), 401
