// src/pages/manage_program.js
import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const ManageProgram = () => {
  const [programs, setPrograms] = useState([]);
  const [colleges, setColleges] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterCollege, setFilterCollege] = useState("");

  const [selectedProgramCode, setSelectedProgramCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const programsPerPage = 10;

  const fetchPrograms = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/programs", { credentials: "include" });
      if (!res.ok) { setPrograms([]); return; }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.programs || []);
      // normalize
      const normalized = list.map(p => ({
        code: p.program_code || p.code || p.program_code,
        name: p.program_name || p.name || p.program_name,
        college: p.college || p.college
      }));
      setPrograms(normalized);
    } catch (err) {
      console.error(err);
      setPrograms([]);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges", { credentials: "include" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.colleges || []);
      setColleges(list);
    } catch (err) {
      console.error(err);
      setColleges([]);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchColleges();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCollege, sortBy]);

  const filteredPrograms = useMemo(() => {
    const list = Array.isArray(programs) ? programs : [];
    const afterFilters = list.filter((p) => {
      if (filterCollege && ((p.college || "") !== filterCollege)) return false;
      return true;
    });
    const search = (searchTerm || "").trim().toLowerCase();
    const afterSearch = search ? afterFilters.filter((p) =>
      (p.code || "").toLowerCase().includes(search) ||
      (p.name || "").toLowerCase().includes(search) ||
      (p.college || "").toLowerCase().includes(search)
    ) : afterFilters;

    return afterSearch.sort((a, b) => {
      if (sortBy === "code") return (a.code || "").localeCompare(b.code || "");
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "college") return (a.college || "").localeCompare(b.college || "");
      return 0;
    });
  }, [programs, searchTerm, filterCollege, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / programsPerPage));
  const indexOfLast = currentPage * programsPerPage;
  const indexOfFirst = indexOfLast - programsPerPage;
  const currentPrograms = filteredPrograms.slice(indexOfFirst, indexOfLast);

  const clearFilters = () => { setFilterCollege(""); setSearchTerm(""); setSortBy(""); };

  const handleRowClick = (program) => {
    setSelectedProgramCode((prev) => (prev === program.code ? null : program.code));
    localStorage.setItem("selectedProgram", JSON.stringify({ code: program.code, name: program.name, college: program.college }));
  };

  const handleDelete = async () => {
    if (!selectedProgramCode) { alert("Please select a program first!"); return; }
    const confirmed = window.confirm("Are you sure you want to delete this program?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/programs/${selectedProgramCode}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setPrograms(prev => prev.filter(p => p.code !== selectedProgramCode));
        setSelectedProgramCode(null);
        localStorage.removeItem("selectedProgram");
        alert("Program deleted successfully!");
        const newTotalPages = Math.max(1, Math.ceil((filteredPrograms.length - 1) / programsPerPage));
        if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
      } else {
        alert("Failed to delete program.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not connect to backend.");
    }
  };

  const collegeOptions = useMemo(() => (Array.isArray(colleges) ? colleges.map(c => c.college_code).filter(Boolean).sort() : []), [colleges]);

  return (
    <div className="row information-frame g-0">
      <div className="col-auto" style={{ width: "170px" }}>
        <Sidebar type="program" onDelete={handleDelete} programCount={programs.length} />
      </div>

      <div className="col p-5 d-flex flex-column" style={{ minHeight: "100vh", boxSizing: "border-box" }}>
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-white">Manage Program</h2>
          </div>

          {/* FILTER BAR */}
          <div className="mb-3 d-flex gap-2 align-items-center">
            <select className="form-select w-25" value={filterCollege} onChange={(e) => setFilterCollege(e.target.value)}>
              <option value="">All Colleges</option>
              {collegeOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <button className="btn btn-sm btn-outline-light ms-2" onClick={clearFilters}>Clear All Filters</button>
          </div>

          {/* SEARCH + SORT */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input type="text" className="form-control w-50" placeholder="🔍 Search Program..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            <select className="form-select w-25" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
              <option value="" disabled hidden>Sort By</option>
              <option value="code">Program Code</option>
              <option value="name">Program</option>
              <option value="college">College</option>
            </select>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="table-wrapper mt-auto" style={{ width: "100%", overflowX: "auto" }}>
          <div className="header-accent" />
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th className="ps-4">Program Code</th><th>Program</th><th>College</th></tr>
            </thead>
            <tbody>
              {currentPrograms.length > 0 ? (
                currentPrograms.map((program, index) => (
                  <tr key={program.code || index} onClick={() => handleRowClick(program)} className={selectedProgramCode === program.code ? "table-active" : ""} style={{ cursor: "pointer" }}>
                    <td className="ps-4">{(program.code || "").toUpperCase()}</td>
                    <td className="gold">{program.name}</td>
                    <td>{program.college}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center text-muted py-4">No programs found.</td></tr>
              )}

              {Array.from({ length: Math.max(0, programsPerPage - currentPrograms.length) }).map((_, i) => (
                <tr key={`empty-${i}`}><td>&nbsp;</td><td></td><td></td></tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-area d-flex justify-content-center mt-4">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => setCurrentPage(currentPage-1)}>&laquo;</button></li>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <li key={idx+1} className={`page-item ${currentPage === idx+1 ? "active" : ""}`}><button className="page-link" onClick={() => setCurrentPage(idx+1)}>{idx+1}</button></li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}><button className="page-link" onClick={() => setCurrentPage(currentPage+1)}>&raquo;</button></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProgram;
