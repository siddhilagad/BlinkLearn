import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      
      {/* LOGO */}
      <Link to="/" className="logo-link">
        <div className="logo">
          <div className="logo-icon">▶</div>
          <h2>BlinkLearn</h2>
        </div>
      </Link>

      {/* NAV LINKS */}
      <ul className="nav-links">
        <li>
          <Link to="/courses">Courses</Link>
        </li>
        
      </ul>

      {/* AUTH BUTTONS */}
      <div className="nav-buttons">
        <Link to="/login">
          <button className="nav-btn">Login</button>
        </Link>

        <Link to="/signup">
          <button className="nav-btn signup-btn">Signup</button>
        </Link>
      </div>

    </nav>
  );
}

export default Navbar;