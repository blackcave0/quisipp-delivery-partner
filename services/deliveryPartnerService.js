import api from "./api";

/**
 * Register a new delivery partner
 * @param {Object} partnerData - Delivery partner registration data
 * @param {string} partnerData.firstName - Partner's first name
 * @param {string} partnerData.lastName - Partner's last name
 * @param {string} partnerData.email - Partner's email
 * @param {string} partnerData.phoneNumber - Partner's phone number
 * @param {string} partnerData.vehicleType - Vehicle type (motorcycle, bicycle, electric_vehicle)
 * @param {string} partnerData.employmentType - Employment type (part-time, full-time)
 * @returns {Promise<Object>} Registration response
 */
export const registerDeliveryPartner = async (partnerData) => {
  try {
    const response = await api.post("/delivery-partners/register", partnerData);
    return response.data;
  } catch (error) {
    console.error(
      "Delivery partner registration error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update delivery partner profile
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
    const response = await api.put("/delivery-partners/profile", profileData);
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
 * Update delivery partner vehicle
 * @param {string} vehicleType - Vehicle type (motorcycle, bicycle, electric_vehicle)
 * @returns {Promise<Object>} Update response
 */
export const updateVehicle = async (vehicleType) => {
  try {
    const response = await api.put("/delivery-partners/vehicle", {
      vehicleType,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Update vehicle error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update delivery partner location
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Update response
 */
export const updateLocation = async (latitude, longitude) => {
  try {
    const response = await api.put("/delivery-partners/location", {
      latitude,
      longitude,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Update location error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Toggle delivery partner active status
 * @returns {Promise<Object>} Toggle response
 */
export const toggleActiveStatus = async () => {
  try {
    const response = await api.put("/delivery-partners/toggle-status");
    return response.data;
  } catch (error) {
    console.error(
      "Toggle active status error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get delivery partner profile
 * @returns {Promise<Object>} Profile data
 */
export const getProfile = async () => {
  try {
    const response = await api.get("/delivery-partners/profile");
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Get profile error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update delivery partner details (for existing users)
 * @param {Object} partnerData - Delivery partner details to update
 * @param {string} partnerData.firstName - Partner's first name
 * @param {string} partnerData.lastName - Partner's last name
 * @param {string} partnerData.email - Partner's email
 * @param {string} partnerData.phoneNumber - Partner's phone number
 * @param {string} partnerData.vehicleType - Vehicle type (motorcycle, bicycle, electric_vehicle)
 * @param {string} partnerData.employmentType - Employment type (part-time, full-time)
 * @returns {Promise<Object>} Update response
 */
export const updateDeliveryPartnerDetails = async (partnerData) => {
  try {
    const response = await api.put("/delivery-partners/details", partnerData);
    return response.data;
  } catch (error) {
    console.error(
      "Update delivery partner details error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
