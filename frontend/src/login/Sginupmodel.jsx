import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import "./Loginmodel.css";

const passwordRules = [
  (p) => p.length >= 8,
  (p) => /[A-Z]/.test(p),
  (p) => /[a-z]/.test(p),
  (p) => /[0-9]/.test(p),
  (p) => /[^A-Za-z0-9]/.test(p),
];

function isPasswordValid(password) {
  return passwordRules.every((rule) => rule(password));
}

function isFullNameValid(name) {
  return /^[A-Za-z\s]+$/.test(name.trim()) && name.trim().length > 0;
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const SignupModal = ({ onClose, onSwitchToLogin }) => {
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
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
    setSuccessMsg("");
    if (name === "password") setPasswordTouched(true);
    if (name === "fullname") setNameTouched(true);
    if (name === "email") setEmailTouched(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isFullNameValid(formData.fullname)) {
      setErrorMsg("Full name must contain only letters and spaces.");
      return;
    }
    if (!isEmailValid(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!isPasswordValid(formData.password)) {
      setErrorMsg("Password must be 8+ chars with uppercase, lowercase, number & special char.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await registerUser({
        fullname: formData.fullname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        accountType: formData.accountType.toLowerCase(),
      });

      setSuccessMsg(res.message || "Account created successfully!");
      setTimeout(() => onSwitchToLogin(), 1200);

    } catch (err) {
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const password = formData.password;
  const isValid = isPasswordValid(password);

  return (
    <>
      {/* Backdrop */}
      <div className="modal-overlay" onClick={onClose} />

      {/* Modal — exact same as signup page */}
      <div className="modal-container modal-container-signup">
        <button className="modal-x-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="signup-wrapper modal-wrapper">

          {/* LEFT SIDE — exact same */}
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

          {/* RIGHT SIDE — exact same */}
          <div className="signup-right">
            <div className="signup-card">

              <div className="signup-header">
                <h2>Create Account</h2>
                <p>Fill in your details to get started with BlinkLearn</p>
              </div>

              {errorMsg && <div className="message-box error-box">{errorMsg}</div>}
              {successMsg && <div className="message-box success-box">{successMsg}</div>}

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
                  {nameTouched && formData.fullname.length > 0 && (
                    <p className={isFullNameValid(formData.fullname) ? "pwd-status valid" : "pwd-status invalid"}>
                      {isFullNameValid(formData.fullname) ? "✅ Valid name" : "❌ Letters and spaces only"}
                    </p>
                  )}
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
                  {emailTouched && formData.email.length > 0 && (
                    <p className={isEmailValid(formData.email) ? "pwd-status valid" : "pwd-status invalid"}>
                      {isEmailValid(formData.email) ? "✅ Valid email" : "❌ Enter a valid email"}
                    </p>
                  )}
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
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordTouched && password.length > 0 && (
                    <p className={isValid ? "pwd-status valid" : "pwd-status invalid"}>
                      {isValid ? "✅ Strong password" : "❌ 8+ chars, uppercase, lowercase, number & special char"}
                    </p>
                  )}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.confirmPassword.length > 0 && (
                    <p className={formData.password === formData.confirmPassword ? "pwd-status valid" : "pwd-status invalid"}>
                      {formData.password === formData.confirmPassword ? "✅ Passwords match" : "❌ Passwords do not match"}
                    </p>
                  )}
                </div>

                <button type="submit" className="signup-btn" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

              </form>

              <p className="signin-text">
                Already have an account?{" "}
                <span onClick={onSwitchToLogin}>Sign in</span>
              </p>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SignupModal;