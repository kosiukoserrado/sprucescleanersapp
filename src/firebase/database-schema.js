// Database schema for Spruces Cleaning Services
// This file provides documentation of the database structure but is not used in the application code

const databaseSchema = {
  // Users collection - stores user profiles and authentication information
  users: {
    userId: {
      uid: "string", // User ID from Firebase Auth
      email: "string",
      displayName: "string",
      role: "string", // 'cleaner' or 'admin'
      createdAt: "timestamp",
      updatedAt: "timestamp",
      profileComplete: "boolean",
      
      // Cleaner specific fields
      abn: "string", // Australian Business Number
      phone: "string",
      address: "string",
      bankName: "string",
      accountName: "string",
      bsb: "string",
      accountNumber: "string",
      
      // Document references
      driverLicense: {
        url: "string",
        verified: "boolean",
        expiryDate: "timestamp"
      },
      whiteCard: {
        url: "string",
        verified: "boolean",
        expiryDate: "timestamp"
      },
      blueCard: {
        url: "string",
        verified: "boolean",
        expiryDate: "timestamp"
      },
      
      // Additional credentials
      credentials: [
        {
          type: "string",
          url: "string",
          verified: "boolean",
          expiryDate: "timestamp"
        }
      ]
    }
  },
  
  // Jobs collection - stores job listings
  jobs: {
    jobId: {
      title: "string",
      description: "string",
      project: "string",
      location: "string",
      category: "string", // e.g., 'Post Construction', 'Office', 'Childcare', etc.
      startDate: "timestamp",
      endDate: "timestamp",
      payRate: "number", // Pay per cleaner
      hoursPerDay: "number",
      cleanersNeeded: "number",
      status: "string", // 'open', 'filled', 'completed', 'cancelled'
      createdAt: "timestamp",
      updatedAt: "timestamp",
      createdBy: "string" // Admin user ID
    }
  },
  
  // Applications collection - stores job applications
  applications: {
    applicationId: {
      userId: "string", // Cleaner user ID
      jobId: "string",
      status: "string", // 'pending', 'approved', 'rejected'
      message: "string", // Optional message from cleaner
      appliedAt: "timestamp",
      updatedAt: "timestamp",
      adminNotes: "string" // Optional notes from admin
    }
  },
  
  // Courses collection - stores training courses
  courses: {
    courseId: {
      title: "string",
      description: "string",
      category: "string", // e.g., 'Post Construction', 'Office', 'Childcare', etc.
      imageUrl: "string",
      status: "string", // 'active', 'inactive'
      createdAt: "timestamp",
      updatedAt: "timestamp",
      
      // Course content organized in sections
      sections: [
        {
          title: "string",
          description: "string",
          order: "number",
          
          // Questions in Typeform-like format
          questions: [
            {
              text: "string",
              type: "string", // 'multiple-choice', 'text', 'boolean'
              options: ["string"], // For multiple-choice questions
              correctAnswer: "string", // For scored questions
              required: "boolean"
            }
          ]
        }
      ]
    }
  },
  
  // Course progress collection - stores user progress in courses
  courseProgress: {
    userId_courseId: { // Composite key
      userId: "string",
      courseId: "string",
      startedAt: "timestamp",
      updatedAt: "timestamp",
      completed: "boolean",
      completedAt: "timestamp",
      currentSection: "number",
      currentQuestion: "number",
      
      // Answers to questions
      answers: {
        sectionId_questionId: "string" // Answer value
      },
      
      // Section completion status
      sectionStatus: {
        sectionId: "boolean" // true if section is completed
      }
    }
  }
};

export default databaseSchema;
