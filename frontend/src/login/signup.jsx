import React, { useState } from "react";
import "./signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        // `${process.env.REACT_APP_BACKEND_URL}/register`,
        "http://localhost:5000/api/auth/register",
        {
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType,
        }
      );

      setSuccessMsg(res.data.message || "Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMsg(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        {/* Left Side */}
        <div className="signup-left">
          <div className="brand-badge">✨ BlinkLearn</div>
          <h1>Create Your Learning Journey</h1>
          <p>
            Join BlinkLearn to explore powerful learning tools, interactive
            lessons, and smart teaching features designed for students and tutors.
          </p>

          <div className="feature-list">
            <div className="feature-card">
              <span>🎯</span>
              <div>
                <h4>Personalized Experience</h4>
                <p>Get a learning dashboard tailored to your role and goals.</p>
              </div>
            </div>

            <div className="feature-card">
              <span>📖</span>
              <div>
                <h4>Interactive Courses</h4>
                <p>Access structured content with a smooth and modern UI.</p>
              </div>
            </div>

            <div className="feature-card">
              <span>🌟</span>
              <div>
                <h4>Client-Ready Design</h4>
                <p>Premium visual style perfect for project presentation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="signup-right">
          <div className="signup-card">
            <div className="signup-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started with BlinkLearn</p>
            </div>

            {errorMsg && <div className="message-box error-box">{errorMsg}</div>}
            {successMsg && (
              <div className="message-box success-box">{successMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Enter your full name"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
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
                    placeholder="Create password"
                    value={formData.password}
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

              <div className="input-group">
                <label>Confirm Password</label>
                <div className="password-box">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Account Type</label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="signin-text">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")}>Sign in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup; 
// useNaviagte , Link
