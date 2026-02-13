import "./home.css";

// hero & feature images
import hero from "../assets/images/hero.jpg";
import shortVideos from "../assets/images/short-videos.jpg";
import progress from "../assets/images/progress.jpg";
import projects from "../assets/images/projects.jpg";

// course images
import jsImg from "../assets/images/js.jpg";
import cssImg from "../assets/images/css.jpg";
import gitImg from "../assets/images/git.jpg";
import reactImg from "../assets/images/react.jpg";

function Home() {
  return (
    <div className="home">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">BlinkLearn</div>

        <ul className="nav-links">
          <li>Home</li>
          <li>Courses</li>
          <li>About</li>
        </ul>

        <div className="nav-actions">
          <input type="text" placeholder="Search courses..." />
          <button className="login-btn">Login</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>BlinkLearn — learn in a blink, grow for life</h1>
          <p>Skill learning website through short, focused videos</p>

          <div className="hero-buttons">
            <button className="btn-primary">Get Started</button>
            <button className="btn-outline">Browse Courses</button>
          </div>
        </div>

        <div className="hero-image">
          <img src={hero} alt="Online Learning" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="feature-card">
          <img src={shortVideos} alt="Short videos" />
          <h3>Short Videos</h3>
          <p>3–10 minute focused lessons</p>
        </div>

        <div className="feature-card">
          <img src={progress} alt="Track progress" />
          <h3>Track Progress</h3>
          <p>Resume anytime and track learning</p>
        </div>

        <div className="feature-card">
          <img src={projects} alt="Projects" />
          <h3>Hands-on Projects</h3>
          <p>Practice with bite-sized projects</p>
        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className="courses">
        <h2>Popular Courses</h2>

        <div className="course-grid">
          <div className="course-card">
            <img src={jsImg} alt="JavaScript" />
            <h4>JavaScript Fundamentals</h4>
            <p>Basics of JS: variables, functions, DOM</p>
            <span>8m</span>
          </div>

          <div className="course-card">
            <img src={cssImg} alt="CSS Flexbox" />
            <h4>CSS Flexbox Fast</h4>
            <p>Layout with flexbox in minutes</p>
            <span>6m</span>
          </div>

          <div className="course-card">
            <img src={gitImg} alt="Git" />
            <h4>Git Essentials</h4>
            <p>Commit, branch, merge workflows</p>
            <span>9m</span>
          </div>

          <div className="course-card">
            <img src={reactImg} alt="React" />
            <h4>React Hooks Intro</h4>
            <p>useState, useEffect explained</p>
            <span>10m</span>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;

