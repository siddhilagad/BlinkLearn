import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./ProfileMenu.css";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  const loadUser = () => {
    try {
      const u = JSON.parse(localStorage.getItem("blinklearn_user"));
      setUser(u || null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    const onUserChanged = () => loadUser();
    window.addEventListener("blinklearn:userChanged", onUserChanged);

    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("blinklearn:userChanged", onUserChanged);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("blinklearn_user");
    window.dispatchEvent(new Event("blinklearn:userChanged"));
    navigate("/login");
  };

  if (!user) return null;

  const isTutor = user.role === "tutor";
  const courseLabel = isTutor ? "Courses Created" : "Courses Enrolled";

  return (
    <div className="profileWrap" ref={boxRef}>
      {/* Profile Button */}
      <button className="profileBtn" onClick={() => setOpen(!open)}>
        <FaUserCircle className="profileIcon" />

        <div className="profileText">
          <div className="profileName">{user.name}</div>
          <div className="profileRole">{isTutor ? "Tutor" : "Student"}</div>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="profileDropdown">
          <div className="profileTop">
            <div className="profileTopName">{user.name}</div>
            <div className="profileTopEmail">{user.email}</div>

            {/* Stats */}
            <div className="profileStats">
              <div className="stat">
                <div className="statNum">{user.totalCourses ?? 0}</div>
                <div className="statLbl">{courseLabel}</div>
              </div>

              {isTutor ? (
                <>
                  <div className="stat">
                    <div className="statNum">{user.totalStudents ?? 0}</div>
                    <div className="statLbl">Students</div>
                  </div>

                  <div className="stat">
                    <div className="statNum">{user.rating ?? 0}</div>
                    <div className="statLbl">Rating</div>
                  </div>
                </>
              ) : (
                <div className="stat">
                  <div className="statNum">{user.streakDays ?? 0}</div>
                  <div className="statLbl">Learning Streak</div>
                </div>
              )}
            </div>

            {isTutor && user.specialization && (
              <div className="profileTag">🎯 {user.specialization}</div>
            )}
          </div>

          {/* Links */}
          <div className="profileLinks">
            {isTutor ? (
              <>
                <Link to="/teacher-dashboard" onClick={() => setOpen(false)}>
                  Tutor Dashboard
                </Link>

                <Link to="/my-courses" onClick={() => setOpen(false)}>
                  My Courses
                </Link>

                <Link to="/edit-profile" onClick={() => setOpen(false)}>
                  Edit Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/student-dashboard" onClick={() => setOpen(false)}>
                  Student Dashboard
                </Link>

                <Link to="/my-courses" onClick={() => setOpen(false)}>
                  My Learning
                </Link>

                <Link to="/edit-profile" onClick={() => setOpen(false)}>
                  Edit Profile
                </Link>
              </>
            )}

            <button className="logoutBtn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}