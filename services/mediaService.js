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
 * Get media by ID
 * @param {string} mediaId - Media ID
 * @returns {Promise<Object>} Media data
 */
export const getMediaById = async (mediaId) => {
  try {
    const response = await api.get(`/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error("Get media error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete media
 * @param {string} mediaId - Media ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteMedia = async (mediaId) => {
  try {
    const response = await api.delete(`/media/${mediaId}`);
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
    const response = await api.get("/media/user");
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
    const response = await api.get(`/media/user/${category}/${type}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get user media by type error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
