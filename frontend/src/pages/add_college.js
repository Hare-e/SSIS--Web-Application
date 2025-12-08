import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/add_student.css";
import "../styles/background.css";

function AddCollege() {
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { college_code: collegeCode, college_name: collegeName };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges", {
        method: "POST",
        credentials: "include",   
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("collegeMessage", result.message || "✅ College added");
        navigate("/manage-college");
      } else {
        setMessage(result.message || "❌ Failed to add college.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error: Could not connect to backend.");
    }
  };

  return (
    <div className="container-fluid page-bg">
      <div className="row min-vh-100">
        <Sidebar type="college" />

        <div className="col-10 offset-2 p-4">
          <h2 className="fw-bold mb-4">Add College</h2>

          <div className="card shadow-lg p-4">
            <h5 className="fw-bold">College Information</h5>
            <hr />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">College Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter college code"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">College Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter college name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                />
              </div>

              <div className="text-end mt-4">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => navigate("/manage-college")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  + Add College
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

export default AddCollege;
