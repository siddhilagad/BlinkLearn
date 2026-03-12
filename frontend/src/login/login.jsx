import React, { useState } from "react";
import axios from "axios";
<<<<<<< HEAD
import { useNavigate, Link } from "react-router-dom";
=======
import { useNavigate } from "react-router-dom";
import "./login.css";
const Login = () => {
>>>>>>> 5e7b663c (my local changes before pulling)

  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

<<<<<<< HEAD
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

=======
  // handle input
>>>>>>> 5e7b663c (my local changes before pulling)
  const handleChange = (e) => {
    setData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMsg("");
  };

  // check teacher courses
  const checkTeacherCourses = async (userId) => {

  try {

    const res = await axios.get(
      `http://localhost:5000/teacher-courses/${userId}`
    );

    if (res.data.length > 0) {
      navigate("/my-courses");   // ✅ teacher courses page
    } else {
      navigate("/teacher-dashboard");   // ✅ add course page
    }

  } catch (err) {
    console.log(err);
  }

};

  // login
  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
<<<<<<< HEAD
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
=======

      const res = await axios.post(
        "http://localhost:5000/login",
>>>>>>> 5e7b663c (my local changes before pulling)
        data
      );

      const user = res.data.user;

<<<<<<< HEAD
      localStorage.setItem("blinklearn_user", JSON.stringify(user));
      window.dispatchEvent(new Event("blinklearn:userChanged"));

      if (user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
=======
      console.log("FULL USER OBJECT:", user);
      console.log("ROLE VALUE:", user.role);

      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role?.trim().toLowerCase();

      if (role === "tutor") {

        checkTeacherCourses(user.user_id);

      } else if (role === "student") {

>>>>>>> 5e7b663c (my local changes before pulling)
        navigate("/student-dashboard");

      } else {

        alert("Role not recognized");
        console.log("Unknown role:", role);

      }

    } catch (err) {
<<<<<<< HEAD
      console.error("Login error:", err);
      setErrorMsg(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
=======

      alert("Invalid email or password");
      console.log(err);

>>>>>>> 5e7b663c (my local changes before pulling)
    }

  };

  return (
<<<<<<< HEAD
    <div className="login-page">
      <div className="login-wrapper">

        {/* Left Side */}
        <div className="login-left">

          {/* CLICKABLE LOGO */}
          <Link to="/" className="logo-link">
            <div className="brand-badge">🎓 BlinkLearn</div>
          </Link>

          <h1>Welcome Back to BlinkLearn</h1>

          <p>
            Learn smarter, teach better, and manage your courses with a modern
            learning platform built for students and tutors.
          </p>

          <div className="feature-list">
            <div className="feature-card">
              <span>📚</span>
              <div>
                <h4>Smart Learning</h4>
                <p>Access interactive courses and structured learning paths.</p>
              </div>
            </div>

            <div className="feature-card">
              <span>👨‍🏫</span>
              <div>
                <h4>For Tutors</h4>
                <p>Create, manage, and track your teaching dashboard easily.</p>
              </div>
            </div>

            <div className="feature-card">
              <span>🚀</span>
              <div>
                <h4>Fast Experience</h4>
                <p>Responsive, modern, and client-ready interface design.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-right">
          <div className="login-card">

            <div className="login-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            {errorMsg && <div className="error-box">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="login-form">

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={data.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  Remember me
                </label>
                <span className="forgot-link">Forgot Password?</span>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing In..." : "Login"}
              </button>

            </form>

            <p className="signup-text">
              Don’t have an account?{" "}
              <span onClick={() => navigate("/signup")}>Sign up</span>
            </p>

          </div>
        </div>
      </div>
=======

    <div className="login-page">

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={data.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={data.password}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Login
        </button>

      </form>

>>>>>>> 5e7b663c (my local changes before pulling)
    </div>

  );

};

export default Login;