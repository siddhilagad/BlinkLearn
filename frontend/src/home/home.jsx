import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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

    return () => {
      window.removeEventListener("blinklearn:userChanged", updateUser);
    };
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
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <span className="trusted">⭐ Trusted by learners worldwide</span>

          <h1>
            Master New Skills Through <br /> Short Videos
          </h1>

          <p>Learn from expert tutors with bite-sized lessons.</p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/courses")}
            >
              Explore Courses
            </button>

            {!user && (
              <button
                className="secondary-btn"
                onClick={() => navigate("/signup")}
              >
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
          <img
            src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5"
            alt="Learning"
          />
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats">
        <div>
          <h2>10K+</h2>
          <p>Active Learners</p>
        </div>
        <div>
          <h2>500+</h2>
          <p>Video Lessons</p>
        </div>
        <div>
          <h2>100+</h2>
          <p>Expert Tutors</p>
        </div>
        <div>
          <h2>50+</h2>
          <p>Course Categories</p>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="features-section">
        <h1>Why Learn With BlinkLearn?</h1>

        <div className="feature-container">
          <div className="feature-box">
            <div className="feature-icon">🎓</div>
            <h3>Expert Tutors</h3>
            <p>
              Learn from experienced mentors and tutors with practical knowledge.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">📚</div>
            <h3>Short Lessons</h3>
            <p>
              Learn faster with easy-to-understand bite-sized video content.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🚀</div>
            <h3>Career Growth</h3>
            <p>
              Build skills that help you grow in academics, jobs, and projects.
            </p>
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

          <button className="view-btn" onClick={() => navigate("/courses")}>
            View All
          </button>
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
                  <img
                    src={`http://localhost:5000/uploads/${course.thumbnail}`}
                    alt={course.title}
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                    alt="Course Thumbnail"
                  />
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
        <p>
          BlinkLearn is a platform dedicated to helping learners acquire new
          skills through short, engaging video lessons.
        </p>
      </section>

      {/* COMPANY STRIP */}
      <section className="company-strip">
        <div className="company-strip-left">
          <p>
            Top learners and growing teams choose{" "}
            <span>BlinkLearn Business</span> to build in-demand career skills.
          </p>
        </div>

        <div className="company-strip-right">
          <span>Nasdaq</span>
          <span>Volkswagen</span>
          <span>NetApp</span>
          <span>Eventbrite</span>
        </div>
      </section>

      {/* BLACK FOOTER */}
      <footer className="main-footer">
        <div className="footer-top">
          <h2>Explore top skills and certifications</h2>
        </div>

        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>In-demand Careers</h4>
            <a href="/">Data Scientist</a>
            <a href="/">Full Stack Web Developer</a>
            <a href="/">Cloud Engineer</a>
            <a href="/">Project Manager</a>
            <a href="/">Game Developer</a>
            <a href="/">All Career Accelerators</a>
          </div>

          <div className="footer-column">
            <h4>Web Development</h4>
            <a href="/">Web Development</a>
            <a href="/">JavaScript</a>
            <a href="/">React JS</a>
            <a href="/">Angular</a>
            <a href="/">Java</a>
          </div>

          <div className="footer-column">
            <h4>IT Certifications</h4>
            <a href="/">Amazon AWS</a>
            <a href="/">AWS Certified Cloud Practitioner</a>
            <a href="/">AZ-900: Microsoft Azure Fundamentals</a>
            <a href="/">AWS Certified Solutions Architect</a>
            <a href="/">Kubernetes</a>
          </div>

          <div className="footer-column">
            <h4>Leadership</h4>
            <a href="/">Leadership</a>
            <a href="/">Management Skills</a>
            <a href="/">Project Management</a>
            <a href="/">Personal Productivity</a>
            <a href="/">Emotional Intelligence</a>
          </div>

          <div className="footer-column">
            <h4>Certifications by Skill</h4>
            <a href="/">Cybersecurity Certification</a>
            <a href="/">Project Management Certification</a>
            <a href="/">Cloud Certification</a>
            <a href="/">Data Analytics Certification</a>
            <a href="/">HR Management Certification</a>
            <a href="/">See all Certifications</a>
          </div>

          <div className="footer-column">
            <h4>Data Science</h4>
            <a href="/">Data Science</a>
            <a href="/">Python</a>
            <a href="/">Machine Learning</a>
            <a href="/">ChatGPT</a>
            <a href="/">Deep Learning</a>
          </div>

          <div className="footer-column">
            <h4>Communication</h4>
            <a href="/">Communication Skills</a>
            <a href="/">Presentation Skills</a>
            <a href="/">Public Speaking</a>
            <a href="/">Writing</a>
            <a href="/">PowerPoint</a>
          </div>

          <div className="footer-column">
            <h4>Business Analytics & Intelligence</h4>
            <a href="/">Microsoft Excel</a>
            <a href="/">SQL</a>
            <a href="/">Microsoft Power BI</a>
            <a href="/">Data Analysis</a>
            <a href="/">Business Analysis</a>
          </div>
        </div>

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