import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ added
import "./courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ added
  const user = JSON.parse(localStorage.getItem("blinklearn_user")); // ✅ updated key

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses");
      setCourses(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setLoading(false);
    }
  };

  // ✅ e.stopPropagation() add केला
  const deleteCourse = async (e, courseId) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `http://localhost:5000/delete-course/${courseId}/${user.user_id}`
      );
      alert("Course deleted successfully");
      fetchCourses();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="courses-page">
      {/* HERO SECTION */}
      <div className="courses-hero">
        <h1>Explore Courses</h1>
        <p>Discover your next skill from our expert-led courses</p>
      </div>

      {/* COURSES GRID */}
      <div className="courses-grid">
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses available</p>
        ) : (
          courses.map((course) => (
            <div
              className="course-card"
              key={course.course_id}
              onClick={() => navigate(`/course/${course.course_id}`)} // ✅ clickable
              style={{ cursor: "pointer" }}
            >
              <img
                src={
                  course.thumbnail &&
                  (course.thumbnail.endsWith(".jpeg") ||
                    course.thumbnail.endsWith(".jpg") ||
                    course.thumbnail.endsWith(".png"))
                    ? `http://localhost:5000/uploads/${course.thumbnail}`
                    : "https://via.placeholder.com/300x200"
                }
                alt="course"
              />
              <span className="tag">{course.level}</span>
              <div className="course-content">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-info">
                  <span>₹ {course.price}</span>
                </div>
                {/* DELETE — only for course owner */}
                {user && user.user_id === course.tutor_id && (
                  <button
                    className="delete-btn"
                    onClick={(e) => deleteCourse(e, course.course_id)} // ✅ e pass केला
                  >
                    Delete Course
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;