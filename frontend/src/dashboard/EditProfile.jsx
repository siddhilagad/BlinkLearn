import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("blinklearn_user"));
    if (user) {
      setRole(user.role || "student");

      if (user.role === "teacher") {
        setFormData({
          name: user.name || "",
          specialization: user.specialization || "",
        });
      } else {
        setFormData({
          name: user.name || "",
          interests: user.interests || "",
        });
      }

      if (user.profilePhoto) {
        setPhotoPreview(user.profilePhoto);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const oldUser = JSON.parse(localStorage.getItem("blinklearn_user"));
    const updatedUser = {
      ...oldUser,
      ...formData,
      ...(photoPreview && { profilePhoto: photoPreview }),
    };
    localStorage.setItem("blinklearn_user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("blinklearn:userChanged"));
    alert("Profile Updated Successfully!");
    navigate(role === "teacher" ? "/teacher-dashboard" : "/student-dashboard");
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-card">

        {/* Header */}
        <div className="edit-profile-header">
          <div className={`role-badge ${role}`}>
            {role === "teacher" ? "👨‍🏫 Teacher" : "🎓 Student"}
          </div>
          <h1>Edit Profile</h1>
          <p className="edit-subtitle">Update your {role} information</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Profile Photo ── */}
          <div className="photo-section">
            <div className="photo-wrapper">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>
            <div className="photo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                id="photo-input"
              />
              <label htmlFor="photo-input" className="photo-upload-btn">
                📷 Change Photo
              </label>
              {photoFile && (
                <span className="photo-file-name">{photoFile.name}</span>
              )}
            </div>
          </div>

          {/* ── Common Field: Name ── */}
          <div className="form-section-label">Basic Info</div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* ── Teacher Fields ── */}
          {role === "teacher" && (
            <>
              <div className="form-section-label">Teacher Details</div>
              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization || ""}
                  onChange={handleChange}
                  placeholder="e.g. Web Development, Data Science"
                />
              </div>
            </>
          )}

          {/* ── Student Fields ── */}
          {role === "student" && (
            <>
              <div className="form-section-label">Student Details</div>
              <div className="form-group">
                <label>Interests</label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests || ""}
                  onChange={handleChange}
                  placeholder="e.g. AI, Design, Finance"
                />
              </div>
            </>
          )}

          {/* ── Buttons ── */}
          <div className="form-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate(role === "teacher" ? "/teacher-dashboard" : "/student-dashboard")
              }
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