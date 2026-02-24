import React from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";

function Home({ setShowAuth, isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div className="home">

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

          <button
            className="explore-btn"
            onClick={() => navigate("/courses")}
          >
            Explore courses
          </button>
        </div>   {/* ✅ FIXED: Closed hero-left div */}

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
              src="https://media.istockphoto.com/id/1201166649/photo/office-responsive-devices-web-design-website.jpg"
              alt="Web Development"
            />
            <p>Learn HTML, CSS, JavaScript</p>
          </div>

          <div className="course-card">
            <h3>React Development</h3>
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
              alt="React Development"
            />
            <p>Build modern web apps</p>
          </div>

          <div className="course-card">
            <h3>UI/UX Design</h3>
            <img
              src="https://images.unsplash.com/photo-1586717799252-bd134ad00e26"
              alt="UI UX Design"
            />
            <p>Create beautiful designs</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <h1>Ready to Start Learning?</h1>
        <h2>"Learn Today, Lead Tomorrow"</h2>

        <h3>About us</h3>
        <p>
          BlinkLearn is a platform dedicated to helping learners acquire new
          skills through short, engaging video lessons.
        </p>
      </footer>

    </div>
  );
}

export default Home;