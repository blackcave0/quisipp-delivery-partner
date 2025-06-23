import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { toast } from 'sonner-native';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Define the stack param list for navigation type
type RootStackParamList = {
  ThankYou: undefined;
  DeliveryUpload: { type: 'part-time' | 'full-time' };
  // add other routes if needed
};

export default function DeliveryUploadScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DeliveryUpload'>>();
  const { type } = route.params;

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadharUri, setAadharUri] = useState<string | null>(null);
  const [panUri, setPanUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // OTP verification states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<TextInput[]>([]);

  const pickImage = async (setUri: (uri: string | null) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return toast.error('Permission denied');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images' });
    if (!result.canceled && result.assets && result.assets.length > 0) setUri(result.assets[0].uri);
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return toast.error('Permission denied');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'videos' });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
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
        // Proceed to submit
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
    // TODO: upload data
    toast.success('Delivery registration submitted');
    navigation.navigate('ThankYou');
  };

  const nextStep = () => {
    if (currentStep < 3) {
      if (currentStep === 2) {
        // Send OTP when moving to OTP verification step
        toast.success('OTP sent to your phone number');
      }
      setCurrentStep(currentStep + 1);
    } else {
      // On step 3 (OTP), verify OTP instead of submitting directly
      if (!isOtpVerified) {
        verifyOtp();
      } else {
        handleSubmit();
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
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
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
            </View>
          </View>
        ) : currentStep === 2 ? (
          <View style={styles.formContainer}>
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="id-card" size={24} color="#4361EE" />
                <Text style={styles.cardTitle}>Document Verification</Text>
              </View>

              <Text style={styles.subtitle}>Upload the required documents</Text>

              <View style={styles.documentSection}>
                <Text style={styles.documentTitle}>Aadhar Card</Text>
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() => pickImage(setAadharUri)}
                >
                  {aadharUri ? (
                    <Image source={{ uri: aadharUri }} style={styles.documentPreview} />
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
                <Text style={styles.documentTitle}>PAN Card</Text>
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() => pickImage(setPanUri)}
                >
                  {panUri ? (
                    <Image source={{ uri: panUri }} style={styles.documentPreview} />
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
                <Text style={styles.documentTitle}>Live Selfie</Text>
                <TouchableOpacity
                  style={[styles.uploadContainer, styles.selfieContainer]}
                  onPress={() => pickImage(setSelfieUri)}
                >
                  {selfieUri ? (
                    <Image source={{ uri: selfieUri }} style={styles.selfiePreview} />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="person-circle-outline" size={64} color="#4361EE" />
                      <View style={styles.uploadOverlay}>
                        <Ionicons name="camera-outline" size={32} color="#fff" />
                        <Text style={styles.uploadText}>Take Selfie</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.documentTitle}>Verification Video</Text>
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={pickVideo}
                >
                  {videoUri ? (
                    <Video source={{ uri: videoUri }} style={styles.documentPreview} useNativeControls resizeMode={ResizeMode.COVER} />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="videocam" size={48} color="#4361EE" />
                      <View style={styles.uploadOverlay}>
                        <Ionicons name="videocam-outline" size={32} color="#fff" />
                        <Text style={styles.uploadText}>Record Video</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
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
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.prevButton]}
          onPress={prevStep}
        >
          <Text style={styles.buttonText}>{currentStep === 1 ? 'Back' : 'Previous'}</Text>
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
          <Text style={styles.buttonText}>
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  },
  selfiePreview: {
    width: '100%',
    height: '100%',
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
});