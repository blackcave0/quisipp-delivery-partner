import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { toast } from 'sonner-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
  Feather
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { businessOwnerService, authService, mediaService } from '../services';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const categoriesList = [
  { id: 'food', name: 'Food', icon: 'food' },
  { id: 'groceries', name: 'Groceries', icon: 'shopping' },
  { id: 'electronics', name: 'Electronics', icon: 'laptop' },
  { id: 'clothing', name: 'Clothing', icon: 'tshirt-crew' },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'medical-bag' },
  { id: 'beauty', name: 'Beauty', icon: 'spray-bottle' },
  { id: 'furniture', name: 'Furniture', icon: 'sofa' },
  { id: 'other', name: 'Other', icon: 'dots-horizontal' }
];

type RootStackParamList = {
  Splash: undefined;
  ThankYou: undefined;
  HomeScreen: undefined;
  // add other routes here if needed
};

export default function BusinessUploadScreen() {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
  const { login, verifyOTP } = useAuth();
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [hasGstin, setHasGstin] = useState(false);
  const [aadharUri, setAadharUri] = useState<string | null>(null);
  const [panUri, setPanUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [shopImageUri, setShopImageUri] = useState<string | null>(null);
  const [shopVideoUri, setShopVideoUri] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState(0);

  // OTP verification states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef<TextInput[]>([]);

  // pincode
  const [pincode, setPincode] = useState('');

  // Add userId state
  const [userId, setUserId] = useState<string | null>(null);

  // Load stored data if available
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user_email');
        const storedPhone = await AsyncStorage.getItem('user_phone');
        const storedUserId = await AsyncStorage.getItem('user_id');

        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);
        if (storedUserId) setUserId(storedUserId);
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  // Check camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      // Store permission status if needed
    })();
  }, []);

  const pickImage = async (setter: (uri: string | null) => void) => {
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
        setter(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Failed to pick image');
    }
  };

  const pickVideo = async (setter: (uri: string | null) => void) => {
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
        videoMaxDuration: 60, // 1 minute max
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check video duration if possible
        if (result.assets[0].duration && result.assets[0].duration > 60000) {
          toast.error('Video must be less than 1 minute long');
          return;
        }

        setter(result.assets[0].uri);
        toast.success('Video selected successfully');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      toast.error('Failed to pick video');
    }
  };


  const takeSelfie = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [1, 1],
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelfieUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking selfie:', error);
      toast.error('Failed to take selfie');
    }
  };

  const recordVideo = async (setter: (uri: string | null) => void) => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 60, // 1 minute max
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check video duration if possible
        if (result.assets[0].duration && result.assets[0].duration > 60000) {
          toast.error('Video must be less than 1 minute long');
          return;
        }

        setter(result.assets[0].uri);
        toast.success('Video recorded successfully');
      }
    } catch (error) {
      console.error('Error recording video:', error);
      toast.error('Failed to record video');
    }
  };

  const toggleCategory = (catId: string) => {
    setCategories(prev =>
      prev.includes(catId)
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
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

    // Auto-verify when all digits are filled
    if (index === 5 && value) {
      const completeOtp = [...newOtp.slice(0, 5), value].join('');
      if (completeOtp.length === 6 && !isVerifying && !isOtpVerified) {
        // Add a slight delay to allow UI to update
        setTimeout(() => {
          verifyOtpCode();
        }, 300);
      }
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

      // Send OTP request
      const response = await login(phone);
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        setOtpSent(true);
        toast.success('OTP sent to your phone number');
        // Focus first input
        otpRefs.current[0]?.focus();
      } else {
        toast.error((response as any).message || 'Failed to send OTP');
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

    // Prevent duplicate verification attempts
    if (isVerifying || isOtpVerified) {
      return;
    }

    setIsVerifying(true);

    try {
      toast.info('Verifying OTP...');
      const response = await verifyOTP(phone, otpString);

      if (response && typeof response === 'object' && 'success' in response && response.success) {
        setIsOtpVerified(true);
        toast.success('OTP verified successfully');

        // Store the user ID from the response
        if (response.data && response.data.user && response.data.user.id) {
          const id = response.data.user.id;
          setUserId(id);
          // Also store in AsyncStorage for persistence
          await AsyncStorage.setItem('user_id', id);
          console.log('User ID stored:', id);

          // Wait a moment to ensure the user ID is properly saved
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Upload documents one by one with delays between them
          toast.info('Starting document upload process...');
          try {
            // Upload documents with delays between each to avoid race conditions
            if (aadharUri) {
              await uploadFile(aadharUri, 'aadhar');
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (panUri) {
              await uploadFile(panUri, 'pan');
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (selfieUri) {
              await uploadFile(selfieUri, 'selfie');
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (videoUri) {
              await uploadFile(videoUri, 'video');
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (shopImageUri) {
              await uploadFile(shopImageUri, 'business-image');
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (shopVideoUri) {
              await uploadFile(shopVideoUri, 'business-video');
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            toast.success('Documents uploaded successfully');

            // Then register business owner with document references
            await registerBusinessOwner();
          } catch (error) {
            console.error('Document upload error:', error);
            toast.error('Some documents failed to upload. You can still continue with registration.');
            await registerBusinessOwner();
          }
        } else {
          console.error('User ID not found in response:', response);
          toast.error('Failed to get user ID. Please try again.');
        }
      } else {
        // Clear OTP fields on failure
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        toast.error((response as any).message || 'Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      // Clear OTP fields on error
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
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
      const response = await authService.resendOTP(phone);

      if (response && typeof response === 'object' && 'success' in response && response.success) {
        toast.success('OTP resent to your phone number');
        // Focus first input
        otpRefs.current[0]?.focus();
      } else {
        toast.error((response as any).message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const registerBusinessOwner = async () => {
    // Only proceed if we have a user ID
    if (!userId) {
      toast.error('Missing user ID. Please try again.');
      return false;
    }

    try {
      setLoading(true);
      toast.info('Finalizing registration...');

      // Register business owner
      const registrationData = {
        userId, // Include the user ID
        email,
        phoneNumber: phone,
        businessName,
        businessType,
        gstin,
        categories,
        businessAddress: address,
        pincode,
      };

      const response = await businessOwnerService.registerBusinessOwner(registrationData);

      // TypeScript fix: check if response is an object with success property
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        toast.success('Registration completed successfully!');

        // Navigate to thank you screen
        navigation.navigate('ThankYou');
        return true;
      } else {
        toast.error('Registration failed. Please try again.');
        return false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Error',
        error.response?.data?.message || 'Failed to register. Please try again.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocuments = async () => {
    try {
      setLoading(true);
      toast.info('Uploading documents, please wait...');

      // Track upload progress
      let uploadedCount = 0;
      let failedUploads = [];
      const totalDocuments = [aadharUri, panUri, selfieUri, videoUri, shopImageUri, shopVideoUri].filter(Boolean).length;

      // Upload Aadhar
      if (aadharUri) {
        try {
          await uploadFile(aadharUri, 'aadhar');
          uploadedCount++;
          toast.info(`Uploading documents (${uploadedCount}/${totalDocuments})...`);
        } catch (error) {
          console.error('Failed to upload Aadhar:', error);
          failedUploads.push('Aadhar Card');
        }
      }

      // Upload PAN
      if (panUri) {
        try {
          await uploadFile(panUri, 'pan');
          uploadedCount++;
          toast.info(`Uploading documents (${uploadedCount}/${totalDocuments})...`);
        } catch (error) {
          console.error('Failed to upload PAN:', error);
          failedUploads.push('PAN Card');
        }
      }

      // Upload selfie
      if (selfieUri) {
        try {
          await uploadFile(selfieUri, 'selfie');
          uploadedCount++;
          toast.info(`Uploading documents (${uploadedCount}/${totalDocuments})...`);
        } catch (error) {
          console.error('Failed to upload Selfie:', error);
          failedUploads.push('Selfie');
        }
      }

      // Upload verification video
      if (videoUri) {
        try {
          await uploadFile(videoUri, 'video');
          uploadedCount++;
          toast.info(`Uploading documents (${uploadedCount}/${totalDocuments})...`);
        } catch (error) {
          console.error('Failed to upload Video:', error);
          failedUploads.push('Verification Video');
        }
      }

      // Upload business images
      if (shopImageUri) {
        try {
          await uploadFile(shopImageUri, 'business-image');
          uploadedCount++;
          toast.info(`Uploading documents (${uploadedCount}/${totalDocuments})...`);
        } catch (error) {
          console.error('Failed to upload Shop Image:', error);
          failedUploads.push('Shop Image');
        }
      }

      // Upload business video
      if (shopVideoUri) {
        try {
          await uploadFile(shopVideoUri, 'business-video');
          uploadedCount++;
          toast.info(`Uploading documents (${uploadedCount}/${totalDocuments})...`);
        } catch (error) {
          console.error('Failed to upload Shop Video:', error);
          failedUploads.push('Shop Video');
        }
      }

      // Check if any uploads failed
      if (failedUploads.length > 0) {
        toast.error(`Failed to upload: ${failedUploads.join(', ')}. You can continue with registration.`);
        // Return true anyway to allow registration to continue
        return true;
      }

      toast.success('All documents uploaded successfully!');
      return true;
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error('Failed to upload some documents. You can still continue with registration.');
      // Return true to allow registration to continue even if document uploads fail
      return true;
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (uri: string, type: string) => {
    try {
      const formData = new FormData();

      // Get file name and type
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1].toLowerCase();

      // Ensure we have a valid file type
      const validFileType = ['jpg', 'jpeg', 'png', 'mp4', 'mov'].includes(fileType)
        ? fileType
        : (type.includes('video') ? 'mp4' : 'jpeg');

      const isVideo = type === 'business-video' || type === 'video';
      const mimePrefix = isVideo ? 'video' : 'image';
      const mimeType = isVideo
        ? (fileType === 'mov' ? 'video/quicktime' : 'video/mp4')
        : (fileType === 'png' ? 'image/png' : 'image/jpeg');

      const fileName = `${type}_${new Date().getTime()}.${validFileType}`;

      console.log(`Preparing to upload ${type}:`, {
        uri,
        name: fileName,
        type: mimeType,
        isVideo,
        fileType
      });

      // @ts-ignore
      formData.append('file', {
        uri,
        name: fileName,
        type: mimeType
      });

      // Add user identification - include userId if available
      if (userId) {
        formData.append('userId', userId);
        console.log('Including userId in upload:', userId);
      } else {
        // Try to get userId from AsyncStorage as fallback
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          formData.append('userId', storedUserId);
          console.log('Including stored userId in upload:', storedUserId);
        } else {
          console.warn('No userId available for upload!');
        }
      }

      // Include phone and email as backup identification
      formData.append('phoneNumber', phone);
      if (email) formData.append('email', email);

      // Log the form data for debugging
      console.log(`FormData for ${type} upload:`, Object.fromEntries(formData as any));

      // Use public upload endpoint since user might not be authenticated yet
      console.log(`Uploading ${type} to server...`);
      const response = await mediaService.uploadDocumentPublic(formData, 'business-owner', type);
      console.log(`Upload response for ${type}:`, response);

      if (response && typeof response === 'object' && 'success' in response && response.success) {
        // TypeScript fix: ensure response.data exists and has url property
        const responseData = response as { data?: { url?: string } };
        if (responseData.data?.url) {
          console.log(`${type} uploaded successfully:`, responseData.data.url);
          return responseData.data;
        }
        return true;
      } else {
        const errorMessage = response && typeof response === 'object' && 'message' in response
          ? response.message
          : 'Unknown error';
        throw new Error(`Failed to upload ${type}: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error);
      console.error(`Error details:`, error.response?.data || error.message);
      toast.error(`Failed to upload ${type}. ${error.message || 'Please try again.'}`);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Comprehensive validation for all required fields
    const missingFields = [];

    // Basic information validation
    if (!phone || phone.length !== 10) missingFields.push('Valid Phone Number (10 digits)');
    if (!email || !email.includes('@')) missingFields.push('Valid Email Address');
    if (!businessName) missingFields.push('Business Name');
    if (hasGstin && !gstin) missingFields.push('GSTIN Number');
    if (!address) missingFields.push('Shop Address');
    if (!pincode) missingFields.push('Pincode');

    // Categories validation
    if (categories.length === 0) missingFields.push('At least one Business Category');

    // Personal documents validation
    if (!aadharUri) missingFields.push('Aadhar Card');
    if (!panUri) missingFields.push('PAN Card');
    if (!selfieUri) missingFields.push('Selfie');
    if (!videoUri) missingFields.push('Verification Video');

    // Business documents validation
    if (!shopImageUri) missingFields.push('Shop Image');
    if (!shopVideoUri) missingFields.push('Shop Video');

    // If any required fields are missing, show toast and return
    if (missingFields.length > 0) {
      toast.error(`Please provide: ${missingFields.join(', ')}`);
      return;
    }

    // If OTP is already verified, show completion message
    if (isOtpVerified) {
      toast.success('Registration already completed!');
      return;
    }

    // If OTP is not verified but filled, verify it
    const otpString = otp.join('');
    if (otpString.length === 6) {
      await verifyOtpCode();
      return;
    }

    // If OTP is not verified and not yet sent or not complete, send OTP
    if (!otpSent || otpString.length < 6) {
      await sendOtp();
      toast.info('Please enter the OTP sent to your phone');
      // Focus first input if empty
      if (!otp[0]) {
        otpRefs.current[0]?.focus();
      }
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentSection + 1) * 20}%` }]} />
        </View>
        <View style={styles.progressSteps}>
          {[0, 1, 2, 3, 4].map(step => (
            <View
              key={step}
              style={[
                styles.progressStep,
                step <= currentSection ? styles.progressStepActive : {}
              ]}
            >
              {step < currentSection ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text style={step === currentSection ? styles.progressStepTextActive : styles.progressStepText}>
                  {step + 1}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return renderBasicInfoSection();
      case 1:
        return renderCategoriesSection();
      case 2:
        return renderPersonalDocumentsSection();
      case 3:
        return renderBusinessDocumentsSection();
      case 4:
        return renderOtpVerificationSection();
      default:
        return null;
    }
  };

  const renderBasicInfoSection = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="account-details" size={24} color="#4361EE" />
          <Text style={styles.sectionTitle}>Basic Information</Text>
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="phone" size={20} color="#4361EE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number (10 digits) *"
            keyboardType="phone-pad"
            value={phone}
            maxLength={10}
            onChangeText={setPhone}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#4361EE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address *"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="business" size={20} color="#4361EE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Business Name *"
            value={businessName}
            onChangeText={setBusinessName}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setHasGstin(!hasGstin)}
        >
          <View style={[styles.checkbox, hasGstin && styles.checkboxChecked]}>
            {hasGstin && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Do you have GSTIN number?</Text>
        </TouchableOpacity>

        {hasGstin && (
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="identifier" size={20} color="#4361EE" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="GSTIN Number *"
              value={gstin}
              onChangeText={setGstin}
              placeholderTextColor="#999"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <MaterialIcons name="store" size={20} color="#4361EE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Shop Address *"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={20} color="#4361EE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Pincode *"
            value={pincode}
            keyboardType="phone-pad"
            maxLength={6}
            onChangeText={setPincode}
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.requiredFieldsNote}>* All fields are required</Text>
      </View>
    );
  };

  const renderCategoriesSection = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="shape" size={24} color="#4361EE" />
          <Text style={styles.sectionTitle}>Business Categories</Text>
        </View>

        <Text style={styles.sectionDescription}>
          Select all categories that apply to your business *
        </Text>

        <View style={styles.categoriesGrid}>
          {categoriesList.map(cat => {
            const isEnabled = cat.id === 'food' || cat.id === 'groceries';
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  categories.includes(cat.id) && isEnabled && styles.categoryCardSelected,
                  !isEnabled && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (isEnabled) {
                    toggleCategory(cat.id);
                  }
                }}
                activeOpacity={isEnabled ? 0.7 : 1}
                disabled={!isEnabled}
              >
                <View style={[
                  styles.categoryIconContainer,
                  categories.includes(cat.id) && isEnabled && styles.categoryIconContainerSelected
                ]}>
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={24}
                    color={categories.includes(cat.id) && isEnabled ? "#fff" : "#4361EE"}
                  />
                </View>
                <Text style={[
                  styles.categoryText,
                  categories.includes(cat.id) && isEnabled && styles.categoryTextSelected
                ]}>
                  {cat.name}
                </Text>
                {!isEnabled && (
                  <Text style={{ fontSize: 10, color: '#999', marginTop: 4 }}>Coming Soon</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.requiredFieldsNote}>* At least one category must be selected</Text>
      </View>
    );
  };

  const renderPersonalDocumentsSection = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="card-account-details" size={24} color="#4361EE" />
          <Text style={styles.sectionTitle}>Personal Documents</Text>
        </View>

        <Text style={styles.sectionDescription}>
          Upload your personal identification documents *
        </Text>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="card-account-details" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>Aadhar Card *</Text>
          </View>
          <TouchableOpacity
            style={[styles.documentUpload, aadharUri && styles.documentUploaded]}
            onPress={() => pickImage(setAadharUri)}
          >
            {aadharUri ? (
              <>
                <Image source={{ uri: aadharUri }} style={styles.documentPreview} />
                <View style={styles.documentOverlay}>
                  <MaterialIcons name="check-circle" size={32} color="#4CC9F0" />
                  <Text style={styles.documentUploadedText}>Uploaded</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="cloud-upload" size={40} color="#4361EE" />
                <Text style={styles.documentUploadText}>Tap to upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="card-bulleted" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>PAN Card *</Text>
          </View>
          <TouchableOpacity
            style={[styles.documentUpload, panUri && styles.documentUploaded]}
            onPress={() => pickImage(setPanUri)}
          >
            {panUri ? (
              <>
                <Image source={{ uri: panUri }} style={styles.documentPreview} />
                <View style={styles.documentOverlay}>
                  <MaterialIcons name="check-circle" size={32} color="#4CC9F0" />
                  <Text style={styles.documentUploadedText}>Uploaded</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="cloud-upload" size={40} color="#4361EE" />
                <Text style={styles.documentUploadText}>Tap to upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="face-recognition" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>Live Selfie *</Text>
          </View>
          <TouchableOpacity
            style={[styles.documentUpload, selfieUri && styles.documentUploaded]}
            onPress={() => takeSelfie()}
          >
            {selfieUri ? (
              <>
                <Image source={{ uri: selfieUri }} style={styles.documentPreview} />
                <View style={styles.documentOverlay}>
                  <MaterialIcons name="check-circle" size={32} color="#4CC9F0" />
                  <Text style={styles.documentUploadedText}>Uploaded</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="camera" size={40} color="#4361EE" />
                <Text style={styles.documentUploadText}>Take Live Selfie</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="video" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>Verification Video *</Text>
          </View>
          <TouchableOpacity
            style={[styles.documentUpload, videoUri && styles.documentUploaded]}
            onPress={() => recordVideo(setVideoUri)}
          >
            {videoUri ? (
              <>
                <Video
                  source={{ uri: videoUri }}
                  style={styles.documentPreview}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                />
                <View style={styles.documentOverlay}>
                  <MaterialIcons name="check-circle" size={32} color="#4CC9F0" />
                  <Text style={styles.documentUploadedText}>Uploaded</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="video-plus" size={40} color="#4361EE" />
                <Text style={styles.documentUploadText}>Record Live Video</Text>
                <Text style={styles.videoDurationNote}>(Max 1 minute)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.requiredFieldsNote}>* All documents are required</Text>
      </View>
    );
  };

  const renderBusinessDocumentsSection = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="store" size={24} color="#4361EE" />
          <Text style={styles.sectionTitle}>Business Documents</Text>
        </View>

        <Text style={styles.sectionDescription}>
          Upload your shop images and videos *
        </Text>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="storefront" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>Shop Image *</Text>
          </View>
          <TouchableOpacity
            style={[styles.documentUpload, shopImageUri && styles.documentUploaded]}
            onPress={() => pickImage(setShopImageUri)}
          >
            {shopImageUri ? (
              <>
                <Image source={{ uri: shopImageUri }} style={styles.documentPreview} />
                <View style={styles.documentOverlay}>
                  <MaterialIcons name="check-circle" size={32} color="#4CC9F0" />
                  <Text style={styles.documentUploadedText}>Uploaded</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="store-plus" size={40} color="#4361EE" />
                <Text style={styles.documentUploadText}>Tap to upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="video-box" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>Shop Video *</Text>
          </View>
          <TouchableOpacity
            style={[styles.documentUpload, shopVideoUri && styles.documentUploaded]}
            onPress={() => pickVideo(setShopVideoUri)}
          >
            {shopVideoUri ? (
              <>
                <Video
                  source={{ uri: shopVideoUri }}
                  style={styles.documentPreview}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                />
                <View style={styles.documentOverlay}>
                  <MaterialIcons name="check-circle" size={32} color="#4CC9F0" />
                  <Text style={styles.documentUploadedText}>Uploaded</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="video-plus" size={40} color="#4361EE" />
                <Text style={styles.documentUploadText}>Tap to upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.requiredFieldsNote}>* All documents are required</Text>
      </View>
    );
  };

  const renderOtpVerificationSection = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#4361EE" />
          <Text style={styles.sectionTitle}>OTP Verification</Text>
        </View>

        <Text style={styles.sectionDescription}>
          We've sent a 6-digit verification code to your phone number ending with {phone.slice(-4)}
        </Text>

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
              editable={!isOtpVerified && !isVerifying}
            />
          ))}
        </View>

        {isVerifying && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4361EE" />
            <Text style={styles.loadingText}>Verifying OTP...</Text>
          </View>
        )}

        {!isOtpVerified && !isVerifying && (
          <View style={styles.otpActions}>
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
    );
  };

  const renderNavButtons = () => {
    const validateCurrentSection = () => {
      const missingFields = [];

      switch (currentSection) {
        case 0: // Basic Information
          if (!phone || phone.length !== 10) missingFields.push('Valid Phone Number');
          if (!email || !email.includes('@')) missingFields.push('Valid Email');
          if (!businessName) missingFields.push('Business Name');
          if (hasGstin && !gstin) missingFields.push('GSTIN Number');
          if (!address) missingFields.push('Shop Address');
          if (!pincode) missingFields.push('Pincode');
          break;
        case 1: // Categories
          if (categories.length === 0) missingFields.push('At least one Business Category');
          break;
        case 2: // Personal Documents
          if (!aadharUri) missingFields.push('Aadhar Card');
          if (!panUri) missingFields.push('PAN Card');
          if (!selfieUri) missingFields.push('Selfie');
          if (!videoUri) missingFields.push('Verification Video');
          break;
        case 3: // Business Documents
          if (!shopImageUri) missingFields.push('Shop Image');
          if (!shopVideoUri) missingFields.push('Shop Video');
          break;
      }

      if (missingFields.length > 0) {
        toast.error(`Please provide: ${missingFields.join(', ')}`);
        return false;
      }

      return true;
    };

    const handleNextPress = () => {
      if (validateCurrentSection()) {
        if (currentSection === 3) {
          // Send OTP when moving to OTP verification section
          sendOtp();
        }
        setCurrentSection(prev => prev + 1);
      }
    };

    // Check if submit button should be disabled
    const isSubmitDisabled = () => {
      // Disable if verification is in progress
      if (isVerifying) return true;

      // Disable if already verified
      if (isOtpVerified) return true;

      // In OTP section, enable only if OTP is filled completely
      if (currentSection === 4) {
        const otpString = otp.join('');
        return otpString.length !== 6; // Disable if OTP is not complete
      }

      // Enable in all other cases
      return false;
    };

    return (
      <View style={styles.navButtons}>
        {currentSection > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentSection(prev => prev - 1)}
          >
            <Ionicons name="arrow-back" size={20} color="#4361EE" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentSection < 4 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextPress}
          >
            <Text style={styles.nextButtonText}>
              {currentSection === 3 ? 'Send OTP' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitDisabled() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled()}
          >
            <Text style={styles.submitButtonText}>
              {isVerifying ? 'Processing...' : (isOtpVerified ? 'Completed' : 'Submit')}
            </Text>
            <MaterialIcons name="check-circle" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#FFE9A0", "#F6FFCD"]}
      locations={[0.25, 0.5]}
      style={{ flex: 1, height: '100%', }}

    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, }}
      >

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Registration</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {renderProgressBar()}
            {renderSection()}
            {renderNavButtons()}
          </View>

          <View style={styles.securityNote}>
            <Feather name="shield" size={16} color="#4361EE" />
            <Text style={styles.securityText}>
              Your information is secure and encrypted
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#fff',
    opacity: 0.8,

    // backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',

    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    // fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter_700Bold',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4361EE',
    borderRadius: 3,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#4361EE',
  },
  progressStepText: {
    fontSize: 12,
    color: '#999',
  },
  progressStepTextActive: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,

  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#F8F8F8',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 10,
    color: '#333',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryCardSelected: {
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    borderColor: '#4361EE',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIconContainerSelected: {
    backgroundColor: '#4361EE',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#4361EE',
    fontWeight: 'bold',
  },
  documentCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  documentUpload: {
    height: 150,
    borderRadius: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  documentUploaded: {
    borderStyle: 'solid',
    borderColor: '#4CC9F0',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  documentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentUploadText: {
    marginTop: 10,
    color: '#4361EE',
    fontWeight: '500',
  },
  documentUploadedText: {
    marginTop: 5,
    color: '#fff',
    fontWeight: 'bold',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4361EE',
  },
  backButtonText: {
    marginLeft: 5,
    color: '#4361EE',
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4361EE',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 5,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CC9F0',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 5,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 20,
  },
  securityText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 12,
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 10,
    fontStyle: 'italic',
  },
  videoDurationNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4361EE',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#4361EE',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#4361EE',
    fontSize: 16,
  },
});