import React, {
  useEffect,
  useState,
  useRef
} from "react";

import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

import {
  FaHeart,
  FaShoppingCart,
  FaSearch
} from "react-icons/fa";

import "./Navbar.css";
import logo from "../assets/images/logo.png";

import Modal from "./Modal";
import Login from "../login/login";
import Signup from "../login/signup";
import AddCourse from "../dashboard/teacher/AddCourse";


function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);

  const [wishlistCount, setWishlistCount] =
    useState(0);

  const [user, setUser] =
    useState(null);

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const [loginOpen, setLoginOpen] =
    useState(false);

  const [signupOpen, setSignupOpen] =
    useState(false);

  const [addCourseOpen, setAddCourseOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");


  const isActive = (path) =>
    location.pathname === path
      ? "active-link"
      : "";


  // Load user from localStorage
  useEffect(() => {

    const storedUser =
      JSON.parse(
        localStorage.getItem("blinklearn_user")
      );

    setUser(storedUser);

    const updateUser = () => {

      const updated =
        JSON.parse(
          localStorage.getItem(
            "blinklearn_user"
          )
        );

      setUser(updated);

    };

    window.addEventListener(
      "blinklearn:userChanged",
      updateUser
    );

    return () =>
      window.removeEventListener(
        "blinklearn:userChanged",
        updateUser
      );

  }, []);


  // Wishlist counter update
  useEffect(() => {

    const updateCount = () => {

      const wishlist =
        JSON.parse(
          localStorage.getItem("wishlist")
        ) || [];

      setWishlistCount(
        wishlist.length
      );

    };

    updateCount();

    window.addEventListener(
      "wishlistUpdated",
      updateCount
    );

    return () =>
      window.removeEventListener(
        "wishlistUpdated",
        updateCount
      );

  }, []);


  // Close dropdown when clicking outside
  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {

        setDropdownOpen(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);


  // Logout
  const handleLogout = () => {

    localStorage.removeItem(
      "blinklearn_user"
    );

    window.dispatchEvent(
      new Event(
        "blinklearn:userChanged"
      )
    );

    setDropdownOpen(false);

  };


  // Search
  const handleSearch = (e) => {

    e.preventDefault();

    if (searchQuery.trim()) {

      navigate(
        `/courses?search=${searchQuery.trim()}`
      );

      setSearchQuery("");

    }

  };


  const isTeacher =
    user?.role?.toLowerCase() ===
    "teacher";


  return (

    <>
      <nav className="navbar">


        {/* LEFT */}
        <div className="nav-left">

          <Link
            to="/"
            className="logo-link"
          >

            <div className="logo">

              <img
                src={logo}
                alt="BlinkLearn"
                className="logo-img"
              />

              <span className="logo-text">
                BlinkLearn
              </span>

            </div>

          </Link>

        </div>



        {/* SEARCH */}
        <form
          className="nav-search"
          onSubmit={handleSearch}
        >

          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
          />

        </form>



        {/* CENTER LINKS */}
        <ul className="nav-links">

          <li>

            <Link
              to="/courses"
              className={isActive(
                "/courses"
              )}
            >

              Explore

            </Link>

          </li>


          {user &&
            isTeacher && (

              <li>

                <button
                  className="nav-btn"
                  onClick={() =>
                    setAddCourseOpen(
                      true
                    )
                  }
                >

                  Add Course

                </button>

              </li>

            )}

        </ul>



        {/* RIGHT SIDE */}
        <div
          className="nav-right"
          ref={dropdownRef}
        >

          <Link
            to="/wishlist"
            className="icon-btn wishlist-icon"
          >

            <FaHeart />

            {wishlistCount > 0 && (

              <span className="wishlist-count">
                {wishlistCount}
              </span>

            )}

          </Link>


          <Link
            to="/cart"
            className="icon-btn"
          >

            <FaShoppingCart />

          </Link>


          {!user ? (

            <>
              <button
                className="nav-btn"
                onClick={() =>
                  setLoginOpen(true)
                }
              >

                Login

              </button>

              <button
                className="nav-btn signup-btn"
                onClick={() =>
                  setSignupOpen(true)
                }
              >

                Signup

              </button>
            </>

          ) : (

            <div className="user-dropdown">

              <button
                className="nav-btn"
                onClick={() =>
                  setDropdownOpen(
                    !dropdownOpen
                  )
                }
              >

                Welcome, {user.name}

              </button>


              {dropdownOpen && (

                <div className="dropdown-menu">

                  <button
                    onClick={() => {

                      navigate(
                        "/dashboard"
                      );

                      setDropdownOpen(
                        false
                      );

                    }}
                  >

                    Dashboard

                  </button>


                  <button
                    onClick={() => {

                      const updatedUser =
                        {

                          ...user,

                          role:
                            user.role ===
                            "teacher"
                              ? "student"
                              : "teacher"

                        };

                      localStorage.setItem(
                        "blinklearn_user",
                        JSON.stringify(
                          updatedUser
                        )
                      );

                      window.dispatchEvent(
                        new Event(
                          "blinklearn:userChanged"
                        )
                      );

                      setDropdownOpen(
                        false
                      );

                    }}
                  >

                    Switch Role

                  </button>


                  <button
                    onClick={
                      handleLogout
                    }
                  >

                    Logout

                  </button>

                </div>

              )}

            </div>

          )}

        </div>

      </nav>



      {/* LOGIN MODAL */}
      <Modal
        isOpen={loginOpen}
        onClose={() =>
          setLoginOpen(false)
        }
      >

        <Login
          onClose={() =>
            setLoginOpen(false)
          }
        />

      </Modal>



      {/* SIGNUP MODAL */}
      <Modal
        isOpen={signupOpen}
        onClose={() =>
          setSignupOpen(false)
        }
      >

        <Signup
          onClose={() =>
            setSignupOpen(false)
          }
        />

      </Modal>



      {/* ADD COURSE MODAL */}
      <Modal
        isOpen={addCourseOpen}
        onClose={() =>
          setAddCourseOpen(false)
        }
      >

        <AddCourse />

      </Modal>

    </>
  );

}

export default Navbar;