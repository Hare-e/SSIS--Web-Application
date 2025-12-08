import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const ManageCollege = () => {
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const collegesPerPage = 10;

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges", {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Error fetching colleges, status:", res.status);
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


  const filteredColleges = colleges
    .filter((c) => {
      const term = (searchTerm || "").toLowerCase();
      if (!term) return true;

      return (
        (c.college_code || "").toLowerCase().includes(term) ||
        (c.college_name || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === "code")
        return (a.college_code || "").localeCompare(b.college_code || "");
      if (sortBy === "name")
        return (a.college_name || "").localeCompare(b.college_name || "");
      return 0;
    });

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredColleges.length / collegesPerPage)
  );
  const indexOfLast = currentPage * collegesPerPage;
  const indexOfFirst = indexOfLast - collegesPerPage;
  const currentColleges = filteredColleges.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowClick = (college) => {
    setSelectedCollegeCode((prev) =>
      prev === college.college_code ? null : college.college_code
    );

    localStorage.setItem("selectedCollege", JSON.stringify(college));
  };

  const handleDelete = async () => {
    if (!selectedCollegeCode) {
      alert("Please select a college first!");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this college?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/colleges/${selectedCollegeCode}`,
        { method: "DELETE", credentials: "include", }
      );

      if (res.ok) {
        setColleges((prev) =>
          prev.filter((c) => c.college_code !== selectedCollegeCode)
        );
        setSelectedCollegeCode(null);
        localStorage.removeItem("selectedCollege");

        // readjust pagination after delete
        const newTotalPages = Math.max(
          1,
          Math.ceil((filteredColleges.length - 1) / collegesPerPage)
        );
        if (currentPage > newTotalPages) setCurrentPage(newTotalPages);

        alert("College deleted successfully!");
      } else {
        alert("Failed to delete college.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not connect to backend.");
    }
  };

  return (
    <div className="row information-frame g-0">
      <div className="col-auto" style={{ width: "170px" }}>
        <Sidebar
          type="college"
          onDelete={handleDelete}
          collegeCount={colleges.length}
        />
      </div>

      <div
        className="col p-5 d-flex flex-column"
        style={{ minHeight: "100vh", boxSizing: "border-box" }}
      >
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-white">Manage College</h2>
          </div>

          {/* SEARCH + SORT */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              className="form-control w-50"
              placeholder="🔍 Search College..."
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
              <option value="code">College Code</option>
              <option value="name">College Name</option>
            </select>
          </div>
        </div>

        {/* spacer to push table down */}
        <div style={{ flex: 1 }} />

        {/* TABLE SECTION */}
        <div className="table-wrapper mt-auto" style={{ width: "100%" }}>
          <div className="header-accent" />

          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">College Code</th>
                <th>College Name</th>
              </tr>
            </thead>

            <tbody>
              {currentColleges.length > 0 ? (
                currentColleges.map((college, index) => (
                  <tr
                    key={college.college_code || index}
                    onClick={() => handleRowClick(college)}
                    className={
                      selectedCollegeCode === college.college_code
                        ? "table-active"
                        : ""
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td className="ps-4">
                      {(college.college_code || "").toUpperCase()}
                    </td>
                    <td className="gold">{college.college_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted py-4">
                    No colleges found.
                  </td>
                </tr>
              )}

              {/* placeholder rows to keep height consistent */}
              {Array.from({
                length: Math.max(0, collegesPerPage - currentColleges.length),
              }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td>&nbsp;</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination-area d-flex justify-content-center mt-4">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  &laquo;
                </button>
              </li>

              {Array.from({ length: totalPages }).map((_, index) => (
                <li
                  key={index + 1}
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
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

export default ManageCollege;
