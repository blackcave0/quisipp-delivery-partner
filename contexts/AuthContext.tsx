import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services';

// Define types
interface User {
  id?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  isVerified?: boolean;
  profile?: any;
  documents?: any;
  deliveryPartnerDetails?: any;
  businessOwnerDetails?: any;
  [key: string]: any;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string) => Promise<any>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserData: (userData: User) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user data from storage on app start
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUserData = await AsyncStorage.getItem('user_data');

        if (storedToken && storedUserData) {
          setToken(storedToken);
          setUser(JSON.parse(storedUserData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Login function - sends OTP
  const login = async (phoneNumber: string) => {
    try {
      return await authService.login(phoneNumber);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Verify OTP and complete login
  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      const response = await authService.verifyOTP(phoneNumber, otp) as AuthResponse;

      if (response.success && response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user data in context
  const updateUserData = (userData: User) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));

    // Also update in AsyncStorage
    AsyncStorage.setItem('user_data', JSON.stringify({
      ...user,
      ...userData
    }));
  };

  // Context value
  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    verifyOTP,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 