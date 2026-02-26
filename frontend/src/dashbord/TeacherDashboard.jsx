import React, { useState } from "react";
import axios from "axios";
import "./TeacherDashboard.css"; // ✅ CSS import

function TeacherDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    thumbnail: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/courses", {
        user_id: user.id,
        ...formData
      });

      alert("Course Created Successfully");

      setFormData({
        title: "",
        description: "",
        price: "",
        level: "",
        thumbnail: ""
      });
    } catch (err) {
      console.error(err);
      alert("Course creation failed");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">
        <h1>Teacher Dashboard</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Course Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Course Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="level"
            placeholder="Level (Beginner/Intermediate/Advanced)"
            value={formData.level}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="thumbnail"
            placeholder="Thumbnail URL"
            value={formData.thumbnail}
            onChange={handleChange}
          />
          <button type="submit">Create Course</button>
        </form>
      </div>
    </div>
  );
}

export default TeacherDashboard;