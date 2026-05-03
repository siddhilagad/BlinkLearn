import React, { useState, useRef } from "react";
import "./AddCourse.css";
import { addCourse } from "../../api/api";

// ─── Helpers ─────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const parseDurationSeconds = (value) => {
  if (!value) return 0;
  const str = String(value).trim();
  const parts = str.split(":");
  if (parts.length === 2 && parts[0] !== "" && parts[1] !== "") {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
      return minutes * 60 + seconds;
    }
  }
  const raw = Number(str);
  return Number.isFinite(raw) ? raw : 0;
};

const makeLesson = () => ({
  id: uid(),
  title: "",
  type: "video",
  duration: "",
  videoFile: null,
  videoName: "",
});

const makeSection = () => ({
  id: uid(),
  title: "",
  open: true,
  lessons: [makeLesson()],
});

// ─── Icons ───────────────────────────────────────────────────────
const Icon = {
  drag:    () => <span title="Drag">⠿</span>,
  chevron: () => <span>▾</span>,
  add:     () => <span style={{ fontSize: 16 }}>＋</span>,
  trash:   () => <span>🗑</span>,
  video:   () => <span>🎬</span>,
  article: () => <span>📄</span>,
  quiz:    () => <span>🧩</span>,
  upload:  () => <span>⬆</span>,
  check:   () => <span style={{ color: "#22c55e" }}>✓</span>,
  rocket:  () => <span>🚀</span>,
};

const lessonTypeIcon = (type) => {
  if (type === "video")   return <Icon.video />;
  if (type === "article") return <Icon.article />;
  return <Icon.quiz />;
};

