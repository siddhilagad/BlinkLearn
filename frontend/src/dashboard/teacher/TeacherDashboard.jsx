import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("blinklearn_user"));

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const userRole = storedUser.role?.toLowerCase().trim();

    if (userRole !== "teacher") {
      navigate("/student-dashboard");
      return;
    }

    setUser(storedUser);
    fetchStats(storedUser.user_id);

    const handleUserChange = () => {
      const updated = JSON.parse(localStorage.getItem("blinklearn_user"));
      setUser(updated);
      if (updated?.user_id) fetchStats(updated.user_id);
    };

    window.addEventListener("blinklearn:userChanged", handleUserChange);
    return () => window.removeEventListener("blinklearn:userChanged", handleUserChange);

  }, [navigate]);

  const fetchStats = async (teacherId) => {
    try {
      const coursesRes = await axios.get(`http://localhost:5000/teacher-courses/${teacherId}`);
      setTotalCourses(coursesRes.data.length);

      const studentsRes = await axios.get(`http://localhost:5000/teacher-students/${teacherId}`);
      setTotalStudents(studentsRes.data.totalStudents);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
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
    <div className="teacher-dashboard-page">
      <div className="teacher-dashboard-wrapper">

        {/* Logo */}
        <Link to="/" className="dashboard-logo-link">
          <div className="dashboard-logo">▶ BlinkLearn</div>
        </Link>

        {/* Hero */}
        <div className="teacher-dashboard-hero">
          <div>
            <p className="dashboard-label">Teacher Panel</p>
            <h1>Welcome back, {user?.name || "Teacher"} 👋</h1>
            <p className="dashboard-subtitle">
              Manage your profile, courses, and students from one place.
            </p>
          </div>
          <button className="dashboard-main-btn" onClick={() => navigate("/add-course")}>
            Add Courses
          </button>
        </div>

        {/* Profile Card */}
        <div className="teacher-profile-card">

          {/* ✅ Avatar with + upload button */}
          <div className="teacher-avatar-wrapper">
            <div className="teacher-avatar">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : "T"
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

          <div className="teacher-profile-info">
            <h2>{user?.name || "Teacher Name"}</h2>
            <p>{user?.email || "teacher@gmail.com"}</p>
            <span className="teacher-role-badge">Teacher</span>
          </div>
        </div>

        {/* Stats */}
        <div className="teacher-stats-grid">
          <div className="teacher-stat-card">
            <h3>{totalCourses}</h3>
            <p>Total Courses</p>
          </div>
          <div className="teacher-stat-card">
            <h3>{totalStudents}</h3>
            <p>Total Students</p>
          </div>
          <div className="teacher-stat-card">
            <h3>{user?.rating || 0}</h3>
            <p>Rating</p>
          </div>
          <div className="teacher-stat-card">
            <h3>{user?.specialization || "Not Added"}</h3>
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
              <h3>Add Courses</h3>
              <p>Create and publish a new course for your students.</p>
              <button onClick={() => navigate("/add-course")}>Add</button>
            </div>
            <div className="teacher-action-box">
              <h3>Edit Profile</h3>
              <p>Update your teacher details and personal information.</p>
              <button onClick={() => navigate("/edit-profile")}>Edit</button>
            </div>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="teacher-section-card">
          <h2>Profile Overview</h2>
          <div className="teacher-overview-grid">
            <div className="teacher-overview-item">
              <span>Full Name</span>
              <strong>{user?.name || "Teacher Name"}</strong>
            </div>
            <div className="teacher-overview-item">
              <span>Email</span>
              <strong>{user?.email || "teacher@gmail.com"}</strong>
            </div>
            <div className="teacher-overview-item">
              <span>Role</span>
              <strong>Teacher</strong>
            </div>
            <div className="teacher-overview-item">
              <span>Specialization</span>
              <strong>{user?.specialization || "Not Added"}</strong>
            </div>
            <div className="teacher-overview-item">
              <span>Total Courses</span>
              <strong>{totalCourses}</strong>
            </div>
            <div className="teacher-overview-item">
              <span>Total Students</span>
              <strong>{totalStudents}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TeacherDashboard;