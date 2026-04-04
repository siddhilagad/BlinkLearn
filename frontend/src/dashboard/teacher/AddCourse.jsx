import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddCourse.css";

const AddCourse = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    level: "Beginner",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Validation
    if (!user?.user_id) {
      setErrorMsg("User not logged in. Please login again.");
      setLoading(false);
      return;
    }

    if (!courseData.title.trim()) {
      setErrorMsg("Course title is required.");
      setLoading(false);
      return;
    }

    if (!courseData.description.trim()) {
      setErrorMsg("Course description is required.");
      setLoading(false);
      return;
    }

    if (!courseData.price || Number(courseData.price) < 0) {
      setErrorMsg("Please enter a valid price.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", courseData.title.trim());
    formData.append("description", courseData.description.trim());
    formData.append("price", courseData.price);
    formData.append("level", courseData.level);
    formData.append("teacher_id", user?.user_id); // ✅ Fixed: teacher_id

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/courses/add-course", // ✅ Fixed URL
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.message === "Course added successfully") {
        setSuccessMsg("✅ Course added successfully! Redirecting...");
        setCourseData({
          title: "",
          description: "",
          price: "",
          level: "Beginner",
        });
        setThumbnail(null);
        setThumbnailPreview(null);

        setTimeout(() => {
          navigate("/teacher-courses");
        }, 1500);
      }
    } catch (err) {
      console.error("Add course error:", err);
      setErrorMsg(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-course-page">
      <div className="add-course-card">
        <div className="add-course-header">
          <span className="add-course-badge">Teacher Panel</span>
          <h2>Add New Course</h2>
          <p>Fill in the details below to publish your course</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="error-box">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="success-box">
            {successMsg}
          </div>
        )}

        <form className="add-course-form" onSubmit={handleSubmit}>

          {/* Course Title */}
          <div className="input-group">
            <label>Course Title <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Full Stack Web Development"
              value={courseData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="input-group">
            <label>Description <span className="required">*</span></label>
            <textarea
              name="description"
              placeholder="Brief overview of what students will learn..."
              value={courseData.description}
              onChange={handleChange}
              rows={5}
              required
            ></textarea>
          </div>

          {/* Price & Level */}
          <div className="input-row">
            <div className="input-group">
              <label>Price (₹) <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 499"
                value={courseData.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="input-group">
              <label>Level</label>
              <select
                name="level"
                value={courseData.level}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="input-group">
            <label>Thumbnail (optional)</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="thumbnail-input"
              />
              <label htmlFor="thumbnail-input" className="file-upload-label">
                📁 Choose Image
              </label>
              {thumbnail && (
                <span className="file-name">{thumbnail.name}</span>
              )}
            </div>
          </div>

          {/* Thumbnail Preview */}
          {thumbnailPreview && (
            <div className="thumbnail-preview">
              <img src={thumbnailPreview} alt="Thumbnail Preview" />
              <button
                type="button"
                className="remove-thumbnail-btn"
                onClick={handleRemoveThumbnail}
              >
                ✕ Remove
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner"></span> Adding Course...
              </span>
            ) : (
              "Add Course"
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddCourse;