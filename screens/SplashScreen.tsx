import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services';

const { width, height } = Dimensions.get('window');
type RootStackParamList = {
  RoleSelect: undefined;
  HomeScreen: undefined;
  // add other routes here if needed
};

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // First animate the icon scaling up
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      // Then fade in the circle background
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Finally fade in the text
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    // Check authentication status
    const checkAuth = async () => {
      try {
        const isLoggedIn = await authService.isLoggedIn();

        // Wait for animations to complete
        setTimeout(() => {
          setCheckingAuth(false);
          if (isLoggedIn) {
            navigation.replace('HomeScreen');
          } else {
            navigation.replace('RoleSelect');
          }
        }, 2000);
      } catch (error) {
        console.error('Auth check error:', error);
        // If there's an error, navigate to role select after animations
        setTimeout(() => {
          setCheckingAuth(false);
          navigation.replace('RoleSelect');
        }, 2000);
      }
    };

    checkAuth();
  }, [navigation]);

  return (
    <LinearGradient
      colors={["#4361EE", "#3A0CA3", "#240046"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.circleBackground,
            { opacity: opacityAnim }
          ]}
        />

        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons name="package-variant" size={60} color="#4361EE" style={styles.packageIcon} />
            <MaterialCommunityIcons name="map-marker-path" size={40} color="#4361EE" style={styles.pathIcon} />
          </View>
          <MaterialCommunityIcons name="truck-delivery-outline" size={80} color="#fff" style={styles.icon} />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacityAnim }]}>
          <Text style={styles.appName}>Quisipp</Text>
          <Text style={styles.tagline}>Fast. Reliable. Convenient.</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.6,
    height: width * 0.6,
  },
  illustrationContainer: {
    width: width * 0.5,
    height: width * 0.5,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageIcon: {
    position: 'absolute',
    top: 30,
    left: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 10,
  },
  pathIcon: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 8,
  },
  icon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(67, 97, 238, 0.9)',
    borderRadius: 40,
    padding: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  }
});