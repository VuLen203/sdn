import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerUser, clearError } from "../redux/slices/authSlice";

function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.username.trim().length < 3) {
      toast.warn("Username must be at least 3 characters");
      return;
    }
    if (form.password.length < 6) {
      toast.warn("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const result = await dispatch(
      registerUser({
        username: form.username,
        password: form.password,
        isAdmin: form.isAdmin,
      }),
    );
    if (!result.error) {
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/login"), 2000);
    }
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
          padding: "40px",
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "8px" }}>Create Account</h2>
          <p style={{ color: "var(--text-muted)" }}>Join us and start your quiz journey today</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group" style={{ textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Username</label>
            <input
              type="text"
              name="username"
              className="input-control"
              placeholder="Pick a unique username"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Password</label>
              <input
                type="password"
                name="password"
                className="input-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group" style={{ textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                className="input-control"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ 
            marginBottom: "24px", 
            padding: '16px', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px',
            textAlign: 'left'
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isAdmin"
                checked={!!form.isAdmin}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontWeight: '500' }}>Register as admin</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "14px" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: "32px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
