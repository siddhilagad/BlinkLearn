import React, { useState } from "react";
import "./login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/login", data);
      alert(res.data.message);
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>BlinkLearn</h1>
        <h3>Sign In</h3>

        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

          <button type="submit">Login</button>
        </form>

        <p>
          Don't have account? <span onClick={() => navigate("/")}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;

