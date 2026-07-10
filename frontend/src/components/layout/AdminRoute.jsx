import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../lib/api";

export default function AdminRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }
    getProfile()
      .then((res) => setIsAdmin(Boolean(res.data.isAdmin)))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (checking) {
    return null; // brief flash-free check, profile call is fast
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
