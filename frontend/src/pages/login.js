import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        credentials: "include", // <<-- IMPORTANT: send/receive cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Try to parse JSON safely
      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        // ignore JSON parse error — we'll handle non-ok below
      }

      setLoading(false);

      if (res.ok) {
        // backend sets JWT cookies; it also returns role in JSON
        localStorage.setItem("role", data.role || "staff");
        localStorage.setItem("username", username);
        navigate("/manage-student");
      } else {
        setError(data.message || "Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div
      className="information-frame d-flex justify-content-center align-items-center vh-100"
      style={{
        animation: "fadeInBG 1s ease-in-out"
      }}
    >
      <div
        className="p-5 shadow-lg text-white"
        style={{
          width: "430px",
          background: "#5A1515",
          borderRadius: "20px",
          animation: "slideFade 0.8s ease-out"
        }}
      >
        {/* Logo */}
        <div className="text-center mb-3">
          <img
            src="/mylogo.png"
            alt="logo"
            style={{ width: "70px", marginBottom: "10px" }}
          />
        </div>

        <h3 className="text-center mb-4 fw-bold">Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{ borderRadius: "10px" }}
            />
          </div>

          {/* Password + Eye Toggle */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>

            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ borderRadius: "10px" }}
              />

              {/* Eye Button */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#aaa"
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* Login Button with Spinner */}
          <button
            type="submit"
            className="btn w-100"
            style={{
              background: "#0d6efd",
              color: "white",
              borderRadius: "10px",
              fontWeight: "600",
              padding: "10px",
              fontSize: "16px"
            }}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideFade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInBG {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
