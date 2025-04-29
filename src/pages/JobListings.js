import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../firebase/firestore';
import JobCard from '../components/JobCard';
import '../styles/JobListings.css';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Categories for filtering
  const categories = [
    'Post Construction',
    'Office',
    'Childcare',
    'School',
    'Residential',
    'Commercial'
  ];

  // Locations for filtering
  const locations = [
    'Brisbane',
    'Gold Coast',
    'Sunshine Coast',
    'Sydney',
    'Melbourne',
    'Perth'
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const filters = {};
        
        if (categoryFilter) {
          filters.category = categoryFilter;
        }
        
        if (locationFilter) {
          filters.location = locationFilter;
        }
        
        const result = await getJobs(filters);
        
        if (result.success) {
          setJobs(result.jobs);
        } else {
          setError('Failed to fetch job listings');
        }
      } catch (err) {
        setError('Error fetching job listings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [categoryFilter, locationFilter]);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchTermLower) ||
      job.project.toLowerCase().includes(searchTermLower) ||
      job.location.toLowerCase().includes(searchTermLower) ||
      job.description.toLowerCase().includes(searchTermLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLocationFilter('');
  };

  return (
    <div className="job-listings-container">
      <h1>Available Jobs</h1>
      
      <div className="job-filters">
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
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="location-filter">Location:</label>
            <select
              id="location-filter"
              value={locationFilter}
              onChange={handleLocationChange}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
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
          <p>Loading job listings...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredJobs.length === 0 ? (
        <div className="no-jobs-message">
          <p>No jobs found matching your criteria.</p>
          <button className="clear-filters-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="job-card-link">
              <JobCard job={job} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListings;
