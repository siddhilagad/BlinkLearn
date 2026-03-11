import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("blinklearn_user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("blinklearn_user");
    window.dispatchEvent(new Event("blinklearn:userChanged"));
    navigate("/login");
  };

  return (
    <div className="teacher-dashboard-page">
      <div className="teacher-dashboard-wrapper">
        {/* Header Card */}
        <div className="teacher-dashboard-hero">
          <div>
            <p className="dashboard-label">Tutor Panel</p>
            <h1>Welcome back, {user?.name || "Tutor"} 👋</h1>
            <p className="dashboard-subtitle">
              Manage your profile, courses, and students from one place.
            </p>
          </div>

          <button
            className="dashboard-main-btn"
            onClick={() => navigate("/edit-profile")}
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="teacher-profile-card">
          <div className="teacher-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
          </div>

          <div className="teacher-profile-info">
            <h2>{user?.name || "Tutor Name"}</h2>
            <p>{user?.email || "tutor@gmail.com"}</p>
            <span className="teacher-role-badge">Tutor</span>
          </div>
        </div>

        {/* Stats */}
        <div className="teacher-stats-grid">
          <div className="teacher-stat-card">
            <h3>{user?.totalCourses || 6}</h3>
            <p>Total Courses</p>
          </div>

          <div className="teacher-stat-card">
            <h3>{user?.totalStudents || 120}</h3>
            <p>Total Students</p>
          </div>

          <div className="teacher-stat-card">
            <h3>{user?.rating || 4.7}</h3>
            <p>Rating</p>
          </div>

          <div className="teacher-stat-card">
            <h3>{user?.specialization || "Web Development"}</h3>
            <p>Specialization</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="teacher-section-card">
          <h2>Quick Actions</h2>

          <div className="teacher-actions-grid">
            <div className="teacher-action-box">
              <h3>My Courses</h3>
              <p>Check and manage all the courses you created.</p>
              <button onClick={() => navigate("/my-courses")}>Open</button>
            </div>

            <div className="teacher-action-box">
              <h3>Edit Profile</h3>
              <p>Update your tutor details and personal information.</p>
              <button onClick={() => navigate("/edit-profile")}>Edit</button>
            </div>

            <div className="teacher-action-box">
              <h3>Logout</h3>
              <p>Securely sign out from your BlinkLearn account.</p>
              <button className="danger-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="teacher-section-card">
          <h2>Profile Overview</h2>

          <div className="teacher-overview-grid">
            <div className="teacher-overview-item">
              <span>Full Name</span>
              <strong>{user?.name || "Tutor Name"}</strong>
            </div>

            <div className="teacher-overview-item">
              <span>Email</span>
              <strong>{user?.email || "tutor@gmail.com"}</strong>
            </div>

            <div className="teacher-overview-item">
              <span>Role</span>
              <strong>{user?.role || "tutor"}</strong>
            </div>

            <div className="teacher-overview-item">
              <span>Specialization</span>
              <strong>{user?.specialization || "Web Development"}</strong>
            </div>

            <div className="teacher-overview-item">
              <span>Total Courses</span>
              <strong>{user?.totalCourses || 6}</strong>
            </div>

            <div className="teacher-overview-item">
              <span>Total Students</span>
              <strong>{user?.totalStudents || 120}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;