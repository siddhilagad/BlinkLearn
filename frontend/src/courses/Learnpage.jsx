import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPlay, FaPause, FaExpand, FaVolumeUp, FaVolumeMute,
  FaCheckCircle, FaLock, FaChevronLeft, FaChevronRight,
  FaBookOpen, FaClock, FaListUl
} from "react-icons/fa";
import "./Learnpage.css";

const BASE = "http://localhost:5000";

function buildUrl(val) {
  if (!val || val === "null" || String(val).trim() === "") return null;
  const v = String(val).trim();
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("uploads/") || v.startsWith("/uploads/"))
    return `${BASE}/${v.replace(/^\//, "")}`;
  return `${BASE}/uploads/${v}`;
}

// ── Video Player ──
function LessonPlayer({ videoUrl, thumbnail, onEnded }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef(null);

  // Reset when video changes
  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setVideoError(false);
  }, [videoUrl]);

  const showCtrlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
    showCtrlsTemporarily();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(cur);
    if (dur) setProgress((cur / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const val = Number(e.target.value);
    videoRef.current.currentTime = (val / 100) * videoRef.current.duration;
    setProgress(val);
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

  const handleEnded = () => {
    setPlaying(false);
    setProgress(100);
    if (onEnded) onEnded();
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // No video → show thumbnail or placeholder
  if (!videoUrl || videoError) {
    return (
      <div className="lp-player-box lp-no-video">
        {thumbnail ? (
          <img src={thumbnail} alt="Lesson" className="lp-thumb-img"
            onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div className="lp-no-video-msg">
            <FaBookOpen style={{ fontSize: 48, color: "#a78bfa", marginBottom: 12 }} />
            <p>No video available for this lesson</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="lp-player-box"
      onMouseMove={showCtrlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Thumbnail overlay before play */}
      {!playing && progress === 0 && (
        <div className="lp-thumb-overlay" onClick={togglePlay}>
          {thumbnail && (
            <img src={thumbnail} alt="Lesson thumbnail"
              onError={(e) => { e.target.style.display = "none"; }} />
          )}
          <button className="lp-big-play-btn"><FaPlay /></button>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        className="lp-video-el"
        style={{ display: !playing && progress === 0 ? "none" : "block" }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setVideoError(true)}
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Controls */}
      {(playing || progress > 0) && (
        <div className={`lp-controls ${showControls ? "visible" : ""}`}>
          <div className="lp-progress-wrap">
            <span className="lp-time">{formatTime(currentTime)}</span>
            <input
              type="range" min="0" max="100"
              value={progress} onChange={handleSeek}
              className="lp-seek"
            />
            <span className="lp-time">{formatTime(duration)}</span>
          </div>
          <div className="lp-ctrl-row">
            <button className="lp-ctrl-btn" onClick={togglePlay}>
              {playing ? <FaPause /> : <FaPlay />}
            </button>
            <button className="lp-ctrl-btn" onClick={toggleMute}>
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <div style={{ flex: 1 }} />
            <button className="lp-ctrl-btn" onClick={handleFullscreen}>
              <FaExpand />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Learn Page ──
export default function LearnPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentLesson = lessons[currentIdx] || null;
  const progressPercent = lessons.length
    ? Math.round((completedIds.size / lessons.length) * 100)
    : 0;

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        axios.get(`${BASE}/api/course/${courseId}`),
        axios.get(`${BASE}/api/course/${courseId}/lessons`).catch(() => ({ data: [] })),
      ]);
      setCourse(courseRes.data);

      // Use API lessons — no fake fallback
      const apiLessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
      setLessons(apiLessons);
      setCompletedIds(new Set());
    } catch (err) {
      console.error("LearnPage fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = (lessonId) => {
    setCompletedIds((prev) => new Set([...prev, lessonId]));
    // Optionally persist to backend:
    // axios.post(`${BASE}/api/lesson/complete`, { user_id: user.user_id, lesson_id: lessonId });
  };

  const goToLesson = (idx) => {
    if (idx < 0 || idx >= lessons.length) return;
    setCurrentIdx(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVideoEnded = () => {
    if (currentLesson) markComplete(currentLesson.id);
    // Auto-advance to next lesson after 2s
    setTimeout(() => {
      if (currentIdx < lessons.length - 1) goToLesson(currentIdx + 1);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="lp-loading">
        <div className="lp-spinner" />
        <p>Loading your course...</p>
      </div>
    );
  }

  const getLessonTitle = (lesson) => {
    return lesson.display_title || 
      (lesson.title && lesson.title !== 'Untitled Lesson' ? lesson.title : null) || 
      lesson.section_title || 
      lesson.title || 
      'Lesson';
  };

  const getLessonDuration = (lesson) => {
    if (lesson.duration_formatted) return lesson.duration_formatted;
    const dur = Number(lesson.duration || lesson.duration_seconds || 0);
    if (dur > 0) {
      const m = Math.floor(dur / 60);
      const s = dur % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    if (typeof lesson.duration === 'string' && lesson.duration.includes(':')) return lesson.duration;
    return null;
  };

  const videoUrl = currentLesson ? buildUrl(currentLesson.video_url || currentLesson.videoUrl) : null;
  const thumbnail = buildUrl(course?.thumbnail);

  return (
    <div className="lp-page">

      {/* ── Top Bar ── */}
      <div className="lp-topbar">
        <button className="lp-back-btn" onClick={() => navigate(`/course/${courseId}`)}>
          <FaChevronLeft /> Back
        </button>
        <div className="lp-topbar-center">
          <span className="lp-course-title">{course?.title}</span>
        </div>
        <div className="lp-topbar-right">
          <div className="lp-top-progress">
            <span>{progressPercent}% complete</span>
            <div className="lp-top-bar">
              <div className="lp-top-fill" style={{ width: progressPercent + "%" }} />
            </div>
          </div>
          <button
            className="lp-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle lesson list"
          >
            <FaListUl />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={`lp-body ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

        {/* LEFT: Video + lesson info */}
        <div className="lp-main">
          {lessons.length === 0 ? (
            <div className="lp-no-video" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FaBookOpen style={{ fontSize: 48, color: '#a78bfa', marginBottom: 16 }} />
              <h2 style={{ color: '#fff', marginBottom: 8 }}>No Lessons Available Yet</h2>
              <p style={{ color: '#9ca3af' }}>The instructor hasn't added any lessons to this course yet.</p>
            </div>
          ) : (
          <>
          <LessonPlayer
            key={currentLesson?.id}
            videoUrl={videoUrl}
            thumbnail={thumbnail}
            onEnded={handleVideoEnded}
          />

          {/* Lesson navigation arrows */}
          <div className="lp-nav-row">
            <button
              className="lp-nav-btn"
              onClick={() => goToLesson(currentIdx - 1)}
              disabled={currentIdx === 0}
            >
              <FaChevronLeft /> Previous
            </button>

            {currentLesson && !completedIds.has(currentLesson.id) && (
              <button
                className="lp-mark-btn"
                onClick={() => markComplete(currentLesson.id)}
              >
                ✓ Mark as Complete
              </button>
            )}
            {currentLesson && completedIds.has(currentLesson.id) && (
              <span className="lp-completed-badge">
                <FaCheckCircle /> Completed
              </span>
            )}

            <button
              className="lp-nav-btn next"
              onClick={() => goToLesson(currentIdx + 1)}
              disabled={currentIdx === lessons.length - 1}
            >
              Next <FaChevronRight />
            </button>
          </div>

          {/* Lesson info card */}
          <div className="lp-lesson-info-card">
            <div className="lp-lesson-header">
              <span className="lp-lesson-num">Lesson {currentIdx + 1} of {lessons.length}</span>
              {currentLesson && getLessonDuration(currentLesson) && (
                <span className="lp-lesson-dur"><FaClock /> {getLessonDuration(currentLesson)}</span>
              )}
            </div>
            <h2 className="lp-lesson-title">{currentLesson ? getLessonTitle(currentLesson) : 'Lesson'}</h2>
            {currentLesson?.description && (
              <p className="lp-lesson-desc">{currentLesson.description}</p>
            )}
          </div>
          </>
          )}
        </div>

        {/* RIGHT: Lesson sidebar */}
        {sidebarOpen && (
          <div className="lp-sidebar">
            <div className="lp-sidebar-header">
              <h3>Course Content</h3>
              <span className="lp-sidebar-meta">
                {completedIds.size}/{lessons.length} lessons
              </span>
            </div>

            {/* Overall progress bar */}
            <div className="lp-sidebar-progress">
              <div className="lp-sidebar-bar">
                <div className="lp-sidebar-fill" style={{ width: progressPercent + "%" }} />
              </div>
              <span>{progressPercent}%</span>
            </div>

            <div className="lp-lessons-scroll">
              {lessons.map((lesson, idx) => {
                const isActive = idx === currentIdx;
                const isDone = completedIds.has(lesson.id);
                return (
                  <div
                    key={lesson.id || idx}
                    className={[
                      "lp-lesson-row",
                      isActive ? "active" : "",
                      isDone ? "done" : "",
                    ].join(" ").trim()}
                    onClick={() => goToLesson(idx)}
                  >
                    <div className="lp-lesson-status">
                      {isDone ? (
                        <FaCheckCircle className="lp-icon-done" />
                      ) : isActive ? (
                        <div className="lp-icon-playing"><FaPlay /></div>
                      ) : (
                        <div className="lp-icon-circle">{idx + 1}</div>
                      )}
                    </div>
                    <div className="lp-lesson-text">
                      <span className="lp-lesson-name">{getLessonTitle(lesson)}</span>
                      {getLessonDuration(lesson) && (
                        <span className="lp-lesson-time">{getLessonDuration(lesson)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
