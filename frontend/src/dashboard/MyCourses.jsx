import React, { useEffect, useState } from "react";
import axios from "axios";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem("blinklearn_user"));

  useEffect(() => {
    if (user?.id && user?.role) {
      fetchCourses();
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/courses/user/${user.id}?role=${user.role}`
      );
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  if (!user) return <h2>Please login first</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>My Courses</h1>

      {courses.length === 0 ? (
        <p>No courses found</p>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
          {courses.map((course) => (
            <div
              key={course.course_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p><strong>Category:</strong> {course.category}</p>
              <p><strong>Price:</strong> ₹{course.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;