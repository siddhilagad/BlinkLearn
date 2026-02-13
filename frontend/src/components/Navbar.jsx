import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">BlinkLearn</h2>

      <ul className="nav-links">
        <li><Link to="/courses">Courses</Link></li>
        <li><Link to="#">About</Link></li>
      </ul>

      <Link to="/login" className="login-btn">
        Login
      </Link>
        <Link to="/signup" className="signup-btn">
        Sign Up
      </Link>

    </nav>
  );
}

export default Navbar;






