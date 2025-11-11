# FinPool - Financial Management App

A comprehensive financial management mobile application built with React Native and Expo, featuring transaction tracking, loan management, and notifications.

## Features

- 💰 **Transaction Management**: Track income and expenses with detailed categorization
- 🏦 **Loan Tracking**: Manage loans with EMI calculations and payment schedules
- 🔔 **Notifications**: Stay updated with transaction and loan notifications
- 📊 **Analytics**: View spending insights and financial summaries
- 👤 **User Profile**: Manage account settings and preferences
- 🌙 **Beautiful UI**: Modern purple gradient theme with smooth animations

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **Redux Toolkit** for state management
- **Redux Persist** for data persistence
- **Lucide Icons** for consistent iconography
- **Expo Linear Gradient** for beautiful backgrounds

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- EAS CLI (for building)

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd finpool
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npx expo start
```

## Building the App

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

### Configure EAS Build (Already done)
The project includes `eas.json` with build configurations.

### Build for Development
```bash
# Android APK (Development)
eas build --profile development --platform android

# iOS Development
eas build --profile development --platform ios
```

### Build for Preview/Testing
```bash
# Android APK (Preview)
eas build --profile preview --platform android

# iOS Preview
eas build --profile preview --platform ios
```

### Build for Production
```bash
# Android AAB (Play Store)
eas build --profile production --platform android

# iOS (App Store)
eas build --profile production --platform ios
```

### Build for Both Platforms
```bash
eas build --profile production --platform all
```

## Project Structure

```
finpool/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── loans.tsx      # Loans management
│   │   ├── addLoan.tsx    # Add new loan
│   │   ├── addTransaction.tsx  # Add transaction
│   │   ├── notifications.tsx   # Notifications
│   │   ├── reminder.tsx   # Activity/Reminders
│   │   ├── profile.tsx    # User profile
│   │   └── _layout.tsx    # Tabs layout
│   ├── auth/              # Authentication screens
│   │   └── login.tsx      # Login screen
│   └── _layout.tsx        # Root layout
├── store/                 # Redux store
│   ├── slices/           # Redux slices
│   │   ├── authSlice.ts
│   │   ├── transactionSlice.ts
│   │   ├── loanSlice.ts
│   │   └── notificationSlice.ts
│   ├── hooks.ts          # Redux hooks
│   └── index.ts          # Store configuration
├── assets/               # Images and fonts
├── eas.json             # EAS build configuration
├── app.json             # Expo configuration
└── package.json         # Dependencies

```

## Environment Setup

Before submitting to app stores, update the following in `eas.json`:

### For iOS:
- `appleId`: Your Apple ID email
- `ascAppId`: App Store Connect App ID
- `appleTeamId`: Your Apple Developer Team ID

### For Android:
- Create a service account in Google Play Console
- Download the JSON key file
- Update `serviceAccountKeyPath` in `eas.json`

## App Configuration

Update `app.json` for your app details:
- `name`: Display name
- `slug`: URL-friendly identifier
- `version`: App version
- `icon`: App icon path
- `ios.bundleIdentifier`: iOS bundle ID
- `android.package`: Android package name

## Scripts

```bash
# Start development server
npm start

# Start with cache clear
npm run start:clear

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Type checking
npm run typecheck

# Build locally (for testing)
npx expo run:android
npx expo run:ios
```

## Features Details

### Authentication
- Mock login system with Redux state management
- Persistent authentication state
- Auto-redirect based on auth status

### Transactions
- Add income/expense transactions
- Categorize transactions
- View transaction history
- Real-time balance calculation
- INR currency support

### Loans
- Add loans with interest calculation
- Automatic EMI computation
- EMI payment schedule
- Progress tracking
- Multiple loan types support

### Notifications
- Transaction notifications
- Loan payment reminders
- Read/unread status
- Mark all as read functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@finpool.app or open an issue in the repository.

## Acknowledgments

- Expo team for the amazing framework
- Redux team for state management
- Lucide for beautiful icons
