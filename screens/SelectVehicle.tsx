import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { styled } from 'nativewind';
import { useFonts, Lato_400Regular, Lato_700Bold, Lato_900Black, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, Poppins_900Black, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_800ExtraBold, Montserrat_900Black, Montserrat_700Bold, Montserrat_400Regular,  } from '@expo-google-fonts/dev';

const { width } = Dimensions.get('window');

const vehicles = [
  {
    key: 'motorcycle',
    label: 'Motorcycle',
    image: require('../assets/bike.jpg'),
  },
  {
    key: 'bicycle',
    label: 'Bicycle',
    image: require('../assets/cycle.jpg'),
  },
  {
    key: 'electric_vehicle',
    label: 'Electric Scooter',
    image: require('../assets/evBike.jpg'),
  },
];

// Wrap LinearGradient to support Tailwind with nativewind
// const StyledLinearGradient = styled(LinearGradient);

const SelectVehicle = ({ navigation }: { navigation: any }) => {
  const [selected, setSelected] = useState<string | null>(null);

  let [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#FFE9A0", "#F6FFCD"]}
        locations={[0.25, 0.5]}
        className="absolute inset-0"
      />
      <View className="w-full items-center pt-[60px] px-5 mb-5">
        <TouchableOpacity className="absolute left-5 top-[60px] w-10 h-10 rounded-full bg-white/80 justify-center items-center" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-[28px]  text-black text-center mt-2" style={{ fontFamily: 'Inter_700Bold' }}>Select Your Vehicle</Text>
        <Text className="text-base text-black/80 mt-2 text-center mb-2" style={{ fontFamily: 'Inter_400Regular' }}>
          Choose the vehicle you will use for deliveries
        </Text>
      </View>

      <ScrollView
        className="w-full flex-1 px-5 pt-2"
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.key}
            className={`w-full  rounded-2xl overflow-hidden mb-6 bg-white/95 shadow-md ${selected === vehicle.key ? '' : ''
              }`}
            activeOpacity={0.9}
            onPress={() => setSelected(vehicle.key)}
          >
            <View
              className="flex  items-center justify-between  rounded-2xl"
            >
              <Image
                source={vehicle.image}
                className=" w-[100px] h-[100px] "
                style={{ width: width * 0.6, height: width * 0.3 }}
                resizeMode="cover"
              />
              <View className=' w-full bg-[#333333]  py-3 px-4 '>
                <Text className="text-[18px]  text-white " style={{ fontFamily: 'Montserrat_600SemiBold' }}>{vehicle.label}</Text>
                {selected === vehicle.key && (
                  <View className="absolute top-4 right-4 bg-white/80 rounded-full ">
                    <Ionicons name="checkmark-circle" size={28} color="#4CC9F0" />
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="px-5 pb-8">
        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center ${selected ? 'bg-[#2940D3]' : 'bg-gray-300'
            }`}
          disabled={!selected}
          onPress={() => navigation.navigate('DeliveryType')}
        >
          <Text className="text-white text-xl " style={{ fontFamily: 'Poppins_700Bold' }}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectVehicle;
