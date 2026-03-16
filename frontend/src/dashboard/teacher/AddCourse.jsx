import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddCourse.css"; // optional, style as needed

const AddCourse = () => {
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    level: "Beginner",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("price", courseData.price);
    formData.append("level", courseData.level);

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      const res = await axios.post("http://localhost:5000/teacher/add-course", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("Course added successfully!");
        navigate("/teacher-courses"); // redirect to teacher courses list
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-course-page">
      <h2>Add New Course</h2>

      {errorMsg && <div className="error-box">{errorMsg}</div>}

      <form className="add-course-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Course Title</label>
          <input
            type="text"
            name="title"
            value={courseData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="input-group">
          <label>Price ($)</label>
          <input
            type="number"
            name="price"
            value={courseData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Level</label>
          <select name="level" value={courseData.level} onChange={handleChange}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="input-group">
          <label>Thumbnail (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Adding Course..." : "Add Course"}
        </button>
      </form>
    </div>
  );
};

export default AddCourse;