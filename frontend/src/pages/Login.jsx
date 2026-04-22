import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUser, clearError } from "../redux/slices/authSlice";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, role } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Welcome back!");
      navigate(role === "admin" ? "/admin" : "/quizzes");
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      toast.warn("Please enter both username and password");
      return;
    }
    dispatch(loginUser(form));
  };

  return (
    <div
      className="animate-fade"
      style={{
        minHeight: "calc(100vh - 100px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: "48px",
          width: "100%",
          maxWidth: "450px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "8px" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-muted)" }}>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group" style={{ textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Username</label>
            <input
              type="text"
              name="username"
              className="input-control"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="input-group" style={{ textAlign: "left", marginBottom: "32px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="input-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "14px" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "32px", color: "var(--text-muted)" }}>
          New here?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
