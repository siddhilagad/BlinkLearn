import React from "react";
import "./courses.css";

import course1 from "../assets/images/course1.jpg";
import course2 from "../assets/images/course2.jpg";
import course3 from "../assets/images/course3.jpg";

const Courses = () => {
  return (
    <div className="courses-page">

      {/* HERO SECTION */}
      <div className="courses-hero">
        <h1>Explore Courses</h1>
        <p>Discover your next skill from our expert courses</p>

        <div className="search-box">
          <input type="text" placeholder="Search for courses, skills, or topics..." />
          <button>Search</button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div><h3>3</h3><p>Total Courses</p></div>
        <div><h3>50+</h3><p>Expert Tutors</p></div>
        <div><h3>50K+</h3><p>Active Students</p></div>
        <div><h3>4.8★</h3><p>Avg Rating</p></div>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <button className="active">All</button>
        <button>Development</button>
        <button>Design</button>
        <button>Marketing</button>
        <button>Business</button>
      </div>

      {/* COURSES GRID */}
      <div className="courses-grid">

        <div className="course-card">
          <img src={course1} alt="course" />
          <span className="tag">Design</span>
          <div className="course-content">
            <h3>UI/UX Design Principles</h3>
            <p>Create beautiful, user-friendly interfaces</p>
            <div className="course-info">
              <span>⭐ 4.9</span>
              <span>20 lessons</span>
            </div>
          </div>
        </div>

        <div className="course-card">
          <img src={course2} alt="course" />
          <span className="tag dev">Development</span>
          <div className="course-content">
            <h3>Web Development Fundamentals</h3>
            <p>HTML, CSS, JavaScript basics</p>
            <div className="course-info">
              <span>⭐ 4.8</span>
              <span>24 lessons</span>
            </div>
          </div>
        </div>

        <div className="course-card">
          <img src={course3} alt="course" />
          <span className="tag market">Marketing</span>
          <div className="course-content">
            <h3>Digital Marketing Mastery</h3>
            
            <p>SEO, social media & content strategy</p>
            <div className="course-info">
              <span>⭐ 4.7</span>
              <span>18 lessons</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Courses;