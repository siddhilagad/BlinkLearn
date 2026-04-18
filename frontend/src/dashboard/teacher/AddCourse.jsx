import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddCourse.css";

function AddCourse() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "Beginner",
    category: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size — max 500MB
    if (file.size > 500 * 1024 * 1024) {
      setErrorMsg("Video must be under 500MB.");
      return;
    }

    setPreviewVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.title.trim()) return setErrorMsg("Title is required.");
    if (!formData.description.trim()) return setErrorMsg("Description is required.");
    if (!formData.price) return setErrorMsg("Price is required.");
    if (!thumbnail) return setErrorMsg("Please upload a course thumbnail.");

    try {
      setLoading(true);
      setUploadProgress(0);

      const data = new FormData();
      data.append("teacher_id", user.user_id);
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("price", formData.price);
      data.append("level", formData.level);
      data.append("category", formData.category.trim());
      data.append("thumbnail", thumbnail);
      if (previewVideo) {
        data.append("preview_video", previewVideo);
      }

      await axios.post("http://localhost:5000/add-course", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      setSuccessMsg("Course added successfully! 🎉");
      setTimeout(() => navigate("/my-courses"), 1500);

    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || "Failed to add course. Please try again."
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="ac-page">
      <div className="ac-container">

        {/* Header */}
        <div className="ac-header">
          <button className="ac-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div>
            <h1 className="ac-title">Add New Course</h1>
            <p className="ac-subtitle">Fill in the details to publish your course</p>
          </div>
        </div>

        {errorMsg && <div className="ac-alert error">{errorMsg}</div>}
        {successMsg && <div className="ac-alert success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="ac-form">

          <div className="ac-two-col">

            {/* LEFT — Form Fields */}
            <div className="ac-left">

              <div className="ac-field">
                <label>Course Title <span>*</span></label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Complete Node.js Course"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="ac-field">
                <label>Description <span>*</span></label>
                <textarea
                  name="description"
                  placeholder="What will students learn in this course?"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  disabled={loading}
                  required
                />
              </div>

              <div className="ac-row">
                <div className="ac-field">
                  <label>Price (₹) <span>*</span></label>
                  <input
                    type="number"
                    name="price"
                    placeholder="0 for free"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="ac-field">
                  <label>Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="ac-field">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Web Development, Data Science"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

            </div>

            {/* RIGHT — Upload Section */}
            <div className="ac-right">

              {/* Thumbnail Upload */}
              <div className="ac-field">
                <label>Course Thumbnail <span>*</span></label>
                <div
                  className="ac-upload-box"
                  onClick={() => document.getElementById("thumbnailInput").click()}
                >
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="ac-thumb-preview"
                    />
                  ) : (
                    <div className="ac-upload-placeholder">
                      <span className="ac-upload-icon">🖼️</span>
                      <p>Click to upload thumbnail</p>
                      <small>JPG, PNG, WEBP • Max 5MB</small>
                    </div>
                  )}
                </div>
                <input
                  id="thumbnailInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleThumbnail}
                  disabled={loading}
                  style={{ display: "none" }}
                />
                {thumbnailPreview && (
                  <button
                    type="button"
                    className="ac-remove-btn"
                    onClick={() => {
                      setThumbnail(null);
                      setThumbnailPreview(null);
                    }}
                  >
                    ✕ Remove Thumbnail
                  </button>
                )}
              </div>

              {/* ✅ Video Upload */}
              <div className="ac-field">
                <label>Preview Video <span className="ac-optional">(Optional)</span></label>
                <div
                  className="ac-upload-box video-box"
                  onClick={() =>
                    !videoPreview &&
                    document.getElementById("videoInput").click()
                  }
                >
                  {videoPreview ? (
                    <video
                      src={videoPreview}
                      controls
                      className="ac-video-preview"
                    />
                  ) : (
                    <div className="ac-upload-placeholder">
                      <span className="ac-upload-icon">🎬</span>
                      <p>Click to upload preview video</p>
                      <small>MP4, MOV, WEBM • Max 500MB</small>
                    </div>
                  )}
                </div>
                <input
                  id="videoInput"
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideo}
                  disabled={loading}
                  style={{ display: "none" }}
                />
                {videoPreview && (
                  <button
                    type="button"
                    className="ac-remove-btn"
                    onClick={() => {
                      setPreviewVideo(null);
                      setVideoPreview(null);
                    }}
                  >
                    ✕ Remove Video
                  </button>
                )}
                {previewVideo && (
                  <p className="ac-file-name">
                    📁 {previewVideo.name} —{" "}
                    {(previewVideo.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Upload Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="ac-progress-wrapper">
              <div className="ac-progress-label">
                Uploading... {uploadProgress}%
              </div>
              <div className="ac-progress-track">
                <div
                  className="ac-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="ac-submit-btn"
            disabled={loading}
          >
            {loading
              ? uploadProgress > 0
                ? `Uploading ${uploadProgress}%...`
                : "Publishing..."
              : "🚀 Publish Course"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddCourse;