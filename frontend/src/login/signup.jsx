import React, { useState } from "react";
import "./signup.css";

const Signup = ({ onClose }) => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSignup = (e) => {

    e.preventDefault();

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.find(
      (user) => user.email === formData.email
    );

    if (userExists) {

      alert("User already exists");
      return;

    }

    users.push(formData);

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    alert("Signup successful");

    onClose(); // close modal

  };

  return (

    <div className="signup-container">

      <h2>Signup</h2>

      <form onSubmit={handleSignup}>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
          required
        />

        <select
          name="role"
          onChange={handleChange}
        >

          <option value="student">
            Student
          </option>

          <option value="teacher">
            Teacher
          </option>

        </select>

        <button type="submit">
          Signup
        </button>

      </form>

      

    </div>

  );
};

export default Signup;