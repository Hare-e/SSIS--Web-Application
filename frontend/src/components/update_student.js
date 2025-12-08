import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/add_student.css"; 
import { useNavigate } from "react-router-dom";

function UpdateStudent() {

  const [studentId, setStudentId] = useState("");
  const [originalId, setOriginalId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [message, setMessage] = useState("");

  // ✅ IMAGE STATES
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // ✅ FETCH COLLEGES & PROGRAMS (always arrays + send cookies)
  useEffect(() => {
    // colleges
    fetch("http://127.0.0.1:5000/api/colleges", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.colleges || []);
        setColleges(list);
      })
      .catch(() => setColleges([]));

    // programs
    fetch("http://127.0.0.1:5000/api/programs", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.programs || []);
        setPrograms(list);
      })
      .catch(() => setPrograms([]));
  }, []);


  // ✅ LOAD SELECTED STUDENT + PROFILE IMAGE, GENDER, YEAR LEVEL
  useEffect(() => {
    const stored = localStorage.getItem("selectedStudent");

    if (!stored) {
      setMessage("⚠️ No student selected.");
      return;
    }

    const student = JSON.parse(stored);

    setStudentId(student.student_id);
    setOriginalId(student.id);
    setFirstName(student.first_name);
    setLastName(student.last_name);
    setGender(student.gender || "");
    setYearLevel(student.year_level || "");
    setCollege(student.college || "");
    setProgram(student.course || "");

    // ✅ PROFILE IMAGE
    if (student.profile_image && student.profile_image !== "null") {
      const imageURL = `http://127.0.0.1:5000/uploads/${student.profile_image}`;
      setImagePreview(imageURL);
      setImageFile(null);
    } else {
      setImagePreview(null);
    }
  }, []);

  // ✅ IMAGE HANDLER
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ✅ SUBMIT UPDATE USING FORMDATA
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalId) {
      setMessage("⚠️ No student selected for update.");
      return;
    }

    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("gender", gender);
    formData.append("year_level", yearLevel);
    formData.append("course", program);

    if (imageFile) {
      formData.append("profile_image", imageFile);
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/students/${originalId}`, 
        {
          method: "PUT",
          credentials: "include",   
          body: formData,
        }
      );

      const result = await res.json();

      if (res.ok) {
        localStorage.removeItem("selectedStudent");
        navigate("/manage-student");
      } else {
        setMessage(result.error || "❌ Update failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Could not connect to backend.");
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("selectedStudent");
    navigate("/manage-student");
  };

  return (
    <div className="container-fluid page-bg">
      <div className="row min-vh-100">

        <Sidebar type="student" />

        <div className="col-10 offset-2 p-4">
          <h2 className="fw-bold mb-4">Update Student</h2>

          <div className="card shadow-lg p-4">

            {/* ✅ PROFILE PHOTO DISPLAY */}
            <div className="text-center mb-4">
              <div
                className="profile-upload-box"
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  margin: "auto",
                  backgroundColor: "#1f2937",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  cursor: "pointer",
                  border: "3px solid #1515c9ff",
                  backgroundImage: imagePreview ? `url("${imagePreview}")` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                {!imagePreview && "Upload Photo"}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>

            <form onSubmit={handleSubmit}>

              <h5 className="fw-bold">Personal Information</h5>
              <hr />

              <div className="mb-3">
                <label className="form-label">Student ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* GENDER */}
              <div className="mb-3">
                <label className="form-label">Gender</label>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="gender"
                    value="Male"
                    checked={gender === "Male"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <label className="form-check-label">Male</label>
                </div>

                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="gender"
                    value="Female"
                    checked={gender === "Female"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <label className="form-check-label">Female</label>
                </div>
              </div>

              {/* YEAR LEVEL */}
              <div className="mb-3">
                <label className="form-label">Year Level</label>
                <select
                  className="form-select"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select year level...</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <h5 className="fw-bold mt-4">Academic Information</h5>
              <hr />

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">College</label>
                  <select
                    className="form-select"
                    value={college}
                    onChange={(e) => {
                      setCollege(e.target.value);
                      setProgram("");
                    }}
                    required
                  >
                    <option value="" disabled hidden>Select college...</option>
                    {colleges.map((c) => (
                      <option key={c.college_code} value={c.college_code}>
                        {c.college_code} - {c.college_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Program</label>
                  <select
                    className="form-select"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    required
                  >
                    <option value="" disabled hidden>Select program...</option>
                    {programs
                      .filter((p) => p.college === college)
                      .map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="text-end mt-4">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning">
                  ✏ Update Student
                </button>
              </div>
            </form>

            {message && (
              <div className="alert alert-info mt-3 text-center">{message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateStudent;
