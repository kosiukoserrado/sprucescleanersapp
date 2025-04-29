import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../firebase/firestore';
import CourseCard from '../components/CourseCard';
import '../styles/TrainingCourses.css';

const TrainingCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Categories for filtering
  const categories = [
    'Post Construction Cleaning',
    'Office Cleaning',
    'Childcare Cleaning',
    'School Cleaning',
    'Customer Service Cleaning'
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const filters = {};
        
        if (categoryFilter) {
          filters.category = categoryFilter;
        }
        
        const result = await getCourses(filters);
        
        if (result.success) {
          setCourses(result.courses);
        } else {
          setError('Failed to fetch training courses');
        }
      } catch (err) {
        setError('Error fetching training courses: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [categoryFilter]);

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchTermLower) ||
      course.description.toLowerCase().includes(searchTermLower) ||
      course.category.toLowerCase().includes(searchTermLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  return (
    <div className="training-courses-container">
      <h1>Training Courses</h1>
      
      <div className="course-filters">
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
              onChange={handleCategoryChange}
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
          <p>Loading training courses...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
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
            <Link to={`/training/${course.id}`} key={course.id} className="course-card-link">
              <CourseCard course={course} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingCourses;
