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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post(
        // `${process.env.REACT_APP_BACKEND_URL}/login`,
        "http://localhost:5000/api/auth/login",
        data
      );

      const user = res.data.user;

      localStorage.setItem("blinklearn_user", JSON.stringify(user));
      window.dispatchEvent(new Event("blinklearn:userChanged"));

      if (user.role === "tutor") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* Left Side */}
        <div className="login-left">
          <div className="brand-badge">🎓 BlinkLearn</div>
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
    </div>
  );
}

export default Login;