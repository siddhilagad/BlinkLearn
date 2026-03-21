import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/course/${courseId}`);
        setCourse(res.data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) { navigate("/login"); return; }
    setEnrolling(true);
    try {
      await axios.post("http://localhost:5000/enroll", {
        user_id: user.user_id,
        course_id: courseId,
      });
      setEnrolled(true);
      alert("Enrolled successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const isTeacher = user?.role?.toLowerCase() === "teacher";
  const isOwner = isTeacher && user?.user_id === course?.tutor_id;

  if (loading) return (
    <div className="cd-loading-screen">
      <div className="cd-spinner"></div>
      <p>Loading course...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="cd-error-screen">
      <div className="cd-error-icon">!</div>
      <p>{errorMsg}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  if (!course) return null;

  return (
    <div className="cd-page">
      {/* TOP NAV */}
      <div className="cd-topbar">
        <button className="cd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="cd-breadcrumb">Courses / {course.title}</span>
      </div>

      <div className="cd-wrapper">
        {/* LEFT SECTION */}
        <div className="cd-left">

          {/* Course Header */}
          <div className="cd-header-card">
            <div className="cd-tags">
              <span className="cd-badge level">{course.level}</span>
              {course.type && (
                <span className={`cd-badge ${course.type}`}>
                  {course.type === "free" ? "Free" : "Paid"}
                </span>
              )}
            </div>
            <h1 className="cd-title">{course.title}</h1>
            <p className="cd-description">{course.description}</p>

            {/* Stats Row */}
            <div className="cd-stats-row">
              <div className="cd-stat">
                <span className="cd-stat-icon">📊</span>
                <span>{course.level}</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-icon">💰</span>
                <span>₹ {course.price}</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-icon">👨‍🏫</span>
                <span>{course.tutor_name}</span>
              </div>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="cd-instructor-card">
            <p className="cd-section-title">About the Instructor</p>
            <div className="cd-instructor-row">
              <div className="cd-instructor-avatar">
                {course.tutor_name?.charAt(0).toUpperCase() || "T"}
              </div>
              <div className="cd-instructor-info">
                <h3>{course.tutor_name || "Instructor"}</h3>
                <p>{course.tutor_email || ""}</p>
                {course.specialization && (
                  <span className="cd-spec-badge">{course.specialization}</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SECTION — Sticky Card */}
        <div className="cd-right">
          <div className="cd-purchase-card">
            {/* Thumbnail */}
            <div className="cd-thumbnail-wrapper">
              {course.thumbnail ? (
                <img
                  src={`http://localhost:5000/uploads/${course.thumbnail}`}
                  alt={course.title}
                  className="cd-thumbnail"
                />
              ) : (
                <div className="cd-thumbnail-placeholder">📚</div>
              )}
            </div>

            {/* Price */}
            <div className="cd-price-section">
              <span className="cd-price">₹ {parseFloat(course.price).toFixed(2)}</span>
              {course.type === "free" && (
                <span className="cd-free-tag">Free</span>
              )}
            </div>

            <div className="cd-divider"></div>

            {/* Course Info */}
            <div className="cd-info-list">
              <div className="cd-info-item">
                <span>📊 Level</span>
                <strong>{course.level}</strong>
              </div>
              <div className="cd-info-item">
                <span>👨‍🏫 Instructor</span>
                <strong>{course.tutor_name}</strong>
              </div>
            </div>

            <div className="cd-divider"></div>

            {/* Action Button */}
            {isOwner ? (
              <button
                className="cd-btn edit"
                onClick={() => navigate(`/edit-course/${courseId}`)}
              >
                ✏️ Edit Course
              </button>
            ) : isTeacher ? (
              <div className="cd-teacher-note">
                👨‍🏫 Viewing as teacher
              </div>
            ) : (
              <button
                className="cd-btn enroll"
                onClick={handleEnroll}
                disabled={enrolled || enrolling}
              >
                {enrolled ? "✅ Enrolled!" : enrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            )}

            {!isTeacher && !enrolled && (
              <p className="cd-guarantee">🔒 Secure Enrollment</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;