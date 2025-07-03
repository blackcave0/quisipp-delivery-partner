import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Format phone number to ensure it has the correct country code
 * @param {string} phoneNumber - User's phone number
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // If the number already has a country code (e.g., starts with +91), return as is
  if (phoneNumber.startsWith("+")) {
    return phoneNumber;
  }

  // If the number starts with 91, add the + prefix
  if (digitsOnly.startsWith("91") && digitsOnly.length >= 12) {
    return `+${digitsOnly}`;
  }

  // Otherwise, assume it's an Indian number and add the country code
  return `+91${digitsOnly}`;
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email
 * @param {string} userData.phoneNumber - User's phone number
 * @param {string} userData.role - User's role (delivery-partner or business-owner)
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
  try {
    // Format the phone number
    const formattedUserData = {
      ...userData,
      phoneNumber: formatPhoneNumber(userData.phoneNumber),
    };

    const response = await api.post("/auth/register", formattedUserData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Login user (send OTP)
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<Object>} Login response
 */
export const login = async (phoneNumber) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const response = await api.post("/auth/login", {
      phoneNumber: formattedPhone,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // If user not found, try to register them first
      try {
        // Create a temporary user
        const registerResponse = await register({
          phoneNumber: phoneNumber,
          email: `${phoneNumber.replace(/\D/g, "")}@temp.com`, // Temporary email
          role:
            (await AsyncStorage.getItem("selected_role")) || "delivery-partner",
        });

        // If registration successful, return success response
        return {
          success: true,
          message: "OTP sent to your phone number",
          data: {
            phoneNumber: phoneNumber,
          },
        };
      } catch (regError) {
        console.error(
          "Auto-registration error:",
          regError.response?.data || regError.message
        );
        throw regError;
      }
    }
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify OTP and complete login
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - OTP received by user
 * @returns {Promise<Object>} Verification response with token
 */
export const verifyOTP = async (phoneNumber, otp) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const response = await api.post("/auth/verify-otp", {
      phoneNumber: formattedPhone,
      otp,
    });

    // Store token and user data in AsyncStorage
    if (
      response.data &&
      response.data.success &&
      response.data.data &&
      response.data.data.token
    ) {
      await AsyncStorage.setItem("auth_token", response.data.data.token);
      await AsyncStorage.setItem(
        "user_data",
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      "OTP verification error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Resend OTP
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<Object>} Response
 */
export const resendOTP = async (phoneNumber) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const response = await api.post("/auth/resend-otp", {
      phoneNumber: formattedPhone,
    });
    return response.data;
  } catch (error) {
    console.error("Resend OTP error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error(
      "Get user profile error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Check if user is logged in
 * @returns {Promise<boolean>} True if logged in
 */
export const isLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    return !!token;
  } catch (error) {
    console.error("Check login status error:", error);
    return false;
  }
};

/**
 * Get stored user data
 * @returns {Promise<Object|null>} User data or null
 */
export const getStoredUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Get stored user data error:", error);
    return null;
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user_data");
    await AsyncStorage.removeItem("selected_role");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
