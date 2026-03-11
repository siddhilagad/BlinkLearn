import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    rating: "",
    totalStudents: "",
    totalCourses: ""
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("blinklearn_user"));
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        specialization: user.specialization || "",
        rating: user.rating || "",
        totalStudents: user.totalStudents || "",
        totalCourses: user.totalCourses || ""
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const oldUser = JSON.parse(localStorage.getItem("blinklearn_user"));

    const updatedUser = {
      ...oldUser,
      ...formData
    };

    localStorage.setItem("blinklearn_user", JSON.stringify(updatedUser));

    window.dispatchEvent(new Event("blinklearn:userChanged"));

    alert("Profile Updated Successfully!");

    navigate("/teacher-dashboard");
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-card">

        <h1>Edit Profile</h1>
        <p className="edit-subtitle">
          Update your tutor information
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label>Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="Example: Web Development"
            />
          </div>

          <div className="form-group">
            <label>Rating</label>
            <input
              type="number"
              step="0.1"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="4.5"
            />
          </div>

          <div className="form-group">
            <label>Total Students</label>
            <input
              type="number"
              name="totalStudents"
              value={formData.totalStudents}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Total Courses</label>
            <input
              type="number"
              name="totalCourses"
              value={formData.totalCourses}
              onChange={handleChange}
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/teacher-dashboard")}
            >
              Cancel
            </button>

            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProfile;