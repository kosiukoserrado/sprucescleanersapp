import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, updateUserRole } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/AdminCleaners.css';

const AdminCleaners = () => {
  const { currentUser, isAdmin } = useAuth();
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);

  useEffect(() => {
    const fetchCleaners = async () => {
      if (!currentUser || !isAdmin) return;
      
      try {
        setLoading(true);
        const result = await getAllUsers();
        
        if (result.success) {
          // Filter to only show users with role 'cleaner' or no role (which defaults to cleaner)
          const cleanerUsers = result.users.filter(user => 
            user.role === 'cleaner' || !user.role
          );
          setCleaners(cleanerUsers);
        } else {
          setError('Failed to fetch cleaners');
        }
      } catch (err) {
        setError('Error fetching cleaners: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCleaners();
  }, [currentUser, isAdmin]);

  // Filter cleaners based on search term and status filter
  const filteredCleaners = cleaners.filter(cleaner => {
    const matchesSearch = 
      (cleaner.displayName && cleaner.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cleaner.email && cleaner.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter ? cleaner.status === statusFilter : true;
    
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

  const handleUpdateRole = async (userId, newRole) => {
    if (!currentUser || !isAdmin) return;
    
    try {
      setUpdatingUser(userId);
      const result = await updateUserRole(userId, newRole);
      
      if (result.success) {
        // Update the local state to reflect the change
        setCleaners(prevCleaners => 
          prevCleaners.map(cleaner => 
            cleaner.id === userId 
              ? { ...cleaner, role: newRole } 
              : cleaner
          )
        );
      } else {
        setError(`Failed to update user role: ${result.error}`);
      }
    } catch (err) {
      setError(`Error updating user role: ${err.message}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isAdmin) {
    return (
      <div className="admin-cleaners-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin cleaners page.</p>
          <Link to="/dashboard" className="back-link">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-cleaners-container">
      <div className="admin-header">
        <h1>Manage Cleaners</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="cleaners-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search cleaners..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
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
          <p>Loading cleaners...</p>
        </div>
      ) : filteredCleaners.length === 0 ? (
        <div className="no-cleaners-message">
          <p>No cleaners found matching your criteria.</p>
          <button className="clear-filters-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="cleaners-table-container">
          <table className="cleaners-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Credentials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCleaners.map(cleaner => (
                <tr key={cleaner.id}>
                  <td>{cleaner.displayName || 'No Name'}</td>
                  <td>{cleaner.email}</td>
                  <td>{formatDate(cleaner.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${cleaner.status || 'pending'}`}>
                      {cleaner.status ? cleaner.status.charAt(0).toUpperCase() + cleaner.status.slice(1) : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="credentials-icons">
                      {cleaner.abn && <span className="credential-icon abn" title="ABN Verified">ABN</span>}
                      {cleaner.driverLicense && <span className="credential-icon license" title="Driver License Verified">DL</span>}
                      {cleaner.whiteCard && <span className="credential-icon white-card" title="White Card Verified">WC</span>}
                      {cleaner.blueCard && <span className="credential-icon blue-card" title="Blue Card Verified">BC</span>}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/admin/cleaners/${cleaner.id}`} 
                        className="view-button"
                      >
                        View Profile
                      </Link>
                      
                      <div className="role-dropdown">
                        <select
                          value={cleaner.role || 'cleaner'}
                          onChange={(e) => handleUpdateRole(cleaner.id, e.target.value)}
                          disabled={updatingUser === cleaner.id}
                        >
                          <option value="cleaner">Cleaner</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCleaners;
