import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFonts, Lato_400Regular, Lato_700Bold, Inter_400Regular, Inter_700Bold, Poppins_700Bold, Poppins_400Regular } from '@expo-google-fonts/dev';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deliveryPartnerService } from '../services';

// Define your stack param list
type RootStackParamList = {
  DeliveryUpload: { type: string };
  // Add other routes here as needed
};

const { width } = Dimensions.get('window');

export default function DeliveryTypeSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<string | null>(null);

  // Fetch stored data
  useEffect(() => {
    const getStoredData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user_email');
        const storedPhone = await AsyncStorage.getItem('user_phone');
        const storedVehicle = await AsyncStorage.getItem('selected_vehicle');

        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhoneNumber(storedPhone);
        if (storedVehicle) setVehicleType(storedVehicle);
      } catch (error) {
        console.error('Error fetching stored data:', error);
      }
    };

    getStoredData();
  }, []);

  let [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Inter_400Regular,
    Inter_700Bold,
    Poppins_700Bold,
    Poppins_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSelect = async (employmentType: string) => {
    try {
      setLoading(true);

      // Store employment type
      await AsyncStorage.setItem('employment_type', employmentType);

      // If we have all required data, we could register the user here
      if (email && phoneNumber && vehicleType) {
        try {
          // Register delivery partner
          const registrationData = {
            email,
            phoneNumber,
            vehicleType,
            employmentType
          };

          // We'll just navigate for now, but in a real app you might register here
          // const response = await deliveryPartnerService.registerDeliveryPartner(registrationData);

          // Navigate to upload screen
          navigation.navigate('DeliveryUpload', { type: employmentType });
        } catch (error: any) {
          console.error('Registration error:', error);
          Alert.alert('Registration Error', error.response?.data?.message || 'Failed to register. Please try again.');
        }
      } else {
        // Just navigate if we don't have all the data yet
        navigation.navigate('DeliveryUpload', { type: employmentType });
      }
    } catch (error) {
      console.error('Error selecting employment type:', error);
      Alert.alert('Error', 'Failed to select employment type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate image URLs for illustrations
  const partTimeIllustrationUrl = "https://api.a0.dev/assets/image?text=part%20time%20delivery%20person%20on%20scooter%20flexible%20hours%20modern%20illustration&aspect=1:1";
  const fullTimeIllustrationUrl = "https://api.a0.dev/assets/image?text=full%20time%20delivery%20person%20professional%20courier%20modern%20illustration&aspect=1:1";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFE9A0", "#F6FFCD"]}
        locations={[0.25, 0.5]}
        style={styles.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: '#000', fontFamily: 'Lato_700Bold' }]}>Choose Your Schedule</Text>
        <Text style={[styles.subtitle, { color: '#000', fontFamily: 'Lato_400Regular' }]}>Select how you want to work with us</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A0CA3" />
          <Text style={{ marginTop: 10, fontFamily: 'Lato_400Regular' }}>Processing your selection...</Text>
        </View>
      ) : (
        <View style={styles.cardsContainer}>
          <View style={styles.cardWrapper}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSelect('part-time')}
              activeOpacity={0.9}
              disabled={loading}
            >
              <LinearGradient
                colors={['#303A52', '#303A52']}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, styles.partTimeIcon]}>
                    <MaterialCommunityIcons name="clock-outline" size={32} color="#F72585" />
                  </View>
                  <Text style={[styles.cardTitle, { fontFamily: 'Inter_700Bold' }]}>Part-Time</Text>
                </View>

                <View style={styles.cardContent}>
                  <Image source={{ uri: partTimeIllustrationUrl }} style={styles.illustration} />
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#F72585" />
                      <Text style={[styles.featureText, { fontFamily: 'Inter_400Regular' }]}>Earn ₹16000 - ₹20000 per month</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#F72585" />
                      <Text style={[styles.featureText, { fontFamily: 'Inter_400Regular' }]}>Work When You Want</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#F72585" />
                      <Text style={[styles.featureText, { fontFamily: 'Inter_400Regular' }]}>Earn Extra Income</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={[styles.selectText, { fontFamily: 'Lato_700Bold' }]}>Select Part-Time</Text>
                  <Ionicons name="arrow-forward-circle" size={24} color="#F72585" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.cardWrapper}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSelect('full-time')}
              activeOpacity={0.9}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FFAAA5', '#FFAAA5']}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, styles.fullTimeIcon]}>
                    <MaterialCommunityIcons name="timer-sand-complete" size={32} color="#3A0CA3" />
                  </View>
                  <Text style={[styles.cardTitle, { color: '#000', fontFamily: 'Inter_700Bold' }]}>Full-Time</Text>
                </View>

                <View style={styles.cardContent}>
                  <Image source={{ uri: fullTimeIllustrationUrl }} style={styles.illustration} />
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#3A0CA3" />
                      <Text style={[styles.featureText, { color: '#000', fontFamily: 'Inter_400Regular' }]}>Earn ₹25000 - ₹30000 per month</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#3A0CA3" />
                      <Text style={[styles.featureText, { color: '#000', fontFamily: 'Inter_400Regular' }]}>Higher Priority Orders</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#3A0CA3" />
                      <Text style={[styles.featureText, { color: '#000', fontFamily: 'Inter_400Regular' }]}>Consistent Income</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={[styles.selectText, styles.fullTimeText, { fontFamily: 'Lato_700Bold' }]}>Select Full-Time</Text>
                  <Ionicons name="arrow-forward-circle" size={24} color="#3A0CA3" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cardWrapper: {
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  partTimeIcon: {
    backgroundColor: 'rgba(247, 37, 133, 0.1)',
  },
  fullTimeIcon: {
    backgroundColor: 'rgba(58, 12, 163, 0.1)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  illustration: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 10,
    marginRight: 15,
  },
  featuresList: {
    flex: 1,
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
    flexShrink: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  selectText: {
    fontSize: 16,
    color: '#fff',
  },
  fullTimeText: {
    color: '#000',
  },
});