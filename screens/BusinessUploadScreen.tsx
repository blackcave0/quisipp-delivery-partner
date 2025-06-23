import React, { useState, useRef } from 'react';
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
  KeyboardAvoidingView
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
  // add other routes here if needed
};

export default function BusinessUploadScreen() {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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
  const otpRefs = useRef<TextInput[]>([]);

  const pickImage = async (setter: (uri: string | null) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return toast.error('Permission denied');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images' });
    if (!result.canceled && result.assets && result.assets.length > 0) setter(result.assets[0].uri);
  };

  const pickVideo = async (setter: (uri: string | null) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return toast.error('Permission denied');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'videos' });
    if (!result.canceled && result.assets && result.assets.length > 0) setter(result.assets[0].uri);
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
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    // Auto-focus previous input on backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsVerifying(true);

    // Simulate OTP verification (replace with actual API call)
    setTimeout(() => {
      if (otpString === '123456') { // Demo OTP
        setIsOtpVerified(true);
        toast.success('OTP verified successfully');
        // Proceed to next step or submit
        handleSubmit();
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
      setIsVerifying(false);
    }, 2000);
  };

  const resendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setIsOtpVerified(false);
    toast.success('OTP sent to your phone number');
    // Focus first input
    otpRefs.current[0]?.focus();
  };

  const handleSubmit = () => {
    // Validation
    /*  if (!phone || !email || !address || !gstin || categories.length === 0 ||
       !aadharUri || !panUri || !selfieUri || !shopImageUri) {
       return toast.error('Please fill all required fields');
     } */

    // TODO: upload data
    toast.success('Business registration submitted');
    navigation.navigate('ThankYou');
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
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#4361EE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="identifier" size={20} color="#4361EE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="GSTIN Number"
            value={gstin}
            onChangeText={setGstin}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="store" size={20} color="#4361EE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Shop Address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#999"
            multiline
          />
        </View>
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
          Select all categories that apply to your business
        </Text>

        <View style={styles.categoriesGrid}>
          {categoriesList.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                categories.includes(cat.id) && styles.categoryCardSelected
              ]}
              onPress={() => toggleCategory(cat.id)}
            >
              <View style={[
                styles.categoryIconContainer,
                categories.includes(cat.id) && styles.categoryIconContainerSelected
              ]}>
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={24}
                  color={categories.includes(cat.id) ? "#fff" : "#4361EE"}
                />
              </View>
              <Text style={[
                styles.categoryText,
                categories.includes(cat.id) && styles.categoryTextSelected
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
          Upload your personal identification documents
        </Text>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="card-account-details" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>Aadhar Card</Text>
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
            <Text style={styles.documentTitle}>PAN Card</Text>
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
            <Text style={styles.documentTitle}>Live Selfie</Text>
          </View>
          <TouchableOpacity
            style={[styles.documentUpload, selfieUri && styles.documentUploaded]}
            onPress={() => pickImage(setSelfieUri)}
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
                <Text style={styles.documentUploadText}>Tap to upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="video" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>Verification Video</Text>
          </View>
          <TouchableOpacity
            style={[styles.documentUpload, videoUri && styles.documentUploaded]}
            onPress={() => pickVideo(setVideoUri)}
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
                <Text style={styles.documentUploadText}>Tap to upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
          Upload your shop images and videos
        </Text>

        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialCommunityIcons name="storefront" size={24} color="#4361EE" />
            <Text style={styles.documentTitle}>Shop Image</Text>
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
            <Text style={styles.documentTitle}>Shop Video</Text>
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
              editable={!isOtpVerified}
            />
          ))}
        </View>

        {!isOtpVerified && (
          <View style={styles.otpActions}>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={verifyOtp}
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
    );
  };

  const renderNavButtons = () => {
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
            onPress={() => {
              if (currentSection === 3) {
                // Send OTP when moving to OTP verification section
                toast.success('OTP sent to your phone number');
                setCurrentSection(prev => prev + 1);
              } else {
                setCurrentSection(prev => prev + 1);
              }
            }}
          >
            <Text style={styles.nextButtonText}>
              {currentSection === 3 ? 'Send OTP' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, !isOtpVerified && styles.submitButtonDisabled]}
            onPress={isOtpVerified ? handleSubmit : verifyOtp}
            disabled={!isOtpVerified && otp.join('').length !== 6}
          >
            <Text style={styles.submitButtonText}>
              {isOtpVerified ? 'Submit' : 'Verify & Submit'}
            </Text>
            <MaterialIcons name="check-circle" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#FFE9A0", "#F6FFCD"]}
        locations={[0.25, 0.5]}
        style={styles.background}
      />

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
    backgroundColor: '#ffffff',
    opacity: 0.5,

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
  submitButtonDisabled: {
    opacity: 0.6,
  },
});