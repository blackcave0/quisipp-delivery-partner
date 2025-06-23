import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useFonts, CinzelDecorative_700Bold, CinzelDecorative_900Black, Cinzel_700Bold, Cinzel_900Black, Cinzel_400Regular, Cinzel_500Medium, Cinzel_600SemiBold, Cinzel_800ExtraBold, } from '@expo-google-fonts/dev';
import { LinearGradient } from 'expo-linear-gradient';

const AppLogo = () => {
  let [fontsLoaded] = useFonts({
    CinzelDecorative_700Bold,
    CinzelDecorative_900Black,
    Cinzel_700Bold,
    Cinzel_900Black,
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#6256CA', '#6256CA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.8, y: 0 }}
      style={styles.logoContainer}> 
      <Text style={styles.logo}>Quisipp</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  logo: {
    fontFamily: 'CinzelDecorative_700Bold',
    fontSize: 10,
    color: '#fff',
  },
});

export default AppLogo