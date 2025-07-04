import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useFonts, Lato_400Regular, Lato_700Bold, Lato_900Black, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, Poppins_900Black, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black, CinzelDecorative_700Bold, CinzelDecorative_900Black, Cinzel_700Bold, Cinzel_900Black, Cinzel_400Regular, Cinzel_500Medium, Cinzel_600SemiBold, Cinzel_800ExtraBold, } from '@expo-google-fonts/dev';
// import AppLogo from '../components/AppLogo';
import { authService } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

type RootStackParamList = {
  DeliveryType: undefined;
  BusinessUpload: undefined;
  SelectVehicle: undefined;
  HomeScreen: undefined;
  // add other routes here if needed
};

// Define user data type
interface UserData {
  role?: string;
  [key: string]: any;
}

export default function RoleSelectScreen({ navigation }: { navigation: StackNavigationProp<RootStackParamList> }) {
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in and has selected a role
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userData = await authService.getStoredUserData() as UserData | null;
        if (userData && userData.role) {
          // If user is already logged in and has a role, navigate to home screen
          navigation.replace('HomeScreen');
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      }
    };

    checkUserSession();
  }, [navigation]);

  // Function to handle role selection
  const handleRoleSelect = async (role: 'delivery-partner' | 'business-owner') => {
    try {
      setLoading(true);

      // Store the selected role temporarily
      await AsyncStorage.setItem('selected_role', role);

      // Navigate to the appropriate screen based on role
      if (role === 'delivery-partner') {
        navigation.navigate('SelectVehicle');
      } else {
        navigation.navigate('BusinessUpload');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      Alert.alert('Error', 'Failed to select role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  let [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    CinzelDecorative_700Bold,
    CinzelDecorative_900Black,
    Cinzel_700Bold,
    Cinzel_900Black,
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  return (
    <View style={styles.container}>
      {/* Top yellow part */}
      <View style={styles.topSection}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity> */}

        <View style={{ marginTop: 10, marginLeft: 10 }}>
          <Text style={{ fontFamily: 'CinzelDecorative_700Bold', fontSize: 18, color: '#333446' }}>
            Quisipp
          </Text>
        </View>

        <TouchableOpacity
          style={styles.customerBadge}
          onPress={() => navigation.navigate('HelpCenter' as never)}
        >
          <View style={styles.customerIconCircle}>
            {/* <Ionicons name="headset" size={24} color="#4361EE" /> */}
            <MaterialCommunityIcons name="face-agent" size={26} color="#333446" />
          </View>
          <Text className='text-black text-sm' style={{ fontFamily: 'Lato_400Regular' }}>Help Center</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom blue part with content */}
      <LinearGradient
        colors={["#FFE9A0", "#F6FFCD"]}
        locations={[0.25, 0.5]}
        style={styles.blueSection}
      >
        <View style={styles.header} >
          <Text className='text-[#4b0082] text-4xl ' style={{ fontFamily: 'Inter_700Bold' }}>Choose{' '} {'\n'}
            <Text className='text-[#4b0082] text-7xl ' style={{ fontFamily: 'Inter_700Bold', }}>
              Your role
            </Text>
          </Text>


          {/* <Text className='text-white text-sm' style={{ fontFamily: 'Lato_400Regular' }}>Select how you want to join our platform</Text> */}
        </View>

        <View style={styles.cardsContainer}>
          {/* Delivery Partner Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleRoleSelect('delivery-partner')}
            activeOpacity={0.9}
            disabled={loading}
          >
            <View className='p-6'>
              <View className='flex-row items-start justify-between'>
                <View className='flex-1'>
                  <LottieView
                    source={require('../assets/delivery-lottie.json')}
                    autoPlay
                    loop={true}

                    // speed={1.5}
                    hardwareAccelerationAndroid={true}

                    style={{
                      width: 150,
                      // height: 100,
                      marginLeft: -10,
                      marginTop: -40,
                      borderRadius: 10,
                      aspectRatio: 1,
                      // resizeMode: 'cover',
                    }}
                  />
                </View>
                <View className='items-center justify-center w-[44px] h-[44px] bg-blue-500 rounded-full'>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </View>

              <View className='mt-4'>
                <View>
                  <Text className='text-black text-2xl' style={{ fontFamily: 'Lato_700Bold' }}>Delivery Partner</Text>
                </View>
                <View className='border-t border-gray-200 mt-2' />

                <View className='mt-2'>
                  <Text className='text-black text-lg' style={{ fontFamily: 'Lato_400Regular' }}>
                    Join our delivery fleet and earn money delivering packages and food.
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Business Owner Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleRoleSelect('business-owner')}
            activeOpacity={0.9}
            disabled={loading}
          >
            <View className='p-6'>
              <View className='flex-row items-start justify-between'>
                <View className='flex-1'>
                  <LottieView
                    source={require('../assets/business-lottie.json')}
                    autoPlay
                    loop={true}

                    // speed={1.5}
                    hardwareAccelerationAndroid={true}

                    style={{
                      width: 150,
                      // height: 100,
                      marginLeft: -10,
                      marginTop: -40,
                      borderRadius: 10,
                      aspectRatio: 1,
                      // resizeMode: 'cover',
                    }}
                  />
                </View>
                <View className='items-center justify-center w-[44px] h-[44px] bg-blue-500 rounded-full '>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </View>

              <View className='mt-4'>
                <View>
                  <Text className='text-black text-2xl' style={{ fontFamily: 'Lato_700Bold' }}>Business Owner</Text>
                </View>
                <View className='border-t border-gray-200 mt-2' />

                <View className='mt-2'>
                  <Text className='text-black text-lg' style={{ fontFamily: 'Lato_400Regular' }}>
                    Register your business and reach more customers through our platform.
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {/* <AppLogo /> */}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    backgroundColor: '#FFE9A0',
    // height: '30%',
    zIndex: 100,
    width: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
  },
  customerBadge: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#C7DB9C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerText: {
    color: '#000',
    fontWeight: 'bold',
    marginTop: 4,
  },
  blueSection: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 20,

  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
  },
  cardsContainer: {
    width: '100%',
    flex: 1,
    marginTop: 20,
  },
  card: {
    width: '100%',
    display: 'flex',
    // flexDirection : 'column',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContentRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cardLeftSection: {
    marginRight: 15,
    // width: 70,
    alignItems: 'center',
  },
  cardTextSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  redLine: {
    width: 40,
    height: 3,
    backgroundColor: '#FF6B6B',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 10,
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  footerText: {
    // color: 'rgba(255,255,255,0.8)',
    // fontSize: 16,
  },
});