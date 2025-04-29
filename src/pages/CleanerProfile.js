import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { updateUserProfile, getUserProfile } from '../firebase/firestore';
import { uploadFile } from '../firebase/storage';
import '../styles/CleanerProfile.css';

const CleanerProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({
    displayName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    abn: '',
    bankName: '',
    bsb: '',
    accountNumber: '',
    driverLicense: false,
    driverLicenseNumber: '',
    driverLicenseExpiry: '',
    driverLicenseFile: null,
    whiteCard: false,
    whiteCardNumber: '',
    whiteCardExpiry: '',
    whiteCardFile: null,
    blueCard: false,
    blueCardNumber: '',
    blueCardExpiry: '',
    blueCardFile: null,
    bio: '',
    experience: '',
    skills: []
  });
  
  // Skills options
  const skillOptions = [
    'Post Construction Cleaning',
    'Office Cleaning',
    'Childcare Cleaning',
    'School Cleaning',
    'Customer Service',
    'Window Cleaning',
    'Carpet Cleaning',
    'Floor Polishing',
    'Pressure Washing',
    'Sanitization'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const result = await getUserProfile(currentUser.uid);
        
        if (result.success) {
          // Merge default profile with fetched data
          setProfile(prevProfile => ({
            ...prevProfile,
            ...result.profile,
            // Don't overwrite file fields
            driverLicenseFile: null,
            whiteCardFile: null,
            blueCardFile: null
          }));
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
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setProfile({ ...profile, [name]: checked });
    } else if (type === 'file') {
      setProfile({ ...profile, [name]: files[0] });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };
  
  const handleSkillChange = (skill) => {
    const updatedSkills = [...profile.skills];
    
    if (updatedSkills.includes(skill)) {
      // Remove skill if already selected
      const index = updatedSkills.indexOf(skill);
      updatedSkills.splice(index, 1);
    } else {
      // Add skill if not already selected
      updatedSkills.push(skill);
    }
    
    setProfile({ ...profile, skills: updatedSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setSaving(true);
      setMessage('');
      setError('');
      
      // Create a copy of profile data for submission
      const profileData = { ...profile };
      
      // Handle file uploads if files are selected
      if (profile.driverLicenseFile) {
        const uploadResult = await uploadFile(
          `users/${currentUser.uid}/documents/driver-license`,
          profile.driverLicenseFile
        );
        
        if (uploadResult.success) {
          profileData.driverLicenseFileURL = uploadResult.downloadURL;
        } else {
          throw new Error('Failed to upload driver license file');
        }
      }
      
      if (profile.whiteCardFile) {
        const uploadResult = await uploadFile(
          `users/${currentUser.uid}/documents/white-card`,
          profile.whiteCardFile
        );
        
        if (uploadResult.success) {
          profileData.whiteCardFileURL = uploadResult.downloadURL;
        } else {
          throw new Error('Failed to upload white card file');
        }
      }
      
      if (profile.blueCardFile) {
        const uploadResult = await uploadFile(
          `users/${currentUser.uid}/documents/blue-card`,
          profile.blueCardFile
        );
        
        if (uploadResult.success) {
          profileData.blueCardFileURL = uploadResult.downloadURL;
        } else {
          throw new Error('Failed to upload blue card file');
        }
      }
      
      // Remove file objects before saving to Firestore
      delete profileData.driverLicenseFile;
      delete profileData.whiteCardFile;
      delete profileData.blueCardFile;
      
      // Update profile in Firestore
      const result = await updateUserProfile(currentUser.uid, profileData);
      
      if (result.success) {
        setMessage('Profile updated successfully');
        window.scrollTo(0, 0);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="cleaner-profile-container">
      <div className="profile-header">
        <h1>Your Cleaner Profile</h1>
        <p>Complete your profile to apply for cleaning jobs</p>
      </div>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Personal Information</h2>
          
          <div className="form-group">
            <label htmlFor="displayName">Full Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profile.displayName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={profile.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                <option value="ACT">Australian Capital Territory</option>
                <option value="NSW">New South Wales</option>
                <option value="NT">Northern Territory</option>
                <option value="QLD">Queensland</option>
                <option value="SA">South Australia</option>
                <option value="TAS">Tasmania</option>
                <option value="VIC">Victoria</option>
                <option value="WA">Western Australia</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="postcode">Postcode</label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                value={profile.postcode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Business Information</h2>
          
          <div className="form-group">
            <label htmlFor="abn">ABN (Australian Business Number)</label>
            <input
              type="text"
              id="abn"
              name="abn"
              value={profile.abn}
              onChange={handleChange}
              required
            />
            <small>Required for all cleaning contractors</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="bankName">Bank Name</label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={profile.bankName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bsb">BSB</label>
              <input
                type="text"
                id="bsb"
                name="bsb"
                value={profile.bsb}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="accountNumber">Account Number</label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={profile.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Credentials</h2>
          
          <div className="credential-section">
            <div className="credential-header">
              <div className="credential-checkbox">
                <input
                  type="checkbox"
                  id="driverLicense"
                  name="driverLicense"
                  checked={profile.driverLicense}
                  onChange={handleChange}
                />
                <label htmlFor="driverLicense">Driver License</label>
              </div>
              <small>Required for most cleaning positions</small>
            </div>
            
            {profile.driverLicense && (
              <div className="credential-details">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="driverLicenseNumber">License Number</label>
                    <input
                      type="text"
                      id="driverLicenseNumber"
                      name="driverLicenseNumber"
                      value={profile.driverLicenseNumber}
                      onChange={handleChange}
                      required={profile.driverLicense}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="driverLicenseExpiry">Expiry Date</label>
                    <input
                      type="date"
                      id="driverLicenseExpiry"
                      name="driverLicenseExpiry"
                      value={profile.driverLicenseExpiry}
                      onChange={handleChange}
                      required={profile.driverLicense}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="driverLicenseFile">Upload License (Front and Back)</label>
                  <input
                    type="file"
                    id="driverLicenseFile"
                    name="driverLicenseFile"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                  />
                  <small>PDF or image files only (max 5MB)</small>
                </div>
                
                {profile.driverLicenseFileURL && (
                  <div className="uploaded-file">
                    <span>Current file: </span>
                    <a href={profile.driverLicenseFileURL} target="_blank" rel="noopener noreferrer">
                      View uploaded license
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="credential-section">
            <div className="credential-header">
              <div className="credential-checkbox">
                <input
                  type="checkbox"
                  id="whiteCard"
                  name="whiteCard"
                  checked={profile.whiteCard}
                  onChange={handleChange}
                />
                <label htmlFor="whiteCard">White Card (Construction Induction)</label>
              </div>
              <small>Required for post-construction cleaning</small>
            </div>
            
            {profile.whiteCard && (
              <div className="credential-details">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="whiteCardNumber">Card Number</label>
                    <input
                      type="text"
                      id="whiteCardNumber"
                      name="whiteCardNumber"
                      value={profile.whiteCardNumber}
                      onChange={handleChange}
                      required={profile.whiteCard}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="whiteCardExpiry">Expiry Date</label>
                    <input
                      type="date"
                      id="whiteCardExpiry"
                      name="whiteCardExpiry"
                      value={profile.whiteCardExpiry}
                      onChange={handleChange}
                      required={profile.whiteCard}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="whiteCardFile">Upload White Card</label>
                  <input
                    type="file"
                    id="whiteCardFile"
                    name="whiteCardFile"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                  />
                  <small>PDF or image files only (max 5MB)</small>
                </div>
                
                {profile.whiteCardFileURL && (
                  <div className="uploaded-file">
                    <span>Current file: </span>
                    <a href={profile.whiteCardFileURL} target="_blank" rel="noopener noreferrer">
                      View uploaded white card
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="credential-section">
            <div className="credential-header">
              <div className="credential-checkbox">
                <input
                  type="checkbox"
                  id="blueCard"
                  name="blueCard"
                  checked={profile.blueCard}
                  onChange={handleChange}
                />
                <label htmlFor="blueCard">Blue Card (Working with Children)</label>
              </div>
              <small>Required for childcare and school cleaning</small>
            </div>
            
            {profile.blueCard && (
              <div className="credential-details">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="blueCardNumber">Card Number</label>
                    <input
                      type="text"
                      id="blueCardNumber"
                      name="blueCardNumber"
                      value={profile.blueCardNumber}
                      onChange={handleChange}
                      required={profile.blueCard}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="blueCardExpiry">Expiry Date</label>
                    <input
                      type="date"
                      id="blueCardExpiry"
                      name="blueCardExpiry"
                      value={profile.blueCardExpiry}
                      onChange={handleChange}
                      required={profile.blueCard}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="blueCardFile">Upload Blue Card</label>
                  <input
                    type="file"
                    id="blueCardFile"
                    name="blueCardFile"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                  />
                  <small>PDF or image files only (max 5MB)</small>
                </div>
                
                {profile.blueCardFileURL && (
                  <div className="uploaded-file">
                    <span>Current file: </span>
                    <a href={profile.blueCardFileURL} target="_blank" rel="noopener noreferrer">
                      View uploaded blue card
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h2>Experience & Skills</h2>
          
          <div className="form-group">
            <label htmlFor="bio">About You</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us a bit about yourself..."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="experience">Cleaning Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={profile.experience}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your cleaning experience..."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Skills & Specialties</label>
            <div className="skills-grid">
              {skillOptions.map(skill => (
                <div key={skill} className="skill-checkbox">
                  <input
                    type="checkbox"
                    id={`skill-${skill}`}
                    checked={profile.skills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                  />
                  <label htmlFor={`skill-${skill}`}>{skill}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CleanerProfile;
