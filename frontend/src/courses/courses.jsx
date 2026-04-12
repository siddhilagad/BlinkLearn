import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaUserFriends,
  FaClock,
  FaPlayCircle,
  FaSearch
} from "react-icons/fa";
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

  const FILTERS = [
    "All",
    "Development",
    "Marketing",
    "Design",
    "Business"
  ];

  const SORT_OPTIONS = [
    "Most Popular",
    "Newest",
    "Price: Low to High",
    "Price: High to Low"
  ];

  useEffect(() => {

    fetchCourses();

    const savedWishlist =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    setWishlist(savedWishlist);

  }, []);

  const applyFilters = useCallback(() => {

    const params =
      new URLSearchParams(location.search);

    const urlSearch =
      params.get("search")?.toLowerCase() || "";

    const search =
      localSearch.toLowerCase() || urlSearch;

    let result = [...courses];

    if (search) {

      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search) ||
          c.level?.toLowerCase().includes(search)
      );

    }

    if (activeFilter !== "All") {

      result = result.filter(
        (c) =>
          c.category?.toLowerCase() ===
          activeFilter.toLowerCase()
      );

    }

    if (sortBy === "Price: Low to High")
      result.sort((a, b) => a.price - b.price);

    else if (sortBy === "Price: High to Low")
      result.sort((a, b) => b.price - a.price);

    else if (sortBy === "Newest")
      result.sort((a, b) => b.course_id - a.course_id);

    setFilteredCourses(result);

  }, [
    location.search,
    courses,
    activeFilter,
    sortBy,
    localSearch
  ]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchCourses = async () => {

    try {

      const res =
        await axios.get("http://localhost:5000/courses");

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

    const saved =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    const exists =
      saved.find(
        (c) => c.course_id === course.course_id
      );

    const updated = exists
      ? saved.filter(
          (c) =>
            c.course_id !== course.course_id
        )
      : [...saved, course];

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updated)
    );

    setWishlist(updated);

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );

  };

  const isWishlisted = (courseId) =>
    wishlist.some(
      (c) => c.course_id === courseId
    );

  const handleSearch = (e) => {

    e.preventDefault();

    applyFilters();

  };

  const params =
    new URLSearchParams(location.search);

  const urlSearch =
    params.get("search") || "";

  return (

    <div className="courses-page">

      <div className="courses-hero">

        <h1>Explore Courses</h1>

        <p>
          Discover your next skill
          from expert-led courses
        </p>

        <form onSubmit={handleSearch}>

          <FaSearch />

          <input
            type="text"
            placeholder="Search..."
            value={localSearch}
            onChange={(e) =>
              setLocalSearch(e.target.value)
            }
          />

          <button>Search</button>

        </form>

        {(urlSearch || localSearch) && (

          <div>

            Results for:

            <b>
              "{localSearch || urlSearch}"
            </b>

          </div>

        )}

      </div>


      {/* FILTER BAR */}

      <div>

        {FILTERS.map((f) => (

          <button
            key={f}
            onClick={() =>
              setActiveFilter(f)
            }
          >
            {f}
          </button>

        ))}

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >

          {SORT_OPTIONS.map((o) => (

            <option key={o}>
              {o}
            </option>

          ))}

        </select>

      </div>


      {loading ? (

        <div>Loading courses...</div>

      ) : (

        filteredCourses.map((course) => (

          <div
            key={course.course_id}
            onClick={() =>
              navigate(`/course/${course.course_id}`)
            }
          >

            <h3>{course.title}</h3>

            <button
              onClick={(e) =>
                toggleWishlist(e, course)
              }
            >

              {isWishlisted(course.course_id)
                ? <FaHeart />
                : <FaRegHeart />
              }

            </button>

            <FaStar />
            <FaUserFriends />
            <FaClock />
            <FaPlayCircle />

          </div>

        ))

      )}

    </div>

  );

};

export default Courses;