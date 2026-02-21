import React from "react";
import "./home.css";

function Home({ setShowAuth, isLoggedIn, setIsLoggedIn }) {
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
          <span className="trusted">
            ⭐ Trusted by 50,000+ learners worldwide
          </span>

          <h1>
            Master New Skills Through <br /> Short Videos
          </h1>

          <p>
            Learn from expert tutors with bite-sized video lessons designed
            for your busy life.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Get Started Free</button>
            <button className="secondary-btn">Explore Courses</button>
          </div>
        </div>

        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5"
            alt="Learning"
          />
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div>
          <h2>50K+</h2>
          <p>Active Learners</p>
        </div>
        <div>
          <h2>200+</h2>
          <p>Video Courses</p>
        </div>
        <div>
          <h2>50+</h2>
          <p>Expert Tutors</p>
        </div>
        <div>
          <h2>4.8★</h2>
          <p>Average Rating</p>
        </div>
      </section>

      {/* COURSES */}
      <section className="courses-section">
        <h2>Popular Courses</h2>

        <div className="courses-grid">
          <div className="course-card">
            <h3>Web Development</h3>
            <img
            src="https://media.istockphoto.com/id/1201166649/photo/office-responsive-devices-web-design-website.jpg?s=2048x2048&w=is&k=20&c=7OQhRq_0EWxf4EQL66TQ6qRiPtpkmJKl33wM4PPnNM8="
            alt="Learning"
          />
            <p>Learn HTML, CSS, JavaScript</p>
          </div>

          <div className="course-card">
            <h3>React Development</h3>
            <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Learning"
          />
            <p>Build modern web apps</p>
          </div>

          <div className="course-card">
            <h3>UI/UX Design</h3>
            <img
            src="https://images.unsplash.com/photo-1586717799252-bd134ad00e26?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Learning"
          />
            <p>Create beautiful designs</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <h1>Ready to Start Learning?</h1>
         <h2>"Learn Today, Lead Tomorrow"</h2>
      </footer>

    </div>
  );
}

export default Home;