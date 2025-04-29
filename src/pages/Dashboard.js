import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { getRecentJobs, getUserApplications, getUserCourseProgress } from '../firebase/firestore';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [recentJobs, setRecentJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch recent jobs
        const jobsResult = await getRecentJobs(5);
        if (jobsResult.success) {
          setRecentJobs(jobsResult.jobs);
        }
        
        // Fetch user applications
        const applicationsResult = await getUserApplications(currentUser.uid);
        if (applicationsResult.success) {
          setApplications(applicationsResult.applications);
        }
        
        // Fetch course progress
        const progressResult = await getUserCourseProgress(currentUser.uid);
        if (progressResult.success) {
          setCourseProgress(progressResult.progress);
        }
      } catch (err) {
        setError('Error loading dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate course completion percentage
  const calculateCompletion = (progress) => {
    if (!progress || !progress.completedSections || !progress.totalSections) {
      return 0;
    }
    return Math.round((progress.completedSections / progress.totalSections) * 100);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {userProfile?.displayName || currentUser.email}</h1>
        <p className="dashboard-subtitle">Your cleaning services dashboard</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-grid">
        <div className="dashboard-card profile-summary">
          <div className="card-header">
            <h2>Profile Summary</h2>
            <Link to="/profile" className="card-action">Edit Profile</Link>
          </div>
          
          <div className="profile-details">
            <div className="profile-avatar">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="profile-info">
              <h3>{userProfile?.displayName || 'Update your profile'}</h3>
              <p>{currentUser.email}</p>
              <p className="profile-status">
                Status: <span className={`status-badge ${userProfile?.status || 'pending'}`}>
                  {userProfile?.status ? userProfile.status.charAt(0).toUpperCase() + userProfile.status.slice(1) : 'Pending'}
                </span>
              </p>
              
              <div className="profile-credentials">
                {userProfile?.abn && <span className="credential-badge">ABN Verified</span>}
                {userProfile?.driverLicense && <span className="credential-badge">Driver License</span>}
                {userProfile?.whiteCard && <span className="credential-badge">White Card</span>}
                {userProfile?.blueCard && <span className="credential-badge">Blue Card</span>}
              </div>
            </div>
          </div>
          
          {(!userProfile?.abn || !userProfile?.driverLicense) && (
            <div className="profile-alert">
              <p>Complete your profile to apply for jobs</p>
              <Link to="/profile" className="button">Update Profile</Link>
            </div>
          )}
        </div>
        
        <div className="dashboard-card recent-jobs">
          <div className="card-header">
            <h2>Recent Job Listings</h2>
            <Link to="/jobs" className="card-action">View All</Link>
          </div>
          
          {recentJobs.length === 0 ? (
            <p className="no-data-message">No job listings available at the moment.</p>
          ) : (
            <div className="jobs-list">
              {recentJobs.map(job => (
                <div key={job.id} className="job-item">
                  <div className="job-details">
                    <h3>{job.title}</h3>
                    <p className="job-location">{job.location}</p>
                    <p className="job-date">{formatDate(job.startDate)} - {formatDate(job.endDate)}</p>
                  </div>
                  <div className="job-actions">
                    <span className={`status-badge ${job.status}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    <Link to={`/jobs/${job.id}`} className="view-job-button">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="dashboard-card applications">
          <div className="card-header">
            <h2>Your Applications</h2>
            <Link to="/applications" className="card-action">View All</Link>
          </div>
          
          {applications.length === 0 ? (
            <p className="no-data-message">You haven't applied to any jobs yet.</p>
          ) : (
            <div className="applications-list">
              {applications.slice(0, 3).map(application => (
                <div key={application.id} className="application-item">
                  <div className="application-details">
                    <h3>{application.jobTitle}</h3>
                    <p className="application-date">Applied: {formatDate(application.appliedAt)}</p>
                  </div>
                  <div className="application-status">
                    <span className={`status-badge ${application.status}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="dashboard-card training">
          <div className="card-header">
            <h2>Training Progress</h2>
            <Link to="/training" className="card-action">View Courses</Link>
          </div>
          
          {courseProgress.length === 0 ? (
            <div className="no-courses">
              <p className="no-data-message">You haven't started any training courses yet.</p>
              <Link to="/training" className="button">Browse Courses</Link>
            </div>
          ) : (
            <div className="courses-progress">
              {courseProgress.slice(0, 3).map(course => (
                <div key={course.id} className="course-progress-item">
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${calculateCompletion(course)}%` }}
                      ></div>
                    </div>
                    <p className="progress-text">{calculateCompletion(course)}% Complete</p>
                  </div>
                  <Link to={`/training/${course.courseId}`} className="continue-button">
                    Continue
                  </Link>
                </div>
              ))}
              
              <Link to="/progress" className="view-all-progress">
                View All Progress
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
