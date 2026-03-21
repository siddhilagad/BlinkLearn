import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherCourses.css";

const TeacherCourses = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("blinklearn_user")); // ✅ updated key
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/teacher-courses/${user.user_id}`
        );
        setCourses(res.data);
      } catch (err) {
        console.log(err);
        setErrorMsg("Error fetching your courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [navigate]);

  // ✅ e.stopPropagation() add केला — card click trigger होणार नाही
  const handleDelete = async (e, courseId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/delete-course/${courseId}/${user.user_id}`
      );
      setCourses(courses.filter((c) => c.course_id !== courseId));
    } catch (err) {
      console.log(err);
      alert("Failed to delete course");
    }
  };

  // ✅ e.stopPropagation() add केला
  const handleEdit = (e, courseId) => {
    e.stopPropagation();
    navigate(`/edit-course/${courseId}`);
  };

  return (
    <div className="teacher-courses-page">
      <h2>Your Courses</h2>
      {errorMsg && <div className="error-box">{errorMsg}</div>}
      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>
          You have not added any courses yet.{" "}
          <span
            onClick={() => navigate("/add-course")}
            className="add-link"
          >
            Add a new course
          </span>
          .
        </p>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div
              className="course-card"
              key={course.course_id}
              onClick={() => navigate(`/course/${course.course_id}`)} // ✅ clickable
              style={{ cursor: "pointer" }}
            >
              {course.thumbnail && (
                <img
                  src={`http://localhost:5000/uploads/${course.thumbnail}`}
                  alt={course.title}
                  className="course-thumbnail"
                />
              )}
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>Price: ₹{course.price}</span>
                <span>Level: {course.level}</span>
              </div>
              <div className="course-actions">
                <button onClick={(e) => handleEdit(e, course.course_id)}>
                  Edit
                </button>
                <button onClick={(e) => handleDelete(e, course.course_id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;