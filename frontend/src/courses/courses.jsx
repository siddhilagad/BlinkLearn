import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaUserFriends, FaClock, FaPlayCircle } from "react-icons/fa";
import "./courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  useEffect(() => {
    fetchCourses();
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

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

  const toggleWishlist = (e, course) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = saved.find((c) => c.course_id === course.course_id);
    let updated;
    if (exists) {
      updated = saved.filter((c) => c.course_id !== course.course_id);
    } else {
      updated = [...saved, course];
    }
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlist(updated);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const isWishlisted = (courseId) => wishlist.some((c) => c.course_id === courseId);

  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  const getCategoryColor = (level) => {
    if (level === "Beginner") return "badge-blue";
    if (level === "Intermediate") return "badge-green";
    if (level === "Advanced") return "badge-orange";
    return "badge-purple";
  };

  return (
    <div className="courses-page">

      {/* HERO */}
      <div className="courses-hero">
        <h1>Explore Courses</h1>
        <p>Discover your next skill from our expert-led courses</p>
        {searchQuery && (
          <div className="search-result-info">
            <span>
              Results for: <strong>"{searchQuery}"</strong> — {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
            </span>
            <button className="clear-search-btn" onClick={() => navigate("/courses")}>
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      {/* COUNT BAR */}
      {!loading && (
        <div className="courses-count-bar">
          <span>All Courses</span>
          <span className="count-label">{filteredCourses.length} results</span>
        </div>
      )}

      {/* GRID */}
      <div className="courses-grid">
        {loading ? (
          <div className="loading-state">⏳ Loading courses...</div>
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
            >
              {/* Image */}
              <div className="card-image-wrapper">
                <img
                  src={
                    course.thumbnail &&
                    (course.thumbnail.endsWith(".jpeg") ||
                      course.thumbnail.endsWith(".jpg") ||
                      course.thumbnail.endsWith(".png"))
                      ? `http://localhost:5000/uploads/${course.thumbnail}`
                      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"
                  }
                  alt={course.title}
                />
                <span className={`category-badge ${getCategoryColor(course.level)}`}>
                  {course.level}
                </span>
                <button
                  className="wishlist-btn"
                  onClick={(e) => toggleWishlist(e, course)}
                >
                  {isWishlisted(course.course_id)
                    ? <FaHeart className="heart-filled" />
                    : <FaRegHeart className="heart-empty" />
                  }
                </button>
              </div>

              {/* Body */}
              <div className="card-body">

                {/* ✅ Show actual teacher name from DB */}
                <div className="teacher-row">
                  <div className="teacher-avatar">
                    {course.teacher_name?.charAt(0).toUpperCase() || "T"}
                  </div>
                  <span className="teacher-name">
                    {course.teacher_name || user?.name || "Instructor"} {/* ✅ real name */}
                  </span>
                </div>

                <h3 className="card-title">{course.title}</h3>
                <p className="card-desc">{course.description}</p>

                <div className="rating-row">
                  <FaStar className="star-icon" />
                  <span className="rating-num">4.8</span>
                  <span className="rating-count">(1,200)</span>
                </div>

                <div className="meta-row">
                  <span className="meta-item"><FaUserFriends /> 12,453</span>
                  <span className="meta-item"><FaClock /> 3h 20m</span>
                  <span className="meta-item level-tag">{course.level}</span>
                </div>

                <div className="card-footer">
                  <span className="price">
                    {course.price > 0 ? `₹ ${course.price}` : "Free"}
                  </span>
                  <span className="lessons-count">
                    <FaPlayCircle /> 24 lessons
                  </span>
                </div>

                {/* ✅ NO delete button here anymore */}

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;