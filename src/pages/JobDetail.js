import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, applyForJob } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const result = await getJobById(id);
        
        if (result.success) {
          setJob(result.job);
        } else {
          setError('Failed to fetch job details');
        }
      } catch (err) {
        setError('Error fetching job details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    try {
      setApplying(true);
      setApplicationError('');
      
      const result = await applyForJob(currentUser.uid, id, {
        message: applicationMessage
      });
      
      if (result.success) {
        setApplicationSuccess(true);
        setApplicationMessage('');
      } else {
        setApplicationError(result.error || 'Failed to apply for job');
      }
    } catch (err) {
      setApplicationError('Error applying for job: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  const handleBackToJobs = () => {
    navigate('/jobs');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-detail-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={handleBackToJobs}>
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-container">
        <div className="error-message">Job not found</div>
        <button className="back-button" onClick={handleBackToJobs}>
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      <button className="back-button" onClick={handleBackToJobs}>
        Back to Jobs
      </button>
      
      <div className="job-detail-card">
        <div className="job-detail-header">
          <h1>{job.title}</h1>
          <span className={`job-status ${job.status}`}>{job.status}</span>
        </div>
        
        <div className="job-detail-section">
          <h2>Job Details</h2>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Project:</span>
              <span className="detail-value">{job.project}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{job.category}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{job.location}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Start Date:</span>
              <span className="detail-value">{formatDate(job.startDate)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">End Date:</span>
              <span className="detail-value">{formatDate(job.endDate)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Cleaners Needed:</span>
              <span className="detail-value">{job.cleanersNeeded}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Pay Rate:</span>
              <span className="detail-value">${job.payRate} per cleaner</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Hours Per Day:</span>
              <span className="detail-value">{job.hoursPerDay} hours</span>
            </div>
          </div>
        </div>
        
        <div className="job-detail-section">
          <h2>Description</h2>
          <p className="job-description">{job.description}</p>
        </div>
        
        {job.status === 'open' && !applicationSuccess && (
          <div className="job-application-section">
            <h2>Apply for this Job</h2>
            
            {applicationError && (
              <div className="error-message">{applicationError}</div>
            )}
            
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label htmlFor="application-message">Message (Optional):</label>
                <textarea
                  id="application-message"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell us why you're interested in this job..."
                  rows={4}
                />
              </div>
              
              <button 
                type="submit" 
                className="apply-button" 
                disabled={applying}
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </button>
            </form>
          </div>
        )}
        
        {applicationSuccess && (
          <div className="application-success">
            <h2>Application Submitted!</h2>
            <p>Your application has been successfully submitted. You can check the status of your application in your dashboard.</p>
            <button 
              className="view-applications-button" 
              onClick={() => navigate('/applications')}
            >
              View My Applications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
