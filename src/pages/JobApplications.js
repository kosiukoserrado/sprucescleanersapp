import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserApplications } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/JobApplications.css';

const JobApplications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const result = await getUserApplications(currentUser.uid);
        
        if (result.success) {
          setApplications(result.applications);
        } else {
          setError('Failed to fetch your applications');
        }
      } catch (err) {
        setError('Error fetching applications: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class based on application status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="job-applications-container">
      <h1>My Job Applications</h1>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : applications.length === 0 ? (
        <div className="no-applications-message">
          <p>You haven't applied for any jobs yet.</p>
          <button 
            className="browse-jobs-button" 
            onClick={() => navigate('/jobs')}
          >
            Browse Available Jobs
          </button>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <h3>{application.jobTitle || 'Job Application'}</h3>
                <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
              
              <div className="application-details">
                <div className="application-detail">
                  <span className="detail-label">Applied On:</span>
                  <span className="detail-value">{formatDate(application.appliedAt)}</span>
                </div>
                
                {application.message && (
                  <div className="application-detail">
                    <span className="detail-label">Your Message:</span>
                    <span className="detail-value message">{application.message}</span>
                  </div>
                )}
                
                {application.adminNotes && (
                  <div className="application-detail">
                    <span className="detail-label">Admin Notes:</span>
                    <span className="detail-value admin-notes">{application.adminNotes}</span>
                  </div>
                )}
              </div>
              
              <div className="application-actions">
                <button 
                  className="view-job-button" 
                  onClick={() => navigate(`/jobs/${application.jobId}`)}
                >
                  View Job Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;
