from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.college_routes import college_bp
from routes.program_routes import program_bp
from routes.student_routes import student_bp
from routes.user_routes import user_bp

app = Flask(__name__)
CORS(app)

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)

app.register_blueprint(college_bp, url_prefix="/api")
app.register_blueprint(program_bp, url_prefix="/api")
app.register_blueprint(student_bp, url_prefix="/api")
app.register_blueprint(user_bp, url_prefix="/api")

@app.route("/")
def home():
    return "Backend is running."

if __name__ == "__main__":
    app.run(debug=True)
