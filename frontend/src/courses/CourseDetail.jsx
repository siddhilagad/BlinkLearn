import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay, FaPause, FaExpand, FaVolumeUp, FaVolumeMute, FaShoppingCart } from "react-icons/fa";
import "./CourseDetail.css";

// ===== Inline VideoPlayer =====
function VideoPlayer({ videoUrl, thumbnail }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((current / duration) * 100);
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const toggleMute = () => {
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  if (!videoUrl) {
    return (
      <div className="cd-hero">
        {thumbnail ? (
          <img src={thumbnail} alt="Course Thumbnail" className="cd-hero-img" />
        ) : (
          <div className="cd-hero-placeholder">
            <span>📚</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="cd-video-wrapper"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {!playing && progress === 0 && thumbnail && (
        <div className="cd-video-thumb-overlay" onClick={togglePlay}>
          <img src={thumbnail} alt="Course Preview" />
          <div className="cd-play-overlay-btn">
            <FaPlay />
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={togglePlay}
        className="cd-video-element"
        style={{
          display: !playing && progress === 0 && thumbnail ? "none" : "block",
        }}
      />

      {showControls && (playing || progress > 0) && (
        <div className="cd-video-controls">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="cd-progress-range"
          />
          <div className="cd-controls-row">
            <button onClick={togglePlay} className="cd-ctrl-btn">
              {playing ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={toggleMute} className="cd-ctrl-btn">
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <span className="cd-ctrl-label">Course Preview</span>
            <button
              onClick={handleFullscreen}
              className="cd-ctrl-btn"
              style={{ marginLeft: "auto" }}
            >
              <FaExpand />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== CourseDetail =====
function CourseDetail() {
  const { courseId } = useParams();
  const courseIdNum = parseInt(courseId); // ✅ convert string → number for DB
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [buying, setBuying] = useState(false);

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
        const res = await axios.get(`http://localhost:5000/course/${courseIdNum}`);
        setCourse(res.data);
      } catch (err) {
        console.error("Fetch course error:", err);
        setErrorMsg("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // ─── Check already enrolled ───────────────────────────────────────────────
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/enroll/check?user_id=${user.user_id}&course_id=${courseIdNum}`
        );
        setEnrolled(res.data.enrolled);
      } catch (err) {
        // silent — not critical
      }
    };
    checkEnrollment();
  }, [courseId]);

  // ─── isFree check ────────────────────────────────────────────────────────
  const isFree =
    course?.type?.toLowerCase() === "free" ||
    !course?.price ||
    parseFloat(course?.price) === 0;

  // ─── Free Enroll ─────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!user) { navigate("/login"); return; }
    setEnrolling(true);
    try {
      await axios.post("http://localhost:5000/enroll", {
        user_id: user.user_id,
        course_id: courseIdNum,
      });
      setEnrolled(true);
      alert("Enrolled successfully!");
    } catch (err) {
      console.error("Enroll error:", err);
      alert(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  // ─── Buy Now ─────────────────────────────────────────────────────────────
  // ✅ KEY FIX: pass course object in state so CheckoutPage can read it
  const handleBuyNow = () => {
    if (!user) { navigate("/login"); return; }
    setBuying(true);

    // Build a clean course object with all fields CheckoutPage needs
    const courseData = {
      course_id: courseIdNum,
      title: course.title,
      price: course.price,
      thumbnail: course.thumbnail || null,
      level: course.level || "",
    };

    navigate(`/checkout/${courseIdNum}`, {
      state: { course: courseData }, // ✅ THIS was missing — fixed!
    });

    setBuying(false);
  };

  // ─── Add to Cart ──────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }

    setCartLoading(true);
    try {
      await axios.post("http://localhost:5000/cart/add", {
        user_id: user.user_id,
        course_id: courseIdNum, // ✅ number, not string
      });
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2500);
    } catch (err) {
      console.error("Add to cart error:", err);
      // If already in cart, still show success
      if (err.response?.status === 409) {
        setCartAdded(true);
        setTimeout(() => setCartAdded(false), 2500);
      } else {
        alert(err.response?.data?.message || "Could not add to cart. Is backend running?");
      }
    } finally {
      setCartLoading(false);
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

  const thumbnailUrl = course.thumbnail
    ? `http://localhost:5000/uploads/${course.thumbnail}`
    : null;

  const videoUrl = course.preview_video
    ? `http://localhost:5000/uploads/${course.preview_video}`
    : null;

  // ─── Render action buttons ────────────────────────────────────────────────
  const renderActionButtons = () => {

    if (isOwner) {
      return (
        <button
          className="cd-action-btn edit"
          onClick={() => navigate("/edit-course/" + courseIdNum)}
        >
          ✏️ Edit Course
        </button>
      );
    }

    if (isTeacher) {
      return <div className="cd-teacher-note">👨‍🏫 Viewing as teacher</div>;
    }

    if (enrolled) {
      return (
        <button
          className="cd-action-btn continue"
          onClick={() => navigate(`/learn/${courseIdNum}`)}
        >
          ▶ Continue Learning
        </button>
      );
    }

    // FREE course
    if (isFree) {
      return (
        <>
          <button
            className="cd-action-btn enroll"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? "Enrolling..." : "Enroll Now — Free"}
          </button>
          <p className="cd-guarantee">✅ No payment required</p>
        </>
      );
    }

    // PAID course
    return (
      <>
        <button
          className="cd-action-btn buy"
          onClick={handleBuyNow}
          disabled={buying}
        >
          {buying ? "Redirecting..." : "💳 Buy Now"}
        </button>

        <button
          className={`cd-action-btn cart ${cartAdded ? "cart-added" : ""}`}
          onClick={handleAddToCart}
          disabled={cartAdded || cartLoading}
        >
          {cartLoading ? (
            "Adding..."
          ) : cartAdded ? (
            "✓ Added to Cart!"
          ) : (
            <>
              <FaShoppingCart style={{ marginRight: "8px" }} />
              Add to Cart
            </>
          )}
        </button>

        {/* Go to Cart link — shows after adding */}
        {cartAdded && (
          <button
            className="cd-go-to-cart-btn"
            onClick={() => navigate("/cart")}
          >
            🛒 Go to Cart
          </button>
        )}

        <p className="cd-guarantee">🔒 Secure Enrollment</p>
      </>
    );
  };

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

        {/* LEFT */}
        <div className="cd-left">

          <VideoPlayer videoUrl={videoUrl} thumbnail={thumbnailUrl} />

          {enrolled && (
            <div className="cd-progress-overlay">
              <span className="cd-progress-label">
                Course Progress: {progressPercent}%
              </span>
              <div className="cd-progress-bar-track">
                <div
                  className="cd-progress-bar-fill"
                  style={{ width: progressPercent + "%" }}
                />
              </div>
            </div>
          )}

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
                    {lesson.completed ? (
                      <div className="cd-check-filled">✓</div>
                    ) : (
                      <div className="cd-check-empty"></div>
                    )}
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
              {isFree ? (
                <span className="cd-free-tag">Free</span>
              ) : (
                <span className="cd-price">
                  ₹ {parseFloat(course.price).toFixed(2)}
                </span>
              )}
            </div>

            {renderActionButtons()}

          </div>
        </div>

      </div>
    </div>
  );
}

export default CourseDetail;