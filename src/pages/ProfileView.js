import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfileById } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/ProfileView.css';

const ProfileView = () => {
  const { id } = useParams();
  const { currentUser, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const result = await getUserProfileById(id);
        
        if (result.success) {
          setProfile(result.profile);
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        setError('Error loading profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-view-container">
        <div className="error-message">
          {error || 'Profile not found'}
          <Link to="/dashboard" className="back-link">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Check if current user is authorized to view this profile
  const isAuthorized = isAdmin || currentUser.uid === id;
  
  if (!isAuthorized) {
    return (
      <div className="profile-view-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this profile.</p>
          <Link to="/dashboard" className="back-link">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view-container">
      <div className="profile-header">
        <h1>Cleaner Profile</h1>
        {isAdmin && (
          <div className="admin-actions">
            <span className={`status-badge ${profile.status || 'pending'}`}>
              {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Pending'}
            </span>
            <Link to={`/admin/cleaners/${id}/edit`} className="edit-button">
              Edit Profile
            </Link>
          </div>
        )}
      </div>
      
      <div className="profile-card">
        <div className="profile-section personal-info">
          <h2>Personal Information</h2>
          
          <div className="profile-details">
            <div className="profile-avatar">
              {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{profile.displayName || 'Not provided'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profile.email || 'Not provided'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{profile.phone || 'Not provided'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">
                  {profile.address ? (
                    <>
                      {profile.address}<br />
                      {profile.city}, {profile.state} {profile.postcode}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">{formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-section business-info">
          <h2>Business Information</h2>
          
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">ABN</span>
              <span className="info-value">{profile.abn || 'Not provided'}</span>
            </div>
            
            {isAdmin && (
              <>
                <div className="info-item">
                  <span className="info-label">Bank Name</span>
                  <span className="info-value">{profile.bankName || 'Not provided'}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">BSB</span>
                  <span className="info-value">{profile.bsb || 'Not provided'}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Account Number</span>
                  <span className="info-value">{profile.accountNumber || 'Not provided'}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="profile-section credentials">
          <h2>Credentials</h2>
          
          <div className="credentials-grid">
            <div className="credential-card">
              <div className="credential-header">
                <h3>Driver License</h3>
                <span className={`credential-status ${profile.driverLicense ? 'verified' : 'missing'}`}>
                  {profile.driverLicense ? 'Verified' : 'Not Provided'}
                </span>
              </div>
              
              {profile.driverLicense && (
                <div className="credential-details">
                  <div className="info-item">
                    <span className="info-label">License Number</span>
                    <span className="info-value">{profile.driverLicenseNumber}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Expiry Date</span>
                    <span className="info-value">{formatDate(profile.driverLicenseExpiry)}</span>
                  </div>
                  
                  {profile.driverLicenseFileURL && isAdmin && (
                    <div className="info-item">
                      <span className="info-label">Document</span>
                      <a href={profile.driverLicenseFileURL} target="_blank" rel="noopener noreferrer" className="document-link">
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="credential-card">
              <div className="credential-header">
                <h3>White Card</h3>
                <span className={`credential-status ${profile.whiteCard ? 'verified' : 'missing'}`}>
                  {profile.whiteCard ? 'Verified' : 'Not Provided'}
                </span>
              </div>
              
              {profile.whiteCard && (
                <div className="credential-details">
                  <div className="info-item">
                    <span className="info-label">Card Number</span>
                    <span className="info-value">{profile.whiteCardNumber}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Expiry Date</span>
                    <span className="info-value">{formatDate(profile.whiteCardExpiry)}</span>
                  </div>
                  
                  {profile.whiteCardFileURL && isAdmin && (
                    <div className="info-item">
                      <span className="info-label">Document</span>
                      <a href={profile.whiteCardFileURL} target="_blank" rel="noopener noreferrer" className="document-link">
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="credential-card">
              <div className="credential-header">
                <h3>Blue Card</h3>
                <span className={`credential-status ${profile.blueCard ? 'verified' : 'missing'}`}>
                  {profile.blueCard ? 'Verified' : 'Not Provided'}
                </span>
              </div>
              
              {profile.blueCard && (
                <div className="credential-details">
                  <div className="info-item">
                    <span className="info-label">Card Number</span>
                    <span className="info-value">{profile.blueCardNumber}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Expiry Date</span>
                    <span className="info-value">{formatDate(profile.blueCardExpiry)}</span>
                  </div>
                  
                  {profile.blueCardFileURL && isAdmin && (
                    <div className="info-item">
                      <span className="info-label">Document</span>
                      <a href={profile.blueCardFileURL} target="_blank" rel="noopener noreferrer" className="document-link">
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-section experience">
          <h2>Experience & Skills</h2>
          
          <div className="bio-section">
            <h3>About</h3>
            <p>{profile.bio || 'No information provided.'}</p>
          </div>
          
          <div className="bio-section">
            <h3>Cleaning Experience</h3>
            <p>{profile.experience || 'No information provided.'}</p>
          </div>
          
          <div className="skills-section">
            <h3>Skills & Specialties</h3>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="skills-list">
                {profile.skills.map(skill => (
                  <span key={skill} className="skill-badge">{skill}</span>
                ))}
              </div>
            ) : (
              <p>No skills listed.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="profile-actions">
        <Link to="/dashboard" className="back-button">
          Back to Dashboard
        </Link>
        
        {currentUser.uid === id && (
          <Link to="/profile" className="edit-button">
            Edit Profile
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
