import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCourseProgress, getCourses } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/CourseProgress.css';

const CourseProgress = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [courseProgress, setCourseProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseProgress = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get user's course progress
        const progressResult = await getUserCourseProgress(currentUser.uid);
        
        if (!progressResult.success) {
          setError('Failed to fetch your course progress');
          return;
        }
        
        // Get all courses to match with progress
        const coursesResult = await getCourses();
        
        if (!coursesResult.success) {
          setError('Failed to fetch courses');
          return;
        }
        
        // Combine course data with progress data
        const progressWithCourseDetails = progressResult.progress
          .filter(progress => !progress.completed) // Only include incomplete courses
          .map(progress => {
            const courseDetails = coursesResult.courses.find(
              course => course.id === progress.courseId
            );
            
            return {
              ...progress,
              courseTitle: courseDetails?.title || 'Unknown Course',
              courseDescription: courseDetails?.description || '',
              courseCategory: courseDetails?.category || '',
              courseImageUrl: courseDetails?.imageUrl || '',
              courseSections: courseDetails?.sections || []
            };
          });
        
        setCourseProgress(progressWithCourseDetails);
      } catch (err) {
        setError('Error fetching course progress: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseProgress();
  }, [currentUser]);

  const handleContinueCourse = (courseId) => {
    navigate(`/training/${courseId}`);
  };

  return (
    <div className="course-progress-container">
      <h1>My Course Progress</h1>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your course progress...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : courseProgress.length === 0 ? (
        <div className="no-progress-message">
          <p>You don't have any courses in progress.</p>
          <button 
            className="browse-courses-button" 
            onClick={() => navigate('/training')}
          >
            Browse Training Courses
          </button>
        </div>
      ) : (
        <div className="progress-courses-list">
          {courseProgress.map(progress => (
            <div key={progress.id} className="progress-course-card">
              <div className="course-image">
                {progress.courseImageUrl ? (
                  <img src={progress.courseImageUrl} alt={progress.courseTitle} />
                ) : (
                  <div className="placeholder-image">
                    <span>{progress.courseTitle.charAt(0)}</span>
                  </div>
                )}
                <div className="course-category">{progress.courseCategory}</div>
              </div>
              
              <div className="course-info">
                <h3>{progress.courseTitle}</h3>
                <p className="course-description">{progress.courseDescription}</p>
                
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{progress.completionPercentage || 0}% Complete</span>
                </div>
                
                <div className="progress-details">
                  <div className="progress-detail">
                    <span className="detail-label">Current Section:</span>
                    <span className="detail-value">
                      {progress.courseSections[progress.currentSection]?.title || `Section ${progress.currentSection + 1}`}
                    </span>
                  </div>
                  
                  <div className="progress-detail">
                    <span className="detail-label">Started:</span>
                    <span className="detail-value">
                      {new Date(progress.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="progress-detail">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {new Date(progress.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="continue-button"
                  onClick={() => handleContinueCourse(progress.courseId)}
                >
                  Continue Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="progress-navigation">
        <button 
          className="view-completed-button"
          onClick={() => navigate('/completed-courses')}
        >
          View Completed Courses
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

export default CourseProgress;
