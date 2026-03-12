import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./home/home";
import Login from "./login/login";
import Signup from "./login/signup";
import Courses from "./courses/courses";

<<<<<<< HEAD
import TeacherDashboard from "./dashboard/TeacherDashboard";
import StudentDashboard from "./dashboard/StudentDashboard";
import MyCourses from "./dashboard/MyCourses";
import EditProfile from "./dashboard/EditProfile";
import Wishlist from "./components/wishlist";
=======
import AddCourse from "./dashbord/teacher/AddCourse";
import TeacherDashboard from "./dashbord/teacher/TeacherDashboard";
import StudentDashboard from "./dashbord/student/StudentDashboard";
import TeacherCourses from "./dashbord/teacher/TeacherCourses";
>>>>>>> 5e7b663c (my local changes before pulling)

function App() {
  return (
    <Router>

      <Routes>
<<<<<<< HEAD
        {/* MAIN ROUTES */}
=======

        {/* PUBLIC */}
>>>>>>> 5e7b663c (my local changes before pulling)
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<Courses />} />

<<<<<<< HEAD
        {/* WISHLIST */}
        <Route path="/wishlist" element={<Wishlist />} />

        {/* DASHBOARD ROUTES */}
=======
        {/* TEACHER */}
        <Route path="/add-course" element={<AddCourse />} />
>>>>>>> 5e7b663c (my local changes before pulling)
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher-courses" element={<TeacherCourses />} />
        <Route path="/my-courses" element={<TeacherCourses />} />


        {/* STUDENT */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
<<<<<<< HEAD
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/edit-profile" element={<EditProfile />} />
=======

>>>>>>> 5e7b663c (my local changes before pulling)
      </Routes>

    </Router>
  );
}

export default App;