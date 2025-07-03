import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { toast } from 'sonner-native';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deliveryPartnerService, authService, mediaService } from '../services';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Mock OTP for testing purposes
const MOCK_OTP = '123456';

// Define response type
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    userId?: string;
    url?: string;
    user?: {
      id?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

// Define the stack param list for navigation type
type RootStackParamList = {
  ThankYou: undefined;
  DeliveryUpload: { type: 'part-time' | 'full-time' };
  HomeScreen: undefined;
  RoleSelect: undefined;
  // add other routes if needed
};

// Add this email validation function after the imports
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function DeliveryUploadScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DeliveryUpload'>>();
  const { type } = route.params;
  const { login, verifyOTP, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadharUri, setAadharUri] = useState<string | null>(null);
  const [panUri, setPanUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Camera permission state
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  // OTP verification states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef<TextInput[]>([]);

  // Add this state variable with the other state variables
  const [showMockOtpHint, setShowMockOtpHint] = useState(false);
  const [backendOtp, setBackendOtp] = useState<string | null>(null);

  // Load stored data if available
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user_email');
        const storedPhone = await AsyncStorage.getItem('user_phone');
        const storedVehicle = await AsyncStorage.getItem('selected_vehicle');
        const storedFirstName = await AsyncStorage.getItem('user_first_name');
        const storedLastName = await AsyncStorage.getItem('user_last_name');

        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);
        if (storedVehicle) setVehicleType(storedVehicle);
        if (storedFirstName) setFirstName(storedFirstName);
        if (storedLastName) setLastName(storedLastName);

        // Don't load stored user ID - we'll get it from the current session
        // Clear any old user ID to avoid conflicts
        await AsyncStorage.removeItem('user_id');

        // If user context has user ID, use that
        if (user && user.id) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, [user]);

  // Check camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  const pickImage = async (setUri: (uri: string | null) => void) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Permission denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1.0,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUri(result.assets[0].uri);
        toast.success('Image selected successfully');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Failed to pick image');
    }
  };

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Permission denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1.0,
        videoMaxDuration: 30, // 30 seconds max
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check video duration if possible
        if (result.assets[0].duration && result.assets[0].duration > 30000) {
          toast.error('Video must be less than 30 seconds long');
          return;
        }

        setVideoUri(result.assets[0].uri);
        toast.success('Video selected successfully');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      toast.error('Failed to pick video');
    }
  };

  // Camera functions
  const takeSelfie = async () => {
    try {
      if (!cameraPermission) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Camera permission is required');
          return;
        }
        setCameraPermission(true);
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelfieUri(result.assets[0].uri);
        toast.success('Selfie taken successfully');
      }
    } catch (error) {
      console.error('Error taking selfie:', error);
      toast.error('Failed to take selfie');
    }
  };

  const recordVideo = async () => {
    try {
      if (!cameraPermission) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Camera permission is required');
          return;
        }
        setCameraPermission(true);
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 30, // 30 seconds max
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check video duration if possible
        if (result.assets[0].duration && result.assets[0].duration > 30000) {
          toast.error('Video must be less than 30 seconds long');
          return;
        }

        setVideoUri(result.assets[0].uri);
        toast.success('Video recorded successfully');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      toast.error('Failed to record video');
    }
  };

  // OTP handling functions
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    // Auto-focus previous input on backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const sendOtp = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    try {
      setLoading(true);

      // Store phone and email for later use
      await AsyncStorage.setItem('user_phone', phone);
      if (email) await AsyncStorage.setItem('user_email', email);
      if (firstName) await AsyncStorage.setItem('user_first_name', firstName);
      if (lastName) await AsyncStorage.setItem('user_last_name', lastName);

      // Try real OTP service first
      try {
        const response = await login(phone) as ApiResponse;

        if (response && response.success) {
          setOtpSent(true);

          // If the backend returned an OTP (for development/testing), use it
          if (response.data?.otp) {
            setBackendOtp(response.data.otp);
            toast.success(`OTP sent: ${response.data.otp}`);
            setShowMockOtpHint(true);
          } else {
            setBackendOtp(null);
            toast.success(response.message || 'OTP sent to your phone number');
          }

          // Store user ID if available
          if (response.data?.userId) {
            setUserId(response.data.userId);
            await AsyncStorage.setItem('user_id', response.data.userId);
          }

          // Focus first input
          otpRefs.current[0]?.focus();
        } else {
          toast.error(response.message || 'Failed to send OTP');
        }
      } catch (error: any) {
        console.error('Error sending OTP:', error);

        // Fallback to mock OTP if real service fails
        setBackendOtp(null);
        toast.success(`Mock OTP sent: ${MOCK_OTP}`);
        setOtpSent(true);
        setShowMockOtpHint(true);

        // Focus first input
        otpRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpCode = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsVerifying(true);

    try {
      // Use mock OTP verification for testing (including backend OTP)
      if (otpString === MOCK_OTP || (backendOtp && otpString === backendOtp)) {
        // Mock successful verification
        setIsOtpVerified(true);
        toast.success('OTP verified successfully (Mock)');

        // For mock OTP, we need to get the user ID from the auth context
        // or from the profile API
        try {
          const profileResponse = await deliveryPartnerService.getProfile() as ApiResponse;
          if (profileResponse && profileResponse.success && profileResponse.data) {
            // Extract user ID from profile data
            const userData = profileResponse.data;
            console.log('Got user data from profile:', userData);
            // The user ID should be available in the auth context now
          }
        } catch (profileError) {
          console.error('Error getting profile:', profileError);
        }

        // Register delivery partner
        await registerDeliveryPartner();
      } else {
        // Try real verification if mock fails
        try {
          const response = await verifyOTP(phone, otpString) as ApiResponse;

          if (response && response.success) {
            setIsOtpVerified(true);
            toast.success('OTP verified successfully');

            // Store user ID if available in response
            if (response.data?.user?.id) {
              setUserId(response.data.user.id);
              await AsyncStorage.setItem('user_id', response.data.user.id);
              console.log('User ID set from OTP verification:', response.data.user.id);
            }

            // Register delivery partner
            await registerDeliveryPartner();
          } else {
            toast.error(response.message || 'Invalid OTP. Please try again.');
          }
        } catch (error: any) {
          console.error('OTP verification error:', error);
          toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    setOtp(['', '', '', '', '', '']);
    setIsOtpVerified(false);

    try {
      setLoading(true);

      // Try real OTP service first
      try {
        const response = await authService.resendOTP(phone) as ApiResponse;

        if (response && response.success) {
          // If the backend returned an OTP (for development/testing), use it
          if (response.data?.otp) {
            setBackendOtp(response.data.otp);
            toast.success(`OTP resent: ${response.data.otp}`);
            setShowMockOtpHint(true);
          } else {
            setBackendOtp(null);
            toast.success(response.message || 'OTP resent to your phone number');
          }

          // Focus first input
          otpRefs.current[0]?.focus();
        } else {
          toast.error(response.message || 'Failed to resend OTP');
        }
      } catch (error: any) {
        console.error('Error resending OTP:', error);

        // Fallback to mock OTP if real service fails
        setBackendOtp(null);
        toast.success(`Mock OTP resent: ${MOCK_OTP}`);
        setShowMockOtpHint(true);

        // Focus first input
        otpRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const registerDeliveryPartner = async () => {
    try {
      setLoading(true);

      // Get the current user ID from state, context, or auth
      const currentUserId = userId || (user && user.id);

      console.log('Current user ID check:', {
        userId,
        userContextId: user?.id,
        currentUserId
      });

      // Check if user is already registered (we have userId from OTP verification)
      if (currentUserId) {
        // User is already registered, just upload documents
        console.log('User already registered, uploading documents...');
        console.log('Current user ID:', currentUserId);

        const uploadSuccess = await uploadDocuments();

        if (uploadSuccess) {
          // Navigate to thank you screen instead of home screen
          try {
            navigation.navigate('ThankYou');
          } catch (navError) {
            console.error('Navigation error:', navError);
            // If navigation fails, try to go back to role select
            navigation.navigate('RoleSelect');
          }
        } else {
          toast.error('Failed to upload documents. Please try again.');
        }
        return;
      }

      // If no user ID, we need to update the existing user with delivery partner details
      // instead of creating a new user
      console.log('Updating existing user with delivery partner details...');

      const updateData = {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        vehicleType: vehicleType || 'motorcycle',
        employmentType: type
      };

      // Update the existing user instead of creating a new one
      const response = await deliveryPartnerService.updateDeliveryPartnerDetails(updateData) as ApiResponse;

      if (response && response.success) {
        console.log('User details updated successfully');

        // After update, try to get the user ID from the auth context again
        const updatedUserId = user?.id;
        if (updatedUserId) {
          setUserId(updatedUserId);
          console.log('Updated user ID from context:', updatedUserId);
        }

        // Upload documents with the existing user ID
        const uploadSuccess = await uploadDocuments();

        if (uploadSuccess) {
          // Navigate to thank you screen instead of home screen
          try {
            navigation.navigate('ThankYou');
          } catch (navError) {
            console.error('Navigation error:', navError);
            // If navigation fails, try to go back to role select
            navigation.navigate('RoleSelect');
          }
        } else {
          toast.error('Registration successful but document upload failed. Please try again.');
        }
      } else {
        throw new Error('Failed to update user details');
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // If update fails, try to upload documents anyway with existing user ID
      console.log('Update failed, trying to upload documents with existing user...');
      try {
        const uploadSuccess = await uploadDocuments();
        if (uploadSuccess) {
          try {
            navigation.navigate('ThankYou');
          } catch (navError) {
            console.error('Navigation error:', navError);
            navigation.navigate('RoleSelect');
          }
          return;
        } else {
          toast.error('Document upload failed. Please try again.');
        }
      } catch (uploadError) {
        console.error('Document upload error:', uploadError);
        toast.error('Failed to upload documents. Please try again.');
      }

      Alert.alert(
        'Registration Error',
        error.response?.data?.message || 'Failed to register. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadDocuments = async () => {
    try {
      console.log('Starting document upload process...');
      console.log('User ID:', userId);
      console.log('User context:', user?.id);

      let uploadCount = 0;
      const totalDocuments = [aadharUri, panUri, selfieUri, videoUri].filter(Boolean).length;

      // Upload Aadhar
      if (aadharUri) {
        console.log('Uploading Aadhar...');
        await uploadFile(aadharUri, 'aadhar');
        uploadCount++;
      }

      // Upload PAN
      if (panUri) {
        console.log('Uploading PAN...');
        await uploadFile(panUri, 'pan');
        uploadCount++;
      }

      // Upload selfie
      if (selfieUri) {
        console.log('Uploading selfie...');
        await uploadFile(selfieUri, 'selfie');
        uploadCount++;
      }

      // Upload video
      if (videoUri) {
        console.log('Uploading video...');
        await uploadFile(videoUri, 'video');
        uploadCount++;
      }

      console.log(`Successfully uploaded ${uploadCount}/${totalDocuments} documents`);
      toast.success(`Successfully uploaded ${uploadCount} documents`);

      return true;
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error('Failed to upload some documents. Please try again.');
      return false;
    }
  };

  const uploadFile = async (uri: string, type: string) => {
    try {
      const formData = new FormData();

      // Get file name and type
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      // @ts-ignore
      formData.append('file', {
        uri,
        name: `${type}_${Date.now()}.${fileType}`,
        type: `${type === 'video' ? 'video' : 'image'}/${fileType}`
      });

      // Add metadata to ensure proper organization in Cloudinary
      formData.append('folder', 'delivery-partner');

      // Send phone number instead of user ID - backend will find user by phone
      console.log(`Uploading ${type} for phone: ${phone}`);
      formData.append('phoneNumber', phone);

      // Use public upload endpoint during registration
      const response = await mediaService.uploadDocumentPublic(formData, 'delivery-partner', type) as ApiResponse;

      if (response && response.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);

        // Store the document URL locally for future reference
        if (response.data) {
          if (response.data.url) {
            await AsyncStorage.setItem(`document_${type}_url`, response.data.url);
          }
        }
      }

      return response;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}. Please try again.`);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Comprehensive validation for all required fields
    const missingFields = [];

    // Basic information validation
    if (!firstName) missingFields.push('First Name');
    if (!lastName) missingFields.push('Last Name');
    if (!phone || phone.length !== 10) missingFields.push('Valid Phone Number (10 digits)');
    if (!email || !isValidEmail(email)) missingFields.push('Valid Email Address (e.g., user@example.com)');

    // Documents validation
    if (!aadharUri) missingFields.push('Aadhar Card');
    if (!panUri) missingFields.push('PAN Card');
    if (!selfieUri) missingFields.push('Selfie');
    if (!videoUri) missingFields.push('Verification Video');

    // If any required fields are missing, show toast and return
    if (missingFields.length > 0) {
      toast.error(`Please provide: ${missingFields.join(', ')}`);
      return;
    }

    // If OTP already verified, register directly
    if (isOtpVerified) {
      await registerDeliveryPartner();
    } else {
      // Send OTP first
      await sendOtp();
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate personal info
      if (!firstName) {
        toast.error('Please enter your first name');
        return;
      }
      if (!lastName) {
        toast.error('Please enter your last name');
        return;
      }
      if (!phone || phone.length !== 10) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
      if (!email || !isValidEmail(email)) {
        toast.error('Please enter a valid email address (e.g., user@example.com)');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate documents
      const missingDocs = [];
      if (!aadharUri) missingDocs.push('Aadhar Card');
      if (!panUri) missingDocs.push('PAN Card');
      if (!selfieUri) missingDocs.push('Selfie');
      if (!videoUri) missingDocs.push('Verification Video');

      if (missingDocs.length > 0) {
        toast.error(`Please upload: ${missingDocs.join(', ')}`);
        return;
      }
      setCurrentStep(3);
      // Send OTP when moving to OTP verification step
      sendOtp();
    } else {
      // On step 3 (OTP), verify OTP
      if (!isOtpVerified) {
        verifyOtpCode();
      } else {
        registerDeliveryPartner();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={["#FFE9A0", "#F6FFCD"]}
        locations={[0.25, 0.5]}
        style={styles.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={prevStep}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Partner Registration</Text>
      </View>

      <View style={styles.stepIndicatorContainer}>
        <View style={[styles.stepIndicator, currentStep >= 1 && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepIndicator, currentStep >= 2 && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepIndicator, currentStep >= 3 && styles.activeStep]}>
          <Text style={[styles.stepNumber, currentStep >= 3 && styles.activeStepNumber]}>3</Text>
        </View>
      </View>

      <View style={styles.stepLabelContainer}>
        <Text style={[styles.stepLabel, currentStep >= 1 && styles.activeStepLabel]}>Personal Info</Text>
        <Text style={[styles.stepLabel, currentStep >= 2 && styles.activeStepLabel]}>Documents</Text>
        <Text style={[styles.stepLabel, currentStep >= 3 && styles.activeStepLabel]}>OTP Verify</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {currentStep === 1 ? (
          <View style={styles.formContainer}>
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="user-circle" size={24} color="#4361EE" />
                <Text style={styles.cardTitle}>Personal Information</Text>
              </View>

              <Text style={styles.subtitle}>You selected: <Text style={styles.highlightText}>{type === 'part-time' ? 'Part-Time' : 'Full-Time'}</Text></Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your first name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your last name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <Text style={styles.requiredFieldsNote}>* All fields are required</Text>
            </View>
          </View>
        ) : currentStep === 2 ? (
          <View style={styles.formContainer}>
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="id-card" size={24} color="#4361EE" />
                <Text style={styles.cardTitle}>Document Verification</Text>
              </View>

              <Text style={styles.subtitle}>Upload the required documents *</Text>

              <View style={styles.documentSection}>
                <Text style={styles.documentTitle}>Aadhar Card *</Text>
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() => pickImage(setAadharUri)}
                >
                  {aadharUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: aadharUri }} style={styles.documentPreview} />
                      <View style={styles.checkOverlay}>
                        <MaterialIcons name="check-circle" size={36} color="#4CC9F0" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <MaterialIcons name="badge" size={48} color="#4361EE" />
                      <View style={styles.uploadOverlay}>
                        <Ionicons name="cloud-upload-outline" size={32} color="#fff" />
                        <Text style={styles.uploadText}>Upload Aadhar</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.documentTitle}>PAN Card *</Text>
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() => pickImage(setPanUri)}
                >
                  {panUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: panUri }} style={styles.documentPreview} />
                      <View style={styles.checkOverlay}>
                        <MaterialIcons name="check-circle" size={36} color="#4CC9F0" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <MaterialIcons name="credit-card" size={48} color="#4361EE" />
                      <View style={styles.uploadOverlay}>
                        <Ionicons name="cloud-upload-outline" size={32} color="#fff" />
                        <Text style={styles.uploadText}>Upload PAN</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.documentTitle}>Live Selfie *</Text>
                <TouchableOpacity
                  style={[styles.uploadContainer, styles.selfieContainer]}
                  onPress={takeSelfie}
                >
                  {selfieUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: selfieUri }} style={styles.selfiePreview} />
                      <View style={styles.checkOverlay}>
                        <MaterialIcons name="check-circle" size={36} color="#4CC9F0" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="person-circle-outline" size={64} color="#4361EE" />
                      <View style={styles.uploadOverlay}>
                        <Ionicons name="camera-outline" size={32} color="#fff" />
                        <Text style={styles.uploadText}>Take Live Selfie</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.documentTitle}>Verification Video *</Text>
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={recordVideo}
                >
                  {videoUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Video source={{ uri: videoUri }} style={styles.documentPreview} useNativeControls resizeMode={ResizeMode.COVER} />
                      <View style={styles.checkOverlay}>
                        <MaterialIcons name="check-circle" size={36} color="#4CC9F0" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="videocam" size={48} color="#4361EE" />
                      <View style={styles.uploadOverlay}>
                        <Ionicons name="videocam-outline" size={32} color="#fff" />
                        <Text style={styles.uploadText}>Record Live Video</Text>
                        <Text style={styles.videoDurationNote}>(Max 30 seconds)</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.requiredFieldsNote}>* All documents are required</Text>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#4361EE" />
                <Text style={styles.cardTitle}>OTP Verification</Text>
              </View>

              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code to your phone number ending with {phone.slice(-4)}
              </Text>

              {showMockOtpHint && (
                <View style={styles.mockOtpHint}>
                  <Text style={styles.mockOtpHintText}>
                    For testing, use OTP: <Text style={styles.mockOtpValue}>{backendOtp || MOCK_OTP}</Text>
                  </Text>
                </View>
              )}

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) otpRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : {},
                      isOtpVerified ? styles.otpInputVerified : {}
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    editable={!isOtpVerified}
                  />
                ))}
              </View>

              {!isOtpVerified && (
                <View style={styles.otpActions}>
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={verifyOtpCode}
                    disabled={isVerifying || otp.join('').length !== 6}
                  >
                    <Text style={[
                      styles.verifyButtonText,
                      (isVerifying || otp.join('').length !== 6) && styles.verifyButtonTextDisabled
                    ]}>
                      {isVerifying ? 'Verifying...' : 'Verify OTP'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={resendOtp}
                    disabled={isVerifying}
                  >
                    <Text style={styles.resendButtonText}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isOtpVerified && (
                <View style={styles.verificationSuccess}>
                  <MaterialIcons name="check-circle" size={32} color="#4CC9F0" />
                  <Text style={styles.verificationSuccessText}>Phone number verified successfully!</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.prevButton]}
          onPress={prevStep}
        >
          <Text style={[styles.buttonText, styles.prevButtonText]}>{currentStep === 1 ? 'Back' : 'Previous'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            currentStep === 3 && !isOtpVerified && styles.disabledButton
          ]}
          onPress={nextStep}
          disabled={currentStep === 3 && !isOtpVerified && otp.join('').length !== 6}
        >
          <Text style={[styles.buttonText, styles.nextButtonText]}>
            {currentStep === 3
              ? (isOtpVerified ? 'Submit' : 'Verify & Submit')
              : currentStep === 2
                ? 'Send OTP'
                : 'Next'
            }
          </Text>
          <Ionicons
            name={currentStep === 3 ? "checkmark-circle" : currentStep === 2 ? "send" : "arrow-forward"}
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255,255,255,0.5)',
    backgroundColor: '#fff',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
    marginTop: 10,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  activeStep: {
    backgroundColor: '#fff',
    opacity: 100,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  activeStepNumber: {
    color: '#000',
    // textDecorationLine: 'underline',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#000',
    opacity: 0.5,
    marginHorizontal: 10,
  },
  stepLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 8,
    marginBottom: 20,
  },
  stepLabel: {
    fontSize: 14,
    color: '#000',
  },
  activeStepLabel: {
    color: '#000',
    fontWeight: '600',
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  formContainer: {
    width: '100%',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
  },
  highlightText: {
    color: '#4361EE',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 10,
    fontSize: 16,
  },
  documentSection: {
    marginBottom: 20,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  uploadContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  selfieContainer: {
    height: 200,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  documentPlaceholder: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  selfiePlaceholder: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selfiePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  prevButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  nextButton: {
    backgroundColor: '#4361EE',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  prevButtonText: {
    color: '#4361EE',
  },
  nextButtonText: {
    color: '#fff',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  // OTP Verification Styles
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#F8F8F8',
  },
  otpInputFilled: {
    borderColor: '#4361EE',
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  otpInputVerified: {
    borderColor: '#4CC9F0',
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
  },
  otpActions: {
    alignItems: 'center',
    marginTop: 20,
  },
  verifyButton: {
    backgroundColor: '#4361EE',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 150,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonTextDisabled: {
    opacity: 0.6,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  resendButtonText: {
    color: '#4361EE',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  verificationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  verificationSuccessText: {
    color: '#4CC9F0',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  checkOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 10,
    fontStyle: 'italic',
  },
  videoDurationNote: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
  },
  mockOtpHint: {
    backgroundColor: 'rgba(255, 233, 160, 0.5)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
    alignItems: 'center',
  },
  mockOtpHintText: {
    fontSize: 14,
    color: '#333',
  },
  mockOtpValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4361EE',
  },
});