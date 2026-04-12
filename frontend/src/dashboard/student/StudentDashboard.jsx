import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

function StudentDashboard() {

  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);


  useEffect(() => {

    const storedUser =
      JSON.parse(
        localStorage.getItem(
          "blinklearn_user"
        )
      );

    setUser(storedUser || null);


    const handleUserChange =
      () => {

        setUser(
          JSON.parse(
            localStorage.getItem(
              "blinklearn_user"
            )
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

  }, []);


  const stats = {

    totalCourses:
      user?.totalCourses ?? 0,

    completedCourses:
      user?.completedCourses ?? 0,

    streakDays:
      user?.streakDays ?? 0,

    hoursLearned:
      user?.hoursLearned ?? 0,

  };


  return (

    <div className="student-dashboard-page">

      <div className="student-dashboard-wrapper">


        <div className="student-hero">

          <div>

            <p className="dashboard-label">
              Student Panel
            </p>

            <h1>
              Welcome back,
              {user?.name ||
                "Student"} 👋
            </h1>

            <p className="dashboard-subtitle">
              Continue learning
              and track your progress.
            </p>

          </div>


          <button
            className="dashboard-main-btn"
            onClick={() =>
              navigate("/courses")
            }
          >

            Explore Courses

          </button>

        </div>


        {/* Profile Card */}

        <div className="student-profile-card">

          <div className="student-avatar">

            {user?.profilePhoto ? (

              <img
                src={
                  user.profilePhoto
                }
                alt="profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />

            ) : (

              user?.name?.[0]?.toUpperCase()
              || "S"

            )}

          </div>


          <div className="student-info">

            <h2>
              {user?.name ||
                "Student Name"}
            </h2>

            <p>
              {user?.email ||
                "student@email.com"}
            </p>

            <h3>
              {user?.accountType || ""}
            </h3>

          </div>

        </div>


        {/* Stats */}

        <div className="student-stats-grid">

          <div className="student-stat-card">
            <h3>
              {stats.totalCourses}
            </h3>
            <p>
              Courses Enrolled
            </p>
          </div>

          <div className="student-stat-card">
            <h3>
              {stats.completedCourses}
            </h3>
            <p>
              Completed Courses
            </p>
          </div>

          <div className="student-stat-card">
            <h3>
              {stats.streakDays}
            </h3>
            <p>
              Learning Streak
            </p>
          </div>

          <div className="student-stat-card">
            <h3>
              {stats.hoursLearned}
            </h3>
            <p>
              Hours Learned
            </p>
          </div>

        </div>


        {/* Quick Actions */}

        <div className="student-section">

          <h2>
            Quick Actions
          </h2>

          <div className="student-actions">


            <div className="student-action-box">

              <h3>
                My Learning
              </h3>

              <p>
                Continue watching
                your enrolled courses.
              </p>

              <button
                onClick={() =>
                  navigate("/my-learning")
                }
              >
                Open
              </button>

            </div>


            <div className="student-action-box">

              <h3>
                Browse Courses
              </h3>

              <p>
                Discover new courses
                to upgrade your skills.
              </p>

              <button
                onClick={() =>
                  navigate("/courses")
                }
              >
                Explore
              </button>

            </div>


            <div className="student-action-box">

              <h3>
                Edit Profile
              </h3>

              <p>
                Update your personal
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

export default StudentDashboard;