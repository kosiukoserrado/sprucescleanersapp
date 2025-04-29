import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, getJobs, getCourses } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalCleaners: 0,
    totalJobs: 0,
    openJobs: 0,
    totalCourses: 0,
    recentApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser || !isAdmin) return;
      
      try {
        setLoading(true);
        
        // Fetch users
        const usersResult = await getAllUsers();
        
        // Fetch jobs
        const jobsResult = await getJobs();
        
        // Fetch courses
        const coursesResult = await getCourses();
        
        if (usersResult.success && jobsResult.success && coursesResult.success) {
          // Calculate stats
          const cleaners = usersResult.users.filter(user => user.role === 'cleaner');
          const openJobs = jobsResult.jobs.filter(job => job.status === 'open');
          
          setStats({
            totalCleaners: cleaners.length,
            totalJobs: jobsResult.jobs.length,
            openJobs: openJobs.length,
            totalCourses: coursesResult.courses.length,
            recentApplications: 0 // This would require additional API call
          });
        } else {
          setError('Failed to fetch admin data');
        }
      } catch (err) {
        setError('Error fetching admin data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin dashboard.</p>
          <Link to="/dashboard" className="back-link">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Cleaners</h3>
              <div className="stat-value">{stats.totalCleaners}</div>
              <Link to="/admin/cleaners" className="stat-link">View All Cleaners</Link>
            </div>
            
            <div className="stat-card">
              <h3>Total Jobs</h3>
              <div className="stat-value">{stats.totalJobs}</div>
              <Link to="/admin/jobs" className="stat-link">Manage Jobs</Link>
            </div>
            
            <div className="stat-card">
              <h3>Open Jobs</h3>
              <div className="stat-value">{stats.openJobs}</div>
              <Link to="/admin/jobs" className="stat-link">View Open Jobs</Link>
            </div>
            
            <div className="stat-card">
              <h3>Training Courses</h3>
              <div className="stat-value">{stats.totalCourses}</div>
              <Link to="/admin/courses" className="stat-link">Manage Courses</Link>
            </div>
          </div>
          
          <div className="admin-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/admin/jobs/new" className="action-button create-job">
                Create New Job
              </Link>
              <Link to="/admin/courses/new" className="action-button create-course">
                Create New Course
              </Link>
              <Link to="/admin/applications" className="action-button view-applications">
                Review Applications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
