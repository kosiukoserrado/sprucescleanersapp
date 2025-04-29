import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, createCourse, updateCourse } from '../firebase/firestore';
import { useAuth } from '../components/AuthContext';
import '../styles/AdminCourses.css';

const AdminCourses = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // New/Edit course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    status: 'active',
    sections: [
      {
        title: 'Introduction',
        description: 'Welcome to the course',
        order: 0,
        questions: [
          {
            text: 'Are you ready to begin?',
            type: 'boolean',
            options: [],
            required: true
          }
        ]
      }
    ]
  });

  // Categories for course form
  const categories = [
    'Post Construction Cleaning',
    'Office Cleaning',
    'Childcare Cleaning',
    'School Cleaning',
    'Customer Service Cleaning'
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      if (!currentUser || !isAdmin) return;
      
      try {
        setLoading(true);
        const result = await getCourses();
        
        if (result.success) {
          setCourses(result.courses);
        } else {
          setError('Failed to fetch courses');
        }
      } catch (err) {
        setError('Error fetching courses: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentUser, isAdmin]);

  // Filter courses based on search term and category filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter ? course.category === categoryFilter : true;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm({
      ...courseForm,
      [name]: value
    });
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...courseForm.sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value
    };
    
    setCourseForm({
      ...courseForm,
      sections: updatedSections
    });
  };

  const handleQuestionChange = (sectionIndex, questionIndex, field, value) => {
    const updatedSections = [...courseForm.sections];
    const updatedQuestions = [...updatedSections[sectionIndex].questions];
    
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      questions: updatedQuestions
    };
    
    setCourseForm({
      ...courseForm,
      sections: updatedSections
    });
  };

  const addSection = () => {
    const newSection = {
      title: `Section ${courseForm.sections.length + 1}`,
      description: '',
      order: courseForm.sections.length,
      questions: [
        {
          text: 'Question 1',
          type: 'text',
          options: [],
          required: true
        }
      ]
    };
    
    setCourseForm({
      ...courseForm,
      sections: [...courseForm.sections, newSection]
    });
  };

  const removeSection = (index) => {
    if (courseForm.sections.length <= 1) {
      setError('Course must have at least one section');
      return;
    }
    
    const updatedSections = courseForm.sections.filter((_, i) => i !== index);
    // Update order of remaining sections
    updatedSections.forEach((section, i) => {
      section.order = i;
    });
    
    setCourseForm({
      ...courseForm,
      sections: updatedSections
    });
  };

  const addQuestion = (sectionIndex) => {
    const updatedSections = [...courseForm.sections];
    const currentQuestions = updatedSections[sectionIndex].questions;
    
    const newQuestion = {
      text: `Question ${currentQuestions.length + 1}`,
      type: 'text',
      options: [],
      required: true
    };
    
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      questions: [...currentQuestions, newQuestion]
    };
    
    setCourseForm({
      ...courseForm,
      sections: updatedSections
    });
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    if (courseForm.sections[sectionIndex].questions.length <= 1) {
      setError('Section must have at least one question');
      return;
    }
    
    const updatedSections = [...courseForm.sections];
    const updatedQuestions = updatedSections[sectionIndex].questions.filter((_, i) => i !== questionIndex);
    
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      questions: updatedQuestions
    };
    
    setCourseForm({
      ...courseForm,
      sections: updatedSections
    });
  };

  const addOption = (sectionIndex, questionIndex) => {
    const updatedSections = [...courseForm.sections];
    const currentQuestion = updatedSections[sectionIndex].questions[questionIndex];
    const currentOptions = currentQuestion.options || [];
    
    const newOption = `Option ${currentOptions.length + 1}`;
    
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...currentQuestion,
      options: [...currentOptions, newOption]
    };
    
    setCourseForm({
      ...courseForm,
      sections: updatedSections
    });
  };

  const handleOptionChange = (sectionIndex, questionIndex, optionIndex, value) => {
    const updatedSections = [...courseForm.sections];
    const currentQuestion = updatedSections[sectionIndex].questions[questionIndex];
    const updatedOptions = [...currentQuestion.options];
    
    updatedOptions[optionIndex] = value;
    
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...currentQuestion,
      options: updatedOptions
    };
    
    setCourseForm({
      ...courseForm,
      sections: updatedSections
    });
  };

  const removeOption = (sectionIndex, questionIndex, optionIndex) => {
    const updatedSections = [...courseForm.sections];
    const currentQuestion = updatedSections[sectionIndex].questions[questionIndex];
    
    if (currentQuestion.options.length <= 2) {
      setError('Multiple choice questions must have at least two options');
      return;
    }
    
    const updatedOptions = currentQuestion.options.filter((_, i) => i !== optionIndex);
    
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...currentQuestion,
      options: updatedOptions
    };
    
    setCourseForm({
      ...courseForm,
      sections: updatedSections
    });
  };

  const resetForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      status: 'active',
      sections: [
        {
          title: 'Introduction',
          description: 'Welcome to the course',
          order: 0,
          questions: [
            {
              text: 'Are you ready to begin?',
              type: 'boolean',
              options: [],
              required: true
            }
          ]
        }
      ]
    });
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      imageUrl: course.imageUrl || '',
      status: course.status || 'active',
      sections: course.sections || [
        {
          title: 'Introduction',
          description: 'Welcome to the course',
          order: 0,
          questions: [
            {
              text: 'Are you ready to begin?',
              type: 'boolean',
              options: [],
              required: true
            }
          ]
        }
      ]
    });
    
    setEditingCourseId(course.id);
    setShowNewCourseForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!courseForm.title || !courseForm.description || !courseForm.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate sections and questions
    for (const section of courseForm.sections) {
      if (!section.title) {
        setError('All sections must have a title');
        return;
      }
      
      for (const question of section.questions) {
        if (!question.text) {
          setError('All questions must have text');
          return;
        }
        
        if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
          setError('Multiple choice questions must have at least two options');
          return;
        }
      }
    }
    
    try {
      setLoading(true);
      
      let result;
      
      if (editingCourseId) {
        // Update existing course
        result = await updateCourse(editingCourseId, courseForm);
      } else {
        // Create new course
        result = await createCourse(courseForm);
      }
      
      if (result.success) {
        // Refresh course list
        const coursesResult = await getCourses();
        if (coursesResult.success) {
          setCourses(coursesResult.courses);
        }
        
        // Reset form and state
        resetForm();
        setShowNewCourseForm(false);
        setEditingCourseId(null);
      } else {
        setError(result.error || 'Failed to save course');
      }
    } catch (err) {
      setError('Error saving course: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowNewCourseForm(false);
    setEditingCourseId(null);
  };

  if (!isAdmin) {
    return (
      <div className="admin-courses-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin courses page.</p>
          <Link to="/dashboard" className="back-link">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-courses-container">
      <div className="admin-header">
        <h1>Manage Training Courses</h1>
        <button 
          className="new-course-button"
          onClick={() => {
            resetForm();
            setShowNewCourseForm(true);
            setEditingCourseId(null);
          }}
        >
          Create New Course
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showNewCourseForm ? (
        <div className="course-form-container">
          <h2>{editingCourseId ? 'Edit Course' : 'Create New Course'}</h2>
          
          <form onSubmit={handleSubmit} className="course-form">
            <div className="form-section">
              <h3>Course Details</h3>
              
              <div className="form-group">
                <label htmlFor="title">Course Title*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={courseForm.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={courseForm.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={courseForm.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status*</label>
                  <select
                    id="status"
                    name="status"
                    value={courseForm.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="imageUrl">Image URL (Optional)</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={courseForm.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Course Content</h3>
              <p className="help-text">Create sections with up to 3 questions each in a Typeform-like format.</p>
              
              {courseForm.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="section-container">
                  <div className="section-header">
                    <h4>Section {sectionIndex + 1}</h4>
                    <button 
                      type="button" 
                      className="remove-button"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      Remove Section
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`section-${sectionIndex}-title`}>Section Title*</label>
                    <input
                      type="text"
                      id={`section-${sectionIndex}-title`}
                      value={section.title}
                      onChange={(e) => handleSectionChange(sectionIndex, 'title', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`section-${sectionIndex}-description`}>Section Description*</label>
                    <textarea
                      id={`section-${sectionIndex}-description`}
                      value={section.description}
                      onChange={(e) => handleSectionChange(sectionIndex, 'description', e.target.value)}
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div className="questions-container">
                    <h5>Questions</h5>
                    
                    {section.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="question-container">
                        <div className="question-header">
                          <h6>Question {questionIndex + 1}</h6>
                          <button 
                            type="button" 
                            className="remove-button"
                            onClick={() => removeQuestion(sectionIndex, questionIndex)}
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor={`question-${sectionIndex}-${questionIndex}-text`}>Question Text*</label>
                          <input
                            type="text"
                            id={`question-${sectionIndex}-${questionIndex}-text`}
                            value={question.text}
                            onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'text', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor={`question-${sectionIndex}-${questionIndex}-type`}>Question Type*</label>
                          <select
                            id={`question-${sectionIndex}-${questionIndex}-type`}
                            value={question.type}
                            onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'type', e.target.value)}
                            required
                          >
                            <option value="text">Text Answer</option>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="boolean">True/False</option>
                          </select>
                        </div>
                        
                        {question.type === 'multiple-choice' && (
                          <div className="options-container">
                            <label>Options*</label>
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="option-row">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(sectionIndex, questionIndex, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  required
                                />
                                <button 
                                  type="button" 
                                  className="remove-option-button"
                                  onClick={() => removeOption(sectionIndex, questionIndex, optionIndex)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button 
                              type="button" 
                              className="add-option-button"
                              onClick={() => addOption(sectionIndex, questionIndex)}
                            >
                              Add Option
                            </button>
                          </div>
                        )}
                        
                        <div className="form-group checkbox-group">
                          <input
                            type="checkbox"
                            id={`question-${sectionIndex}-${questionIndex}-required`}
                            checked={question.required}
                            onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, 'required', e.target.checked)}
                          />
                          <label htmlFor={`question-${sectionIndex}-${questionIndex}-required`}>Required</label>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      className="add-question-button"
                      onClick={() => addQuestion(sectionIndex)}
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="add-section-button"
                onClick={addSection}
              >
                Add Section
              </button>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Saving...' : (editingCourseId ? 'Update Course' : 'Create Course')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="courses-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search courses..."
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
                  onChange={handleCategoryFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
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
              <p>Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="no-courses-message">
              <p>No courses found matching your criteria.</p>
              <button className="clear-filters-button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map(course => (
                <div key={course.id} className="admin-course-card">
                  <div className="course-image">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.title} />
                    ) : (
                      <div className="placeholder-image">
                        <span>{course.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="course-category">{course.category}</div>
                    <div className={`course-status ${course.status}`}>
                      {course.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    
                    <div className="course-meta">
                      <span>{course.sections ? course.sections.length : 0} Sections</span>
                      <span>{course.enrollments || 0} Enrollments</span>
                    </div>
                    
                    <div className="course-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEditCourse(course)}
                      >
                        Edit Course
                      </button>
                      <button 
                        className="view-button"
                        onClick={() => navigate(`/admin/courses/${course.id}/progress`)}
                      >
                        View Progress
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCourses;
