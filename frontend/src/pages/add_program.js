import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/add_student.css"; 
import "../styles/background.css";

function AddProgram() {
  const navigate = useNavigate();

  const [programCode, setProgramCode] = useState("");
  const [programName, setProgramName] = useState("");
  const [college, setCollege] = useState("");
  const [colleges, setColleges] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/colleges", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.colleges || []);
        setColleges(list);
      })
      .catch(() => setColleges([]));
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      program_code: programCode,
      program_name: programName,
      college: college,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/programs", {
        method: "POST",
        credentials: "include",   
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("programMessage", "✅ Program added successfully!");
        navigate("/manage-program");
      } else {
        setMessage(data.message || "❌ Failed to add program.");
      }

    } catch (error) {
      console.error(error);
      setMessage("⚠️ Could not reach backend server.");
    }
  };

  return (
    <div className="container-fluid page-bg">
      <div className="row min-vh-100">

        <Sidebar type="program" />

        <div className="col-10 offset-2 p-4">
          <h2 className="fw-bold mb-4">Add Program</h2>

          <div className="card shadow-lg p-4 bg-transparent text-light">

            <h5 className="fw-bold">Program Information</h5>
            <hr />

            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label className="form-label">Program Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={programCode}
                  onChange={(e) => setProgramCode(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Program Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">College</label>
                <select
                  className="form-select"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>Select College...</option>

                  {colleges.map((c) => (
                    <option key={c.college_code} value={c.college_code}>
                      {c.college_code} - {c.college_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-end mt-4">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => navigate("/manage-program")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  + Add Program
                </button>
              </div>

              {message && (
                <div className="alert alert-info mt-3 text-center">{message}</div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProgram;
