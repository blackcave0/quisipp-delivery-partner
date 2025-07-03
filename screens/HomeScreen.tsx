import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { deliveryPartnerService, businessOwnerService } from '../services';
import { useFonts, Lato_400Regular, Lato_700Bold, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/dev';
import { useNavigation, NavigationProp } from '@react-navigation/native';
// import Video from 'react-native-video';
import { ResizeMode, Video } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';

// Define response type
interface ApiResponse {
  success: boolean;
  message?: string;
  data: any;
}

type RootStackParamList = {
  ThankYou: undefined;
  HomeScreen: undefined;
  RoleSelect: undefined;
  // add other routes if needed
};

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: { navigation: StackNavigationProp<RootStackParamList> }) {
  const { user, logout } = useAuth();
  // const { user, logout } = { user: { role: 'delivery-partner', profile: { firstName: 'John', lastName: 'Doe', phoneNumber: '1234567890', email: 'john.doe@example.com', profilePicture: { url: 'https://via.placeholder.com/150' } } }, logout: () => { } };

  // const user = {
  //   role: 'delivery-partner',
  //   profile: { firstName: 'John', lastName: 'Doe', phoneNumber: '1234567890', email: 'john.doe@example.com', profilePicture: { url: 'https://via.placeholder.com/150' } },
  //   deliveryPartnerDetails: { vehicleType: 'motorcycle', employmentType: 'full-time', isActive: true },
  //   businessOwnerDetails: { businessName: 'ABC Inc', businessType: 'Retail', businessAddress: '123 Main St', businessImages: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'], businessVideo: 'https://via.placeholder.com/150' },
  //   documents: { aadhar: true, pan: true, selfie: true, video: true },
  //   phoneNumber: '1234567890',
  //   email: 'john.doe@example.com'
  // };

  // const logout = () => {
  //   console.log('Logout');
  // };

  // const deliveryPartnerService = {
  //   getProfile: () => {
  //     return { success: true, data: user };
  //   },
  //   toggleActiveStatus: () => {
  //     return { success: true };
  //   }
  // };



  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  let [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      if (user?.role === 'delivery-partner') {
        const response = await deliveryPartnerService.getProfile() as ApiResponse;
        if (response.success) {
          setUserProfile(response.data);
          console.log('Profile fetched successfully:', response.data);
        }
      } else if (user?.role === 'business-owner') {
        const response = await businessOwnerService.getProfile() as ApiResponse;
        if (response.success) {
          setUserProfile(response.data);
          console.log('Profile fetched successfully:', response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      (navigation as any).navigate('RoleSelect');
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpCenter = () => {
    (navigation as any).navigate('HelpCenter');
  };

  // Use userProfile as the main user object
  const displayUser = userProfile || {};
  console.log(displayUser)

  // Helper function to get display name (use email or phone if no name)
  const getDisplayName = () => {
      // if (displayUser.email) return displayUser.email;
    if (displayUser.profile?.firstName) return displayUser.profile.firstName ;
    if (displayUser.phoneNumber) return displayUser.phoneNumber;
    return 'Delivery Partner';
  };

  const getBusinessName = () => {
    return displayUser.businessOwnerDetails?.businessName || 'Not Provided';
  };

  // Helper function to get profile initial (use first letter of email or phone)
  const getProfileInitial = () => {
    if (displayUser.email) return displayUser.email[0].toUpperCase();
    if (displayUser.phoneNumber) return displayUser.phoneNumber[0];
    return 'U';
  };

  // Helper function to get profile picture (if available)
  const getProfilePicture = () => {
    return displayUser?.profile?.profilePicture?.url || null;
  };


  // Helper for document status
  const getDocStatusIcon = (exists: boolean) =>
    exists ? (
      <Ionicons name="checkmark-circle" size={20} color="#4CC9F0" />
    ) : (
      <Ionicons name="close-circle" size={20} color="#FF5A5F" />
    );

  // Helper for document image
  const renderDocumentImage = (label: string, imageUrl?: string) => {
    if (!imageUrl) {
      return (
        <View style={styles.documentImagePlaceholder}>
          <Ionicons name="image-outline" size={24} color="#CCCCCC" />
          <Text style={styles.documentImageText}>No {label}</Text>
        </View>
      );
    }
    return (
      <Image source={{ uri: imageUrl }} style={styles.documentImage} resizeMode="cover" />
    );
  };

  // Helper for document video
  const renderDocumentVideo = (videoUrl?: string) => {
    if (!videoUrl) {
      return (
        <View style={styles.documentImagePlaceholder}>
          <Ionicons name="videocam-outline" size={24} color="#CCCCCC" />
          <Text style={styles.documentImageText}>No Video</Text>
        </View>
      );
    }
    return (
      <View style={styles.videoContainer}>
        <Image source={{ uri: videoUrl }} style={styles.documentImage} resizeMode="cover" />
        <TouchableOpacity
          style={styles.videoPlayButton}
          onPress={() => {
            setCurrentVideoUrl(videoUrl);
            setVideoModalVisible(true);
          }}
        >
          <Ionicons name="play" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { fontFamily: 'Inter_700Bold' }]}>Welcome, {displayUser?.role == 'delivery-partner' ? getDisplayName() : getBusinessName()}!</Text>
          <Text style={[styles.roleText, { fontFamily: 'Lato_400Regular' }]}>{displayUser?.role === 'delivery-partner' ? 'Delivery Partner' : (displayUser?.role === 'business-owner' ? 'Shop Owner' : (displayUser?.role || 'User'))}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.helpButton} onPress={handleHelpCenter}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#4361EE" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
            <Ionicons name="log-out-outline" size={24} color="#FF5A5F" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361EE" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Profile</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileImageContainer}>
                {getProfilePicture() ? (
                  <Image source={{ uri: getProfilePicture() }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileInitial}>{getProfileInitial()}</Text>
                  </View>
                )}
              </View>
              <View style={styles.profileDetails}>
                <View style={styles.nameRow}>
                  <Text style={[styles.profileName, { fontFamily: 'Inter_700Bold' }]}>{getDisplayName()}</Text>
                  {displayUser.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#4CC9F0" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.profileContact, { fontFamily: 'Lato_400Regular' }]}>{displayUser.phoneNumber || 'Not Provided'}</Text>
                <Text style={[styles.profileContact, { fontFamily: 'Lato_400Regular' }]}>{displayUser.email || 'Not Provided'}</Text>
              </View>
            </View>
          </View>

          {displayUser?.role === 'delivery-partner' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Delivery Partner Details</Text>
              <View style={styles.profileInfo}>
                <View style={styles.infoRow}>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#888', fontSize: 14, minWidth: 120 }]}>Vehicle Type</Text>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#222', fontSize: 14, textTransform: 'capitalize' }]}>{displayUser.deliveryPartnerDetails?.vehicleType || 'Not Provided'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#888', fontSize: 14, minWidth: 120 }]}>Employment Type</Text>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#222', fontSize: 14, textTransform: 'capitalize' }]}>{displayUser.deliveryPartnerDetails?.employmentType || 'Not Provided'}</Text>
                </View>
              </View>
            </View>
          )}


          {/* Shop Details Card */}
          {displayUser?.role == 'business-owner' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Shop Details</Text>
              <View style={styles.profileInfo}>
                <View style={styles.infoRow}>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#888', fontSize: 14, minWidth: 120 }]}>Business Name</Text>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#222', fontSize: 14, textTransform: 'capitalize' }]}>{getBusinessName()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#888', fontSize: 14, minWidth: 120 }]}>Business Type</Text>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#222', fontSize: 14, textTransform: 'capitalize' }]}>{displayUser.businessOwnerDetails?.businessType || 'Not Provided'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#888', fontSize: 14, minWidth: 120 }]}>Business Address</Text>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#222', fontSize: 14, textTransform: 'capitalize' }]}>{displayUser.businessOwnerDetails?.businessAddress || 'Not Provided'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#888', fontSize: 14, minWidth: 120 }]}>Pincode</Text>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#222', fontSize: 14, textTransform: 'capitalize' }]}>{displayUser.businessOwnerDetails?.pincode || 'Not Provided'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#888', fontSize: 14, minWidth: 120 }]}>GSTIN</Text>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#222', fontSize: 14, textTransform: 'capitalize' }]}>{displayUser.businessOwnerDetails?.gstin || 'Not Provided'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#888', fontSize: 14, minWidth: 120 }]}>Categories</Text>
                  <Text style={[{ fontFamily: 'Lato_400Regular', color: '#222', fontSize: 14, textTransform: 'capitalize' }]}>{displayUser.businessOwnerDetails?.categories?.join(', ') || 'Not Provided'}</Text>
                </View>
              </View>
            </View>

          )}



          {/* Document Status Card */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Document Status</Text>
            <View style={styles.documentRow}>
              <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>Aadhar Card</Text>
              <View style={styles.documentStatus}>{getDocStatusIcon(!!displayUser.documents?.aadhar?.imageUrl)}</View>
            </View>
            <View style={styles.documentRow}>
              <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>PAN Card</Text>
              <View style={styles.documentStatus}>{getDocStatusIcon(!!displayUser.documents?.pan?.imageUrl)}</View>
            </View>
            <View style={styles.documentRow}>
              <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>Selfie</Text>
              <View style={styles.documentStatus}>{getDocStatusIcon(!!displayUser.documents?.selfie?.imageUrl)}</View>
            </View>
            <View style={styles.documentRow}>
              <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>Video Verification</Text>
              <View style={styles.documentStatus}>{getDocStatusIcon(!!displayUser.documents?.video?.url)}</View>
            </View>
          </View>

          {/* Uploaded Documents Card */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Uploaded Documents</Text>
            <View style={styles.documentSection}>
              <Text style={[styles.documentSectionTitle, { fontFamily: 'Lato_700Bold' }]}>Aadhar Card</Text>
              {renderDocumentImage('Aadhar', displayUser.documents?.aadhar?.imageUrl)}
            </View>
            <View style={styles.documentSection}>
              <Text style={[styles.documentSectionTitle, { fontFamily: 'Lato_700Bold' }]}>PAN Card</Text>
              {renderDocumentImage('PAN', displayUser.documents?.pan?.imageUrl)}
            </View>
            <View style={styles.documentSection}>
              <Text style={[styles.documentSectionTitle, { fontFamily: 'Lato_700Bold' }]}>Selfie</Text>
              {renderDocumentImage('Selfie', displayUser.documents?.selfie?.imageUrl)}
            </View>
            <View style={styles.documentSection}>
              <Text style={[styles.documentSectionTitle, { fontFamily: 'Lato_700Bold' }]}>Video Verification</Text>
              {renderDocumentVideo(displayUser.documents?.video?.url)}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Video Modal */}
      <Modal
        visible={videoModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 2 }}
            onPress={() => setVideoModalVisible(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {currentVideoUrl && (
            <Video
              source={{ uri: currentVideoUrl }}
              style={{ width: width - 32, height: 300, backgroundColor: '#000' }}
              resizeMode={ResizeMode.COVER}
              useNativeControls={true}
            // isLooping={true}
            // usePoster={true}
            // posterSource={{ uri: currentVideoUrl }}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  welcomeText: {
    fontSize: 20,
    color: '#333333',
  },
  roleText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButton: {
    padding: 8,
    marginRight: 8,
  },
  logoutButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    color: '#333333',
  },
  profileInfo: {
    flexDirection: 'row',
    // alignItems: 'center',
    flexWrap: 'wrap',

    // justifyContent: 'space-between',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 4,
  },
  profileContact: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  activeStatus: {
    backgroundColor: '#4CC9F0',
  },
  inactiveStatus: {
    backgroundColor: '#FF5A5F',
  },
  statusText: {
    fontSize: 16,
    color: '#333333',
  },
  toggleButton: {
    backgroundColor: '#4361EE',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  documentLabel: {
    fontSize: 16,
    color: '#333333',
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentImage: {
    width: width - 64, // Full width minus padding
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  documentImagePlaceholder: {
    width: width - 64,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentImageText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  videoContainer: {

    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayButton: {
    position: 'absolute',

    backgroundColor: '#4361EE',
    borderRadius: 12,
    padding: 8,
    marginLeft: 8,
  },
  documentSection: {
    marginBottom: 16,
  },
  documentSectionTitle: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 8,
  },
  businessImagesContainer: {
    height: 100,
  },
  businessImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: '#4CC9F0',
    fontWeight: 'bold',
    marginLeft: 2,
  },
});