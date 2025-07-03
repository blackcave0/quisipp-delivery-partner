import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Path, Ellipse, Circle } from 'react-native-svg';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Define the stack param list for navigation type
type RootStackParamList = {
  Splash: undefined;
  HomeScreen: undefined;
  // add other routes if needed
};

export default function ThankYouScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Animation values for balloons
  const balloon1Anim = useRef(new Animated.Value(0)).current;
  const balloon2Anim = useRef(new Animated.Value(0)).current;
  const balloon3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create swinging animation for each balloon with different timing
    const createSwingAnimation = (animValue: Animated.Value, delay: number = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            delay: delay,
            useNativeDriver: false,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );
    };

    // Start animations
    createSwingAnimation(balloon1Anim, 0).start();
    createSwingAnimation(balloon2Anim, 500).start();
    createSwingAnimation(balloon3Anim, 1000).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFE9A0", "#F6FFCD"]}
        locations={[0.25, 0.5]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.illustrationWrapper}>
        {/* Animated Balloons */}
        <Svg width={width * 0.8} height={width * 0.7} viewBox="0 0 350 300" fill="none">
          {/* Balloon Strings */}
          <Path d="M80 180 Q85 220 70 260" stroke="#F72585" strokeWidth="3" />
          <Path d="M175 175 Q180 220 160 270" stroke="#4361EE" strokeWidth="3" />
          <Path d="M270 185 Q275 220 290 270" stroke="#4CC9F0" strokeWidth="3" />
          {/* Confetti */}
          <Circle cx="60" cy="60" r="6" fill="#F72585" />
          <Circle cx="300" cy="60" r="5" fill="#3A0CA3" />
          <Circle cx="120" cy="40" r="4" fill="#4CC9F0" />
          <Circle cx="200" cy="30" r="5" fill="#F72585" />
          <Circle cx="250" cy="80" r="4" fill="#3A0CA3" />
          <Circle cx="320" cy="120" r="3" fill="#4CC9F0" />
        </Svg>
        
        {/* Animated balloon overlays */}
        <View style={styles.balloonOverlay}>
          <Animated.View 
            style={[
              styles.balloon1,
              {
                transform: [{
                  translateX: balloon1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  })
                }]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.balloon2,
              {
                transform: [{
                  translateX: balloon2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  })
                }]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.balloon3,
              {
                transform: [{
                  translateX: balloon3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  })
                }]
              }
            ]}
          />
        </View>
      </View>
      <Text style={styles.thankYouText}>Thank You!</Text>
      <Text style={styles.subText}>Your submission was successful. We appreciate your time and trust in us.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HomeScreen')}>
        <LinearGradient
          colors={["#4361EE", "#4CC9F0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  illustrationWrapper: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  balloonOverlay: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.7,
  },
  balloon1: {
    position: 'absolute',
    left: 35,
    top: 60,
    width: 90,
    height: 120,
    backgroundColor: '#F72585',
    borderRadius: 45,
    opacity: 0.95,
  },
  balloon2: {
    position: 'absolute',
    left: 125,
    top: 45,
    width: 100,
    height: 130,
    backgroundColor: '#4361EE',
    borderRadius: 50,
    opacity: 0.95,
  },
  balloon3: {
    position: 'absolute',
    left: 230,
    top: 75,
    width: 80,
    height: 110,
    backgroundColor: '#4CC9F0',
    borderRadius: 40,
    opacity: 0.95,
  },
  thankYouText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
    // textShadowColor: 'rgba(67,97,238,0.25)',
    // textShadowOffset: { width: 0, height: 4 },
    // textShadowRadius: 12,
    letterSpacing: 1.2,
  },
  subText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 36,
    fontWeight: '500',
    lineHeight: 26,
  },
  button: {
    width: '80%',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
}); 