import os
from flask import Blueprint, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename
from db_connection import get_db_connection

student_bp = Blueprint("student", __name__)

# Upload folder (absolute path)
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ========== SERVE UPLOADED IMAGES ==========
@student_bp.route("/uploads/<path:filename>")
def serve_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# ========== GET ALL STUDENTS ==========
@student_bp.route("/students", methods=["GET"])
def get_students():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            s.id,
            s.student_id,
            s.first_name,
            s.last_name,
            s.gender,
            s.year_level,
            s.course, 
            p.college,
            s.profile_image 
        FROM students s
        LEFT JOIN programs p ON s.course = p.program_code
        ORDER BY s.id ASC;
    """)
    
    rows = cur.fetchall()
    cur.close()
    conn.close()

    students = []
    for s in rows:
        students.append({
            "id": s[0],
            "student_id": s[1],
            "first_name": s[2],
            "last_name": s[3],
            "gender": s[4],
            "year_level": s[5],
            "course": s[6],
            "college": s[7],
            "profile_image": s[8]
        })

    return jsonify(students)


# ========== ADD STUDENT ==========
@student_bp.route("/students", methods=["POST"])
def add_student():
    required_fields = ["student_id", "first_name", "last_name", "gender", "year_level", "course"]
    for f in required_fields:
        if not request.form.get(f):
            return jsonify({"error": f"Field '{f}' is required."}), 400

    student_id = request.form["student_id"]
    first_name = request.form["first_name"]
    last_name = request.form["last_name"]
    gender = request.form["gender"]
    year_level = request.form["year_level"]
    course = request.form["course"]

    profile_file = request.files.get("profile_image")

    conn = get_db_connection()
    cur = conn.cursor()

    # Check duplicate student_id
    cur.execute("SELECT id FROM students WHERE student_id = %s;", (student_id,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "❌ Student ID already exists!"}), 400

    # Save image if provided
    filename = None
    if profile_file:
        filename = secure_filename(profile_file.filename)
        profile_file.save(os.path.join(UPLOAD_FOLDER, filename))

    # Insert new student
    cur.execute("""
        INSERT INTO students 
        (student_id, first_name, last_name, gender, year_level, course, profile_image)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    """, (student_id, first_name, last_name, gender, year_level, course, filename))

    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "✅ Student added successfully", "id": new_id}), 201


# ========== UPDATE STUDENT (Supports FormData + JSON) ==========
@student_bp.route("/students/<int:id>", methods=["PUT"])
def update_student(id):

    # If FormData was sent (image update)
    if request.content_type and "multipart/form-data" in request.content_type:
        student_id = request.form.get("student_id")
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        gender = request.form.get("gender")
        year_level = request.form.get("year_level")
        course = request.form.get("course")

        new_image = request.files.get("profile_image")

    else:  # JSON update
        data = request.get_json()
        student_id = data.get("student_id")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        gender = data.get("gender")
        year_level = data.get("year_level")
        course = data.get("course")
        new_image = None

    conn = get_db_connection()
    cur = conn.cursor()

    # Get old image
    cur.execute("SELECT profile_image FROM students WHERE id=%s", (id,))
    old = cur.fetchone()
    old_image = old[0] if old else None

    filename = old_image

    # Replace image if new one uploaded
    if new_image:
        filename = secure_filename(new_image.filename)
        new_image.save(os.path.join(UPLOAD_FOLDER, filename))

        # Delete old image
        if old_image and os.path.exists(os.path.join(UPLOAD_FOLDER, old_image)):
            os.remove(os.path.join(UPLOAD_FOLDER, old_image))

    cur.execute("""
        UPDATE students SET
            student_id=%s, first_name=%s, last_name=%s,
            gender=%s, year_level=%s, course=%s, profile_image=%s
        WHERE id=%s
    """, (student_id, first_name, last_name, gender, year_level, course, filename, id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "✏ Student updated successfully"})


# ========== DELETE STUDENT ==========
@student_bp.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):

    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch image name
    cur.execute("SELECT profile_image FROM students WHERE id=%s", (id,))
    row = cur.fetchone()

    if row and row[0]:
        img_path = os.path.join(UPLOAD_FOLDER, row[0])
        if os.path.exists(img_path):
            os.remove(img_path)

    cur.execute("DELETE FROM students WHERE id = %s;", (id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "🗑 Student deleted successfully"})
