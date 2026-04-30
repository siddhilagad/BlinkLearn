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
import MyCourses from "./dashboard/MyCourses";
import EditProfile from "./dashboard/EditProfile";
import Wishlist from "./components/wishlist";
import CourseDetail from "./courses/CourseDetail";
import ForgotPassword from "./login/forgotpassword";
import ResetPassword from "./login/resetpassword";
import Navbar from "./components/Navbar";
import Chat from "./chat/Chat";
import CartPage from "./cart/CartPage";
import CheckoutPage from "./Payment/CheckoutPage";
import LearnPage from "./courses/Learnpage";


const NO_NAVBAR_ROUTES = ["/login", "/signup", "/forgot-password"];

// Routes where Navbar should be hidden
const NO_NAVBAR_PREFIXES = ["/reset-password", "/learn"];

const AppLayout = () => {
  const location = useLocation();

  const hideNavbar =
    NO_NAVBAR_ROUTES.includes(location.pathname) ||
    NO_NAVBAR_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

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
        <Route path="/my-learning" element={<MyCourses />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/:courseId" element={<CheckoutPage />} />
        <Route path="/learn/:courseId" element={<LearnPage />} />

        
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
