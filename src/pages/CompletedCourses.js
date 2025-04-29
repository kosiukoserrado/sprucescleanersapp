import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCourseProgress, getCourses } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/CompletedCourses.css';

const CompletedCourses = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get user's course progress
        const progressResult = await getUserCourseProgress(currentUser.uid);
        
        if (!progressResult.success) {
          setError('Failed to fetch your completed courses');
          return;
        }
        
        // Get all courses to match with progress
        const coursesResult = await getCourses();
        
        if (!coursesResult.success) {
          setError('Failed to fetch courses');
          return;
        }
        
        // Combine course data with progress data, only for completed courses
        const completedWithCourseDetails = progressResult.progress
          .filter(progress => progress.completed) // Only include completed courses
          .map(progress => {
            const courseDetails = coursesResult.courses.find(
              course => course.id === progress.courseId
            );
            
            return {
              ...progress,
              courseTitle: courseDetails?.title || 'Unknown Course',
              courseDescription: courseDetails?.description || '',
              courseCategory: courseDetails?.category || '',
              courseImageUrl: courseDetails?.imageUrl || ''
            };
          });
        
        setCompletedCourses(completedWithCourseDetails);
      } catch (err) {
        setError('Error fetching completed courses: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, [currentUser]);

  return (
    <div className="completed-courses-container">
      <h1>Completed Courses</h1>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your completed courses...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : completedCourses.length === 0 ? (
        <div className="no-completed-message">
          <p>You haven't completed any courses yet.</p>
          <button 
            className="browse-courses-button" 
            onClick={() => navigate('/training')}
          >
            Browse Training Courses
          </button>
        </div>
      ) : (
        <div className="completed-courses-list">
          {completedCourses.map(course => (
            <div key={course.id} className="completed-course-card">
              <div className="course-image">
                {course.courseImageUrl ? (
                  <img src={course.courseImageUrl} alt={course.courseTitle} />
                ) : (
                  <div className="placeholder-image">
                    <span>{course.courseTitle.charAt(0)}</span>
                  </div>
                )}
                <div className="course-category">{course.courseCategory}</div>
                <div className="completion-badge">Completed</div>
              </div>
              
              <div className="course-info">
                <h3>{course.courseTitle}</h3>
                <p className="course-description">{course.courseDescription}</p>
                
                <div className="completion-details">
                  <div className="completion-detail">
                    <span className="detail-label">Completed On:</span>
                    <span className="detail-value">
                      {new Date(course.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="completion-detail">
                    <span className="detail-label">Started On:</span>
                    <span className="detail-value">
                      {new Date(course.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="view-certificate-button"
                  onClick={() => navigate(`/certificate/${course.courseId}`)}
                >
                  View Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="courses-navigation">
        <button 
          className="view-progress-button"
          onClick={() => navigate('/progress')}
        >
          View Courses in Progress
        </button>
        <button 
          className="browse-courses-button"
          onClick={() => navigate('/training')}
        >
          Browse All Courses
        </button>
      </div>
    </div>
  );
};

export default CompletedCourses;
