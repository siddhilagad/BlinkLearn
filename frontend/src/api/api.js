// src/api/api.js
import axios from "axios";

// LOGIN API
export const loginUser = async (email, password) => {
  const res = await axios.post("http://localhost:5000/login", { email, password });
  return res.data; // { message, user }
};

// REGISTER API
export const registerUser = async (fullname, email, password, accountType) => {
  const res = await axios.post("http://localhost:5000/register", {
    fullname,
    email,
    password,
    accountType,
  });
  return res.data; // { message }
};