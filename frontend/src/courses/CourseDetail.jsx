import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CourseDetail.css";

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const lessons = [
    { id: 1, title: "Introduction & Overview", duration: "7:00", completed: true },
    { id: 2, title: "Core Concepts", duration: "6:30", completed: true },
    { id: 3, title: "Hands-on Practice", duration: "8:15", completed: true },
    { id: 4, title: "Advanced Topics", duration: "10:00", completed: false },
    { id: 5, title: "Final Project", duration: "12:00", completed: false },
  ];

  const completedCount = lessons.filter((l) => l.completed).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);
  const totalDuration = "2h 30m";

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

  if (loading) {
    return (
      <div className="cd-loading-screen">
        <div className="cd-spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="cd-error-screen">
        <div className="cd-error-icon">!</div>
        <p>{errorMsg}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="cd-page">

      {/* TOP NAV */}
      <div className="cd-topbar">
        <button className="cd-back-btn" onClick={() => navigate(-1)}>
          ← Back to Courses
        </button>
        <span className="cd-breadcrumb">Courses / {course.title}</span>
      </div>

      <div className="cd-wrapper">

        {/* LEFT SECTION */}
        <div className="cd-left">

          {/* Hero Image */}
          <div className="cd-hero">
            {course.thumbnail ? (
              <img
                src={`http://localhost:5000/uploads/${course.thumbnail}`}
                alt={course.title}
                className="cd-hero-img"
              />
            ) : (
              <div className="cd-hero-placeholder">
                <span>📚</span>
              </div>
            )}
            {enrolled && (
              <div className="cd-progress-overlay">
                <span className="cd-progress-label">
                  Course Progress: {progressPercent}%
                </span>
                <div className="cd-progress-bar-track">
                  <div
                    className="cd-progress-bar-fill"
                    style={{ width: progressPercent + "%" }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="cd-info-section">
            <h1 className="cd-title">{course.title}</h1>
            <p className="cd-description">{course.description}</p>
            <div className="cd-stats-row">
              <div className="cd-stat">
                <span className="cd-star">★</span>
                <span className="cd-rating-val">4.9 rating</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-icon">👥</span>
                <span>15,678 students</span>
              </div>
              <div className="cd-stat">
                <span className="cd-stat-icon">🕐</span>
                <span>{totalDuration}</span>
              </div>
              <span className="cd-badge level">{course.level}</span>
              {course.category && (
                <span className="cd-badge category">{course.category}</span>
              )}
            </div>
          </div>

          {/* Instructor Card */}
          <div className="cd-instructor-card">
            <p className="cd-section-label">About the Instructor</p>
            <div className="cd-instructor-row">
              <div className="cd-instructor-avatar">
                {course.tutor_name ? course.tutor_name.charAt(0).toUpperCase() : "T"}
              </div>
              <div className="cd-instructor-info">
                <h3>{course.tutor_name || "Instructor"}</h3>
                {course.tutor_title && (
                  <p className="cd-instructor-title">{course.tutor_title}</p>
                )}
                <div className="cd-instructor-meta">
                  <span className="cd-meta-rating">★ 4.9 rating</span>
                  <span>👥 28,450 students</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="cd-right">
          <div className="cd-sidebar-card">

            <h3 className="cd-sidebar-title">Course Content</h3>
            <p className="cd-sidebar-meta">
              {lessons.length} lessons • {totalDuration}
            </p>

            <div className="cd-lessons-list">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className={lesson.completed ? "cd-lesson-item completed" : "cd-lesson-item"}
                >
                  <div className="cd-lesson-icon">
                    {lesson.completed
                      ? <div className="cd-check-filled">✓</div>
                      : <div className="cd-check-empty"></div>
                    }
                  </div>
                  <div className="cd-lesson-info">
                    <span className="cd-lesson-title">
                      {idx + 1}. {lesson.title}
                    </span>
                    <span className="cd-lesson-duration">{lesson.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cd-sidebar-divider"></div>

            <div className="cd-price-row">
              <span className="cd-price">
                ₹ {parseFloat(course.price).toFixed(2)}
              </span>
              {course.type === "free" && (
                <span className="cd-free-tag">Free</span>
              )}
            </div>

            {isOwner ? (
              <button
                className="cd-action-btn edit"
                onClick={() => navigate("/edit-course/" + courseId)}
              >
                ✏️ Edit Course
              </button>
            ) : isTeacher ? (
              <div className="cd-teacher-note">👨‍🏫 Viewing as teacher</div>
            ) : enrolled ? (
              <button className="cd-action-btn continue">
                ▶ Continue Learning
              </button>
            ) : (
              <button
                className="cd-action-btn enroll"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? "Enrolling..." : "Enroll Now"}
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
}

export default CourseDetail;