import React, { useEffect, useState } from "react";
import axios from "axios";
import "./home.css";
import { useNavigate } from "react-router-dom";

function Home({ setShowAuth, isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  return (
    <div className="home">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <div className="logo-icon">▶</div>
            <h2>blinkLearn</h2>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Search courses..." />
          </div>
        </div>

        <div className="nav-right">
          {!isLoggedIn ? (
            <>
              <button className="login-btn" onClick={() => setShowAuth(true)}>
                Sign In
              </button>
              <button className="signup-btn" onClick={() => setShowAuth(true)}>
                Login
              </button>
            </>
          ) : (
            <button
              className="signup-btn"
              onClick={() => setIsLoggedIn(false)}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <span className="trusted">⭐ Trusted by learners worldwide</span>

          <h1>
            Master New Skills Through <br /> Short Videos
          </h1>

          <p>Learn from expert tutors with bite-sized lessons.</p>

          <button
            className="explore-btn"
            onClick={() => navigate("/courses")}
          >
            Explore Courses
          </button>
        </div>

        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5"
            alt="Learning"
          />
        </div>
      </section>

      {/* COURSES SECTION */}
      <section className="courses-section">
        <h2>Popular Courses</h2>

        <div className="courses-grid">
          {courses.length === 0 ? (
            <p>No Courses Available</p>
          ) : (
            courses.slice(0, 3).map((course) => (
              <div className="course-card" key={course.course_id}>
                <img src={course.thumbnail} alt={course.title} />
                <h3>{course.title}</h3>
                <p>{course.description}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <h1>Ready to Start Learning?</h1>
        <h2>"Learn Today, Lead Tomorrow"</h2>

        <h3>About Us</h3>
        <p>
          BlinkLearn is a platform dedicated to helping learners acquire new
          skills through short, engaging video lessons.
        </p>
      </footer>
    </div>
  );
}

export default Home;