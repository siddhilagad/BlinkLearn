import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("blinklearn_user"));
    setUser(storedUser || null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("blinklearn_user");
    window.dispatchEvent(new Event("blinklearn:userChanged"));
    navigate("/login");
  };

  // Fallback values – can come from API later
  const stats = {
    totalCourses: user?.totalCourses ?? 0,
    completedCourses: user?.completedCourses ?? 0,
    streakDays: user?.streakDays ?? 0,
    hoursLearned: user?.hoursLearned ?? 0,
  };

  return (
    <div className="student-dashboard-page">
      <div className="student-dashboard-wrapper">
        {/* Hero */}
        <div className="student-hero">
          <div>
            <p className="dashboard-label">Student Panel</p>
            <h1>Welcome back, {user?.name || "Student"} 👋</h1>
            <p className="dashboard-subtitle">Continue learning and track your progress.</p>
          </div>
          <button className="dashboard-main-btn" onClick={() => navigate("/courses")}>
            Explore Courses
          </button>
        </div>

        {/* Profile Card */}
        <div className="student-profile-card">
          <div className="student-avatar">{user?.name?.[0]?.toUpperCase() || "S"}</div>
          <div className="student-info">
            <h2>{user?.name || "Student Name"}</h2>
            <p>{user?.email || "student@email.com"}</p>
            <h3>{user?.accountType || ""} </h3>
          </div>
        </div>

        {/* Stats */}
        <div className="student-stats-grid">
          <div className="student-stat-card">
            <h3>{stats.totalCourses}</h3>
            <p>Courses Enrolled</p>
          </div>
          <div className="student-stat-card">
            <h3>{stats.completedCourses}</h3>
            <p>Completed Courses</p>
          </div>
          <div className="student-stat-card">
            <h3>{stats.streakDays}</h3>
            <p>Learning Streak</p>
          </div>
          <div className="student-stat-card">
            <h3>{stats.hoursLearned}</h3>
            <p>Hours Learned</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="student-section">
          <h2>Quick Actions</h2>
          <div className="student-actions">
            <div className="student-action-box">
              <h3>My Learning</h3>
              <p>Continue watching your enrolled courses.</p>
              <button onClick={() => navigate("/my-learning")}>Open</button>
            </div>
            <div className="student-action-box">
              <h3>Browse Courses</h3>
              <p>Discover new courses to upgrade your skills.</p>
              <button onClick={() => navigate("/courses")}>Explore</button>
            </div>
            <div className="student-action-box">
              <h3>Edit Profile</h3>
              <p>Update your personal information.</p>
              <button onClick={() => navigate("/edit-profile")}>Edit</button>
            </div>
            <div className="student-action-box">
              <h3>Logout</h3>
              <p>Sign out securely.</p>
              <button className="danger-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="student-section">
          <h2>Profile Overview</h2>
          <div className="student-overview-grid">
            <div className="overview-item">
              <span>Name</span>
              <strong>{user?.name || "—"}</strong>
            </div>
            <div className="overview-item">
              <span>Email</span>
              <strong>{user?.email || "—"}</strong>
            </div>
            <div className="overview-item">
              <span>Role</span>
              <strong>{user?.role || "student"}</strong>
            </div>
            <div className="overview-item">
              <span>Courses Enrolled</span>
              <strong>{stats.totalCourses}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;