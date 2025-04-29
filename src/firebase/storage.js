// Storage functions
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Upload a file to Firebase Storage
export const uploadFile = async (userId, file, folder = 'documents') => {
  try {
    // Create a reference to the file location
    const fileRef = ref(storage, `${folder}/${userId}/${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get download URL for a file
export const getFileURL = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(fileRef);
    
    return {
      success: true,
      downloadURL
    };
  } catch (error) {
    console.error('Error getting file URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete a file from Firebase Storage
export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload a profile image
export const uploadProfileImage = async (userId, file) => {
  return uploadFile(userId, file, 'profile-images');
};

// Upload a document (license, card, etc.)
export const uploadDocument = async (userId, file, documentType) => {
  return uploadFile(userId, file, `documents/${documentType}`);
};

// Upload a course image
export const uploadCourseImage = async (courseId, file) => {
  try {
    // Create a reference to the file location
    const fileRef = ref(storage, `courses/${courseId}/image`);
    
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading course image:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
