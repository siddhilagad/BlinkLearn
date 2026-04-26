import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCourses();
    const storedUser = JSON.parse(localStorage.getItem("blinklearn_user"));
    setUser(storedUser);
    const updateUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("blinklearn_user"));
      setUser(updatedUser);
    };
    window.addEventListener("blinklearn:userChanged", updateUser);
    return () => window.removeEventListener("blinklearn:userChanged", updateUser);
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // ✅ Single helper — call this on every skill click
  const goToSearch = (skill) => {
    navigate(`/courses?search=${encodeURIComponent(skill)}`);
  };

  return (
    <div className="home">

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <span className="trusted">⭐ Trusted by learners worldwide</span>
          <h1>Master New Skills Through <br /> Short Videos</h1>
          <p>Learn from expert tutors with bite-sized lessons.</p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/courses")}>
              Explore Courses
            </button>
            {!user && (
              <button className="secondary-btn" onClick={() => navigate("/signup")}>
                Get Started
              </button>
            )}
          </div>
          <div className="hero-features">
            <span>✔ Expert Tutors</span>
            <span>✔ Short Lessons</span>
            <span>✔ Flexible Learning</span>
          </div>
        </div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5" alt="Learning" />
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats">
        <div><h2>10K+</h2><p>Active Learners</p></div>
        <div><h2>500+</h2><p>Video Lessons</p></div>
        <div><h2>100+</h2><p>Expert Tutors</p></div>
        <div><h2>50+</h2><p>Course Categories</p></div>
      </section>

      {/* FEATURE SECTION */}
      <section className="features-section">
        <h1>Why Learn With BlinkLearn?</h1>
        <div className="feature-container">
          <div className="feature-box">
            <div className="feature-icon">🎓</div>
            <h3>Expert Tutors</h3>
            <p>Learn from experienced mentors and tutors with practical knowledge.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">📚</div>
            <h3>Short Lessons</h3>
            <p>Learn faster with easy-to-understand bite-sized video content.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">🚀</div>
            <h3>Career Growth</h3>
            <p>Build skills that help you grow in academics, jobs, and projects.</p>
          </div>
        </div>
      </section>

      {/* COURSES SECTION */}
      <section className="courses-section">
        <div className="courses-header">
          <div>
            <h2>Popular Courses</h2>
            <p>Explore our most loved learning content</p>
          </div>
          <button className="view-btn" onClick={() => navigate("/courses")}>View All</button>
        </div>
        <div className="courses-grid">
          {courses.length === 0 ? (
            <p className="no-course-text">No Courses Available</p>
          ) : (
            courses.slice(0, 6).map((course) => (
              <div
                className="course-card"
                key={course.course_id}
                onClick={() => navigate("/courses")}
              >
                {course.thumbnail ? (
                  <img src={`http://localhost:5000/uploads/${course.thumbnail}`} alt={course.title} />
                ) : (
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3" alt="Course Thumbnail" />
                )}
                <div className="course-card-body">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <button className="course-btn">Explore</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h1>Ready to Start Learning?</h1>
        <h2>"Learn Today, Lead Tomorrow"</h2>
        <h3>About Us</h3>
        <p>BlinkLearn is a platform dedicated to helping learners acquire new skills through short, engaging video lessons.</p>
      </section>

      {/* COMPANY STRIP */}
      <section className="company-strip">
        <div className="company-strip-left">
          <p>Top learners and growing teams choose <span>BlinkLearn Business</span> to build in-demand career skills.</p>
        </div>
        <div className="company-strip-right">
          <span>Nasdaq</span>
          <span>Volkswagen</span>
          <span>NetApp</span>
          <span>Eventbrite</span>
        </div>
      </section>

      {/* ✅ FOOTER — all skill links now navigate to /courses?search=... */}
      <footer className="main-footer">
        <div className="footer-top">
          <h2>Explore top skills and certifications</h2>
        </div>

        <div className="footer-links-grid">

          <div className="footer-column">
            <h4>In-demand Careers</h4>
            <span className="footer-link" onClick={() => goToSearch("Data Scientist")}>Data Scientist</span>
            <span className="footer-link" onClick={() => goToSearch("Full Stack Web Developer")}>Full Stack Web Developer</span>
            <span className="footer-link" onClick={() => goToSearch("Cloud Engineer")}>Cloud Engineer</span>
            <span className="footer-link" onClick={() => goToSearch("Project Manager")}>Project Manager</span>
            <span className="footer-link" onClick={() => goToSearch("Game Developer")}>Game Developer</span>
            <span className="footer-link" onClick={() => goToSearch("Career")}>All Career Accelerators</span>
          </div>

          <div className="footer-column">
            <h4>Web Development</h4>
            <span className="footer-link" onClick={() => goToSearch("Web Development")}>Web Development</span>
            <span className="footer-link" onClick={() => goToSearch("JavaScript")}>JavaScript</span>
            <span className="footer-link" onClick={() => goToSearch("React JS")}>React JS</span>
            <span className="footer-link" onClick={() => goToSearch("Angular")}>Angular</span>
            <span className="footer-link" onClick={() => goToSearch("Java")}>Java</span>
          </div>

          <div className="footer-column">
            <h4>IT Certifications</h4>
            <span className="footer-link" onClick={() => goToSearch("Amazon AWS")}>Amazon AWS</span>
            <span className="footer-link" onClick={() => goToSearch("AWS Certified Cloud Practitioner")}>AWS Certified Cloud Practitioner</span>
            <span className="footer-link" onClick={() => goToSearch("Microsoft Azure")}>AZ-900: Microsoft Azure Fundamentals</span>
            <span className="footer-link" onClick={() => goToSearch("AWS Certified Solutions Architect")}>AWS Certified Solutions Architect</span>
            <span className="footer-link" onClick={() => goToSearch("Kubernetes")}>Kubernetes</span>
          </div>

          <div className="footer-column">
            <h4>Leadership</h4>
            <span className="footer-link" onClick={() => goToSearch("Leadership")}>Leadership</span>
            <span className="footer-link" onClick={() => goToSearch("Management Skills")}>Management Skills</span>
            <span className="footer-link" onClick={() => goToSearch("Project Management")}>Project Management</span>
            <span className="footer-link" onClick={() => goToSearch("Personal Productivity")}>Personal Productivity</span>
            <span className="footer-link" onClick={() => goToSearch("Emotional Intelligence")}>Emotional Intelligence</span>
          </div>

          <div className="footer-column">
            <h4>Certifications by Skill</h4>
            <span className="footer-link" onClick={() => goToSearch("Cybersecurity")}>Cybersecurity Certification</span>
            <span className="footer-link" onClick={() => goToSearch("Project Management Certification")}>Project Management Certification</span>
            <span className="footer-link" onClick={() => goToSearch("Cloud Certification")}>Cloud Certification</span>
            <span className="footer-link" onClick={() => goToSearch("Data Analytics")}>Data Analytics Certification</span>
            <span className="footer-link" onClick={() => goToSearch("HR Management")}>HR Management Certification</span>
            <span className="footer-link" onClick={() => goToSearch("Certification")}>See all Certifications</span>
          </div>

          <div className="footer-column">
            <h4>Data Science</h4>
            <span className="footer-link" onClick={() => goToSearch("Data Science")}>Data Science</span>
            <span className="footer-link" onClick={() => goToSearch("Python")}>Python</span>
            <span className="footer-link" onClick={() => goToSearch("Machine Learning")}>Machine Learning</span>
            <span className="footer-link" onClick={() => goToSearch("ChatGPT")}>ChatGPT</span>
            <span className="footer-link" onClick={() => goToSearch("Deep Learning")}>Deep Learning</span>
          </div>

          <div className="footer-column">
            <h4>Communication</h4>
            <span className="footer-link" onClick={() => goToSearch("Communication Skills")}>Communication Skills</span>
            <span className="footer-link" onClick={() => goToSearch("Presentation Skills")}>Presentation Skills</span>
            <span className="footer-link" onClick={() => goToSearch("Public Speaking")}>Public Speaking</span>
            <span className="footer-link" onClick={() => goToSearch("Writing")}>Writing</span>
            <span className="footer-link" onClick={() => goToSearch("PowerPoint")}>PowerPoint</span>
          </div>

          <div className="footer-column">
            <h4>Business Analytics & Intelligence</h4>
            <span className="footer-link" onClick={() => goToSearch("Microsoft Excel")}>Microsoft Excel</span>
            <span className="footer-link" onClick={() => goToSearch("SQL")}>SQL</span>
            <span className="footer-link" onClick={() => goToSearch("Microsoft Power BI")}>Microsoft Power BI</span>
            <span className="footer-link" onClick={() => goToSearch("Data Analysis")}>Data Analysis</span>
            <span className="footer-link" onClick={() => goToSearch("Business Analysis")}>Business Analysis</span>
          </div>

        </div>

        {/* Bottom footer links — these stay as normal links */}
        <div className="footer-bottom-links">
          <div className="footer-column">
            <h4>About</h4>
            <a href="/">About us</a>
            <a href="/">Careers</a>
            <a href="/">Contact us</a>
            <a href="/">Blog</a>
            <a href="/">Investors</a>
          </div>
          <div className="footer-column">
            <h4>Discover BlinkLearn</h4>
            <a href="/">Get the app</a>
            <a href="/">Teach on BlinkLearn</a>
            <a href="/">Plans and Pricing</a>
            <a href="/">Affiliate</a>
            <a href="/">Help and Support</a>
          </div>
          <div className="footer-column">
            <h4>BlinkLearn for Business</h4>
            <a href="/">BlinkLearn Business</a>
          </div>
          <div className="footer-column">
            <h4>Legal & Accessibility</h4>
            <a href="/">Accessibility Statement</a>
            <a href="/">Privacy Policy</a>
            <a href="/">Sitemap</a>
            <a href="/">Terms</a>
          </div>
        </div>

        <div className="footer-last-bar">
          <div className="footer-logo">BlinkLearn</div>
          <div className="footer-copy">© 2026 BlinkLearn, Inc.</div>
          <div className="footer-language">English</div>
        </div>
      </footer>
    </div>
  );
}

export default Home;