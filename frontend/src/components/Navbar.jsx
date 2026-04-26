import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";
import axios from "axios";
import "./Navbar.css";
import LoginModal from "../login/Loginmodel";
import SignupModal from "../login/Sginupmodel";

function BlinkLearnLogo() {
  return (
    <div className="logo-wrapper">
      {/* Shield Icon */}
      <svg
        width="36"
        height="42"
        viewBox="0 0 72 84"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon"
      >
        <defs>
          <linearGradient id="shield-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Shield body */}
        <path
          d="M36,4 L66,4 L72,34 Q72,62 36,78 Q0,62 0,34 Z"
          fill="url(#shield-grad)"
        />
        <path
          d="M36,4 L66,4 L72,34 Q72,62 36,78 Q0,62 0,34 Z"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />
        {/* Play triangle */}
        <polygon points="24,18 24,36 42,27" fill="#7C3AED" opacity="0.75" />
        {/* Eye */}
        <ellipse cx="36" cy="54" rx="18" ry="11" fill="white" opacity="0.2" />
        <ellipse cx="36" cy="54" rx="18" ry="11" fill="none" stroke="#7C3AED" strokeWidth="1.2" opacity="0.6" />
        <circle cx="36" cy="54" r="7" fill="#6D28D9" opacity="0.85" />
        <circle cx="36" cy="54" r="3.5" fill="#1E0A4E" />
        <circle cx="39" cy="51" r="2" fill="white" opacity="0.9" />
      </svg>

      {/* Text block */}
      <div className="logo-text-block">
        <span className="logo-blink">Blink</span>
        <span className="logo-learn">Learn</span>
      </div>
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const isActive = (path) => location.pathname === path ? "active-link" : "";

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
    const updateUnread = () => {
      const count = parseInt(localStorage.getItem("blinklearn_unread") || "0");
      setUnreadCount(count);
    };
    updateUnread();
    window.addEventListener("blinklearn:unreadChanged", updateUnread);
    return () => window.removeEventListener("blinklearn:unreadChanged", updateUnread);
  }, []);

  useEffect(() => {
    if (location.pathname === "/chat") {
      setUnreadCount(0);
      localStorage.setItem("blinklearn_unread", "0");
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Modal handlers
  const openLogin = () => { setShowLogin(true); setShowSignup(false); };
  const openSignup = () => { setShowSignup(true); setShowLogin(false); };
  const closeModals = () => { setShowLogin(false); setShowSignup(false); };

  const handleLogout = () => {
    localStorage.removeItem("blinklearn_user");
    window.dispatchEvent(new Event("blinklearn:userChanged"));
    setDropdownOpen(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  const handleWishlistClick = (e) => {
    if (!user) {
      e.preventDefault();
      openLogin();
    }
  };

  const handleChatClick = (e) => {
    if (!user) {
      e.preventDefault();
      openLogin();
    }
  };

  const handleSwitchToTeacher = async () => {
    try {
      await axios.put(`http://localhost:5000/switch-role/${user.user_id}`, { role: "teacher" });
      const updatedUser = { ...user, role: "teacher" };
      localStorage.setItem("blinklearn_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("blinklearn:userChanged"));
      setDropdownOpen(false);
      navigate("/");
    } catch (err) {
      alert("Failed to switch role");
    }
  };

  const handleSwitchToStudent = async () => {
    try {
      await axios.put(`http://localhost:5000/switch-role/${user.user_id}`, { role: "student" });
      const updatedUser = { ...user, role: "student" };
      localStorage.setItem("blinklearn_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("blinklearn:userChanged"));
      setDropdownOpen(false);
      navigate("/");
    } catch (err) {
      alert("Failed to switch role");
    }
  };

  const isTeacher = user?.role?.toLowerCase() === "teacher";

  return (
    <>
      <nav className="navbar">

        {/* LEFT — Logo */}
        <div className="nav-left">
          <Link to="/" className="logo-link">
            <BlinkLearnLogo />
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
          <li>
            <Link to="/courses" className={isActive("/courses")}>Explore</Link>
          </li>
          {user && isTeacher && (
            <>
              <li><Link to="/teacher-dashboard" className={isActive("/teacher-dashboard")}>Dashboard</Link></li>
              <li><Link to="/my-courses" className={isActive("/my-courses")}>My Courses</Link></li>
              <li><Link to="/add-course" className={isActive("/add-course")}>Add Course</Link></li>
            </>
          )}
          {user && !isTeacher && (
            <>
              <li><Link to="/student-dashboard" className={isActive("/student-dashboard")}>Dashboard</Link></li>
              <li><Link to="/my-learning" className={isActive("/my-learning")}>My Learning</Link></li>
            </>
          )}
        </ul>

        {/* RIGHT */}
        <div className="nav-right">

          {/* Messenger */}
          <Link
            to="/chat"
            className="icon-btn messenger-icon"
            onClick={handleChatClick}
            title="Messages"
          >
            <FaFacebookMessenger />
            {user && unreadCount > 0 && (
              <span className="messenger-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </Link>

          {/* Wishlist */}
          <Link to="/wishlist" className="icon-btn wishlist-icon" onClick={handleWishlistClick}>
            <FaHeart />
            {user && wishlistCount > 0 && (
              <span className="wishlist-count">{wishlistCount}</span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="icon-btn">
            <FaShoppingCart />
          </Link>

          {!user ? (
            <>
              <button className="nav-btn" onClick={openLogin}>Login</button>
              <button className="nav-btn signup-btn" onClick={openSignup}>Signup</button>
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
                  <span className="profile-role">{isTeacher ? "Teacher" : "Student"}</span>
                </div>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <Link to={isTeacher ? "/teacher-dashboard" : "/student-dashboard"} onClick={() => setDropdownOpen(false)}>
                    🏠 Dashboard
                  </Link>
                  {isTeacher && (
                    <>
                      <Link to="/my-courses" onClick={() => setDropdownOpen(false)}>📚 My Courses</Link>
                      <Link to="/add-course" onClick={() => setDropdownOpen(false)}>➕ Add Course</Link>
                    </>
                  )}
                  {!isTeacher && (
                    <Link to="/my-learning" onClick={() => setDropdownOpen(false)}>🎓 My Learning</Link>
                  )}
                  <Link to="/chat" onClick={() => setDropdownOpen(false)}>💬 Messages</Link>
                  <Link to="/edit-profile" onClick={() => setDropdownOpen(false)}>✏️ Edit Profile</Link>
                  <hr style={{ margin: "6px 0", border: "none", borderTop: "1px solid #f3f4f6" }} />
                  {!isTeacher ? (
                    <button onClick={handleSwitchToTeacher}>🎙️ Become an Instructor</button>
                  ) : (
                    <button onClick={handleSwitchToStudent}>👨‍🎓 Switch to Learning</button>
                  )}
                  <hr style={{ margin: "6px 0", border: "none", borderTop: "1px solid #f3f4f6" }} />
                  <button onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      {showLogin && (
        <LoginModal onClose={closeModals} onSwitchToSignup={openSignup} />
      )}
      {showSignup && (
        <SignupModal onClose={closeModals} onSwitchToLogin={openLogin} />
      )}
    </>
  );
}

export default Navbar;
