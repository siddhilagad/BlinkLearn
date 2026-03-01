import React, { useState } from "react";
import axios from "axios";
import "./TeacherDashboard.css";
import { useNavigate } from "react-router-dom";

function TeacherDashboard() {

  const navigate = useNavigate();   // 🔥 redirect साठी

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    thumbnail: null
  });

  const user = { id: 1 }; // later replace with real logged user

  const handleChange = (e) => {
    if (e.target.name === "thumbnail") {
      setFormData({
        ...formData,
        thumbnail: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("level", formData.level);
      data.append("thumbnail", formData.thumbnail);
      data.append("user_id", user.id);

      await axios.post("http://localhost:5000/add-course", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Course Created Successfully ✅");

      // 🔥 Redirect to Courses Page
      navigate("/courses", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Course creation failed ❌");
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

          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <input
            type="file"
            name="thumbnail"
            onChange={handleChange}
            required
          />

          <button type="submit">Create Course</button>

        </form>
      </div>
    </div>
  );
}

export default TeacherDashboard;