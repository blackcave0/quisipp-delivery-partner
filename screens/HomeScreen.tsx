import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { deliveryPartnerService, businessOwnerService } from '../services';
import { useFonts, Lato_400Regular, Lato_700Bold, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/dev';

// Define response type
interface ApiResponse {
  success: boolean;
  message?: string;
  data: any;
}

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

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
          setProfileData(response.data);
        }
      } else if (user?.role === 'business-owner') {
        const response = await businessOwnerService.getProfile() as ApiResponse;
        if (response.success) {
          setProfileData(response.data);
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
      navigation.replace('Splash');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { fontFamily: 'Inter_700Bold' }]}>
            Welcome, {user?.profile?.firstName || 'User'}!
          </Text>
          <Text style={[styles.roleText, { fontFamily: 'Lato_400Regular' }]}>
            {user?.role === 'delivery-partner' ? 'Delivery Partner' : 'Business Owner'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF5A5F" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361EE" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Profile</Text>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={18} color="#4361EE" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.profileImageContainer}>
                {user?.profile?.profilePicture?.url ? (
                  <Image
                    source={{ uri: user.profile.profilePicture.url }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileInitial}>
                      {(user?.profile?.firstName?.[0] || 'U').toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.profileDetails}>
                <Text style={[styles.profileName, { fontFamily: 'Inter_700Bold' }]}>
                  {`${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`}
                </Text>
                <Text style={[styles.profileContact, { fontFamily: 'Lato_400Regular' }]}>
                  {user?.phoneNumber}
                </Text>
                <Text style={[styles.profileContact, { fontFamily: 'Lato_400Regular' }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Role-specific cards */}
          {user?.role === 'delivery-partner' && (
            <>
              {/* Vehicle Info Card */}
              <View style={styles.card}>
                <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Vehicle Information</Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="motorbike" size={24} color="#4361EE" />
                  <Text style={[styles.infoText, { fontFamily: 'Lato_400Regular' }]}>
                    {user?.deliveryPartnerDetails?.vehicleType === 'motorcycle' ? 'Motorcycle' :
                      user?.deliveryPartnerDetails?.vehicleType === 'bicycle' ? 'Bicycle' :
                        user?.deliveryPartnerDetails?.vehicleType === 'electric_vehicle' ? 'Electric Vehicle' :
                          'Not specified'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={24} color="#4361EE" />
                  <Text style={[styles.infoText, { fontFamily: 'Lato_400Regular' }]}>
                    {user?.deliveryPartnerDetails?.employmentType === 'full-time' ? 'Full-time' :
                      user?.deliveryPartnerDetails?.employmentType === 'part-time' ? 'Part-time' :
                        'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Status Card */}
              <View style={styles.card}>
                <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Status</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusIndicator,
                    user?.deliveryPartnerDetails?.isActive ? styles.activeStatus : styles.inactiveStatus
                  ]} />
                  <Text style={[styles.statusText, { fontFamily: 'Lato_700Bold' }]}>
                    {user?.deliveryPartnerDetails?.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={async () => {
                    try {
                      setLoading(true);
                      await deliveryPartnerService.toggleActiveStatus();
                      await fetchUserProfile();
                    } catch (error) {
                      console.error('Error toggling status:', error);
                      Alert.alert('Error', 'Failed to update status. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <Text style={[styles.toggleButtonText, { fontFamily: 'Lato_700Bold' }]}>
                    {user?.deliveryPartnerDetails?.isActive ? 'Go Offline' : 'Go Online'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {user?.role === 'business-owner' && (
            <>
              {/* Business Info Card */}
              <View style={styles.card}>
                <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Business Information</Text>
                <View style={styles.infoRow}>
                  <FontAwesome5 name="store" size={20} color="#4361EE" />
                  <Text style={[styles.infoText, { fontFamily: 'Lato_400Regular' }]}>
                    {user?.businessOwnerDetails?.businessName || 'Not specified'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <FontAwesome5 name="building" size={20} color="#4361EE" />
                  <Text style={[styles.infoText, { fontFamily: 'Lato_400Regular' }]}>
                    {user?.businessOwnerDetails?.businessType || 'Not specified'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={22} color="#4361EE" />
                  <Text style={[styles.infoText, { fontFamily: 'Lato_400Regular' }]}>
                    {user?.businessOwnerDetails?.businessAddress || 'Not specified'}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Document Status Card */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Document Status</Text>
            <View style={styles.documentRow}>
              <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>Aadhar Card</Text>
              <View style={styles.documentStatus}>
                {user?.documents?.aadhar ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4CC9F0" />
                ) : (
                  <Ionicons name="close-circle" size={20} color="#FF5A5F" />
                )}
              </View>
            </View>
            <View style={styles.documentRow}>
              <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>PAN Card</Text>
              <View style={styles.documentStatus}>
                {user?.documents?.pan ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4CC9F0" />
                ) : (
                  <Ionicons name="close-circle" size={20} color="#FF5A5F" />
                )}
              </View>
            </View>
            {user?.role === 'delivery-partner' && (
              <>
                <View style={styles.documentRow}>
                  <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>Selfie</Text>
                  <View style={styles.documentStatus}>
                    {user?.documents?.selfie ? (
                      <Ionicons name="checkmark-circle" size={20} color="#4CC9F0" />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#FF5A5F" />
                    )}
                  </View>
                </View>
                <View style={styles.documentRow}>
                  <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>Video Verification</Text>
                  <View style={styles.documentStatus}>
                    {user?.documents?.video ? (
                      <Ionicons name="checkmark-circle" size={20} color="#4CC9F0" />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#FF5A5F" />
                    )}
                  </View>
                </View>
              </>
            )}
            {user?.role === 'business-owner' && (
              <>
                <View style={styles.documentRow}>
                  <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>Business Images</Text>
                  <View style={styles.documentStatus}>
                    {user?.businessOwnerDetails?.businessImages?.length > 0 ? (
                      <Ionicons name="checkmark-circle" size={20} color="#4CC9F0" />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#FF5A5F" />
                    )}
                  </View>
                </View>
                <View style={styles.documentRow}>
                  <Text style={[styles.documentLabel, { fontFamily: 'Lato_400Regular' }]}>Business Video</Text>
                  <View style={styles.documentStatus}>
                    {user?.businessOwnerDetails?.businessVideo ? (
                      <Ionicons name="checkmark-circle" size={20} color="#4CC9F0" />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#FF5A5F" />
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}
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
    padding: 16,
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
  editButton: {
    padding: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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
});