// ─── Component ───────────────────────────────────────────────────
export default function AddCourse() {
  const [title, setTitle]          = useState("");
  const [description, setDesc]     = useState("");
  const [price, setPrice]          = useState("");
  const [level, setLevel]          = useState("Beginner");
  const [category, setCategory]    = useState("");
  const [thumbnail, setThumbnail]  = useState(null);
  const [previewVideo, setPreview] = useState(null);
  const [sections, setSections]    = useState([makeSection()]);
  const [step, setStep]            = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const thumbRef   = useRef();
  const previewRef = useRef();

  const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0);
  const totalVideos  = sections.reduce(
    (a, s) => a + s.lessons.filter((l) => l.type === "video").length, 0
  );

  // ── Section operations ────────────────────────────────────────
  const addSection = () => setSections((prev) => [...prev, makeSection()]);
  const removeSection = (sid) => setSections((prev) => prev.filter((s) => s.id !== sid));
  const toggleSection = (sid) =>
    setSections((prev) => prev.map((s) => (s.id === sid ? { ...s, open: !s.open } : s)));
  const updateSectionTitle = (sid, val) =>
    setSections((prev) => prev.map((s) => (s.id === sid ? { ...s, title: val } : s)));

  // ── Lesson operations ─────────────────────────────────────────
  const addLesson = (sid) =>
    setSections((prev) =>
      prev.map((s) => s.id === sid ? { ...s, lessons: [...s.lessons, makeLesson()] } : s)
    );
  const removeLesson = (sid, lid) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sid ? { ...s, lessons: s.lessons.filter((l) => l.id !== lid) } : s
      )
    );
  const updateLesson = (sid, lid, field, val) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sid
          ? { ...s, lessons: s.lessons.map((l) => (l.id === lid ? { ...l, [field]: val } : l)) }
          : s
      )
    );
  const handleLessonVideo = (sid, lid, file) => {
    if (!file) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sid
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lid ? { ...l, videoFile: file, videoName: file.name } : l
              ),
            }
          : s
      )
    );
  };

  // ── Thumbnail / preview ───────────────────────────────────────
  const handleThumb = (file) => {
    if (!file) return;
    setThumbnail({ file, url: URL.createObjectURL(file) });
  };
  const handlePreview = (file) => {
    if (!file) return;
    setPreview({ file, name: file.name });
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIXED: use "blinklearn_user" key (same as login/home.jsx)
    const user = JSON.parse(localStorage.getItem("blinklearn_user"));
    const teacherId = user?.user_id || user?.id;
    if (!teacherId) {
      alert("Please log in first.");
      return;
    }

    if (!title || !description || price === "") {
      alert("Please fill in all required fields.");
      setStep(1);
      return;
    }
    if (!thumbnail?.file) {
      alert("Please upload a course thumbnail.");
      setStep(2);
      return;
    }

    const formData = new FormData();
    formData.append("teacher_id", teacherId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("level", level);
    formData.append("category", category);
    formData.append("thumbnail", thumbnail.file);
    if (previewVideo?.file) {
      formData.append("preview_video", previewVideo.file);
    }

    const sectionsPayload = sections.map((section, sectionIndex) => ({
      title: section.title,
      lessons: section.lessons.map((lesson, lessonIndex) => {
        const lessonVideoField = lesson.videoFile ? `lesson_video_${sectionIndex}_${lessonIndex}` : null;
        if (lesson.videoFile) {
          formData.append(lessonVideoField, lesson.videoFile);
        }
        return {
          title: lesson.title,
          type: lesson.type,
          duration: parseDurationSeconds(lesson.duration),
          description: lesson.description || null,
          videoField: lessonVideoField,
          sectionTitle: section.title,
        };
      }),
    }));
    formData.append("sections", JSON.stringify(sectionsPayload));

    try {
      setIsSubmitting(true);
      const data = await addCourse(formData);
      console.log("Course created:", data);
      alert("✅ Course published successfully!");

      // Reset form
      setTitle("");
      setDesc("");
      setPrice("");
      setLevel("Beginner");
      setCategory("");
      setThumbnail(null);
      setPreview(null);
      setSections([makeSection()]);
      setStep(1);
    } catch (error) {
      console.error("Submit error:", error);
      console.error("Submit response data:", error?.response?.data);
      const msg = error?.response?.data?.message || error.message || "Failed to publish course.";
      alert(`❌ ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ac-page">

      {/* ── Header ── */}
      <div className="ac-header">
        <div className="ac-header-inner">
          <div className="ac-header-tag">✏️ Teacher Studio</div>
          <h1>Create a New Course</h1>
          <p>Fill in the details and build your curriculum topic by topic</p>
        </div>
        <div className="ac-steps">
          {[{ n: 1, label: "Basic Info" }, { n: 2, label: "Media" }, { n: 3, label: "Curriculum" }].map((s) => (
            <div key={s.n} className={`ac-step${step === s.n ? " active" : ""}`} onClick={() => setStep(s.n)}>
              <div className="ac-step-num">{s.n}</div>
              <div>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <form className="ac-body" onSubmit={handleSubmit}>

        {/* ════ STEP 1 — Basic Info ════ */}
        {step === 1 && (
          <>
            <div className="ac-card">
              <div className="ac-card-head">
                <div className="ac-card-title"><div className="ac-card-title-icon">📝</div>Course Details</div>
              </div>
              <div className="ac-card-body">
                <div className="ac-row">
                  <div className="ac-field full">
                    <label className="ac-label">Course Title <span className="req">*</span></label>
                    <input className="ac-input" placeholder="e.g. Complete Node.js Course" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="ac-field full">
                    <label className="ac-label">Description <span className="req">*</span></label>
                    <textarea className="ac-textarea" placeholder="What will students learn in this course?" value={description} onChange={(e) => setDesc(e.target.value)} required />
                  </div>
                  <div className="ac-field">
                    <label className="ac-label">Price (₹) <span className="req">*</span></label>
                    <input className="ac-input" placeholder="0 for free" value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" required />
                  </div>
                  <div className="ac-field">
                    <label className="ac-label">Level</label>
                    <select className="ac-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>All Levels</option>
                    </select>
                  </div>
                  <div className="ac-field full">
                    <label className="ac-label">Category</label>
                    <input className="ac-input" placeholder="e.g. Web Development, Data Science" value={category} onChange={(e) => setCategory(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="ac-btn primary" onClick={() => setStep(2)}>Next: Media →</button>
            </div>
          </>
        )}

        {/* ════ STEP 2 — Media ════ */}
        {step === 2 && (
          <>
            <div className="ac-card">
              <div className="ac-card-head">
                <div className="ac-card-title"><div className="ac-card-title-icon">🖼️</div>Course Thumbnail <span className="req">*</span></div>
              </div>
              <div className="ac-card-body">
                <div className="ac-upload-zone" onClick={() => thumbRef.current.click()}>
                  <input ref={thumbRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => handleThumb(e.target.files[0])} />
                  {thumbnail ? (
                    <div className="ac-upload-preview">
                      <img className="ac-upload-preview-thumb" src={thumbnail.url} alt="thumb" />
                      <span className="ac-upload-preview-name">{thumbnail.file.name}</span>
                      <button type="button" className="ac-upload-preview-remove" onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <div className="ac-upload-icon">🖼️</div>
                      <div className="ac-upload-title">Click to upload thumbnail</div>
                      <div className="ac-upload-hint">JPG, PNG, WEBP · Max 5MB</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="ac-card">
              <div className="ac-card-head">
                <div className="ac-card-title">
                  <div className="ac-card-title-icon">🎬</div>
                  Preview Video <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-m)" }}>(Optional)</span>
                </div>
              </div>
              <div className="ac-card-body">
                <div className="ac-upload-zone" onClick={() => previewRef.current.click()}>
                  <input ref={previewRef} type="file" accept="video/mp4,video/mov,video/webm" style={{ display: "none" }} onChange={(e) => handlePreview(e.target.files[0])} />
                  {previewVideo ? (
                    <div className="ac-upload-preview">
                      <span style={{ fontSize: 28 }}>🎬</span>
                      <span className="ac-upload-preview-name">{previewVideo.name}</span>
                      <button type="button" className="ac-upload-preview-remove" onClick={(e) => { e.stopPropagation(); setPreview(null); }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <div className="ac-upload-icon">🎬</div>
                      <div className="ac-upload-title">Click to upload preview video</div>
                      <div className="ac-upload-hint">MP4, MOV, WEBM · Max 500MB</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="button" className="ac-btn ghost" onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="ac-btn primary" onClick={() => setStep(3)}>Next: Curriculum →</button>
            </div>
          </>
        )}

        {/* ════ STEP 3 — Curriculum ════ */}
        {step === 3 && (
          <>
            <div className="ac-card">
              <div className="ac-card-head">
                <div className="ac-card-title"><div className="ac-card-title-icon">📚</div>Course Curriculum</div>
              </div>
              <div className="ac-card-body">
                <div className="ac-summary-bar">
                  <div className="ac-summary-item">📦 <strong>{sections.length}</strong><span>Sections</span></div>
                  <div className="ac-summary-item">📋 <strong>{totalLessons}</strong><span>Lessons</span></div>
                  <div className="ac-summary-item">🎬 <strong>{totalVideos}</strong><span>Videos</span></div>
                </div>

                {sections.map((section, si) => (
                  <div key={section.id} className={`ac-section${section.open ? " open" : ""}`}>
                    <div className="ac-section-head">
                      <span className="ac-section-drag" title="Drag to reorder"><Icon.drag /></span>
                      <div className="ac-section-num">{si + 1}</div>
                      <input
                        className="ac-section-title-input"
                        placeholder={`Section ${si + 1}: e.g. Introduction to the Course`}
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="ac-section-actions">
                        <button type="button" className="ac-icon-btn danger" title="Remove section"
                          onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}>
                          <Icon.trash />
                        </button>
                        <button type="button" className="ac-icon-btn" title="Toggle" onClick={() => toggleSection(section.id)}>
                          <span className="ac-chevron"><Icon.chevron /></span>
                        </button>
                      </div>
                    </div>

                    {section.open && (
                      <div className="ac-lessons">
                        {section.lessons.map((lesson, li) => (
                          <div key={lesson.id} className="ac-lesson-item">
                            <span className="ac-lesson-drag"><Icon.drag /></span>
                            <div className={`ac-lesson-type-icon ${lesson.type}`}>{lessonTypeIcon(lesson.type)}</div>
                            <div className="ac-lesson-fields">
                              <input
                                className="ac-lesson-name-input"
                                placeholder={`Lesson ${li + 1}: e.g. What is React?`}
                                value={lesson.title}
                                onChange={(e) => updateLesson(section.id, lesson.id, "title", e.target.value)}
                              />
                              
                              <input
                                className="ac-lesson-duration-input"
                                placeholder="0:00"
                                value={lesson.duration}
                                onChange={(e) => updateLesson(section.id, lesson.id, "duration", e.target.value)}
                                title="Duration (e.g. 5:30)"
                              />
                              {lesson.type === "video" && (
                                lesson.videoName ? (
                                  <div className="ac-lesson-video-uploaded">
                                    <Icon.check />
                                    <span title={lesson.videoName}>{lesson.videoName}</span>
                                    <button type="button"
                                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, padding: "0 2px" }}
                                      onClick={() => {
                                        updateLesson(section.id, lesson.id, "videoFile", null);
                                        updateLesson(section.id, lesson.id, "videoName", "");
                                      }}>✕</button>
                                  </div>
                                ) : (
                                  <label className="ac-lesson-video-upload">
                                    <input type="file" accept="video/mp4,video/mov,video/webm"
                                      onChange={(e) => handleLessonVideo(section.id, lesson.id, e.target.files[0])} />
                                    <Icon.upload /> Upload Video
                                  </label>
                                )
                              )}
                            </div>
                            <button type="button" className="ac-icon-btn danger" title="Remove lesson"
                              onClick={() => removeLesson(section.id, lesson.id)}>
                              <Icon.trash />
                            </button>
                          </div>
                        ))}
                        <button type="button" className="ac-add-lesson-btn" onClick={() => addLesson(section.id)}>
                          <Icon.add /> Add Lesson to this Section
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <button type="button" className="ac-add-section-btn" onClick={addSection}>
                  <Icon.add /> Add New Section
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 80 }}>
              <button type="button" className="ac-btn ghost" onClick={() => setStep(2)}>← Back to Media</button>
            </div>
          </>
        )}

        {/* ── Sticky submit bar ── */}
        <div className="ac-submit-bar">
          <div className="ac-submit-info">
            <strong>{sections.length}</strong> sections · <strong>{totalLessons}</strong> lessons · <strong>{totalVideos}</strong> videos uploaded
          </div>
          <div className="ac-submit-actions">
            <button type="button" className="ac-btn ghost">Save Draft</button>
            <button type="submit" className="ac-btn primary" disabled={isSubmitting}>
              <Icon.rocket />
              {isSubmitting ? " Publishing..." : " Publish Course"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
