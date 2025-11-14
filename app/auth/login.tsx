import GoogleIcon from '@/assets/icons/GoogleIcon';
import { signInWithGoogle } from '@/config/firebaseConfig';
import { useAppDispatch } from '@/store/hooks';
import { loginFailure, loginStart, loginSuccess } from '@/store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      dispatch(loginStart());
      
      // Sign in with Google
      const userData = await signInWithGoogle();
      
      // Dispatch success action with user data
      dispatch(loginSuccess(userData));
      
      // Navigate to tabs
      router.replace('/(tabs)/' as Href);
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch(loginFailure());
      
      // Show error message to user
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (error.code === 'sign_in_cancelled') {
        errorMessage = 'Sign in was cancelled.';
      } else if (error.code === 'in_progress') {
        errorMessage = 'Sign in is already in progress.';
      } else if (error.code === 'play_services_not_available') {
        errorMessage = 'Google Play Services is not available. Please update Google Play Services.';
      }
      
      Alert.alert('Sign In Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
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
                <Image source={require('@/assets/images/piggy-bank.png')} style={styles.logoImage} />
              </View>
            </View>
            <Text style={styles.brandName}>Finpool Jar</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.mainTitle}>Track your all</Text>
            <Text style={styles.mainTitle}>Expenses & Jar</Text>
            <Text style={styles.mainTitle}>with Us</Text>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={[styles.getStartedButton, isLoading && styles.getStartedButtonDisabled]}
              onPress={handleGetStarted}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <View style={styles.getStartedContent}>
                <GoogleIcon width={22} height={22} />
                <Text style={styles.getStartedText}>
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </View>
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
  getStartedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  getStartedButtonDisabled: {
    opacity: 0.7,
  },
  logoImage: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
});

export default Login;
