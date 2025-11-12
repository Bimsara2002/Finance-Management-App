from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import bcrypt
import oracledb

app = Flask(__name__)
CORS(app)

# ----------------------------
# DATABASE CONNECTIONS
# ----------------------------
def get_db_connection():
    """SQLite connection"""
    conn = sqlite3.connect('Finance.db', check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def get_oracle_connection():
    """Oracle connection"""
    return oracledb.connect(user="system", password="82322929", dsn="localhost:1521/XE")

# ----------------------------
# HELPER FUNCTIONS
# ----------------------------
def hash_password(password: str) -> bytes:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

# ----------------------------
# GET USER BY ID
# ----------------------------
@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    # 1️⃣ SQLite
    try:
        with get_db_connection() as conn:
            user = conn.execute(
                "SELECT user_id, username, email FROM register WHERE user_id = ?", (user_id,)
            ).fetchone()
        if user:
            return jsonify(dict(user))
    except Exception as e:
        print("SQLite error:", e)

    # 2️⃣ Oracle
    try:
        with get_oracle_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_id, username, email FROM register WHERE user_id = :id",
                {"id": user_id}
            )
            row = cursor.fetchone()
        if row:
            return jsonify({"user_id": row[0], "username": row[1], "email": row[2]})
    except Exception as e:
        print("Oracle error:", e)

    return jsonify({"error": "User not found"}), 404

# ----------------------------
# UPDATE PASSWORD
# ----------------------------
@app.route("/api/users/<int:user_id>/update-password", methods=["POST"])
def update_password(user_id):
    data = request.get_json()
    password = data.get("password")

    if not password:
        return jsonify({"error": "Password is required"}), 400

    hashed = hash_password(password)

    # SQLite
    try:
        with get_db_connection() as conn:
            conn.execute(
                "UPDATE register SET password = ? WHERE user_id = ?",
                (hashed, user_id)
            )
            conn.commit()
    except Exception as e:
        print("SQLite error:", e)
        return jsonify({"error": "Failed to update SQLite"}), 500

    # Oracle
    try:
        with get_oracle_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE register SET password = :password WHERE user_id = :id",
                {"password": hashed, "id": user_id}
            )
            conn.commit()
    except Exception as e:
        print("Oracle error:", e)
        return jsonify({"error": "Failed to update Oracle"}), 500

    return jsonify({"message": "Password updated successfully!"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)

