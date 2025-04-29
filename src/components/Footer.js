import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Spruces</h3>
          <p className="footer-description">
            Connecting professional cleaners with quality jobs across Australia.
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/jobs">Job Listings</a></li>
            <li><a href="/training">Training Courses</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Training Categories</h4>
          <ul className="footer-links">
            <li><a href="/training?category=Post Construction Cleaning">Post Construction</a></li>
            <li><a href="/training?category=Office Cleaning">Office</a></li>
            <li><a href="/training?category=Childcare Cleaning">Childcare</a></li>
            <li><a href="/training?category=School Cleaning">School</a></li>
            <li><a href="/training?category=Customer Service Cleaning">Customer Service</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Contact Us</h4>
          <address className="footer-contact">
            <p>Brisbane, Australia</p>
            <p>Email: info@spruces.com.au</p>
            <p>Phone: (07) 1234 5678</p>
          </address>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Spruces Cleaning Services. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
