# app.py
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

load_dotenv()

from routes.college_routes import college_bp
from routes.program_routes import program_bp
from routes.student_routes import student_bp
from routes.user_routes import user_bp
from routes.auth_routes import auth_bp  # new auth blueprint

app = Flask(__name__)

# === CORS (allow dev frontends and allow cookies) ===
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {"origins": ALLOWED_ORIGINS},
    },
)


# JWT config (read secret from .env or fallback)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "replace_this_with_a_real_secret")

# We store tokens in cookies
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]

# Cookie security / path / samesite
app.config["JWT_COOKIE_SECURE"] = False  # True in production (requires HTTPS)
app.config["JWT_ACCESS_COOKIE_PATH"] = "/"               # access cookie available to app routes
app.config["JWT_REFRESH_COOKIE_PATH"] = "/api/auth/refresh"  # must match blueprint + url_prefix
app.config["JWT_COOKIE_CSRF_PROTECT"] = False           # keep false for dev; consider enabling in prod
app.config["JWT_COOKIE_SAMESITE"] = "Lax"               # use "None" + Secure=True in production with cross-site
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 60 * 15        # 15 minutes
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = 60 * 60 * 24 * 30  # 30 days

jwt = JWTManager(app)

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)

# Register blueprints (auth first so /api/login exists)
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(college_bp, url_prefix="/api")
app.register_blueprint(program_bp, url_prefix="/api")
app.register_blueprint(student_bp, url_prefix="/api")
app.register_blueprint(user_bp, url_prefix="/api")

@app.route("/")
def home():
    return "Backend is running."

if __name__ == "__main__":
    app.run(debug=True)
