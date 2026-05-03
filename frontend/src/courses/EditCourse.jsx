import React, { useState } from 'react';
import './EditCourse.css';

const EditCourse = ({ course, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    title: course?.title || 'Java',
    subtitle: course?.subtitle || 'learn Java',
    description: course?.description || 'Master Java programming from basics to advanced concepts.',
    category: course?.category || 'web development',
    level: course?.level || 'Beginner',
    price: course?.price || 'Free',
    image: course?.image || '',
  });

  const [lessons, setLessons] = useState([
    { id: 1, title: '1. Introduction', duration: '45 min' },
    { id: 2, title: '2. Intro', duration: '30 min' },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Simulate save
    console.log('Course updated:', formData, lessons);
    alert('Course updated successfully!');
    onSave?.(formData);
  };

  const addLesson = () => {
    const newLesson = {
      id: lessons.length + 1,
      title: `Lesson ${lessons.length + 1}`,
      duration: '30 min'
    };
    setLessons([...lessons, newLesson]);
  };

  const removeLesson = (id) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const updateLesson = (id, field, value) => {
    setLessons(lessons.map(lesson => 
      lesson.id === id ? { ...lesson, [field]: value } : lesson
    ));
  };

  return (
    <div className="edit-course-container">
      {/* Header */}
      <div className="edit-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Course
        </button>
        <h1>Edit Course</h1>
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <div className="edit-content">
        {/* Left Side - Course Info */}
        <div className="edit-left">
          <div className="form-section">
            <h2>Course Information</h2>
            
            <label>Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />

           

            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
            />

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="form-section">
            <div className="lessons-header">
              <h2>Course Content ({lessons.length} lessons)</h2>
              <button className="add-lesson-btn" onClick={addLesson}>
                + Add Lesson
              </button>
            </div>

            <div className="lessons-list">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="lesson-item">
                  <div className="lesson-number">{index + 1}.</div>
                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                    className="lesson-title-input"
                  />
                  <input
                    type="text"
                    value={lesson.duration}
                    onChange={(e) => updateLesson(lesson.id, 'duration', e.target.value)}
                    className="lesson-duration-input"
                  />
                  <button 
                    className="remove-lesson-btn"
                    onClick={() => removeLesson(lesson.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Preview / Thumbnail */}
        <div className="edit-right">
          <div className="thumbnail-section">
            <h3>Course Thumbnail</h3>
            <div className="thumbnail-preview">
              <img 
                src="https://picsum.photos/id/1015/600/200" 
                alt="Course thumbnail" 
              />
              <div className="thumbnail-overlay">
                <button className="change-thumbnail-btn">Change Image</button>
              </div>
            </div>
            <p className="help-text">Recommended size: 1280x720 px</p>
          </div>

          <div className="preview-card">
            <h3>Live Preview</h3>
            <div className="preview-box">
              <h4>{formData.title}</h4>
              <p>{formData.subtitle}</p>
              <div className="preview-meta">
                <span>⭐ 4.9</span>
                <span>{lessons.length} lessons</span>
                <span className="level-badge">{formData.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;