import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { loginUser } from "../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import StudentOnboarding from "./studentOnboardingModal";
import Navbar from "../components/Navbar";

const Login = () => {

  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");

  const [showOnboarding, setShowOnboarding] =
    useState(false);


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

      const res =
        await loginUser(
          data.email,
          data.password
        );

      const user =
        res.user;

      localStorage.setItem(
        "blinklearn_user",
        JSON.stringify(user)
      );

      const role =
        user.role
          ?.toLowerCase()
          .trim();


      // ✅ NEW REDIRECT LOGIC (Home Page default)

      if (
        role === "student"
      ) {

        const onboardingDone =
          localStorage.getItem(
            "blinklearn_onboarding_done"
          ) === "true";

        if (!onboardingDone) {

          setShowOnboarding(true);

        } else {

          navigate("/");

        }

      }

      else if (
        role === "teacher"
      ) {

        navigate("/");

      }

      else {

        alert("Role not recognized");

      }

    }

    catch (err) {

      setErrorMsg(
        err.message ||
        "Login failed"
      );

    }

    finally {

      setLoading(false);

    }

  };


  const handleOnboardingClose = () => {

    setShowOnboarding(false);

    navigate("/");   // ✅ after onboarding go home

  };


  return (

    <>

      <Navbar />

      {showOnboarding && (

        <StudentOnboarding
          onClose={
            handleOnboardingClose
          }
        />

      )}

      <div className="login-page">

        <div className="login-wrapper">


          {/* LEFT SIDE */}

          <div className="login-left">

            <Link
              to="/"
              className="logo-link"
            >

              <div className="brand-badge">
                🎓 BlinkLearn
              </div>

            </Link>

            <h1>
              Welcome Back to BlinkLearn
            </h1>

            <p>

              Learn smarter, teach better,
              and manage your courses with
              a modern learning platform.

            </p>

          </div>


          {/* RIGHT SIDE */}

          <div className="login-right">

            <div className="login-card">

              <div className="login-header">

                <h2>
                  Sign In
                </h2>

                <p>
                  Enter your credentials
                  to access your account
                </p>

              </div>


              {errorMsg && (

                <div className="error-box">
                  {errorMsg}
                </div>

              )}


              <form
                onSubmit={
                  handleSubmit
                }
                className="login-form"
              >


                <div className="input-group">

                  <label>
                    Email Address
                  </label>

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

                  <label>
                    Password
                  </label>

                  <div className="password-box">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="Enter your password"
                      value={data.password}
                      onChange={handleChange}
                      required
                    />

                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >

                      {showPassword
                        ? <FaEyeSlash />
                        : <FaEye />}

                    </button>

                  </div>

                </div>


                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading}
                >

                  {loading
                    ? "Signing In..."
                    : "Login"}

                </button>

              </form>


              <p className="signup-text">

                Don't have an account?{" "}

                <span
                  onClick={() =>
                    navigate("/signup")
                  }
                >

                  Sign up

                </span>

              </p>

            </div>

          </div>

        </div>

      </div>

    </>

  );

};

export default Login;