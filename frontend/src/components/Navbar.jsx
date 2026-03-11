import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import ProfileMenu from "./ProfileMenu";
import "./Navbar.css";

function Navbar() {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);

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

    updateCount(); // initial
    window.addEventListener("wishlistUpdated", updateCount);
    return () => window.removeEventListener("wishlistUpdated", updateCount);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("blinklearn_user");
    window.dispatchEvent(new Event("blinklearn:userChanged"));
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {user && <ProfileMenu />}
        <Link to="/" className="logo-link">
          <div className="logo">
            <div className="logo-icon">▶</div>
            <h2>BlinkLearn</h2>
          </div>
        </Link>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/courses">Courses</Link>
        </li>
        {/* Add more links later: About, Contact, etc. */}
      </ul>

      <div className="nav-right">
        <Link to="/wishlist" className="icon-btn wishlist-icon">
          <FaHeart />
          {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
        </Link>

        <Link to="/cart" className="icon-btn">
          <FaShoppingCart />
        </Link>

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
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;