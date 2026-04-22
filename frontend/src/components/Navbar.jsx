import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const activeStyle = {
    color: "var(--primary)",
    fontWeight: "700",
    borderBottom: "2px solid var(--primary)",
  };

  const navLinkStyle = ({ isActive }) => ({
    marginRight: "24px",
    padding: "8px 0",
    color: isActive ? "var(--primary)" : "var(--text-muted)",
    fontWeight: isActive ? "600" : "400",
    borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
    transition: "all 0.3s ease",
  });

  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      background: 'var(--glass)', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      marginBottom: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {role === "admin" ? "QuizAdmin" : "QuizHub"}
          </h1>
          
          <nav style={{ display: 'flex' }}>
            {role === "admin" ? (
              <>
                <NavLink to="/admin" end style={navLinkStyle}>Dashboard</NavLink>
                <NavLink to="/admin/quizzes" style={navLinkStyle}>Quizzes</NavLink>
                <NavLink to="/admin/questions" style={navLinkStyle}>Questions</NavLink>
              </>
            ) : (
              <NavLink to="/quizzes" style={navLinkStyle}>Explore Quizzes</NavLink>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
              Hi, <span style={{ color: 'var(--primary)' }}>{user?.username}</span>
              <span className={role === "admin" ? "badge badge-admin" : "badge badge-user"} style={{ marginLeft: '8px' }}>{role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="btn-outline"
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
