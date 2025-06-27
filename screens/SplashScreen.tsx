import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services';
import AppLogo from '../components/AppLogo';

const { width, height } = Dimensions.get('window');
type RootStackParamList = {
  RoleSelect: undefined;
  HomeScreen: undefined;
  // add other routes here if needed
};

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const letterAnims = useRef([...Array(7)].map(() => new Animated.Value(0))).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // First animate the icon scaling up with a bounce effect
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),

      // Then fade in the circle background with a pulse
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // Animate each letter of "Quisipp" separately
      Animated.stagger(100,
        letterAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        )
      ),

      // Finally fade in the tagline
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start();

    // Start continuous pulse animation for the background
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Rotate animation for the icon
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

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
        }, 2500);
      } catch (error) {
        console.error('Auth check error:', error);
        // If there's an error, navigate to role select after animations
        setTimeout(() => {
          setCheckingAuth(false);
          navigation.replace('RoleSelect');
        }, 2500);
      }
    };

    checkAuth();
  }, [navigation]);

  // Create rotate interpolation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Split the text for individual letter animations
  const appNameLetters = "Quisipp".split("");

  return (
    <LinearGradient
      colors={["#FFE9A0", "#F6FFCD"]}
      locations={[0.25, 0.5]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated background circle with pulse effect */}
        <Animated.View
          style={[
            styles.circleBackground,
            {
              opacity: opacityAnim,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        />

        {/* Logo container with scale and rotate animations */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: scaleAnim }, { rotate: spin }] }
          ]}
        >
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="package-variant" size={50} color="#4361EE" style={styles.packageIcon} />
            <FontAwesome5 name="truck" size={60} color="#4b0082" style={styles.truckIcon} />
          </View>
        </Animated.View>

        {/* Animated text container */}
        <View style={styles.textContainer}>
          {/* Each letter animates individually */}
          <View style={styles.appNameContainer}>
            {appNameLetters.map((letter, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.appNameLetter,
                  {
                    transform: [
                      {
                        translateY: letterAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      },
                      { scale: letterAnims[index] }
                    ],
                    opacity: letterAnims[index]
                  }
                ]}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>

          {/* Tagline with slide-up animation */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineAnim,
                transform: [{
                  translateY: taglineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            Fast. Reliable. Convenient.
          </Animated.Text>
        </View>

        {/* App logo at the bottom */}
        <View style={styles.footer}>
          <AppLogo />
        </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  circleBackground: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(75, 0, 130, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 20,
  },
  logoContainer: {
    width: width * 0.5,
    height: width * 0.5,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  truckIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  appNameLetter: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4b0082',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4b0082',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  }
});