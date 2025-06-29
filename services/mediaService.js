import api from "./api";

/**
 * Upload media file
 * @param {FormData} formData - Form data with file and metadata
 * @returns {Promise<Object>} Upload response
 */
export const uploadMedia = async (formData) => {
  try {
    const response = await api.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Media upload error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload document
 * @param {FormData} formData - Form data with file and metadata
 * @param {string} userType - User type (delivery-partner or business-owner)
 * @param {string} documentType - Document type (aadhar, pan, selfie, video, business-image, business-video, profile-picture)
 * @returns {Promise<Object>} Upload response
 */
export const uploadDocument = async (formData, userType, documentType) => {
  try {
    const response = await api.post(
      `/media/upload-document/${userType}/${documentType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Document upload error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Upload document publicly (for registration without authentication)
 * @param {FormData} formData - Form data with file and metadata
 * @param {string} userType - User type (delivery-partner or business-owner)
 * @param {string} documentType - Document type (aadhar, pan, selfie, video, business-image, business-video, profile-picture)
 * @returns {Promise<Object>} Upload response
 */
export const uploadDocumentPublic = async (
  formData,
  userType,
  documentType
) => {
  try {
    const response = await api.post(
      `/media/upload-document-public/${userType}/${documentType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Public document upload error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Delete media by type
 * @param {string} type - Document type (aadhar, pan, selfie, video, etc.)
 * @returns {Promise<Object>} Delete response
 */
export const deleteMedia = async (type) => {
  try {
    const response = await api.delete(`/media/${type}`);
    return response.data;
  } catch (error) {
    console.error("Delete media error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all media for current user
 * @returns {Promise<Object>} Media list
 */
export const getAllUserMedia = async () => {
  try {
    const response = await api.get("/media");
    return response.data;
  } catch (error) {
    console.error(
      "Get user media error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get user media by type and category
 * @param {string} category - Media category (delivery-partner or business-owner)
 * @param {string} type - Media type (aadhar, pan, selfie, video, etc.)
 * @returns {Promise<Object>} Media list
 */
export const getUserMediaByType = async (category, type) => {
  try {
    const response = await api.get(`/media/${category}/${type}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get user media by type error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
