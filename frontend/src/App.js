import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./home/home";
import Login from "./login/login";
import Signup from "./login/signup";
import Courses from "./courses/courses";

// Teacher & Student Dashboards
import AddCourse from "./dashboard/teacher/AddCourse";
import TeacherDashboard from "./dashboard/teacher/TeacherDashboard";
import StudentDashboard from "./dashboard/student/StudentDashboard";
import TeacherCourses from "./dashboard/teacher/TeacherCourses";
import MyCourses from "./dashboard/MyCourses";
import EditProfile from "./dashboard/EditProfile";
import Wishlist from "./components/wishlist";

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<Courses />} />

        {/* WISHLIST */}
        <Route path="/wishlist" element={<Wishlist />} />

        {/* TEACHER */}
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher-courses" element={<TeacherCourses />} />
        <Route path="/my-courses" element={<TeacherCourses />} />

        {/* STUDENT */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/edit-profile" element={<EditProfile />} />

      </Routes>
    </Router>
  );
}

export default App;