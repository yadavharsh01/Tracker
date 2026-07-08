import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PageTransition from "./components/layout/PageTransition";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MockTests from "./pages/MockTests";
import SectionalTests from "./pages/SectionalTests";
import Planner from "./pages/Planner";
import Colleges from "./pages/Colleges";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mock-tests"
                  element={
                    <ProtectedRoute>
                      <MockTests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sectional-tests"
                  element={
                    <ProtectedRoute>
                      <SectionalTests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/planner"
                  element={
                    <ProtectedRoute>
                      <Planner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/colleges"
                  element={
                    <ProtectedRoute>
                      <Colleges />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
