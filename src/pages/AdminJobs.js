import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, createJob, updateJob } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/AdminJobs.css';

const AdminJobs = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // New/Edit job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    project: '',
    description: '',
    location: '',
    category: '',
    startDate: '',
    endDate: '',
    payRate: '',
    hoursPerDay: '',
    cleanersNeeded: '',
    status: 'open'
  });

  // Categories for job form
  const categories = [
    'Post Construction',
    'Office',
    'Childcare',
    'School',
    'Residential',
    'Commercial'
  ];

  // Locations for job form
  const locations = [
    'Brisbane',
    'Gold Coast',
    'Sunshine Coast',
    'Sydney',
    'Melbourne',
    'Perth'
  ];

  // Job statuses
  const statuses = ['open', 'filled', 'completed', 'cancelled'];

  useEffect(() => {
    const fetchJobs = async () => {
      if (!currentUser || !isAdmin) return;
      
      try {
        setLoading(true);
        const result = await getJobs();
        
        if (result.success) {
          setJobs(result.jobs);
        } else {
          setError('Failed to fetch jobs');
        }
      } catch (err) {
        setError('Error fetching jobs: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentUser, isAdmin]);

  // Filter jobs based on search term and status filter
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? job.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm({
      ...jobForm,
      [name]: value
    });
  };

  const resetForm = () => {
    setJobForm({
      title: '',
      project: '',
      description: '',
      location: '',
      category: '',
      startDate: '',
      endDate: '',
      payRate: '',
      hoursPerDay: '',
      cleanersNeeded: '',
      status: 'open'
    });
  };

  const handleEditJob = (job) => {
    // Format dates for form input
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setJobForm({
      title: job.title,
      project: job.project,
      description: job.description,
      location: job.location,
      category: job.category,
      startDate: formatDateForInput(job.startDate),
      endDate: formatDateForInput(job.endDate),
      payRate: job.payRate,
      hoursPerDay: job.hoursPerDay,
      cleanersNeeded: job.cleanersNeeded,
      status: job.status
    });
    
    setEditingJobId(job.id);
    setShowNewJobForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!jobForm.title || !jobForm.project || !jobForm.location || 
        !jobForm.category || !jobForm.startDate || !jobForm.endDate || 
        !jobForm.payRate || !jobForm.hoursPerDay || !jobForm.cleanersNeeded) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert string values to appropriate types
      const jobData = {
        ...jobForm,
        payRate: parseFloat(jobForm.payRate),
        hoursPerDay: parseFloat(jobForm.hoursPerDay),
        cleanersNeeded: parseInt(jobForm.cleanersNeeded, 10)
      };
      
      let result;
      
      if (editingJobId) {
        // Update existing job
        result = await updateJob(editingJobId, jobData);
      } else {
        // Create new job
        result = await createJob(jobData);
      }
      
      if (result.success) {
        // Refresh job list
        const jobsResult = await getJobs();
        if (jobsResult.success) {
          setJobs(jobsResult.jobs);
        }
        
        // Reset form and state
        resetForm();
        setShowNewJobForm(false);
        setEditingJobId(null);
      } else {
        setError(result.error || 'Failed to save job');
      }
    } catch (err) {
      setError('Error saving job: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowNewJobForm(false);
    setEditingJobId(null);
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isAdmin) {
    return (
      <div className="admin-jobs-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin jobs page.</p>
          <Link to="/dashboard" className="back-link">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-jobs-container">
      <div className="admin-header">
        <h1>Manage Jobs</h1>
        <button 
          className="new-job-button"
          onClick={() => {
            resetForm();
            setShowNewJobForm(true);
            setEditingJobId(null);
          }}
        >
          Create New Job
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showNewJobForm ? (
        <div className="job-form-container">
          <h2>{editingJobId ? 'Edit Job' : 'Create New Job'}</h2>
          
          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Job Title*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={jobForm.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="project">Project Name*</label>
                <input
                  type="text"
                  id="project"
                  name="project"
                  value={jobForm.project}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={jobForm.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location*</label>
                <select
                  id="location"
                  name="location"
                  value={jobForm.location}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category*</label>
                <select
                  id="category"
                  name="category"
                  value={jobForm.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date*</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={jobForm.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date*</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={jobForm.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="payRate">Pay Rate ($ per cleaner)*</label>
                <input
                  type="number"
                  id="payRate"
                  name="payRate"
                  value={jobForm.payRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="hoursPerDay">Hours Per Day*</label>
                <input
                  type="number"
                  id="hoursPerDay"
                  name="hoursPerDay"
                  value={jobForm.hoursPerDay}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cleanersNeeded">Cleaners Needed*</label>
                <input
                  type="number"
                  id="cleanersNeeded"
                  name="cleanersNeeded"
                  value={jobForm.cleanersNeeded}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status*</label>
              <select
                id="status"
                name="status"
                value={jobForm.status}
                onChange={handleInputChange}
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Saving...' : (editingJobId ? 'Update Job' : 'Create Job')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="jobs-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="filter-options">
              <div className="filter-group">
                <label htmlFor="status-filter">Status:</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <button className="clear-filters-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="no-jobs-message">
              <p>No jobs found matching your criteria.</p>
              <button className="clear-filters-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="jobs-table-container">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Location</th>
                    <th>Dates</th>
                    <th>Cleaners</th>
                    <th>Pay Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.project}</td>
                      <td>{job.location}</td>
                      <td>
                        {formatDate(job.startDate)} - {formatDate(job.endDate)}
                      </td>
                      <td>{job.cleanersNeeded}</td>
                      <td>${job.payRate}</td>
                      <td>
                        <span className={`status-badge ${job.status}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditJob(job)}
                          >
                            Edit
                          </button>
                          <button 
                            className="view-button"
                            onClick={() => navigate(`/admin/jobs/${job.id}/applications`)}
                          >
                            Applications
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminJobs;
