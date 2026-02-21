import React, { useState } from "react";
import "./Auth.css";

export default function Auth({ setShowAuth, setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowAuth(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-box">
          <h2 className="logo">blinkLearn</h2>
          <h3>{isLogin ? "Welcome Back!" : "Create Account"}</h3>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" required />
              </div>
            )}

            <div className="input-group">
              <label>Email</label>
              <input type="email" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" required />
            </div>

            <button className="primary-btn">
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Sign Up" : " Sign In"}
            </span>
          </div>

          <button
            style={{ marginTop: "15px" }}
            onClick={() => setShowAuth(false)}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}