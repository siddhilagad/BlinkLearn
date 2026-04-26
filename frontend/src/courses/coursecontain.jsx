import React, { useState, useRef, useEffect, useCallback } from "react";
import "./coursecontain.css";

// ─── Sample course data (replace videoUrl with your real URLs) ───
const COURSES = [
  {
    id: 1,
    title: "Introduction & Overview",
    duration: "7:00",
    totalSeconds: 420,
    description:
      "Get started with React.js — learn what it is, why it matters, and what you'll build throughout this course.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  },
  {
    id: 2,
    title: "Core Concepts",
    duration: "6:30",
    totalSeconds: 390,
    description:
      "Dive into components, props, and the virtual DOM — the foundational building blocks of every React app.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
  {
    id: 3,
    title: "Hands-on Practice",
    duration: "8:15",
    totalSeconds: 495,
    description:
      "Build your first component from scratch. Master hooks, state management, and event handling.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1587620962725-abab19836100?w=800&q=80",
  },
  {
    id: 4,
    title: "Advanced Topics",
    duration: "10:00",
    totalSeconds: 600,
    description:
      "Context API, useReducer, custom hooks, and performance optimisation techniques.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
  },
  {
    id: 5,
    title: "Final Project",
    duration: "12:00",
    totalSeconds: 720,
    description:
      "Put everything together — build a complete mini-app from design to deployment.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
  },
];

const STORAGE_KEY = "blinklearn_progress_v2";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function fmt(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── SVG Icons ──────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);
const CheckIcon = ({ size = 14, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

// ─── Main Component ─────────────────────────────────────────────
export default function CourseDashboard() {
  const [progress, setProgress] = useState(loadProgress);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  const videoRef = useRef(null);
  const bannerRef = useRef(null);

  const lesson = COURSES[activeIdx];
  const lessonKey = lesson.id;
  const lessonProg = progress[lessonKey] || { watched: 0, completed: false };

  // ── Computed stats ──────────────────────────────────────────
  const completedCount = COURSES.filter((c) => progress[c.id]?.completed).length;
  const inProgressCount = COURSES.filter((c) => {
    const lp = progress[c.id];
    return lp?.watched > 5 && !lp?.completed;
  }).length;

  const overallPct = Math.round(
    COURSES.reduce((acc, c) => {
      const lp = progress[c.id];
      if (lp?.completed) return acc + 100;
      if (lp?.watched && c.totalSeconds > 0)
        return acc + Math.min(100, (lp.watched / c.totalSeconds) * 100);
      return acc;
    }, 0) / COURSES.length
  );

  // ── Load video at correct saved time ────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    vid.load();
    const saved = progress[lesson.id]?.watched || 0;
    const onMeta = () => {
      vid.currentTime =
        saved && saved < vid.duration - 3 ? saved : 0;
    };
    vid.addEventListener("loadedmetadata", onMeta, { once: true });
    return () => vid.removeEventListener("loadedmetadata", onMeta);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  // ── Track watch time ─────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const ct = vid.currentTime;
    setCurrentTime(ct);
    setProgress((prev) => {
      const lp = prev[lessonKey] || { watched: 0, completed: false };
      if (ct > (lp.watched || 0)) {
        const next = { ...prev, [lessonKey]: { ...lp, watched: ct } };
        saveProgress(next);
        return next;
      }
      return prev;
    });
  }, [lessonKey]);

  // ── Mark lesson complete when video ends ─────────────────────
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress((prev) => {
      const next = {
        ...prev,
        [lessonKey]: {
          ...(prev[lessonKey] || {}),
          completed: true,
          watched: lesson.totalSeconds,
        },
      };
      saveProgress(next);
      return next;
    });
    setShowBanner(true);
    clearTimeout(bannerRef.current);
    bannerRef.current = setTimeout(() => setShowBanner(false), 3500);
  }, [lessonKey, lesson.totalSeconds]);

  // ── Toggle play/pause ────────────────────────────────────────
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.paused ? vid.play() : vid.pause();
  };

  // ── Seek on progress bar click ───────────────────────────────
  const handleSeek = (e) => {
    const vid = videoRef.current;
    if (!vid || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    vid.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  // ── Navigate lessons ─────────────────────────────────────────
  const goTo = (idx) => {
    setActiveIdx(idx);
    setShowBanner(false);
  };

  // ── Derived percentages ──────────────────────────────────────
  const watchedPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const savedPct =
    duration > 0
      ? Math.min(100, ((lessonProg.watched || 0) / duration) * 100)
      : 0;

  // ── Status ───────────────────────────────────────────────────
  const getStatus = () => {
    if (lessonProg.completed) return { cls: "completed", text: "✓ Completed" };
    if ((lessonProg.watched || 0) > 5)
      return {
        cls: "in-progress",
        text: `▶ ${Math.round(((lessonProg.watched || 0) / lesson.totalSeconds) * 100)}% watched`,
      };
    return { cls: "not-started", text: "Not started" };
  };

  const status = getStatus();

  // ── Ring circumference ───────────────────────────────────────
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="cd-root">
      {/* Completion banner */}
      {showBanner && (
        <div className="cd-banner">🎉 Lesson completed! Keep it up!</div>
      )}

      {/* ── Nav ── */}
      <header className="cd-nav">
        <a href="/" className="cd-nav-logo">
          <div className="cd-nav-logo-icon">B</div>
          <span className="cd-nav-brand">
            Blink<span>Learn</span>
          </span>
        </a>
        <div className="cd-nav-right">
          <div className="cd-nav-badge">
            {completedCount}/{COURSES.length} lessons done
          </div>
          <div className="cd-nav-avatar">S</div>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="cd-layout">

        {/* ════ Left column ════ */}
        <div className="cd-main cd-fadein">

          {/* Video player */}
          <div className="cd-player-wrap">
            <div className="cd-video-area" onClick={togglePlay}>
              <video
                ref={videoRef}
                src={lesson.videoUrl}
                poster={lesson.thumbnail}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() =>
                  setDuration(videoRef.current?.duration || 0)
                }
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Overlay shown when paused */}
              {!isPlaying && (
                <div className="cd-video-overlay">
                  <button className="cd-big-play" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                    <PlayIcon />
                  </button>
                </div>
              )}

              {/* Badges */}
              <div className="cd-lesson-badge">
                Lesson {activeIdx + 1} / {COURSES.length}
              </div>
              {lessonProg.completed && (
                <div className="cd-completed-badge">✓ Completed</div>
              )}
            </div>

            {/* Controls */}
            <div className="cd-controls">
              {/* Seek bar */}
              <div className="cd-seekbar-wrap">
                <div className="cd-seekbar-track" onClick={handleSeek}>
                  <div className="cd-seekbar-saved" style={{ width: `${savedPct}%` }} />
                  <div className="cd-seekbar-fill" style={{ width: `${watchedPct}%` }} />
                  <div className="cd-seekbar-thumb" style={{ left: `${watchedPct}%` }} />
                </div>
                <div className="cd-time-row">
                  <span>{fmt(currentTime)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="cd-ctrl-row">
                <div className="cd-ctrl-left">
                  <button className="cd-play-btn" onClick={togglePlay}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <button
                    className="cd-nav-btn"
                    disabled={activeIdx === 0}
                    onClick={() => goTo(activeIdx - 1)}
                  >
                    ← Prev
                  </button>
                  <button
                    className="cd-nav-btn"
                    disabled={activeIdx === COURSES.length - 1}
                    onClick={() => goTo(activeIdx + 1)}
                  >
                    Next →
                  </button>
                </div>
                <span className={`cd-status-pill ${status.cls}`}>
                  {status.text}
                </span>
              </div>
            </div>
          </div>

          {/* Lesson info */}
          <div className="cd-card cd-lesson-info">
            <h1 className="cd-lesson-title">{lesson.title}</h1>
            <p className="cd-lesson-desc">{lesson.description}</p>
          </div>

          {/* Stats row */}
          <div className="cd-stats-row">
            {[
              { icon: "📚", value: COURSES.length, label: "Total Lessons" },
              { icon: "✅", value: completedCount, label: "Completed" },
              { icon: "▶", value: inProgressCount, label: "In Progress" },
              { icon: "⏳", value: COURSES.length - completedCount, label: "Remaining" },
            ].map((s) => (
              <div className="cd-stat-card" key={s.label}>
                <div className="cd-stat-icon">{s.icon}</div>
                <div className="cd-stat-value">{s.value}</div>
                <div className="cd-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ Sidebar ════ */}
        <aside className="cd-sidebar">

          {/* Progress ring */}
          <div className="cd-card cd-ring-card">
            <div className="cd-ring-wrap">
              <svg
                className="cd-ring-svg"
                width="86"
                height="86"
                viewBox="0 0 86 86"
              >
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6c5cff" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <circle
                  cx="43" cy="43" r={R}
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="6"
                />
                <circle
                  cx="43" cy="43" r={R}
                  fill="none"
                  stroke="url(#rg)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - overallPct / 100)}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="cd-ring-text">
                <span className="cd-ring-pct">{overallPct}%</span>
                <span className="cd-ring-lbl">done</span>
              </div>
            </div>

            <div>
              <div className="cd-ring-info-title">Overall Progress</div>
              <div className="cd-ring-info-sub">
                {completedCount} of {COURSES.length} lessons
                <br />
                completed
              </div>
              {completedCount === COURSES.length && (
                <div className="cd-course-complete-tag">
                  🏆 Course Complete!
                </div>
              )}
            </div>
          </div>

          {/* Lesson list */}
          <div className="cd-card cd-list-card">
            <div className="cd-list-header">
              <div className="cd-list-title">Course Content</div>
              <div className="cd-list-meta">
                {COURSES.length} lessons · 2h 30m
              </div>
            </div>

            <div className="cd-lesson-list">
              {COURSES.map((c, idx) => {
                const lp = progress[c.id] || {};
                const pct = lp.completed
                  ? 100
                  : Math.min(
                      100,
                      Math.round(((lp.watched || 0) / c.totalSeconds) * 100)
                    );
                const isActive = idx === activeIdx;

                // Dot state
                const dotCls = lp.completed
                  ? "done"
                  : isActive
                  ? "active"
                  : pct > 0
                  ? "progress"
                  : "idle";

                return (
                  <div
                    key={c.id}
                    className={`cd-lesson-item${isActive ? " active" : ""}`}
                    onClick={() => goTo(idx)}
                  >
                    <div className={`cd-lesson-dot ${dotCls}`}>
                      {lp.completed ? (
                        <CheckIcon size={14} color="white" />
                      ) : isActive ? (
                        <PlayIcon />
                      ) : pct > 0 ? (
                        "▶"
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div className="cd-lesson-item-body">
                      <div className="cd-lesson-item-name">{c.title}</div>
                      {pct > 0 && !lp.completed && (
                        <div className="cd-mini-bar-track">
                          <div
                            className="cd-mini-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <span className="cd-lesson-item-dur">{c.duration}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="cd-card cd-legend-card">
            <div className="cd-legend-title">Legend</div>
            <div className="cd-legend-list">
              {[
                {
                  bg: "linear-gradient(135deg,#22d3a5,#16a085)",
                  label: "Completed",
                },
                {
                  bg: "linear-gradient(135deg,#6c5cff,#c084fc)",
                  label: "Currently watching",
                },
                {
                  bg: "rgba(245,158,11,0.25)",
                  border: "1.5px solid rgba(245,158,11,0.5)",
                  label: "In progress",
                },
                {
                  bg: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  label: "Not started",
                },
              ].map((item) => (
                <div className="cd-legend-item" key={item.label}>
                  <div
                    className="cd-legend-dot"
                    style={{
                      background: item.bg,
                      border: item.border || "none",
                    }}
                  />
                  <span className="cd-legend-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
