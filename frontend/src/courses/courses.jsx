import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaUserFriends, FaClock, FaPlayCircle, FaSearch } from "react-icons/fa";
import "./courses.css";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [localSearch, setLocalSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  const FILTERS = ["All", "Development", "Marketing", "Design", "Business"];
  const SORT_OPTIONS = ["Most Popular", "Newest", "Price: Low to High", "Price: High to Low"];

  const stats = [
    { value: "3", label: "Total Courses" },
    { value: "50+", label: "Expert Tutors" },
    { value: "50K+", label: "Active Students" },
    { value: "4.8★", label: "Avg Rating" },
  ];

  useEffect(() => {
    fetchCourses();
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [location.search, courses, activeFilter, sortBy, localSearch]);

  const applyFilters = () => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search")?.toLowerCase() || "";
    const search = localSearch.toLowerCase() || urlSearch;

    let result = [...courses];

    // Search filter
    if (search) {
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search) ||
          c.level?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (activeFilter !== "All") {
      result = result.filter(
        (c) => c.category?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Sort
    if (sortBy === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "Newest") result.sort((a, b) => b.course_id - a.course_id);

    setFilteredCourses(result);
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses");
      setCourses(res.data);
      setFilteredCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (e, course) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = saved.find((c) => c.course_id === course.course_id);
    const updated = exists
      ? saved.filter((c) => c.course_id !== course.course_id)
      : [...saved, course];
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlist(updated);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const isWishlisted = (courseId) => wishlist.some((c) => c.course_id === courseId);

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const params = new URLSearchParams(location.search);
  const urlSearch = params.get("search") || "";

  return (
    <div className="courses-page">

      {/* HERO SECTION */}
      <div className="courses-hero">
        <h1>Explore Courses</h1>
        <p>Discover your next skill from our library of expert-led video courses</p>
        <form className="hero-search-form" onSubmit={handleSearch}>
          <div className="hero-search-box">
            <FaSearch className="hero-search-icon" />
            <input
              type="text"
              placeholder="Search for courses, skills, or topics..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="hero-search-btn">Search</button>
        </form>
        {(urlSearch || localSearch) && (
          <div className="search-result-info">
            <span>
              Results for: <strong>"{localSearch || urlSearch}"</strong> — {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
            </span>
            <button className="clear-search-btn" onClick={() => { setLocalSearch(""); navigate("/courses"); }}>
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      {/* STATS BAR */}
      <div className="stats-bar">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* FILTERS BAR */}
      <div className="filters-bar">
        <div className="filters-left">
          <span className="filters-label">⚙ Filters:</span>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={activeFilter === f ? "filter-pill active" : "filter-pill"}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="filters-right">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* COURSE GRID */}
      <div className="courses-container">
        <div className="courses-count-bar">
          <span className="count-heading">
            {activeFilter === "All" ? "All Courses" : activeFilter + " Courses"}
          </span>
          <span className="count-label">{filteredCourses.length} results</span>
        </div>

        {loading ? (
          <div className="loading-state">⏳ Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="no-results">
            <p>😕 No courses found</p>
            <button onClick={() => { setLocalSearch(""); setActiveFilter("All"); navigate("/courses"); }}>
              View All Courses
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
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
                  <span className="category-badge">{course.level}</span>
                  <button
                    className="wishlist-btn"
                    onClick={(e) => toggleWishlist(e, course)}
                  >
                    {isWishlisted(course.course_id)
                      ? <FaHeart className="heart-filled" />
                      : <FaRegHeart className="heart-empty" />
                    }
                  </button>
                  {course.progress > 0 && (
                    <div className="progress-overlay">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: course.progress + "%" }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="card-body">
                  <div className="teacher-row">
                    <div className="teacher-avatar">
                      {course.teacher_name?.charAt(0).toUpperCase() || "T"}
                    </div>
                    <span className="teacher-name">
                      {course.teacher_name || user?.name || "Instructor"}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;