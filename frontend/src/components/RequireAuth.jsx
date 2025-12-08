// src/components/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getCurrentUser();
      if (!mounted) return;
      setUser(u);
      setChecking(false);
    })();
    return () => (mounted = false);
  }, []);

  if (checking) return <div className="d-flex justify-content-center align-items-center vh-100">Checking session...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}
