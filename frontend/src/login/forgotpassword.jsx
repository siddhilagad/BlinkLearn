import React, { useState } from "react";
import "./forgotpassword.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setMessage(res.data.msg || "Reset link sent!");
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-wrapper">
        
        {/* LEFT SIDE */}
        <div className="forgot-left">
          <div className="brand-badge">✨ BlinkLearn</div>
          <h1>Reset Your Password</h1>
          <p>
            Enter your email and we’ll send you a link to reset your password.
          </p>

          <div className="feature-card">
            <span>🔐</span>
            <div>
              <h4>Secure Process</h4>
              <p>Your data is protected with secure authentication.</p>
            </div>
          </div>

          <div className="feature-card">
            <span>⚡</span>
            <div>
              <h4>Quick Recovery</h4>
              <p>Reset your password in just a few simple steps.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="forgot-right">
          <div className="forgot-card">
            <h2>Forgot Password</h2>
            <p>Enter your registered email</p>

            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="back-login" onClick={() => navigate("/login")}>
              ← Back to Login
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;