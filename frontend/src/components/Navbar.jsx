import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import axios from "axios"; // ✅ add
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("blinklearn_user"));
    setUser(storedUser);

    const updateUser = () => {
      const updated = JSON.parse(localStorage.getItem("blinklearn_user"));
      setUser(updated);
    };
    window.addEventListener("blinklearn:userChanged", updateUser);
    return () => window.removeEventListener("blinklearn:userChanged", updateUser);
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);
    };
    updateCount();
    window.addEventListener("wishlistUpdated", updateCount);
    return () => window.removeEventListener("wishlistUpdated", updateCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("blinklearn_user");
    window.dispatchEvent(new Event("blinklearn:userChanged"));
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  // ✅ Switch to Teacher
  const handleSwitchToTeacher = async () => {
    try {
      await axios.put(`http://localhost:5000/switch-role/${user.user_id}`, {
        role: "teacher",
      });
      const updatedUser = { ...user, role: "teacher" };
      localStorage.setItem("blinklearn_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("blinklearn:userChanged"));
      setDropdownOpen(false);
      navigate("/teacher-dashboard");
    } catch (err) {
      alert("Failed to switch role");
    }
  };

  // ✅ Switch to Student
  const handleSwitchToStudent = async () => {
    try {
      await axios.put(`http://localhost:5000/switch-role/${user.user_id}`, {
        role: "student",
      });
      const updatedUser = { ...user, role: "student" };
      localStorage.setItem("blinklearn_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("blinklearn:userChanged"));
      setDropdownOpen(false);
      navigate("/student-dashboard");
    } catch (err) {
      alert("Failed to switch role");
    }
  };

  const isTeacher = user?.role?.toLowerCase() === "teacher";

  return (
    <nav className="navbar">
      {/* LEFT — Logo */}
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <div className="logo">
            <div className="logo-icon">▶</div>
            <h2>BlinkLearn</h2>
          </div>
        </Link>
      </div>

      {/* CENTER — Search Bar */}
      <form className="nav-search" onSubmit={handleSearch}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* CENTER — Nav Links */}
      <ul className="nav-links">
        <li><Link to="/courses">Explore</Link></li>

        {user && isTeacher && (
          <>
            <li><Link to="/teacher-dashboard">Dashboard</Link></li>
            <li><Link to="/my-courses">My Courses</Link></li>
            <li><Link to="/add-course">Add Course</Link></li>
          </>
        )}

        {user && !isTeacher && (
          <>
            <li><Link to="/student-dashboard">Dashboard</Link></li>
            <li><Link to="/my-learning">My Learning</Link></li>
          </>
        )}
      </ul>

      {/* RIGHT */}
      <div className="nav-right">
        {/* Wishlist */}
        <Link to="/wishlist" className="icon-btn wishlist-icon">
          <FaHeart />
          {wishlistCount > 0 && (
            <span className="wishlist-count">{wishlistCount}</span>
          )}
        </Link>

        {/* Cart */}
        <Link to="/cart" className="icon-btn">
          <FaShoppingCart />
        </Link>

        {/* Auth */}
        {!user ? (
          <>
            <Link to="/login">
              <button className="nav-btn">Login</button>
            </Link>
            <Link to="/signup">
              <button className="nav-btn signup-btn">Signup</button>
            </Link>
          </>
        ) : (
          <div className="profile-menu">
            <button
              className="profile-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="profile-avatar">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user.name}</span>
                <span className="profile-role">
                  {isTeacher ? "Teacher" : "Student"}
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <Link
                  to={isTeacher ? "/teacher-dashboard" : "/student-dashboard"}
                  onClick={() => setDropdownOpen(false)}
                >
                  🏠 Dashboard
                </Link>

                {isTeacher && (
                  <>
                    <Link to="/my-courses" onClick={() => setDropdownOpen(false)}>
                      📚 My Courses
                    </Link>
                    <Link to="/add-course" onClick={() => setDropdownOpen(false)}>
                      ➕ Add Course
                    </Link>
                  </>
                )}

                {!isTeacher && (
                  <Link to="/my-learning" onClick={() => setDropdownOpen(false)}>
                    🎓 My Learning
                  </Link>
                )}

                <Link to="/edit-profile" onClick={() => setDropdownOpen(false)}>
                  ✏️ Edit Profile
                </Link>

                <hr style={{ margin: "6px 0", border: "none", borderTop: "1px solid #f3f4f6" }} />

                {/* ✅ Switch Role */}
                {!isTeacher ? (
                  <button onClick={handleSwitchToTeacher}>
                    🎙️ Become an Instructor
                  </button>
                ) : (
                  <button onClick={handleSwitchToStudent}>
                    👨‍🎓 Switch to Learning
                  </button>
                )}

                <hr style={{ margin: "6px 0", border: "none", borderTop: "1px solid #f3f4f6" }} />

                <button onClick={handleLogout}>🚪 Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;