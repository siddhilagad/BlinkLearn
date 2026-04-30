import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { loginUser } from "../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import StudentOnboarding from "./studentOnboardingModal";

const Login = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

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
      const res = await loginUser(data.email, data.password);
      const user = res.user;

      // Save user
      localStorage.setItem("blinklearn_user", JSON.stringify(user));

      // Update navbar instantly
      window.dispatchEvent(new Event("blinklearn:userChanged"));

      const role = user.role?.toLowerCase().trim();

      if (role === "student" || role === "") {
        if (!user.onboarding_done) {
          setShowOnboarding(true);
          return;
        }
      }

      // Navigate based on role
      navigate(role === "teacher" ? "/teacher-dashboard" : "/student-dashboard");

    } catch (err) {
      // ✅ Show specific error message from backend
      const msg = err.response?.data?.message || err.message || "Login failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // After onboarding complete → go to home page
    navigate("/");
  };

  return (
    <>
      {/* ✅ Navbar काढला — App.jsx मधून येतो */}

      {showOnboarding && (
        <StudentOnboarding 
          user={JSON.parse(localStorage.getItem("blinklearn_user"))} 
          onClose={handleOnboardingClose} 
        />
      )}

      {!showOnboarding && (
        <div className="login-page">
          <div className="login-wrapper">

            {/* LEFT SIDE */}
            <div className="login-left">
              <Link to="/" className="logo-link">
                <div className="brand-badge">
                  🎓 BlinkLearn
                </div>
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

            {/* RIGHT SIDE */}
            <div className="login-right">
              <div className="login-card">
                <div className="login-header">
                  <h2>Sign In</h2>
                  <p>Enter your credentials to access your account</p>
                </div>

                {errorMsg && (
                  <div className="error-box">{errorMsg}</div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={data.email}
                      onChange={handleChange}
                      autoComplete="off"
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
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <label className="remember-me">
                      <input type="checkbox" />
                      Remember me
                    </label>
                    <span
                      className="forgot-link"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot Password?
                    </span>
                  </div>

                  <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? "Signing In..." : "Login"}
                  </button>
                </form>

                <p className="signup-text">
                  Don't have an account?{" "}
                  <span onClick={() => navigate("/signup")}>Sign up</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Login;