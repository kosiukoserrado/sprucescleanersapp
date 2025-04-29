import React from 'react';
import '../styles/CourseCard.css';

const CourseCard = ({ course }) => {
  // Calculate completion percentage if available
  const completionPercentage = course.progress ? course.progress.completionPercentage : 0;
  
  return (
    <div className="course-card">
      <div className="course-image">
        {course.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} />
        ) : (
          <div className="placeholder-image">
            <span>{course.title.charAt(0)}</span>
          </div>
        )}
        <div className="course-category">{course.category}</div>
      </div>
      
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        
        {course.progress && (
          <div className="course-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{completionPercentage}% Complete</span>
          </div>
        )}
      </div>
      
      <div className="course-footer">
        <div className="course-sections">
          <span>{course.sections ? course.sections.length : 0} Sections</span>
        </div>
        <button className="start-course-button">
          {course.progress ? 'Continue' : 'Start'} Course
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
