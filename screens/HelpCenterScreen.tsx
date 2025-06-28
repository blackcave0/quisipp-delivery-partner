import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Lato_400Regular, Lato_700Bold, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/dev';

const { width } = Dimensions.get('window');

// FAQ data
const faqData = [
  {
    id: 1,
    question: "How do I start accepting delivery requests?",
    answer: "Once your account is approved, you can start accepting delivery requests by going online in the app. Make sure your location services are enabled and you're in an active delivery zone."
  },
  {
    id: 2,
    question: "What are the payment methods available?",
    answer: "We support multiple payment methods including cash on delivery, mobile money, and digital wallet payments. Earnings are automatically transferred to your registered account."
  },
  {
    id: 3,
    question: "How do I update my vehicle information?",
    answer: "You can update your vehicle information by going to your profile settings. Make sure to upload updated documents if you change your vehicle."
  },
  {
    id: 4,
    question: "What should I do if I encounter issues during delivery?",
    answer: "If you encounter any issues during delivery, you can contact our support team immediately through the app or call our emergency hotline. We're here to help 24/7."
  },
  {
    id: 5,
    question: "How are delivery fees calculated?",
    answer: "Delivery fees are calculated based on distance, time, demand, and other factors. You'll see the estimated earnings before accepting any delivery request."
  }
];

export default function HelpCenterScreen() {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  let [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handlePhoneCall = async () => {
    const phoneNumber = 'tel:+919693126109'; // Replace with actual support phone number
    try {
      await Linking.openURL(phoneNumber);
    } catch (error) {
      Alert.alert('Error', 'Failed to make phone call');
    }
  };

  const handleEmailContact = async () => {
    const email = 'mailto:support@quisipp.com?subject=Delivery Partner Support Request&body=Hello, I need help with...';
    try {
      const supported = await Linking.canOpenURL(email);
      if (supported) {
        await Linking.openURL(email);
      } else {
        Alert.alert('Error', 'Email is not supported on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email client');
    }
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Live chat feature will be available soon. For immediate assistance, please call our support line.',
      [{ text: 'OK' }]
    );
  };

  const handleSupportTicket = () => {
    Alert.alert(
      'Support Ticket',
      'Support ticket submission feature will be available soon. For immediate assistance, please call our support line or send us an email.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: 'Inter_700Bold' }]}>
          Help Center
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Us Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_700Bold' }]}>
            Contact Us
          </Text>

          {/* Phone Contact */}
          <TouchableOpacity style={styles.contactCard} onPress={handlePhoneCall}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={24} color="#4361EE" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { fontFamily: 'Lato_700Bold' }]}>
                Call Support
              </Text>
              <Text style={[styles.contactSubtitle, { fontFamily: 'Lato_400Regular' }]}>
                {/* +1 (234) 567-8900 */}
                +91 9693126109
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          {/* Email Contact */}
          <TouchableOpacity style={styles.contactCard} onPress={handleEmailContact}>
            <View style={styles.contactIconContainer}>
              <MaterialCommunityIcons name="email" size={24} color="#4361EE" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { fontFamily: 'Lato_700Bold' }]}>
                Email Support
              </Text>
              <Text style={[styles.contactSubtitle, { fontFamily: 'Lato_400Regular' }]}>
                support@quisipp.com
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          {/* Business Hours */}
          <View style={styles.businessHoursCard}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="time" size={24} color="#4361EE" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { fontFamily: 'Lato_700Bold' }]}>
                Business Hours
              </Text>
              <Text style={[styles.contactSubtitle, { fontFamily: 'Lato_400Regular' }]}>
                Monday - Friday: 8:00 AM - 8:00 PM
              </Text>
              <Text style={[styles.contactSubtitle, { fontFamily: 'Lato_400Regular' }]}>
                Saturday - Sunday: 9:00 AM - 6:00 PM
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Help Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_700Bold' }]}>
            Additional Help
          </Text>

          {/* Live Chat */}
          <TouchableOpacity style={styles.helpCard} onPress={handleLiveChat}>
            <View style={styles.helpIconContainer}>
              <MaterialCommunityIcons name="chat" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.helpInfo}>
              <Text style={[styles.helpTitle, { fontFamily: 'Lato_700Bold' }]}>
                Live Chat
              </Text>
              <Text style={[styles.helpSubtitle, { fontFamily: 'Lato_400Regular' }]}>
                Chat with our support team
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>

          {/* Support Ticket */}
          <TouchableOpacity style={styles.helpCard} onPress={handleSupportTicket}>
            <View style={styles.helpIconContainer}>
              <FontAwesome5 name="ticket-alt" size={20} color="#4ECDC4" />
            </View>
            <View style={styles.helpInfo}>
              <Text style={[styles.helpTitle, { fontFamily: 'Lato_700Bold' }]}>
                Submit Ticket
              </Text>
              <Text style={[styles.helpSubtitle, { fontFamily: 'Lato_400Regular' }]}>
                Create a support ticket
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_700Bold' }]}>
            Frequently Asked Questions
          </Text>

          {faqData.map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFaq(faq.id)}
              >
                <Text style={[styles.faqQuestion, { fontFamily: 'Lato_700Bold' }]}>
                  {faq.question}
                </Text>
                <Ionicons
                  name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>
              {expandedFaq === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.faqAnswerText, { fontFamily: 'Lato_400Regular' }]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#FF5A5F" />
              <Text style={[styles.emergencyTitle, { fontFamily: 'Inter_700Bold' }]}>
                Emergency Support
              </Text>
            </View>
            <Text style={[styles.emergencyText, { fontFamily: 'Lato_400Regular' }]}>
              For urgent delivery issues or emergencies, call our 24/7 hotline
            </Text>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => Linking.openURL('tel:+919693126109')}
            >
              <Text style={[styles.emergencyButtonText, { fontFamily: 'Lato_700Bold' }]}>
                Call Emergency Line
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 15,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  businessHoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpInfo: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  comingSoonBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#856404',
    fontFamily: 'Lato_700Bold',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginTop: 12,
  },
  emergencySection: {
    marginTop: 20,
    marginBottom: 30,
  },
  emergencyCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    color: '#C53030',
    marginLeft: 12,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
