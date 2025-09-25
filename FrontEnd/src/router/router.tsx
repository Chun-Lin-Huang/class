import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainPage from '../components/MainPage';
import StudentDashboard from '../components/StudentDashboard';
import AdminDashboard from '../components/AdminDashboard';
import StudentManagementPage from '../components/StudentManagementPage';
import CourseManagementPage from '../components/CourseManagementPage';
import AttendanceManagementPage from '../components/AttendanceManagementPage';
import AttendanceRecordsPage from '../components/AttendanceRecordsPage';

const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route 
        path="/attendance" 
        element={user?.role === 'admin' ? <AttendanceManagementPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/student-management" 
        element={user?.role === 'admin' ? <StudentManagementPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/student-management/:courseId" 
        element={user?.role === 'admin' ? <StudentManagementPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/course-management" 
        element={user?.role === 'admin' ? <CourseManagementPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/attendance-records" 
        element={<AttendanceRecordsPage />} 
      />
      <Route 
        path="/admin" 
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
      />
      <Route 
        path="/student" 
        element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/" />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
