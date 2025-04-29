import React from 'react';
import '../styles/JobCard.css';

const JobCard = ({ job }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        <span className={`job-status ${job.status}`}>{job.status}</span>
      </div>
      
      <div className="job-details">
        <div className="job-detail">
          <span className="detail-label">Project:</span>
          <span className="detail-value">{job.project}</span>
        </div>
        
        <div className="job-detail">
          <span className="detail-label">Dates:</span>
          <span className="detail-value">
            {formatDate(job.startDate)} - {formatDate(job.endDate)}
          </span>
        </div>
        
        <div className="job-detail">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{job.location}</span>
        </div>
        
        <div className="job-detail">
          <span className="detail-label">Category:</span>
          <span className="detail-value">{job.category}</span>
        </div>
      </div>
      
      <div className="job-metrics">
        <div className="job-metric">
          <span className="metric-value">{job.cleanersNeeded}</span>
          <span className="metric-label">Cleaners</span>
        </div>
        
        <div className="job-metric">
          <span className="metric-value">${job.payRate}</span>
          <span className="metric-label">Per Cleaner</span>
        </div>
        
        <div className="job-metric">
          <span className="metric-value">{job.hoursPerDay}</span>
          <span className="metric-label">Hours/Day</span>
        </div>
      </div>
      
      <div className="job-card-footer">
        <button className="view-details-button">View Details</button>
      </div>
    </div>
  );
};

export default JobCard;
