import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay, FaPause, FaExpand, FaVolumeUp, FaVolumeMute, FaShoppingCart } from "react-icons/fa";
import "./CourseDetail.css";
import RatingsAndReviews from "../ratingandreview/RatingsAndReviews";


const BASE = "http://localhost:5000";

function buildMediaUrl(value) {
  if (!value || value === "null" || String(value).trim() === "") return null;
  let v = String(value).trim();
  v = v.replace(/\\/g, "/");
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("uploads/") || v.startsWith("/uploads/")) {
    return `${BASE}/${v.replace(/^\//, "")}`;
  }
  return `${BASE}/uploads/${v}`;
}

// ===== VideoPlayer =====
function VideoPlayer({ videoUrl, thumbnail }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setVideoError(false); }, [videoUrl]);
  useEffect(() => { setImgError(false); }, [thumbnail]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration) setProgress((currentTime / duration) * 100);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const newTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(Number(e.target.value));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const handleEnded = () => { setPlaying(false); setProgress(0); };

  if (!videoUrl || videoError) {
    return (
      <div className="cd-hero">
        {thumbnail && !imgError ? (
          <img
            src={thumbnail}
            alt="Course Thumbnail"
            className="cd-hero-img"
            onError={() => setImgError(true)}
          />
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
      {!playing && progress === 0 && thumbnail && !imgError && (
        <div className="cd-video-thumb-overlay" onClick={togglePlay}>
          <img
            src={thumbnail}
            alt="Course Preview"
            onError={() => setImgError(true)}
          />
          <div className="cd-play-overlay-btn"><FaPlay /></div>
        </div>
      )}

      {!playing && progress === 0 && (!thumbnail || imgError) && (
        <div className="cd-video-no-thumb" onClick={togglePlay}>
          <div className="cd-play-overlay-btn"><FaPlay /></div>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail || undefined}
        controls
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={togglePlay}
        onError={() => setVideoError(true)}
        className="cd-video-element"
        preload="metadata"
      />

      {showControls && (playing || progress > 0) && (
        <div className="cd-video-controls">
          <input
            type="range" min="0" max="100"
            value={progress} onChange={handleSeek}
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
            <button onClick={handleFullscreen} className="cd-ctrl-btn" style={{ marginLeft: "auto" }}>
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
  const courseIdNum = parseInt(courseId);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));
  const userRole = user?.role?.toLowerCase();
  const isStudent = userRole === "student";

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);

  const completedCount = lessons.filter((l) => l.completed).length;
  const progressPercent = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const totalDurationStr = (() => {
    if (!lessons.length) return "—";
    const totalSec = lessons.reduce((acc, l) => {
      const duration = Number(l.duration || l.duration_seconds || 0);
      return acc + (Number.isFinite(duration) ? duration : 0);
    }, 0);
    if (totalSec > 0) {
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
    return `${lessons.length} lessons`;
  })();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${BASE}/api/course/${courseIdNum}`);
        setCourse(res.data);
      } catch (err) {
        console.error("Fetch course error:", err);
        setErrorMsg("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${BASE}/check-enrollment/${user.user_id}/${courseId}`);
        setEnrolled(res.data.enrolled);
      } catch (err) {
        console.error("Enrollment check failed:", err);
      }
    };

    const fetchLessons = async () => {
      try {
        const res = await axios.get(`${BASE}/api/course/${courseIdNum}/lessons`);
        const data = Array.isArray(res.data) ? res.data : [];
        setLessons(data);
        if (data.length > 0) setCurrentLesson(data[0]);
      } catch (err) {
        console.error("Lessons fetch failed — using fallback:", err);
        const fallback = [
          { id: 1, title: "Introduction & Overview", duration: "7:00", completed: true },
          { id: 2, title: "Core Concepts", duration: "6:30", completed: true },
          { id: 3, title: "Hands-on Practice", duration: "8:15", completed: true },
          { id: 4, title: "Advanced Topics", duration: "10:00", completed: false },
          { id: 5, title: "Final Project", duration: "12:00", completed: false },
        ];
        setLessons(fallback);
        setCurrentLesson(fallback[0]);
      }
    };

    fetchCourse();
    checkEnrollment();
    fetchLessons();
  }, [courseId]);

  const isFree =
    course?.type?.toLowerCase() === "free" ||
    !course?.price ||
    parseFloat(course?.price) === 0;

  const handleEnroll = async () => {
    if (!user) { navigate("/login"); return; }
    if (!isStudent) {
      alert("Only students can enroll. Please switch to student mode to enroll.");
      return;
    }
    setEnrolling(true);
    try {
      await axios.post(`${BASE}/api/enroll`, { user_id: user.user_id, course_id: courseIdNum });
      setEnrolled(true);
      alert("Enrolled successfully! 🎉\nThis course is now available in My Learning.");
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) { navigate("/login"); return; }
    if (!isStudent) {
      alert("Only students can purchase and enroll in courses. Switch to student mode first.");
      return;
    }
    setBuying(true);
    navigate(`/checkout/${courseIdNum}`, {
      state: {
        course: {
          course_id: courseIdNum,
          title: course.title,
          price: course.price,
          thumbnail: course.thumbnail || null,
          level: course.level || "",
        },
      },
    });
    setBuying(false);
  };

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    if (!isStudent) {
      alert("Only students can add courses to cart. Switch to student mode first.");
      return;
    }
    setCartLoading(true);
    try {
      await axios.post(`${BASE}/cart/add`, { user_id: user.user_id, course_id: courseIdNum });
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to cart.");
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cd-loading-screen">
        <div className="cd-spinner" />
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

  const thumbnailUrl = buildMediaUrl(course.thumbnail);
  const videoUrl = buildMediaUrl(course.preview_video);

  console.log("🖼 thumbnailUrl →", thumbnailUrl);
  console.log("🎬 videoUrl →", videoUrl);

  const renderActionButtons = () => {
    if (enrolled) {
      return (
        <button className="cd-action-btn continue" onClick={() => navigate(`/learn/${courseIdNum}`)}>
          ▶ Continue Learning
        </button>
      );
    }
    if (isFree) {
      if (!user) {
        return (
          <>
            <button className="cd-action-btn enroll" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? "Enrolling..." : "Login to Enroll"}
            </button>
            <p className="cd-guarantee">✅ No payment required</p>
          </>
        );
      }
      if (!isStudent) {
        return (
          <>
            <button className="cd-action-btn disabled" disabled>
              Only students can enroll
            </button>
            <p className="cd-guarantee">Switch to student mode to enroll and access this course in My Learning.</p>
          </>
        );
      }
      return (
        <>
          <button className="cd-action-btn enroll" onClick={handleEnroll} disabled={enrolling}>
            {enrolling ? "Enrolling..." : "Enroll Now — Free"}
          </button>
          <p className="cd-guarantee">✅ No payment required</p>
        </>
      );
    }
    return (
      <>
        <button className="cd-action-btn buy" onClick={handleBuyNow} disabled={buying}>
          {buying ? "Redirecting..." : "💳 Buy Now"}
        </button>
        <button
          className={`cd-action-btn cart ${cartAdded ? "cart-added" : ""}`}
          onClick={handleAddToCart}
          disabled={cartAdded || cartLoading}
        >
          {cartLoading ? "Adding..." : cartAdded ? "✓ Added to Cart!" : (
            <><FaShoppingCart style={{ marginRight: "8px" }} />Add to Cart</>
          )}
        </button>
        {cartAdded && (
          <button className="cd-go-to-cart-btn" onClick={() => navigate("/cart")}>
            🛒 Go to Cart
          </button>
        )}
        <p className="cd-guarantee">🔒 Secure Enrollment</p>
      </>
    );
  };

  return (
    <div className="cd-page">
      <div className="cd-topbar">
        <button className="cd-back-btn" onClick={() => navigate(-1)}>← Back to Courses</button>
        <span className="cd-breadcrumb">Courses / {course.title}</span>
      </div>

      <div className="cd-wrapper">
        {/* LEFT */}
        <div className="cd-left">
          <VideoPlayer videoUrl={videoUrl} thumbnail={thumbnailUrl} />

          {enrolled && (
            <div className="cd-progress-overlay-bar">
              <span className="cd-progress-label">Course Progress: {progressPercent}%</span>
              <div className="cd-progress-bar-track">
                <div className="cd-progress-bar-fill" style={{ width: progressPercent + "%" }} />
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
                <span>{totalDurationStr}</span>
              </div>
              <span className="cd-badge level">{course.level}</span>
              {course.category && <span className="cd-badge category">{course.category}</span>}
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
                {course.tutor_title && <p className="cd-instructor-title">{course.tutor_title}</p>}
                <div className="cd-instructor-meta">
                  <span className="cd-meta-rating">★ 4.9 rating</span>
                  <span>👥 28,450 students</span>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Ratings & Reviews — correctly placed here */}
          <RatingsAndReviews courseId={courseIdNum} />

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="cd-right">
          <div className="cd-sidebar-card">
            <h3 className="cd-sidebar-title">Course Content</h3>
            <p className="cd-sidebar-meta">{lessons.length} lessons • {totalDurationStr}</p>

            <div className="cd-lessons-list">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  onClick={() => setCurrentLesson(lesson)}
                  className={[
                    "cd-lesson-item",
                    lesson.completed ? "completed" : "",
                    currentLesson?.id === lesson.id ? "active" : "",
                  ].join(" ").trim()}
                >
                  <div className="cd-lesson-icon">
                    {lesson.completed
                      ? <div className="cd-check-filled">✓</div>
                      : <div className="cd-check-empty" />}
                  </div>
                  <div className="cd-lesson-info">
                    <span className="cd-lesson-title">{idx + 1}. {lesson.title}</span>
                    <span className="cd-lesson-duration">{lesson.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cd-sidebar-divider" />

            <div className="cd-price-row">
              {isFree
                ? <span className="cd-free-tag">Free</span>
                : <span className="cd-price">₹ {parseFloat(course.price).toFixed(2)}</span>
              }
            </div>

            {renderActionButtons()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
