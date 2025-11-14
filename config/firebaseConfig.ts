import { Platform } from 'react-native';

// Lazy import Firebase modules to avoid crashes if native modules aren't available
let auth: any = null;
let GoogleSignin: any = null;

// Helper to safely import Firebase modules
const getFirebaseModules = () => {
  if (!auth || !GoogleSignin) {
    try {
      // Only import if native modules are available
      require('@react-native-firebase/app');
      auth = require('@react-native-firebase/auth').default;
      GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    } catch (error: any) {
      console.warn('Firebase native modules not available. Make sure you have rebuilt the app after adding Firebase.');
      throw new Error('Firebase native modules not found. Please rebuild the app with: npx expo run:android');
    }
  }
  return { auth, GoogleSignin };
};

// OAuth Client IDs from google-services.json
// Android Client ID (client_type: 1) - automatically used by native Google Sign-In
const ANDROID_CLIENT_ID = '532732415001-uvrl9dcim2i2i84m7o9qqfsduurq17o2.apps.googleusercontent.com';

// Web Client ID (client_type: 3) - required for getting ID tokens to authenticate with Firebase
// This is the one we need to configure for @react-native-google-signin/google-signin
const WEB_CLIENT_ID = '532732415001-nhitnvio18773mqv8nujfokpu5gdukf7.apps.googleusercontent.com';

/**
 * Initialize Google Sign-In configuration
 * Call this once at app startup (e.g., in _layout.tsx or App.tsx)
 */
export const configureGoogleSignIn = () => {
  try {
    const { GoogleSignin: GSI } = getFirebaseModules();
    GSI.configure({
      webClientId: WEB_CLIENT_ID, // Web client ID from Firebase Console (required for Firebase Auth)
      // For Android, we don't need to set iosClientId
      ...(Platform.OS === 'ios' && { iosClientId: '' }), // Add if needed for iOS
      offlineAccess: true, // If you want to access Google API on behalf of the user FROM YOUR SERVER
      forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
      scopes: ['profile', 'email'], // Optional: specify scopes if needed
    });
  } catch (error) {
    // Silently fail if native modules aren't available
    console.warn('Could not configure Google Sign-In:', error);
  }
};

/**
 * Sign in with Google
 * @returns User object with id, email, name, and avatar
 */
export const signInWithGoogle = async () => {
  try {
    const { auth: firebaseAuth, GoogleSignin: GSI } = getFirebaseModules();
    
    // Check if your device supports Google Play
    await GSI.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Sign out first to clear any cached state (helps with DEVELOPER_ERROR)
    try {
      await GSI.signOut();
    } catch (e) {
      // Ignore sign out errors
    }
    
    // Sign in with Google - this opens the Google Sign-In dialog
    const result = await GSI.signIn();
    
    // Get the user's ID token after sign-in
    // Note: getTokens() gets tokens for the currently signed-in user
    const tokens = await GSI.getTokens();
    
    if (!tokens.idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }
    
    // Create a Google credential with the token
    const googleCredential = firebaseAuth.GoogleAuthProvider.credential(tokens.idToken);
    
    // Sign in the user with the credential
    const userCredential = await firebaseAuth().signInWithCredential(googleCredential);
    
    const user = userCredential.user;
    
    // Return user data in the format expected by the auth slice
    return {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || '',
      avatar: user.photoURL || undefined,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    
    // Check if it's a native module error
    if (error.message && error.message.includes('native module') || error.message && error.message.includes('not found')) {
      throw new Error(
        'Firebase native modules not found. Please rebuild the app with:\n' +
        'npx expo run:android\n\n' +
        'Note: Firebase requires a development build, not Expo Go.'
      );
    }
    
    // Provide more helpful error messages
    if (error.code === '10') {
      throw new Error(
        'DEVELOPER_ERROR: Please verify the following:\n' +
        '1. SHA-1 fingerprint is added in Firebase Console\n' +
        '2. Web Client ID is correct\n' +
        '3. OAuth consent screen is configured in Google Cloud Console\n' +
        '4. Package name matches: dev.selvakumar.finpool'
      );
    }
    
    throw error;
  }
};

/**
 * Sign out from Google and Firebase
 */
export const signOutFromGoogle = async () => {
  try {
    const { auth: firebaseAuth, GoogleSignin: GSI } = getFirebaseModules();
    await GSI.signOut();
    await firebaseAuth().signOut();
  } catch (error: any) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  try {
    const { auth: firebaseAuth } = getFirebaseModules();
    return firebaseAuth().currentUser;
  } catch (error) {
    return null;
  }
};

