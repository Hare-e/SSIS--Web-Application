import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ type, onDelete, studentCount, collegeCount, programCount }) => {
  const renderLinks = () => {
    if (type === "student") {
      return (
        <>
          <p className="text-light">Student Vault</p>
          <Link to="/add-student" className="btn btn-success w-100 mb-2">
            + Add Student
          </Link>
          <Link to="/update-student" className="btn btn-warning w-100 mb-2">
            Update Student
          </Link>
          <button
            className="btn btn-danger w-100 mb-2"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            Delete Student
          </button>
        </>
      );
    } else if (type === "college") {
      return (
        <>
          <p className="text-light">College Vault</p>
          <Link to="/add-college" className="btn btn-success w-200 mb-2">
            + Add College
          </Link>
          <Link to="/update-college" className="btn btn-warning w-100 mb-2">
            Update College
          </Link>
          <button
            className="btn btn-danger w-100 mb-4"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            Delete College
          </button>
        </>
      );
    } else if (type === "program") {
      return (
        <>
          <p className="text-light">Program Vault</p>
          <Link to="/add-program" className="btn btn-success w-100 mb-2">
            + Add Program
          </Link>
          <Link to="/update-program" className="btn btn-warning w-100 mb-2">
            Update Program
          </Link>
          <button
            className="btn btn-danger w-100 mb-4"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            Delete Program
          </button>
        </>
      );
    }
  };

  return (
    <div className="sidebar-fixed" style={{ padding: "5px", backgroundColor: "#410000ff", height: "100vh" }}>
      {/* Sidebar Title */}
      <h4 className="text-center text-light mb-4">STUDENT SYSTEM</h4>

      {/* Section Links */}
      {renderLinks()}

      {/* Common Navigation */}
      <p className="text-light mt-2"></p>
      <Link to="/manage-student" className="btn btn-success w-100 mb-2">
        Manage Student
      </Link>
      <Link to="/manage-college" className="btn btn-success w-100 mb-2">
        Manage College
      </Link>
      <Link to="/manage-program" className="btn btn-success w-100 mb-2">
        Manage Program
      </Link>
      
      {/* Total Students – CLEAN VERSION */}
      {type === "student" && studentCount !== undefined && (
        <div
          style={{
            width: "100%",
            padding: "15px 10px",
            backgroundColor: "#2b0000",
            borderRadius: "10px",
            textAlign: "center",
            marginTop: "20px",
            border: "1px solid #6b0000",
          }}
        >
          <div style={{ fontSize: "1rem", color: "#d4d4d4" }}>
            Total Students:
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "white" }}>
            {studentCount}
          </div>
        </div>
      )}

      {/* Total Colleges – CLEAN VERSION */}
      {type === "college" && collegeCount !== undefined && (
        <div
          style={{
            width: "100%",
            padding: "15px 10px",
            backgroundColor: "#2b0000",
            borderRadius: "10px",
            textAlign: "center",
            marginTop: "20px",
            border: "1px solid #6b0000",
          }}
        >
          <div style={{ fontSize: "1rem", color: "#d4d4d4" }}>
            Total Colleges:
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "white" }}>
            {collegeCount}
          </div>
        </div>
      )}

      {/* Total Programs – CLEAN VERSION */}
      {type === "program" && programCount !== undefined && (
        <div
          style={{
            width: "100%",
            padding: "15px 10px",
            backgroundColor: "#2b0000",
            borderRadius: "10px",
            textAlign: "center",
            marginTop: "20px",
            border: "1px solid #6b0000",
          }}
        >
          <div style={{ fontSize: "1rem", color: "#d4d4d4" }}>
            Total Programs:
          </div>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "white" }}>
            {programCount}
          </div>
        </div>
      )}

    </div>
  );
};

export default Sidebar;
