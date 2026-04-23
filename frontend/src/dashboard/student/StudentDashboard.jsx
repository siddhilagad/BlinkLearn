import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completedCourses: 0,
    streakDays: 0,
    wishlistCount: 0,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("blinklearn_user"));
    setUser(storedUser || null);

    if (storedUser?.user_id) {
      fetchStats(storedUser.user_id);
    }

    const handleUserChange = () => {
      const updated = JSON.parse(localStorage.getItem("blinklearn_user"));
      setUser(updated);
      if (updated?.user_id) fetchStats(updated.user_id);
    };

    window.addEventListener("blinklearn:userChanged", handleUserChange);
    return () => window.removeEventListener("blinklearn:userChanged", handleUserChange);
  }, []);

  const fetchStats = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/student-stats/${userId}`);
      const data = res.data;
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setStats({
        totalEnrolled: data.totalEnrolled || 0,
        completedCourses: data.completedCourses || 0,
        streakDays: data.streakDays || 0,
        wishlistCount: data.wishlistCount > 0 ? data.wishlistCount : wishlist.length,
      });
    } catch (err) {
      console.error("Failed to fetch student stats:", err);
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setStats((prev) => ({ ...prev, wishlistCount: wishlist.length }));
    }
  };

  // ✅ Photo upload handler
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview locally first
    const reader = new FileReader();
    reader.onload = (ev) => {
      const updatedUser = { ...user, profilePhoto: ev.target.result };
      setUser(updatedUser);
      localStorage.setItem("blinklearn_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("blinklearn:userChanged"));
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("profilePhoto", file);
      formData.append("user_id", user.user_id);

      const res = await axios.post("http://localhost:5000/upload-profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.profilePhoto) {
        const updatedUser = { ...user, profilePhoto: `http://localhost:5000/uploads/${res.data.profilePhoto}` };
        setUser(updatedUser);
        localStorage.setItem("blinklearn_user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("blinklearn:userChanged"));
      }
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="student-dashboard-page">
      <div className="student-dashboard-wrapper">

        {/* Hero */}
        <div className="student-hero">
          <div>
            <p className="dashboard-label">Student Panel</p>
            <h1>Welcome back, {user?.name || "Student"} 👋</h1>
            <p className="dashboard-subtitle">
              Continue learning and track your progress.
            </p>
          </div>
          <button className="dashboard-main-btn" onClick={() => navigate("/courses")}>
            Explore Courses
          </button>
        </div>

        {/* Profile Card */}
        <div className="student-profile-card">

          {/* ✅ Avatar with + upload button */}
          <div className="student-avatar-wrapper">
            <div className="student-avatar">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "S"
              )}
            </div>

            {/* + Button */}
            <button
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current.click()}
              title="Upload profile photo"
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "..." : "+"}
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="student-info">
            <h2>{user?.name || "Student Name"}</h2>
            <p>{user?.email || "student@email.com"}</p>
            <h3>{user?.role || "Student"}</h3>
          </div>
        </div>

        {/* Stats */}
        <div className="student-stats-grid">
          <div className="student-stat-card">
            <h3>{stats.totalEnrolled}</h3>
            <p>Courses Enrolled</p>
          </div>
          <div className="student-stat-card">
            <h3>{stats.completedCourses}</h3>
            <p>Completed Courses</p>
          </div>
          <div className="student-stat-card">
            <h3>{stats.streakDays} 🔥</h3>
            <p>Learning Streak</p>
          </div>
          <div className="student-stat-card">
            <h3>{stats.wishlistCount} ❤️</h3>
            <p>Wishlist</p>
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
              <strong>{user?.role || "Student"}</strong>
            </div>
            <div className="overview-item">
              <span>Courses Enrolled</span>
              <strong>{stats.totalEnrolled}</strong>
            </div>
            <div className="overview-item">
              <span>Completed Courses</span>
              <strong>{stats.completedCourses}</strong>
            </div>
            <div className="overview-item">
              <span>Wishlist</span>
              <strong>{stats.wishlistCount}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;