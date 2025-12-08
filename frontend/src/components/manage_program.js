// ManageProgram.js
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const ManageProgram = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedProgramCode, setSelectedProgramCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const programsPerPage = 10;

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/programs", {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Error fetching programs, status:", res.status);
        setPrograms([]);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.programs || []);
      setPrograms(list);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setPrograms([]);
    }
  };


  const filteredPrograms = programs
    .filter((p) => {
      const term = (searchTerm || "").toLowerCase();
      if (!term) return true;
      return (
        (p.code || "").toLowerCase().includes(term) ||
        (p.name || "").toLowerCase().includes(term) ||
        (p.college || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === "code") return (a.code || "").localeCompare(b.code || "");
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "college") return (a.college || "").localeCompare(b.college || "");
      return 0;
    });

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / programsPerPage));
  const indexOfLast = currentPage * programsPerPage;
  const indexOfFirst = indexOfLast - programsPerPage;
  const currentPrograms = filteredPrograms.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRowClick = (program) => {
    setSelectedProgramCode((prev) => (prev === program.code ? null : program.code));

    // store the selected program (keep structure consistent)
    localStorage.setItem("selectedProgram", JSON.stringify({
      code: program.code,
      name: program.name,
      college: program.college
    }));
  };

  const handleDelete = async () => {
    if (!selectedProgramCode) {
      alert("Please select a program first!");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this program?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/programs/${selectedProgramCode}`, { method: "DELETE" , credentials: "include" ,});
      if (res.ok) {
        setPrograms((prev) => prev.filter((p) => p.code !== selectedProgramCode));
        setSelectedProgramCode(null);
        localStorage.removeItem("selectedProgram");
        alert("Program deleted successfully!");
        // adjust page if deleting last item on the last page
        const newTotalPages = Math.max(1, Math.ceil((filteredPrograms.length - 1) / programsPerPage));
        if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
      } else {
        alert("Failed to delete program.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to backend.");
    }
  };

  return (
    <div className="row information-frame g-0">
      <div className="col-auto" style={{ width: "170px" }}>
        <Sidebar
          type="program"
          onDelete={handleDelete}
          programCount={programs.length}
        />
      </div>

      <div className="col p-5 d-flex flex-column" style={{ minHeight: "100vh", boxSizing: "border-box" }}>
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-white">Manage Program</h2>
          </div>

          {/* SEARCH + SORT */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              className="form-control w-50"
              placeholder="🔍 Search Program..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <select
              className="form-select w-25"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="" disabled hidden>
                Sort By
              </option>
              <option value="code">Program Code</option>
              <option value="name">Program</option>
              <option value="college">College</option>
            </select>
          </div>
        </div>

        {/* spacer will push table to bottom */}
        <div style={{ flex: 1 }} />

        {/* TABLE (anchored to bottom) */}
        <div className="table-wrapper mt-auto" style={{ width: "100%", overflowX: "auto" }}>
          <div className="header-accent" />

          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Program Code</th>
                <th>Program</th>
                <th>College</th>
              </tr>
            </thead>

            <tbody>
              {currentPrograms.length > 0 ? (
                currentPrograms.map((program, index) => (
                  <tr
                    key={program.code || index}
                    onClick={() => handleRowClick(program)}
                    className={selectedProgramCode === program.code ? "table-active" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="ps-4">{(program.code || "").toUpperCase()}</td>
                    <td className="gold">{program.name}</td>
                    <td>{program.college}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    No programs found.
                  </td>
                </tr>
              )}

              {/* placeholder rows to keep table height consistent (show 10 rows per page) */}
              {Array.from({ length: Math.max(0, programsPerPage - currentPrograms.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="placeholder-row">
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION FIXED AT BOTTOM */}
          <div className="pagination-area d-flex justify-content-center mt-4">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                  &laquo;
                </button>
              </li>

              {Array.from({ length: totalPages }).map((_, index) => (
                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                  &raquo;
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProgram;
