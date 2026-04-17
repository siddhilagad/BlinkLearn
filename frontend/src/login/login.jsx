import React, { useState } from "react";
import "./login.css";

const Login = ({ onClose }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {

    e.preventDefault();

    const storedUsers =
      JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = storedUsers.find(
      (user) =>
        user.email === email &&
        user.password === password
    );

    if (!foundUser) {

      alert("Invalid credentials");
      return;

    }

    localStorage.setItem(
      "blinklearn_user",
      JSON.stringify(foundUser)
    );

    window.dispatchEvent(
      new Event("blinklearn:userChanged")
    );

    alert("Login successful");

    onClose(); // close modal

  };

  return (

    <div className="login-container">

      <h2>Login</h2>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button type="submit">
          Login
        </button>

      </form>

      

    </div>

  );
};

export default Login;