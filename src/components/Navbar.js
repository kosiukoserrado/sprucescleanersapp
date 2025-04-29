import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Get first letter of user's name for avatar
  const getInitial = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Spruces
        </Link>

        <button className="navbar-mobile-toggle" onClick={toggleMenu}>
          ☰
        </button>

        {currentUser ? (
          <>
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              <NavLink to="/dashboard" className="navbar-link">
                Dashboard
              </NavLink>
              <NavLink to="/jobs" className="navbar-link">
                Job Listings
              </NavLink>
              <NavLink to="/training" className="navbar-link">
                Training
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="navbar-link">
                  Admin
                </NavLink>
              )}
            </div>

            <div className={`navbar-auth ${menuOpen ? 'open' : ''}`}>
              <div className="navbar-user">
                <div className="navbar-user-avatar">
                  {getInitial()}
                </div>
                <span className="navbar-user-name">
                  {currentUser.displayName || currentUser.email}
                </span>

                <div className="navbar-dropdown">
                  <Link to="/profile" className="navbar-dropdown-item">
                    My Profile
                  </Link>
                  <Link to="/applications" className="navbar-dropdown-item">
                    My Applications
                  </Link>
                  <Link to="/progress" className="navbar-dropdown-item">
                    Course Progress
                  </Link>
                  <div className="navbar-dropdown-divider"></div>
                  <button 
                    onClick={handleLogout} 
                    className="navbar-dropdown-item logout"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              <NavLink to="/about" className="navbar-link">
                About Us
              </NavLink>
            </div>

            <div className={`navbar-auth ${menuOpen ? 'open' : ''}`}>
              <Link to="/login" className="navbar-button">
                Login
              </Link>
              <Link to="/register" className="navbar-button">
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
