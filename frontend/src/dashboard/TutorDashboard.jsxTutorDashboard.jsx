import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TutorDashboard.css";

function TutorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("blinklearn_user"));
    setUser(stored || null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("blinklearn_user");
    window.dispatchEvent(new Event("blinklearn:userChanged"));
    navigate("/login");
  };

  // Fallbacks
  const stats = {
    totalCourses: user?.totalCourses ?? 0,
    totalStudents: user?.totalStudents ?? 0,
    rating: user?.rating ?? "—",
    specialization: user?.specialization ?? "Not set",
  };

  return (
    <div className="tutor-dashboard-page">
      <div className="dashboard-wrapper">
        {/* Hero */}
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-label">Tutor Panel</p>
            <h1>Welcome back, {user?.name || "Tutor"} 👋</h1>
            <p className="dashboard-subtitle">
              Manage your courses, students, and teaching profile.
            </p>
          </div>
          <button className="primary-btn" onClick={() => navigate("/edit-profile")}>
            Edit Profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="tutor-profile-card">
          <div className="tutor-avatar">{user?.name?.[0]?.toUpperCase() || "T"}</div>
          <div className="tutor-info">
            <h2>{user?.name || "Tutor Name"}</h2>
            <p>{user?.email || "tutor@example.com"}</p>
            <span className="tutor-badge">Tutor</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
          <div className="stat-card">
            <h3>{stats.rating}</h3>
            <p>Rating</p>
          </div>
          <div className="stat-card">
            <h3>{stats.specialization}</h3>
            <p>Specialization</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <div className="action-card">
              <h3>My Courses</h3>
              <p>Manage your uploaded courses</p>
              <button onClick={() => navigate("/my-courses")}>Open</button>
            </div>
            <div className="action-card">
              <h3>Edit Profile</h3>
              <p>Update your tutor information</p>
              <button onClick={() => navigate("/edit-profile")}>Edit</button>
            </div>
            <div className="action-card">
              <h3>Logout</h3>
              <p>Sign out securely</p>
              <button className="danger-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="dashboard-section">
          <h2>Profile Overview</h2>
          <div className="overview-grid">
            <div className="overview-item"><span>Name</span><strong>{user?.name || "—"}</strong></div>
            <div className="overview-item"><span>Email</span><strong>{user?.email || "—"}</strong></div>
            <div className="overview-item"><span>Role</span><strong>{user?.role || "tutor"}</strong></div>
            <div className="overview-item"><span>Specialization</span><strong>{stats.specialization}</strong></div>
            <div className="overview-item"><span>Total Courses</span><strong>{stats.totalCourses}</strong></div>
            <div className="overview-item"><span>Total Students</span><strong>{stats.totalStudents}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDashboard;