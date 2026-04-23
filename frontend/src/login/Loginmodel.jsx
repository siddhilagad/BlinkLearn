import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/api";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import StudentOnboarding from "./studentOnboardingModal";
import "./Loginmodel.css";

const LoginModal = ({ onClose, onSwitchToSignup }) => {
  const navigate = useNavigate();

  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await loginUser(data.email, data.password);
      const user = res.user;

      localStorage.setItem("blinklearn_user", JSON.stringify(user));
      window.dispatchEvent(new Event("blinklearn:userChanged"));

      const role = user.role?.toLowerCase().trim();

      if (role === "student") {
        const onboardingDone =
          localStorage.getItem("blinklearn_onboarding_done") === "true";
        if (!onboardingDone) {
          setShowOnboarding(true);
          return;
        }
      }

      onClose();
      navigate("/");

    } catch (err) {
      setErrorMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    onClose();
    navigate("/");
  };

  return (
    <>
      {showOnboarding && (
        <StudentOnboarding onClose={handleOnboardingClose} />
      )}

      {/* Backdrop */}
      <div className="modal-overlay" onClick={onClose} />

      {/* Modal — exact same as login page */}
      <div className="modal-container">
        <button className="modal-x-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="login-wrapper modal-wrapper">

          {/* LEFT SIDE — exact same */}
          <div className="login-left">
            <Link to="/" className="logo-link" onClick={onClose}>
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

          {/* RIGHT SIDE — exact same */}
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
                    onClick={() => { onClose(); navigate("/forgot-password"); }}
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
                <span onClick={onSwitchToSignup}>Sign up</span>
              </p>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoginModal;