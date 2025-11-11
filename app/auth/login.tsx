import { useAppDispatch } from '@/store/hooks';
import { mockLogin } from '@/store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    // Dispatch mock login action
    dispatch(mockLogin());
    // Navigate to tabs
    router.replace('/(tabs)/' as Href);
  };

  return (
    <LinearGradient
      colors={['#6B46C1', '#4C2F7C', '#2D1B4E', '#1a0b2e']}
      locations={[0, 0.4, 0.7, 1]}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and Brand */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <View style={styles.logoCircle}>
                <View style={styles.logoInnerCircle} />
              </View>
            </View>
            <Text style={styles.brandName}>Track app</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.mainTitle}>Track your all</Text>
            <Text style={styles.mainTitle}>Subscription</Text>
            <Text style={styles.mainTitle}>plan with Us</Text>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Get started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoIcon: {
    marginRight: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoInnerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mainContent: {
    paddingTop: height * 0.12,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    fontWeight: '400',
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 50,
  },
  spacer: {
    flex: 1,
  },
  bottomContainer: {
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Login;
