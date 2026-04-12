import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./TeacherDashboard.css";

function TeacherDashboard() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {

    const storedUser =
      JSON.parse(localStorage.getItem("blinklearn_user"));

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const userRole =
      storedUser.role?.toLowerCase().trim();

    if (userRole !== "teacher") {
      navigate("/student-dashboard");
      return;
    }

    setUser(storedUser);

    const handleUserChange = () => {

      setUser(
        JSON.parse(
          localStorage.getItem("blinklearn_user")
        )
      );

    };

    window.addEventListener(
      "blinklearn:userChanged",
      handleUserChange
    );

    return () =>
      window.removeEventListener(
        "blinklearn:userChanged",
        handleUserChange
      );

  }, [navigate]);


  return (

    <div className="teacher-dashboard-page">

      <div className="teacher-dashboard-wrapper">

        <Link
          to="/"
          className="dashboard-logo-link"
        >

          <div className="dashboard-logo">
            ▶ BlinkLearn
          </div>

        </Link>


        <div className="teacher-dashboard-hero">

          <div>

            <p className="dashboard-label">
              Teacher Panel
            </p>

            <h1>
              Welcome back,
              {user?.name || "Teacher"} 👋
            </h1>

            <p className="dashboard-subtitle">
              Manage your profile,
              courses, and students
              from one place.
            </p>

          </div>


          <button
            className="dashboard-main-btn"
            onClick={() =>
              navigate("/add-course")
            }
          >

            Add Courses

          </button>

        </div>


        {/* Profile Card */}

        <div className="teacher-profile-card">

          <div className="teacher-avatar">

            {user?.profilePhoto ? (

              <img
                src={user.profilePhoto}
                alt="profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />

            ) : (

              user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "T"

            )}

          </div>


          <div className="teacher-profile-info">

            <h2>
              {user?.name ||
                "Teacher Name"}
            </h2>

            <p>
              {user?.email ||
                "teacher@gmail.com"}
            </p>

            <span className="teacher-role-badge">
              Teacher
            </span>

          </div>

        </div>


        {/* Stats */}

        <div className="teacher-stats-grid">

          <div className="teacher-stat-card">
            <h3>
              {user?.totalCourses || 0}
            </h3>
            <p>Total Courses</p>
          </div>

          <div className="teacher-stat-card">
            <h3>
              {user?.totalStudents || 0}
            </h3>
            <p>Total Students</p>
          </div>

          <div className="teacher-stat-card">
            <h3>
              {user?.rating || 0}
            </h3>
            <p>Rating</p>
          </div>

          <div className="teacher-stat-card">
            <h3>
              {user?.specialization ||
                "Not Added"}
            </h3>
            <p>Specialization</p>
          </div>

        </div>


        {/* Quick Actions */}

        <div className="teacher-section-card">

          <h2>
            Quick Actions
          </h2>

          <div className="teacher-actions-grid">

            <div className="teacher-action-box">

              <h3>
                My Courses
              </h3>

              <p>
                Check and manage
                all the courses
                you created.
              </p>

              <button
                onClick={() =>
                  navigate("/my-courses")
                }
              >
                Open
              </button>

            </div>


            <div className="teacher-action-box">

              <h3>
                Add Courses
              </h3>

              <p>
                Create and publish
                a new course
                for your students.
              </p>

              <button
                onClick={() =>
                  navigate("/add-course")
                }
              >
                Add
              </button>

            </div>


            <div className="teacher-action-box">

              <h3>
                Edit Profile
              </h3>

              <p>
                Update your teacher
                details and personal
                information.
              </p>

              <button
                onClick={() =>
                  navigate("/edit-profile")
                }
              >
                Edit
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default TeacherDashboard;