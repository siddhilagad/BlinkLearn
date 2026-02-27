import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./home/home";
import Courses from "./courses/courses";
import Login from "./login/login";
import Signup from "./login/signup";
import TeacherDashboard from "./dashbord/TeacherDashboard";
import StudentDashboard from "./dashbord/StudentDashboard";
import ProtectedRoute from "./dashbord/ProtectedRoute";


function App() {
  return (

  
  <Router>
      {<Navbar />}

=======
  
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute role="tutor">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;





