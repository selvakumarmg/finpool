#!/usr/bin/env node

/**
 * Script to generate SHA1 keys for Firebase Authentication
 * This script helps you get SHA1 fingerprints for both debug and production builds
 */

const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

console.log('🔑 Firebase SHA1 Key Generator\n');
console.log('='.repeat(50));

// Get debug keystore path
const homeDir = os.homedir();
const debugKeystorePath = path.join(homeDir, '.android', 'debug.keystore');

console.log('\n1️⃣  DEBUG SHA1 (for local development):');
console.log('-'.repeat(50));

if (fs.existsSync(debugKeystorePath)) {
  try {
    const sha1Output = execSync(
      `keytool -list -v -keystore "${debugKeystorePath}" -alias androiddebugkey -storepass android -keypass android`,
      { encoding: 'utf-8' }
    );
    
    const sha1Match = sha1Output.match(/SHA1:\s*([A-F0-9:]+)/i);
    const sha256Match = sha1Output.match(/SHA256:\s*([A-F0-9:]+)/i);
    
    if (sha1Match) {
      console.log(`✅ SHA1: ${sha1Match[1]}`);
    }
    if (sha256Match) {
      console.log(`✅ SHA256: ${sha256Match[1]}`);
    }
  } catch (error) {
    console.log('❌ Error reading debug keystore:', error.message);
    console.log('\n💡 Try running manually:');
    console.log(`keytool -list -v -keystore "${debugKeystorePath}" -alias androiddebugkey -storepass android -keypass android`);
  }
} else {
  console.log('⚠️  Debug keystore not found at:', debugKeystorePath);
  console.log('💡 It will be created automatically when you build the app for the first time.');
  console.log('\nTo generate it manually, run:');
  console.log(`keytool -genkey -v -keystore "${debugKeystorePath}" -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android`);
}

console.log('\n2️⃣  PRODUCTION SHA1 (for EAS builds):');
console.log('-'.repeat(50));
console.log('📋 To get production SHA1, run one of these commands:');
console.log('\n   Option 1 (Recommended):');
console.log('   npx eas credentials');
console.log('   → Select Android → Select your project → View credentials');
console.log('\n   Option 2:');
console.log('   eas credentials');
console.log('   → Follow the prompts to view your keystore info');
console.log('\n   Option 3 (if you have the keystore file):');
console.log('   keytool -list -v -keystore <path-to-keystore> -alias <alias-name>');

console.log('\n3️⃣  ADD TO FIREBASE:');
console.log('-'.repeat(50));
console.log('1. Go to Firebase Console → Project Settings → Your Android App');
console.log('2. Click "Add fingerprint"');
console.log('3. Paste the SHA1 key(s) above');
console.log('4. Download the updated google-services.json');
console.log('5. Place it in your project root (it will be ignored by git)');

console.log('\n' + '='.repeat(50));
console.log('✨ Done! Copy the SHA1 keys above to Firebase Console.\n');

