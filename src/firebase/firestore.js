// Firestore database functions
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp, 
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

// Add createUserProfile function
export const createUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileComplete: true
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add updateUserRole function
export const updateUserRole = async (userId, role) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add getRecentJobs function
export const getRecentJobs = async (limitCount = 5) => {
  try {
    const jobsQuery = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(jobsQuery);
    const jobs = [];
    
    querySnapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      jobs
    };
  } catch (error) {
    console.error('Error getting recent jobs:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add getUserProfileById function (alias for getUserProfile for compatibility)
export const getUserProfileById = async (userId) => {
  return getUserProfile(userId);
};

// Jobs collection functions
export const getJobs = async (filters = {}) => {
  try {
    let jobsQuery = collection(db, 'jobs');
    
    // Apply filters if provided
    if (filters.category) {
      jobsQuery = query(jobsQuery, where('category', '==', filters.category));
    }
    
    if (filters.location) {
      jobsQuery = query(jobsQuery, where('location', '==', filters.location));
    }
    
    // Always order by date
    jobsQuery = query(jobsQuery, orderBy('startDate', 'desc'));
    
    const querySnapshot = await getDocs(jobsQuery);
    const jobs = [];
    
    querySnapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      jobs
    };
  } catch (error) {
    console.error('Error getting jobs:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getJobById = async (jobId) => {
  try {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    
    if (jobDoc.exists()) {
      return {
        success: true,
        job: {
          id: jobDoc.id,
          ...jobDoc.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Job not found'
      };
    }
  } catch (error) {
    console.error('Error getting job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const createJob = async (jobData) => {
  try {
    const jobRef = await addDoc(collection(db, 'jobs'), {
      ...jobData,
      createdAt: new Date().toISOString(),
      status: 'open'
    });
    
    return {
      success: true,
      jobId: jobRef.id
    };
  } catch (error) {
    console.error('Error creating job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateJob = async (jobId, jobData) => {
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      ...jobData,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Applications collection functions
export const applyForJob = async (userId, jobId, applicationData) => {
  try {
    const applicationRef = await addDoc(collection(db, 'applications'), {
      userId,
      jobId,
      ...applicationData,
      status: 'pending',
      appliedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      applicationId: applicationRef.id
    };
  } catch (error) {
    console.error('Error applying for job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getUserApplications = async (userId) => {
  try {
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('userId', '==', userId),
      orderBy('appliedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(applicationsQuery);
    const applications = [];
    
    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting user applications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getJobApplications = async (jobId) => {
  try {
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      orderBy('appliedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(applicationsQuery);
    const applications = [];
    
    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      applications
    };
  } catch (error) {
    console.error('Error getting job applications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateApplicationStatus = async (applicationId, status) => {
  try {
    await updateDoc(doc(db, 'applications', applicationId), {
      status,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating application status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Courses collection functions
export const getCourses = async (filters = {}) => {
  try {
    let coursesQuery = collection(db, 'courses');
    
    // Apply filters if provided
    if (filters.category) {
      coursesQuery = query(coursesQuery, where('category', '==', filters.category));
    }
    
    const querySnapshot = await getDocs(coursesQuery);
    const courses = [];
    
    querySnapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      courses
    };
  } catch (error) {
    console.error('Error getting courses:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getCourseById = async (courseId) => {
  try {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    
    if (courseDoc.exists()) {
      return {
        success: true,
        course: {
          id: courseDoc.id,
          ...courseDoc.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Course not found'
      };
    }
  } catch (error) {
    console.error('Error getting course:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const createCourse = async (courseData) => {
  try {
    const courseRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    
    return {
      success: true,
      courseId: courseRef.id
    };
  } catch (error) {
    console.error('Error creating course:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    await updateDoc(doc(db, 'courses', courseId), {
      ...courseData,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating course:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Course progress functions
export const updateCourseProgress = async (userId, courseId, progressData) => {
  try {
    const progressRef = doc(db, 'courseProgress', `${userId}_${courseId}`);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      // Update existing progress
      await updateDoc(progressRef, {
        ...progressData,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new progress document
      await setDoc(progressRef, {
        userId,
        courseId,
        ...progressData,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating course progress:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getUserCourseProgress = async (userId) => {
  try {
    const progressQuery = query(
      collection(db, 'courseProgress'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(progressQuery);
    const progress = [];
    
    querySnapshot.forEach((doc) => {
      progress.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      progress
    };
  } catch (error) {
    console.error('Error getting user course progress:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// User profile functions
export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: new Date().toISOString(),
      profileComplete: true
    });
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return {
        success: true,
        profile: userDoc.data()
      };
    } else {
      return {
        success: false,
        error: 'User not found'
      };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Admin functions
export const getAllUsers = async () => {
  try {
    const usersQuery = collection(db, 'users');
    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      users
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
