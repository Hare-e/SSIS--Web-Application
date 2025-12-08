// src/pages/manage_student.js
import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const ManageStudent = () => {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [colleges, setColleges] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  // FILTERS
  const [filterCollege, setFilterCollege] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterGender, setFilterGender] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 10;

  // ---------- FETCHERS ----------
  const fetchStudents = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/students", {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Error fetching students, status:", res.status);
        setStudents([]);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.students || []);
      setStudents(list);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/programs", {
        credentials: "include",
      });
      if (!res.ok) {
        setPrograms([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.programs || []);
      // normalize program keys (some pages expect .code/.name)
      const normalized = list.map((p) => ({
        code: p.program_code || p.code || p.code?.toString?.() || p.program_code,
        name: p.program_name || p.name || p.program_name,
        college: p.college || p.college,
      }));
      setPrograms(normalized);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setPrograms([]);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges", {
        credentials: "include",
      });
      if (!res.ok) {
        setColleges([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.colleges || []);
      setColleges(list);
    } catch (err) {
      console.error("Error fetching colleges:", err);
      setColleges([]);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchColleges();
  }, []);

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCollege, filterProgram, filterYear, filterGender, sortBy]);

  // ---------- FILTER + SEARCH (apply filters first, then search) ----------
  const filteredStudents = useMemo(() => {
    // ensure array
    const list = Array.isArray(students) ? students : [];

    // apply filters
    const afterFilters = list.filter((s) => {
      // filter college (student.college expected)
      if (filterCollege && ((s.college || "") !== filterCollege)) return false;
      // filter program (student.course expected)
      if (filterProgram && ((s.course || "") !== filterProgram)) return false;
      // filter year
      if (filterYear && ((s.year_level || "") !== filterYear)) return false;
      // filter gender
      if (filterGender && ((s.gender || "").toLowerCase() !== filterGender.toLowerCase())) return false;
      return true;
    });

    // apply search inside the filtered set
    const search = (searchTerm || "").trim().toUpperCase();
    const afterSearch = search
      ? afterFilters.filter((student) => {
          return (
            (student.student_id || "").toString().toUpperCase().includes(search) ||
            (student.first_name || "").toUpperCase().includes(search) ||
            (student.last_name || "").toUpperCase().includes(search) ||
            (student.gender || "").toUpperCase().includes(search) ||
            (student.year_level ? student.year_level.toString().toUpperCase().includes(search) : false) ||
            (student.course || "").toUpperCase().includes(search) ||
            (student.college || "").toUpperCase().includes(search)
          );
        })
      : afterFilters;

    // sort
    const sorted = [...afterSearch].sort((a, b) => {
      if (sortBy === "student_id") return (a.student_id || "").localeCompare(b.student_id || "");
      if (sortBy === "first_name") return (a.first_name || "").localeCompare(b.first_name || "");
      if (sortBy === "last_name") return (a.last_name || "").localeCompare(b.last_name || "");
      return 0;
    });

    return sorted;
  }, [students, searchTerm, filterCollege, filterProgram, filterYear, filterGender, sortBy]);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // ---------- UI helpers ----------
  const clearFilters = () => {
    setFilterCollege("");
    setFilterProgram("");
    setFilterYear("");
    setFilterGender("");
    setSearchTerm("");
  };

  const handleRowClick = (student) => {
    if (selectedStudentId === student.id) {
      setSelectedStudentId(null);
      localStorage.removeItem("selectedStudent");
    } else {
      setSelectedStudentId(student.id);
      localStorage.setItem(
        "selectedStudent",
        JSON.stringify({
          id: student.id,
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          gender: student.gender,
          year_level: student.year_level,
          college: student.college,
          course: student.course,
          profile_image: student.profile_image
        })
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedStudentId) {
      alert("⚠️ Please select a student to delete!");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this student?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/students/${selectedStudentId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        alert("Student deleted successfully!");
        setSelectedStudentId(null);
        fetchStudents();
      } else {
        alert("Failed to delete student.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Could not connect to backend.");
    }
  };

  // helper lists for filter dropdowns (unique & sorted)
  const programOptions = useMemo(() => {
    const set = new Set();
    programs.forEach((p) => {
      if (p.code) set.add(p.code);
    });
    return Array.from(set).sort();
  }, [programs]);

  const collegeOptions = useMemo(() => {
    return (Array.isArray(colleges) ? colleges : []).map(c => c.college_code).filter(Boolean).sort();
  }, [colleges]);

  const yearOptions = useMemo(() => {
    const set = new Set();
    students.forEach(s => { if (s.year_level) set.add(s.year_level); });
    return Array.from(set).sort();
  }, [students]);

  const genderOptions = ["Male", "Female", "Other"];

  return (
    <div className="row information-frame g-0">
      <div className="col-auto" style={{ width: "190px" }}>
        <Sidebar
          type="student"
          onDelete={handleDelete}
          studentCount={students.length}
        />
      </div>

      <div className="col p-4 d-flex flex-column" style={{ minHeight: "100vh", boxSizing: "border-box", width: "100%" }}>
        <div>
          <h2 className="fw-bold text-white mb-3">Student</h2>

          {/* FILTER BAR */}
          <div className="mb-3 d-flex gap-2 align-items-center">
            <select className="form-select w-20" value={filterCollege} onChange={(e) => setFilterCollege(e.target.value)}>
              <option value="">All Colleges</option>
              {collegeOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select className="form-select w-20" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
              <option value="">All Programs</option>
              {programOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select className="form-select w-20" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <select className="form-select w-15" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="">All Genders</option>
              {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <button className="btn btn-sm btn-outline-light ms-2" onClick={clearFilters}>Clear All Filters</button>
          </div>

          {/* SEARCH + SORT */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              className="form-control w-50"
              placeholder="🔍 Search Student..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <select className="form-select w-25" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
              <option value="" disabled hidden>Sort By</option>
              <option value="student_id">Student ID</option>
              <option value="first_name">First Name</option>
              <option value="last_name">Last Name</option>
            </select>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* TABLE */}
        <div className="table-wrapper mt-auto" style={{ width: "100%", overflowX: "auto" }}>
          <div className="header-accent" />
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Student ID</th><th>First Name</th><th>Last Name</th><th>Gender</th><th>Year Level</th><th>Course</th><th>College</th><th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr key={student.id} onClick={() => handleRowClick(student)} className={selectedStudentId === student.id ? "table-active" : ""} style={{ cursor: "pointer" }}>
                    <td>{student.student_id || ""}</td>
                    <td className="gold">{(student.first_name || "").toUpperCase()}</td>
                    <td>{(student.last_name || "").toUpperCase()}</td>
                    <td>{student.gender || ""}</td>
                    <td>{student.year_level || ""}</td>
                    <td>{student.course ? student.course.toUpperCase() : ""}</td>
                    <td>{student.college || ""}</td>
                    <td>
                      <img src={student.profile_image ? `http://127.0.0.1:5000/api/uploads/${student.profile_image}` : "/profile.png"}
                        alt="profile" style={{ width: 120, height: 115, borderRadius: "50%", objectFit: "cover", border: "2px solid #c0542aff" }} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="text-center text-muted py-4">No students found.</td></tr>
              )}

              {Array.from({ length: Math.max(0, studentsPerPage - currentStudents.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="placeholder-row"><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination-area">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>&laquo;</button>
              </li>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <li key={idx+1} className={`page-item ${currentPage === idx+1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(idx+1)}>{idx+1}</button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>&raquo;</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStudent;
