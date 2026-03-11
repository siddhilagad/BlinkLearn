import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./home/home";
import Login from "./login/login";
import Signup from "./login/signup";
import Courses from "./courses/courses";

import TeacherDashboard from "./dashboard/TeacherDashboard";
import StudentDashboard from "./dashboard/StudentDashboard";
import MyCourses from "./dashboard/MyCourses";
import EditProfile from "./dashboard/EditProfile";
import Wishlist from "./components/wishlist";

function App() {
  return (
    <Router>
      <Routes>
        {/* MAIN ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<Courses />} />

        {/* WISHLIST */}
        <Route path="/wishlist" element={<Wishlist />} />

        {/* DASHBOARD ROUTES */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}

export default App;