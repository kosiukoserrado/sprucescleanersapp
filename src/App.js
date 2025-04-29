import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoutes from './components/ProtectedRoutes';
import Layout from './components/Layout';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Protected pages
import Dashboard from './pages/Dashboard';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import JobApplications from './pages/JobApplications';
import TrainingCourses from './pages/TrainingCourses';
import CourseContent from './pages/CourseContent';
import CourseProgress from './pages/CourseProgress';
import CompletedCourses from './pages/CompletedCourses';
import CleanerProfile from './pages/CleanerProfile';
import ProfileView from './pages/ProfileView';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminJobs from './pages/AdminJobs';
import AdminCleaners from './pages/AdminCleaners';
import AdminCourses from './pages/AdminCourses';

// Styles
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<JobListings />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/applications" element={<JobApplications />} />
              <Route path="/training" element={<TrainingCourses />} />
              <Route path="/training/:id" element={<CourseContent />} />
              <Route path="/progress" element={<CourseProgress />} />
              <Route path="/completed-courses" element={<CompletedCourses />} />
              <Route path="/profile" element={<CleanerProfile />} />
              <Route path="/profile/:id" element={<ProfileView />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/cleaners" element={<AdminCleaners />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
