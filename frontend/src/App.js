import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./home/home";
import Login from "./login/login";
import Signup from "./login/signup";
import Courses from "./courses/courses";
import AddCourse from "./dashboard/teacher/AddCourse";
import TeacherDashboard from "./dashboard/teacher/TeacherDashboard";
import StudentDashboard from "./dashboard/student/StudentDashboard";
import TeacherCourses from "./dashboard/teacher/TeacherCourses";
import EditProfile from "./dashboard/EditProfile";
import Wishlist from "./components/wishlist";
import CourseDetail from "./courses/CourseDetail";
import ForgotPassword from "./login/forgotpassword";
import ResetPassword from "./login/resetpassword";
import Navbar from "./components/Navbar"; // ✅ Navbar import

// ✅ Navbar कोणत्या pages वर नको
const NO_NAVBAR_ROUTES = ["/login", "/signup", "/forgot-password"];

const AppLayout = () => {
  const location = useLocation();
  const hideNavbar =
    NO_NAVBAR_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher-courses" element={<TeacherCourses />} />
        <Route path="/my-courses" element={<TeacherCourses />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;