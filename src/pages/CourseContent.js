import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, updateCourseProgress } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/CourseContent.css';

const CourseContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const result = await getCourseById(id);
        
        if (result.success) {
          setCourse(result.course);
          
          // Initialize answers if there's existing progress
          if (result.course.progress) {
            setAnswers(result.course.progress.answers || {});
            setCurrentSection(result.course.progress.currentSection || 0);
            setCurrentQuestion(result.course.progress.currentQuestion || 0);
            setCompleted(result.course.progress.completed || false);
          }
        } else {
          setError('Failed to fetch course details');
        }
      } catch (err) {
        setError('Error fetching course details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleAnswerChange = (value) => {
    const questionKey = `${currentSection}_${currentQuestion}`;
    setAnswers({
      ...answers,
      [questionKey]: value
    });
  };

  const handleNext = async () => {
    if (!course || !course.sections) return;
    
    const currentSectionData = course.sections[currentSection];
    if (!currentSectionData) return;
    
    // Check if we're at the last question of the current section
    if (currentQuestion >= currentSectionData.questions.length - 1) {
      // If we're at the last section, mark as completed
      if (currentSection >= course.sections.length - 1) {
        await saveProgress(true);
        setCompleted(true);
      } else {
        // Move to the next section, first question
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
        await saveProgress();
      }
    } else {
      // Move to the next question in the current section
      setCurrentQuestion(currentQuestion + 1);
      await saveProgress();
    }
  };

  const handlePrevious = async () => {
    if (currentQuestion > 0) {
      // Move to the previous question in the current section
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      // Move to the last question of the previous section
      const prevSection = course.sections[currentSection - 1];
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(prevSection.questions.length - 1);
    }
    await saveProgress();
  };

  const saveProgress = async (isCompleted = false) => {
    if (!currentUser || !course) return;
    
    try {
      setSaving(true);
      setSaveError('');
      
      // Calculate completion percentage
      const totalQuestions = course.sections.reduce(
        (total, section) => total + section.questions.length, 
        0
      );
      
      const answeredQuestions = Object.keys(answers).length;
      const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
      
      const progressData = {
        currentSection,
        currentQuestion,
        answers,
        completionPercentage,
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      };
      
      const result = await updateCourseProgress(currentUser.uid, course.id, progressData);
      
      if (!result.success) {
        setSaveError(result.error || 'Failed to save progress');
      }
    } catch (err) {
      setSaveError('Error saving progress: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    navigate('/completed-courses');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-content-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate('/training')}>
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-content-container">
        <div className="error-message">Course not found</div>
        <button className="back-button" onClick={() => navigate('/training')}>
          Back to Courses
        </button>
      </div>
    );
  }

  // If the course is completed, show completion screen
  if (completed) {
    return (
      <div className="course-content-container">
        <div className="course-completion">
          <h1>Congratulations!</h1>
          <h2>You've completed the {course.title} course</h2>
          <p>You have successfully completed all sections of this training course.</p>
          <button className="finish-button" onClick={handleFinish}>
            View Completed Courses
          </button>
          <button className="back-button" onClick={() => navigate('/training')}>
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Get current section and question data
  const currentSectionData = course.sections[currentSection];
  const currentQuestionData = currentSectionData?.questions[currentQuestion];
  const questionKey = `${currentSection}_${currentQuestion}`;
  const currentAnswer = answers[questionKey] || '';

  return (
    <div className="course-content-container">
      <div className="course-header">
        <button className="back-button" onClick={() => navigate('/training')}>
          Back to Courses
        </button>
        <h1>{course.title}</h1>
      </div>
      
      <div className="course-progress-bar">
        <div className="progress-sections">
          {course.sections.map((section, index) => (
            <div 
              key={index}
              className={`progress-section ${index < currentSection ? 'completed' : index === currentSection ? 'current' : ''}`}
            >
              <span className="section-number">{index + 1}</span>
              <span className="section-title">{section.title}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="course-content-main">
        <div className="section-info">
          <h2>{currentSectionData.title}</h2>
          <p>{currentSectionData.description}</p>
        </div>
        
        <div className="question-container">
          <h3>Question {currentQuestion + 1} of {currentSectionData.questions.length}</h3>
          
          <div className="question">
            <p>{currentQuestionData.text}</p>
            
            {currentQuestionData.type === 'multiple-choice' && (
              <div className="multiple-choice">
                {currentQuestionData.options.map((option, index) => (
                  <div key={index} className="option">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${questionKey}`}
                      value={option}
                      checked={currentAnswer === option}
                      onChange={() => handleAnswerChange(option)}
                    />
                    <label htmlFor={`option-${index}`}>{option}</label>
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestionData.type === 'text' && (
              <div className="text-answer">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                />
              </div>
            )}
            
            {currentQuestionData.type === 'boolean' && (
              <div className="boolean-choice">
                <div className="option">
                  <input
                    type="radio"
                    id="option-true"
                    name={`question-${questionKey}`}
                    value="true"
                    checked={currentAnswer === 'true'}
                    onChange={() => handleAnswerChange('true')}
                  />
                  <label htmlFor="option-true">True</label>
                </div>
                <div className="option">
                  <input
                    type="radio"
                    id="option-false"
                    name={`question-${questionKey}`}
                    value="false"
                    checked={currentAnswer === 'false'}
                    onChange={() => handleAnswerChange('false')}
                  />
                  <label htmlFor="option-false">False</label>
                </div>
              </div>
            )}
          </div>
          
          {saveError && <div className="error-message">{saveError}</div>}
          
          <div className="question-navigation">
            <button 
              className="prev-button" 
              onClick={handlePrevious}
              disabled={currentSection === 0 && currentQuestion === 0 || saving}
            >
              Previous
            </button>
            
            <button 
              className="next-button" 
              onClick={handleNext}
              disabled={saving}
            >
              {currentSection === course.sections.length - 1 && 
               currentQuestion === currentSectionData.questions.length - 1 
                ? 'Complete Course' 
                : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
