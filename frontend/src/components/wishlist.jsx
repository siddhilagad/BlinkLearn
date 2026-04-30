import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaUserFriends, FaClock, FaPlayCircle, FaHeart } from "react-icons/fa";
import "./wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("blinklearn_user"));

    // ✅ If not logged in, redirect to login
    if (!storedUser) {
      navigate("/login");
      return;
    }

    setUser(storedUser);
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  const removeFromWishlist = (e, courseId) => {
    e.stopPropagation();
    const updated = wishlist.filter((course) => course.course_id !== courseId);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // ✅ Don't render anything while checking auth
  if (!user) return null;

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist <span>❤️</span></h1>
        <p>{wishlist.length} course{wishlist.length !== 1 ? "s" : ""} saved</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">💔</div>
          <h2>Your wishlist is empty</h2>
          <p>Browse courses and click the heart icon to save them here.</p>
          <button onClick={() => navigate("/courses")}>Explore Courses</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((course) => (
            <div
              className="wishlist-card"
              key={course.course_id}
              onClick={() => navigate(`/course/${course.course_id}`)}
            >
              {/* Image */}
              <div className="wl-image-wrapper">
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
                <span className="wl-level-badge">{course.level}</span>

                <button
                  className="wl-heart-btn"
                  onClick={(e) => removeFromWishlist(e, course.course_id)}
                >
                  <FaHeart className="wl-heart-filled" />
                </button>
              </div>

              {/* Body */}
              <div className="wl-body">
                <div className="wl-teacher-row">
                  <div className="wl-avatar">
                    {course.tutor_name?.charAt(0).toUpperCase() || "T"}
                  </div>
                  <span className="wl-teacher-name">
                    {course.tutor_name || "Instructor"}
                  </span>
                </div>

                <h3 className="wl-title">{course.title}</h3>
                <p className="wl-desc">{course.description}</p>

                <div className="wl-rating-row">
                  <FaStar className="wl-star" />
                  <span className="wl-rating-num">4.8</span>
                  <span className="wl-rating-count">(1,200)</span>
                </div>

                <div className="wl-meta-row">
                  <span className="wl-meta"><FaUserFriends /> 12,453</span>
                  <span className="wl-meta"><FaClock /> 3h 20m</span>
                  <span className="wl-level-tag">{course.level}</span>
                </div>

                <div className="wl-footer">
                  <span className="wl-price">
                    {course.price > 0 ? `₹ ${course.price}` : "Free"}
                  </span>
                  <span className="wl-lessons">
                    <FaPlayCircle /> 24 lessons
                  </span>
                </div>

                <button
                  className="wl-remove-btn"
                  onClick={(e) => removeFromWishlist(e, course.course_id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;