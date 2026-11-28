import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

import Landing from "./pages/Landing";

// Admin Pages
import AdminSetup from "./pages/admin/AdminSetup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminProfile from "./pages/admin/AdminProfile";

// Teacher Pages
import TeacherLogin from "./pages/teacher/TeacherLogin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherCourseDetails from "./pages/teacher/TeacherCourseDetails";
import TakeAttendance from "./pages/teacher/TakeAttendance";
import TeacherReports from "./pages/teacher/TeacherReports";

// Student Pages
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";

import "./styles/dark-theme.css";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Admin Routes */}
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="courses" replace />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/course/:code" element={<TeacherCourseDetails />} />
          <Route path="/teacher/course/:code/attendance" element={<TakeAttendance />} />
          <Route path="/teacher/course/:code/reports" element={<TeacherReports />} />

          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}