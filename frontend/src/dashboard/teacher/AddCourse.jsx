import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddCourse.css";

const AddCourse = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user")); // ✅ user_id साठी

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

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("price", courseData.price);
    formData.append("level", courseData.level);
    formData.append("user_id", user?.user_id); // ✅ user_id add केला
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      const res = await axios.post("http://localhost:5000/add-course", formData, { // ✅ URL fix
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.message === "Course added successfully") { // ✅ success check fix
        alert("Course added successfully!");
        navigate("/teacher-courses");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Something went wrong");
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

        {errorMsg && <div className="error-box">⚠️ {errorMsg}</div>}

        <form className="add-course-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Course Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Full Stack Web Development"
              value={courseData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Brief overview of what students will learn..."
              value={courseData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 499"
                value={courseData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Level</label>
              <select name="level" value={courseData.level} onChange={handleChange}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

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
              {thumbnail && <span className="file-name">{thumbnail.name}</span>}
            </div>
          </div>

          {thumbnailPreview && (
            <div className="thumbnail-preview">
              <img src={thumbnailPreview} alt="Thumbnail Preview" />
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
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