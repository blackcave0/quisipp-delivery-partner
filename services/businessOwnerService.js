import api from "./api";

/**
 * Register a new business owner
 * @param {Object} businessData - Business owner registration data
 * @param {string} businessData.userId - User ID (optional)
 * @param {string} businessData.email - Business owner's email
 * @param {string} businessData.phoneNumber - Business owner's phone number
 * @param {string} businessData.businessName - Business name
 * @param {string} businessData.businessType - Business type
 * @param {string} businessData.gstin - Business GSTIN (optional)
 * @param {string[]} businessData.categories - Business categories
 * @param {string} businessData.businessAddress - Business address
 * @param {string} businessData.pincode - Business pincode
 * @returns {Promise<Object>} Registration response
 */
export const registerBusinessOwner = async (businessData) => {
  try {
    console.log("Registering business owner with data:", businessData);
    const response = await api.post("/business-owners/register", businessData);
    return response.data;
  } catch (error) {
    console.error(
      "Business owner registration error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update business owner profile
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.firstName - First name
 * @param {string} profileData.lastName - Last name
 * @param {string} profileData.address - Address
 * @param {string} profileData.city - City
 * @param {string} profileData.state - State
 * @param {string} profileData.pincode - Pincode
 * @returns {Promise<Object>} Update response
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/business-owners/profile", profileData);
    return response.data;
  } catch (error) {
    console.error(
      "Update profile error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update business details
 * @param {Object} businessDetails - Business details to update
 * @param {string} businessDetails.businessName - Business name
 * @param {string} businessDetails.businessType - Business type
 * @param {string} businessDetails.gstin - Business GSTIN (optional)
 * @param {string[]} businessDetails.categories - Business categories
 * @param {string} businessDetails.businessAddress - Business address
 * @param {string} businessDetails.businessCity - Business city
 * @param {string} businessDetails.businessState - Business state
 * @param {string} businessDetails.businessPincode - Business pincode
 * @param {string} businessDetails.pincode - Business pincode
 * @returns {Promise<Object>} Update response
 */
export const updateBusinessDetails = async (businessDetails) => {
  try {
    const response = await api.put(
      "/business-owners/business",
      businessDetails
    );
    return response.data;
  } catch (error) {
    console.error(
      "Update business details error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get business owner profile
 * @returns {Promise<Object>} Profile data
 */
export const getProfile = async () => {
  try {
    const response = await api.get("/business-owners/profile");
    return response.data;
  } catch (error) {
    console.error("Get profile error:", error.response?.data || error.message);
    throw error;
  }
};
