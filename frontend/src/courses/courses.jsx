import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ useLocation add
import "./courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ URL params read करायला
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  useEffect(() => {
    fetchCourses();
  }, []);

  // ✅ URL मध्ये search param असेल तर filter कर
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search")?.toLowerCase() || "";

    if (searchQuery) {
      const filtered = courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchQuery) ||
          course.description?.toLowerCase().includes(searchQuery) ||
          course.level?.toLowerCase().includes(searchQuery)
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [location.search, courses]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses");
      setCourses(res.data);
      setFilteredCourses(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setLoading(false);
    }
  };

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

  // ✅ Search query URL मधून काढ
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  return (
    <div className="courses-page">
      {/* HERO SECTION */}
      <div className="courses-hero">
        <h1>Explore Courses</h1>
        <p>Discover your next skill from our expert-led courses</p>

        {/* ✅ Search result दाखव */}
        {searchQuery && (
          <div className="search-result-info">
            <span>
              Search results for: <strong>"{searchQuery}"</strong> —{" "}
              {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
            </span>
            <button
              className="clear-search-btn"
              onClick={() => navigate("/courses")}
            >
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      {/* COURSES GRID */}
      <div className="courses-grid">
        {loading ? (
          <p>Loading courses...</p>
        ) : filteredCourses.length === 0 ? (
          <div className="no-results">
            <p>😕 No courses found for "<strong>{searchQuery}</strong>"</p>
            <button onClick={() => navigate("/courses")}>View All Courses</button>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              className="course-card"
              key={course.course_id}
              onClick={() => navigate(`/course/${course.course_id}`)}
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
                {user && user.user_id === course.tutor_id && (
                  <button
                    className="delete-btn"
                    onClick={(e) => deleteCourse(e, course.course_id)}
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