# FinPool - Project Specification Document

## Project Overview

**Project Name:** FinPool  
**Current Version:** 1.0.0  
**Target Version:** 2.0.0 (Personal Finance & Expense Tracker MVP)  
**Platform:** React Native (iOS & Android)  
**Framework:** Expo with Expo Router  
**Package Name:** dev.selvakumar.finpool  
**Last Updated:** November 2025

> **Note:** This document covers both v1.0 (current implementation) and v2.0 (planned transformation)

---

## Executive Summary

FinPool is a comprehensive personal finance management mobile application that helps users track their income, expenses, loans, and EMIs. The app features a modern, intuitive interface with a purple gradient theme and provides complete financial visibility with persistent data storage.

---

## Technical Stack

### Core Technologies
- **Framework:** Expo SDK ~54.0.22
- **Language:** TypeScript
- **Navigation:** Expo Router (v6.0.14) - File-based routing
- **State Management:** Redux Toolkit (v2.10.1)
- **Data Persistence:** Redux Persist with AsyncStorage
- **UI Library:** React Native
- **Icons:** Lucide React Native
- **Styling:** React Native StyleSheet API

### Key Dependencies
```json
{
  "expo": "~54.0.22",
  "expo-router": "~6.0.14",
  "@reduxjs/toolkit": "^2.10.1",
  "redux-persist": "^6.0.0",
  "@react-native-async-storage/async-storage": "^1.24.0",
  "lucide-react-native": "^0.468.0",
  "expo-linear-gradient": "^15.0.7",
  "react-native-safe-area-context": "^5.1.5"
}
```

---

## Architecture

### Project Structure
```
finpool/
├── app/                          # Main application code
│   ├── _layout.tsx              # Root layout with auth logic
│   ├── (tabs)/                  # Authenticated tab screens
│   │   ├── _layout.tsx          # Bottom tabs configuration
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── loans.tsx            # Loans listing
│   │   ├── addLoan.tsx          # Add new loan
│   │   ├── addTransaction.tsx   # Add transaction
│   │   ├── notifications.tsx    # Notifications center
│   │   ├── reminder.tsx         # Activity/History
│   │   └── profile.tsx          # User profile
│   └── auth/                    # Authentication screens
│       ├── _layout.tsx          # Auth layout
│       └── login.tsx            # Login screen
├── store/                       # Redux store
│   ├── index.ts                # Store configuration
│   ├── hooks.ts                # Typed Redux hooks
│   └── slices/                 # Redux slices
│       ├── authSlice.ts        # Authentication state
│       ├── transactionSlice.ts # Transactions state
│       ├── loanSlice.ts        # Loans state
│       └── notificationSlice.ts # Notifications state
├── assets/                      # Images and fonts
├── eas.json                    # EAS Build configuration
├── app.json                    # Expo configuration
└── package.json                # Dependencies
```

### State Management Architecture

#### Redux Store Structure
```typescript
{
  auth: {
    isAuthenticated: boolean,
    user: {
      id: string,
      name: string,
      email: string,
      avatar?: string
    }
  },
  transactions: {
    transactions: Transaction[],
    totalIncome: number,
    totalExpense: number,
    balance: number
  },
  loans: {
    loans: Loan[],
    totalLoanAmount: number,
    totalPaidAmount: number,
    totalRemainingAmount: number
  },
  notifications: {
    notifications: Notification[],
    unreadCount: number
  }
}
```

---

## Feature Specifications

### 1. Authentication System

**Route:** `/auth/login`

**Features:**
- Mock authentication (development mode)
- Persistent login state
- Auto-redirect based on auth status
- Beautiful onboarding UI with purple gradient

**Implementation:**
- Redux-based authentication state
- Automatic navigation handling in root layout
- Mock user data: `{ id: '1', name: 'John Doe', email: 'john@example.com' }`

**UI Components:**
- Brand logo with "Track app" branding
- Welcome message
- Purple gradient background (4 colors)
- "Get Started" button
- Status bar configuration

---

### 2. Home/Dashboard Screen

**Route:** `/(tabs)/` (index)

**Features:**
- Welcome message with user name
- Total balance display (INR)
- Income/Expense split view
- Recent transactions list (last 10)
- Notification bell with unread badge
- Empty state handling
- Context-aware add button

**Data Display:**
- Total Balance: Calculated from totalIncome - totalExpense
- Income: Sum of all income transactions
- Expense: Sum of all expense transactions
- Transactions: Sorted by timestamp (newest first)

**UI Components:**
- Header with greeting and notification icon
- Balance card with split view
- Transaction list with icons
- Progress indicators
- Empty state with call-to-action

**Navigation:**
- Click Add button → Add Transaction screen
- Click notification → Notifications screen

---

### 3. Transaction Management

#### 3.1 Add Transaction Screen

**Route:** `/(tabs)/addTransaction`

**Features:**
- Dual tabs: Income / Expense
- Amount input with INR symbol
- Category selection (different for income/expense)
- Optional description
- Real-time validation
- Success notification
- Auto-navigation back

**Categories:**
- **Income:** Salary, Business, Investment, Freelance, Other
- **Expense:** Food, Transport, Shopping, Bills, Entertainment, Other

**Data Structure:**
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  timestamp: number;
}
```

**Validation:**
- Amount must be > 0
- Category must be selected
- Description is optional

**UI Components:**
- Tab switcher (Income/Expense)
- Currency input (₹)
- Category chips
- Text input for description
- Colored submit button (green for income, red for expense)

---

### 4. Loan Management System

#### 4.1 Loans Listing Screen

**Route:** `/(tabs)/loans`

**Features:**
- Summary cards (Total Loan, Remaining)
- List of all loans
- Progress tracking per loan
- EMI schedule visibility
- Status indicators (Active/Completed/Overdue)
- Empty state handling

**Display Information:**
- Lender name
- Loan type
- EMI amount
- Remaining balance
- Next due date
- Payment progress (% paid)
- EMI count (paid/total)

**UI Components:**
- Summary cards
- Loan cards with progress bars
- Status badges
- Icon indicators
- Empty state

**Navigation:**
- Click Add button (from bottom tabs) → Add Loan screen

#### 4.2 Add Loan Screen

**Route:** `/(tabs)/addLoan`

**Features:**
- Lender name input
- Loan type selection
- Principal amount input
- Interest rate input (%)
- Tenure input (months)
- Real-time EMI calculation
- Automatic EMI schedule generation
- Optional description

**Loan Types:**
- Personal, Home, Car, Education, Business, Other

**EMI Calculation Formula:**
```javascript
// EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
// Where:
// P = Principal loan amount
// R = Monthly interest rate (annual rate / 12 / 100)
// N = Loan tenure in months

if (R === 0) {
  EMI = P / N  // No interest case
} else {
  EMI = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)
}
```

**Data Structure:**
```typescript
interface Loan {
  id: string;
  lenderName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  remainingAmount: number;
  paidAmount: number;
  emis: EMI[];
  status: 'active' | 'completed' | 'overdue';
  description?: string;
  timestamp: number;
}

interface EMI {
  month: number;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
}
```

**Features:**
- Auto-generates EMI schedule for entire loan tenure
- Calculates due dates for each EMI
- Displays total payment amount
- Creates notification on loan addition

---

### 5. Notifications System

**Route:** `/(tabs)/notifications`

**Features:**
- List of all notifications
- Read/Unread status
- Mark as read functionality
- Mark all as read option
- Notification types (info, success, warning, error)
- Empty state handling

**Notification Types:**
- Transaction added (income/expense)
- Loan added
- EMI payment reminders (future enhancement)

**Data Structure:**
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: number;
  date: string;
}
```

**UI Components:**
- Header with "Mark all read" button
- Notification cards with status indicator
- Unread badge
- Back button
- Empty state

**Integration:**
- Automatically creates notifications when:
  - New transaction added
  - New loan added
  - EMI payment made (future)

---

### 6. Activity/History Screen

**Route:** `/(tabs)/activities`

**Features:**
- Transaction history view
- Activity timeline (future enhancement)
- Empty state handling

**Current Status:** Placeholder for future features

---

### 7. Profile Screen

**Route:** `/(tabs)/profile`

**Features:**
- User information display
- Avatar display (if available)
- Edit profile option
- Settings menu items
- Logout functionality

**Menu Sections:**
- **Account:** Payment Methods, My Wallets
- **Settings:** Preferences, Notifications, Security
- **Support:** Help Center
- **Logout:** Clear auth state and redirect to login

**UI Components:**
- Profile card with avatar
- Edit profile button
- Menu items with icons
- Logout button (red theme)
- Version number

---

## Navigation Structure

### Bottom Tabs Navigation

**Tabs Configuration:**
```
┌─────────┬─────────┬─────────┬──────────┬─────────┐
│  Home   │  Loans  │   Add   │ Activity │ Profile │
│   🏠    │   📊    │   ➕    │    📋   │   👤   │
└─────────┴─────────┴─────────┴──────────┴─────────┘
```

**Tab Details:**
1. **Home** - Dashboard with balance and transactions
2. **Loans** - Loan management and tracking
3. **Add** - Context-aware button (elevated center button)
   - From Home → Add Transaction
   - From Loans → Add Loan
4. **Activity** - Transaction history and reminders
5. **Profile** - User settings and account management

**Tab Bar Styling:**
- Background: Dark purple (#1F1B2E)
- Active color: Purple (#7C3AED)
- Inactive color: Gray (#6B7280)
- Center button: Elevated circular button with shadow
- Height: 70px (Android), 88px (iOS)

### Screen-Specific Behavior

**Hidden Tab Bar Screens:**
- Add Transaction screen
- Add Loan screen
- Notifications screen

**Authentication Flow:**
```
App Start
    │
    ├─ Not Authenticated → /auth/login
    │                          │
    │                          └─ Login Success → /(tabs)/
    │
    └─ Authenticated → /(tabs)/
```

---

## Design System

### Color Palette

**Primary Colors:**
```css
Purple Primary: #7C3AED
Purple Dark: #6B46C1
Purple Darker: #4C2F7C
Purple Darkest: #2D1B4E
Background Dark: #1a0b2e
Tab Bar: #1F1B2E
```

**Status Colors:**
```css
Success/Income: #10B981
Error/Expense: #EF4444
Warning: #F59E0B
Info: #3B82F6
```

**Gradients:**
```css
Main Gradient: ['#6B46C1', '#4C2F7C', '#2D1B4E', '#1a0b2e']
Gradient Locations: [0, 0.3, 0.6, 1]
```

### Typography

**Font Sizes:**
- Display: 42px (bold)
- Heading 1: 32px (bold)
- Heading 2: 28px (bold)
- Heading 3: 24px (bold)
- Heading 4: 20px (bold)
- Body Large: 18px
- Body: 16px
- Body Small: 14px
- Caption: 13px
- Tiny: 12px

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Component Patterns

**Cards:**
```css
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border Radius: 16-20px
Padding: 16-24px
```

**Buttons:**
```css
Primary: #7C3AED
Border Radius: 16px
Padding: 18px vertical
Shadow: 0 4px 8px rgba(124, 58, 237, 0.4)
```

**Input Fields:**
```css
Background: rgba(255, 255, 255, 0.08)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border Radius: 16px
Padding: 16px
Focus Border: rgba(124, 58, 237, 0.3)
```

---

## Data Persistence

### Storage Strategy

**Technology:** Redux Persist + AsyncStorage

**Persisted Data:**
- Authentication state
- Transactions
- Loans with EMI schedules
- Notifications

**Storage Keys:**
```
persist:root - Main Redux state
```

**Data Lifecycle:**
1. App loads → Redux Persist rehydrates state from AsyncStorage
2. User interactions → State updates → Auto-persisted
3. App closes → State remains in AsyncStorage
4. App reopens → State restored automatically

---

## Build Configuration

### EAS Build Profiles

**Development:**
- Build Type: APK (Android), Development (iOS)
- Distribution: Internal
- Use: Testing with development client

**Preview:**
- Build Type: APK (Android), Preview (iOS)
- Distribution: Internal
- Use: Internal testing and sharing

**Production:**
- Build Type: app-bundle (Android), Production (iOS)
- Distribution: Store
- Use: App Store submission

### Build Commands

```bash
# Development
npm run build:dev:android
npm run build:dev:ios

# Preview
npm run build:preview:android
npm run build:preview:ios

# Production
npm run build:prod:android
npm run build:prod:ios
npm run build:prod:all
```

---

## API & Integration Points

### Current State
- **No Backend API** - All data stored locally
- Mock authentication
- Client-side calculations
- No external services

### Future Integration Points

**Potential APIs:**
1. **Authentication API**
   - User registration
   - Login/Logout
   - Password reset
   - OAuth providers

2. **Transaction API**
   - CRUD operations
   - Sync across devices
   - Export data

3. **Loan Management API**
   - Bank integrations
   - Automatic EMI reminders
   - Payment gateway integration

4. **Analytics API**
   - Spending insights
   - Financial reports
   - Budget recommendations

5. **Notification API**
   - Push notifications
   - SMS reminders
   - Email alerts

---

## Security Considerations

### Current Implementation
- Client-side data storage (AsyncStorage)
- No sensitive data encryption
- Mock authentication only

### Recommended Enhancements
1. **Data Encryption**
   - Encrypt sensitive data in AsyncStorage
   - Use react-native-keychain for credentials

2. **Authentication**
   - Implement proper JWT-based auth
   - Biometric authentication (Face ID, Touch ID)
   - Session management

3. **Data Security**
   - Input validation
   - XSS prevention
   - Secure API communication (HTTPS)
   - Certificate pinning

4. **Privacy**
   - GDPR compliance
   - Data export functionality
   - Account deletion option

---

## Performance Optimization

### Current Optimizations
- Redux state normalized structure
- Efficient re-renders with React.memo (where needed)
- FlatList for long lists (future enhancement)
- Image optimization
- Code splitting with Expo Router

### Future Optimizations
1. **List Performance**
   - Implement FlatList for transactions
   - Virtual scrolling for large datasets
   - Pagination

2. **State Management**
   - Memoized selectors
   - Debounced inputs
   - Optimistic updates

3. **Bundle Size**
   - Code splitting
   - Tree shaking
   - Remove unused dependencies

---

## Testing Strategy

### Recommended Testing Approach

**Unit Tests:**
- Redux reducers and actions
- Utility functions (EMI calculation)
- Data transformations

**Integration Tests:**
- Navigation flows
- Redux integration
- Persistence logic

**E2E Tests:**
- Complete user flows
- Authentication flow
- Transaction creation
- Loan management

**Testing Tools:**
- Jest (unit tests)
- React Native Testing Library
- Detox (E2E)

---

## Accessibility

### Current Features
- Safe area handling
- Status bar configuration
- Touch target sizes (minimum 44x44)

### Recommended Enhancements
1. Screen reader support
2. Voice over labels
3. Haptic feedback
4. Dynamic type support
5. High contrast mode
6. Keyboard navigation

---

## Localization

### Current State
- English only
- INR currency hardcoded
- Date format: en-IN

### Future Enhancement
- Multi-language support (Hindi, Tamil, etc.)
- Currency selection
- Regional date/time formats
- Number formatting per locale

---

## Analytics & Monitoring

### Recommended Implementation

**Analytics Events:**
- Screen views
- User interactions
- Transaction creation
- Loan additions
- Feature usage

**Error Monitoring:**
- Crash reporting (Sentry)
- Performance monitoring
- API error tracking

**User Metrics:**
- Daily/Monthly active users
- Feature adoption rates
- User retention
- Session duration

---

## Deployment Strategy

### Development Workflow
1. Local development with Expo Go
2. Feature branches for new features
3. Code review process
4. Testing on preview builds
5. Production build and submission

### Release Process
1. Version bump in app.json
2. Update changelog
3. Run tests
4. Build production version
5. Submit to stores
6. Monitor crash reports

### Store Requirements

**Google Play Store:**
- App Bundle (AAB)
- Min SDK: 21 (Android 5.0)
- Target SDK: Latest
- Privacy policy
- App content rating

**Apple App Store:**
- Archive build
- App Store Connect submission
- Review guidelines compliance
- Privacy nutrition label

---

## Future Roadmap

### Phase 1: Core Enhancements (0-3 months)
- [ ] Backend API integration
- [ ] User authentication (JWT)
- [ ] Cloud data sync
- [ ] Push notifications
- [ ] Biometric authentication

### Phase 2: Advanced Features (3-6 months)
- [ ] Budget planning and tracking
- [ ] Spending analytics and insights
- [ ] Recurring transaction support
- [ ] EMI payment reminders
- [ ] Export data (PDF, CSV)
- [ ] Multiple currency support

### Phase 3: Social & Smart Features (6-12 months)
- [ ] Bill splitting with friends
- [ ] Bank account integration
- [ ] AI-powered insights
- [ ] Investment tracking
- [ ] Tax calculation assistance
- [ ] Financial goal setting

### Phase 4: Enterprise Features (12+ months)
- [ ] Multi-user support (family accounts)
- [ ] Business expense tracking
- [ ] Receipt scanning (OCR)
- [ ] Automated categorization
- [ ] Financial advisor integration

---

## Known Issues & Limitations

### Current Limitations
1. **No Backend** - Data only stored locally
2. **No Multi-device Sync** - Data not synced across devices
3. **Mock Authentication** - No real user accounts
4. **No Push Notifications** - Only in-app notifications
5. **Limited Analytics** - No spending insights/charts
6. **No Recurring Transactions** - Manual entry each time
7. **No Data Export** - Cannot export financial data
8. **No Bank Integration** - Manual entry only

### Known Issues
1. Metro bundler cache issues - Requires periodic clearing
2. No EMI payment functionality - Only tracking
3. No transaction editing - Can only delete/add
4. No search functionality
5. No transaction filters

---

## Support & Maintenance

### Documentation
- README.md - Setup and usage
- This spec document
- Code comments
- API documentation (future)

### Monitoring
- Error tracking
- Performance metrics
- User feedback

### Updates
- Regular dependency updates
- Security patches
- Bug fixes
- Feature enhancements

---

## License & Legal

**License:** MIT (or specify your license)  
**Copyright:** © 2025 Selvakumar  
**Privacy Policy:** Required before production release  
**Terms of Service:** Required before production release

---

## Contact & Support

**Developer:** Selvakumar  
**Project Repository:** [Add GitHub URL]  
**Support Email:** support@finpool.app  
**Documentation:** [Add docs URL]

---

## Appendix

### A. EMI Calculation Examples

**Example 1: Personal Loan**
- Principal: ₹100,000
- Interest Rate: 12% per annum
- Tenure: 12 months
- EMI: ₹8,885
- Total Payment: ₹106,620
- Interest Paid: ₹6,620

**Example 2: Home Loan**
- Principal: ₹5,000,000
- Interest Rate: 8.5% per annum
- Tenure: 240 months (20 years)
- EMI: ₹43,391
- Total Payment: ₹10,413,840
- Interest Paid: ₹5,413,840

### B. Redux Action Types

```typescript
// Auth Actions
'auth/mockLogin'
'auth/logout'

// Transaction Actions
'transactions/addTransaction'
'transactions/deleteTransaction'
'transactions/clearTransactions'

// Loan Actions
'loans/addLoan'
'loans/payEMI'
'loans/deleteLoan'
'loans/clearLoans'

// Notification Actions
'notifications/addNotification'
'notifications/markAsRead'
'notifications/markAllAsRead'
'notifications/deleteNotification'
```

### C. Screen Recording Configuration

For app store submissions, record:
1. Login flow
2. Add transaction flow
3. View dashboard
4. Add loan flow
5. View loan details
6. Notifications
7. Profile/Settings

---

---

## 🚀 FinPool v2.0 - Personal Finance & Expense Tracker MVP

### Vision & Transformation

Transform FinPool from a **loan-centric tracker** into a comprehensive **personal daily expense manager** with recurring expenses, reminders, insights, and time-based spend analysis — maintaining the same UI, purple gradient theme, and design consistency.

### 🎯 v2.0 Objective

Create a complete daily, weekly, and monthly expense management MVP that helps users:
- Visualize where their money goes
- Track category spending ratios
- Manage bills & recurring expenses
- Get actionable insights
- Receive timely payment reminders

---

## v2.0 Core MVP Features

### 1. Daily Expense Tracking

**Overview:**
Simplified, fast expense entry with intelligent categorization and daily summaries.

**Key Features:**
- ✅ Add expense/income entries with single tap
- ✅ Edit and delete existing entries
- ✅ Categorize expenses (Food, Transport, Bills, Shopping, Entertainment, etc.)
- ✅ Add optional notes for context
- ✅ Attach date (default: today)
- ✅ Mark as recurring or one-time
- ✅ View **daily summary card** showing:
  - Total spent today
  - Top spending category
  - Comparison with yesterday
  - Quick insights

**UI Components:**
```typescript
// Daily Summary Card
{
  totalSpent: number,
  topCategory: string,
  comparisonYesterday: number, // percentage
  quickInsight: string
}
```

**Implementation:**
```typescript
interface DailyExpense extends Expense {
  quickAdd?: boolean; // Flag for quick entry
  attachments?: string[]; // Future: Receipt images
}
```

---

### 2. Weekly Expense Insights

**Overview:**
7-day rolling view with trend analysis and spending patterns.

**Key Features:**
- 📊 Weekly overview with bar/line chart
- 📈 Week-over-week spending comparison
- 🔴 Highlight high-expense days
- 💡 Personalized saving tips based on patterns
- 📉 Average daily spend for the week
- 🎯 Category breakdown for week

**Calculations:**
```typescript
// Week-over-week ratio
const weeklyGrowth = ((currentWeek - previousWeek) / previousWeek) * 100;

// Daily average
const dailyAverage = weeklyTotal / 7;

// High expense threshold
const highExpenseDay = dayExpense > (dailyAverage * 1.5);
```

**UI Components:**
- Weekly trend chart (7 bars/points)
- Comparison badge (up/down arrow with %)
- High-expense day markers
- Saving tip cards
- Category mini-charts

**Data Structure:**
```typescript
interface WeeklyInsight {
  weekStart: string;
  weekEnd: string;
  totalSpent: number;
  dailyBreakdown: {
    date: string;
    amount: number;
    isHighExpense: boolean;
  }[];
  weekOverWeekChange: number;
  topCategories: CategorySpend[];
  savingTips: string[];
}
```

---

### 3. Monthly Overview (Enhanced Dashboard)

**Overview:**
Complete financial picture for the month with visual breakdowns.

**Key Features:**
- 💰 Total income vs. total expense
- 💵 Remaining balance (savings)
- 🥧 Category-wise expense pie chart
- 📊 Category ratio percentages
- 📅 Weekly trend within month (4-5 weeks)
- 🔄 Recurring vs. one-time expenses split
- 🎯 Budget progress (if set)
- 📈 Month-over-month comparison

**Visual Components:**
1. **Balance Card**
   ```
   ┌─────────────────────────┐
   │ Monthly Balance         │
   │ ₹45,000 remaining       │
   │ ↑ 12% vs last month    │
   └─────────────────────────┘
   ```

2. **Category Pie Chart**
   - Interactive segments
   - Tap to drill down
   - Color-coded by category
   - Percentage labels

3. **Ratio Cards**
   ```typescript
   {
     category: "Food",
     amount: 8000,
     ratio: 25.5, // (8000 / 31,000) * 100
     change: +5.2 // vs last month
   }
   ```

4. **Weekly Trend Chart**
   - 4-5 bars for weeks in month
   - Spending trajectory
   - Budget line overlay

**Implementation:**
```typescript
interface MonthlyOverview {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    ratio: number;
    color: string;
  }[];
  weeklyTrend: {
    week: number;
    amount: number;
  }[];
  recurringTotal: number;
  oneTimeTotal: number;
  monthOverMonthChange: number;
}
```

---

### 4. Recurring/Static Expense Management

**Overview:**
Manage all fixed, predictable expenses with automatic tracking.

**Key Features:**
- 📝 List of all recurring expenses
- 🔄 Frequency options: Daily, Weekly, Biweekly, Monthly, Quarterly, Yearly
- 📅 Next due date display
- ⏰ Auto-add to expense history when due
- ✅ Mark as paid/unpaid
- 🔔 Reminder integration
- 📊 Total recurring expense calculation
- 🎯 Impact on monthly budget

**Recurring Expense Types:**
```typescript
type Frequency = 
  | 'daily'
  | 'weekly' 
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: Frequency;
  startDate: string;
  nextDueDate: string;
  reminderBeforeDays: number; // e.g., 3 days before
  active: boolean;
  autoAdd: boolean; // Automatically add to expenses
  notes?: string;
  history: {
    date: string;
    paid: boolean;
    amount: number;
  }[];
}
```

**Auto-Add Logic:**
```typescript
// Daily check (on app open or background task)
const checkRecurringDue = () => {
  const today = new Date();
  
  recurringExpenses
    .filter(exp => exp.active && exp.autoAdd)
    .forEach(exp => {
      if (isDateDue(exp.nextDueDate, today)) {
        // Auto-add to expenses
        addExpense({
          ...exp,
          date: today,
          isRecurring: true,
          recurringId: exp.id
        });
        
        // Update next due date
        updateNextDueDate(exp);
        
        // Mark as paid in history
        exp.history.push({
          date: today,
          paid: true,
          amount: exp.amount
        });
      }
    });
};
```

**UI Components:**
- Recurring expense list with toggle switches
- Add recurring expense form
- Frequency picker
- Payment history modal
- Total recurring impact card

**Screen Layout:**
```
Recurring Expenses Tab
├── Summary Card (Total Monthly Recurring: ₹X)
├── Add New Button (Floating)
├── Recurring List
│   ├── Card: Rent (₹15,000 - Monthly)
│   │   ├── Next Due: Dec 1, 2025
│   │   ├── Toggle: Active/Inactive
│   │   └── Actions: Edit, Delete, History
│   ├── Card: Netflix (₹500 - Monthly)
│   └── Card: Electricity (₹2,000 - Monthly)
└── Past Payments History
```

---

### 5. Bill Reminders & Notifications

**Overview:**
Never miss a payment with intelligent reminders and push notifications.

**Technology:**
- Expo Notifications API
- Local notifications (no server required)
- Background task scheduling

**Key Features:**
- 🔔 Push/local notifications via Expo Notifications
- ⏰ Remind X days before due date
- 😴 Snooze functionality (1 hour, 3 hours, 1 day)
- ✅ Mark as paid directly from notification
- 📜 Auto-track bill payment history
- 🔄 Repeat reminders for unpaid bills
- 📊 Notification statistics

**Reminder Types:**
```typescript
interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  reminderDate: string;
  recurringExpenseId?: string;
  status: 'pending' | 'snoozed' | 'paid' | 'overdue';
  notificationIds: string[]; // Expo notification IDs
  snoozeCount: number;
  reminderSettings: {
    daysBefore: number[];  // e.g., [7, 3, 1] - remind 7, 3, and 1 day before
    timeOfDay: string;     // e.g., "09:00"
  };
}
```

**Notification Flow:**
```typescript
// Schedule notification
const scheduleReminder = async (reminder: BillReminder) => {
  const notifications = [];
  
  for (const daysBefore of reminder.reminderSettings.daysBefore) {
    const notificationDate = subDays(new Date(reminder.dueDate), daysBefore);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Bill Due: ${reminder.title}`,
        body: `₹${reminder.amount} due in ${daysBefore} day(s)`,
        data: { reminderId: reminder.id, type: 'bill_reminder' },
        sound: true,
        badge: 1,
      },
      trigger: {
        date: notificationDate,
      },
    });
    
    notifications.push(notificationId);
  }
  
  return notifications;
};

// Handle notification response
const handleNotificationResponse = (response: NotificationResponse) => {
  const { reminderId, action } = response.notification.request.content.data;
  
  switch (action) {
    case 'mark_paid':
      markBillAsPaid(reminderId);
      break;
    case 'snooze':
      snoozeReminder(reminderId, 3600); // 1 hour
      break;
    default:
      navigateToReminder(reminderId);
  }
};
```

**UI Components:**
- Reminders list (upcoming, overdue)
- Notification settings panel
- Quick action buttons
- Payment confirmation modal
- History view with filters

**Screen Layout:**
```
Reminders Tab
├── Upcoming (Next 7 Days)
│   ├── Today
│   │   └── Rent - ₹15,000 (Due today)
│   ├── Tomorrow
│   │   └── Internet - ₹1,000
│   └── This Week
│       └── Electricity - ₹2,000 (Due Dec 5)
├── Overdue (Red Alert)
│   └── Phone Bill - ₹500 (Overdue by 2 days)
└── Paid This Month
    └── Netflix - ₹500 (Paid Nov 28)
```

---

### 6. Expense History & Ratio Tracking

**Overview:**
Powerful filtering and analysis tools to understand spending patterns.

**Key Features:**
- 📅 Filter by: **Day, Week, or Month**
- 📊 Category ratio comparison
- 📈 Cumulative chart view with date slider
- 🔍 Search and filter by category, amount, notes
- 📉 Ratio calculation: `(CategoryTotal / TotalExpense) * 100`
- 📱 Export filtered data
- 🎯 Budget comparison overlay

**Filter Options:**
```typescript
interface HistoryFilter {
  period: 'day' | 'week' | 'month' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[]; // Filter by specific categories
  type: 'all' | 'income' | 'expense';
  amountRange?: {
    min: number;
    max: number;
  };
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}
```

**Ratio Calculations:**
```typescript
interface CategoryRatio {
  category: string;
  total: number;
  ratio: number; // Percentage of total expense
  count: number; // Number of transactions
  average: number; // Average per transaction
  trend: 'up' | 'down' | 'stable'; // vs previous period
  trendPercentage: number;
}

// Calculate ratios
const calculateRatios = (expenses: Expense[]): CategoryRatio[] => {
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categoryTotals).map(([category, total]) => ({
    category,
    total,
    ratio: (total / totalExpense) * 100,
    count: expenses.filter(e => e.category === category).length,
    average: total / expenses.filter(e => e.category === category).length,
    trend: calculateTrend(category, expenses),
    trendPercentage: calculateTrendPercentage(category, expenses)
  }));
};
```

**Visual Components:**
1. **Timeline Chart**
   - Line chart for cumulative spending
   - Bar chart for daily/weekly breakdown
   - Category-colored stacks

2. **Ratio Pie Chart**
   - Interactive segments
   - Percentage labels
   - Legend with colors

3. **Category Cards**
   ```
   ┌─────────────────────────┐
   │ 🍔 Food                 │
   │ ₹8,000 (28.5%)         │
   │ ↑ 5% vs last period    │
   │ 24 transactions        │
   └─────────────────────────┘
   ```

4. **Transaction List**
   - Grouped by date
   - Color-coded by category
   - Swipe actions (edit/delete)

**Screen Layout:**
```
History Tab
├── Period Selector (Day | Week | Month)
├── Date Range Picker
├── Summary Cards
│   ├── Total Spent: ₹28,000
│   ├── Avg per Day: ₹1,000
│   └── Top Category: Food (28.5%)
├── Visualization Tabs
│   ├── Chart View
│   └── Ratio View (Pie Chart)
├── Category Ratio List
│   ├── Food: 28.5%
│   ├── Transport: 15.2%
│   └── Bills: 35.8%
└── Transaction List (Paginated)
    ├── Dec 5, 2025
    │   ├── Groceries - ₹1,200
    │   └── Fuel - ₹800
    └── Dec 4, 2025
        └── Lunch - ₹300
```

---

### 7. Insights & Analytics Dashboard

**Overview:**
AI-powered insights to help users understand and optimize their spending.

**Key Features:**
- 💡 "Where your money goes" visualization cards
- 📊 Average daily spend by category
- 🏆 Category leaderboard (highest to lowest)
- 💰 Personalized saving recommendations
- 🚨 Overspending alerts (when ratio exceeds average)
- 📈 Spending trajectory prediction
- 🎯 Goal tracking and progress
- 📅 Best/worst spending days analysis

**Insight Types:**

1. **Spending Breakdown Cards**
```typescript
interface SpendingInsight {
  title: string;
  description: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
  action?: {
    label: string;
    route: string;
  };
}

// Examples:
const insights = [
  {
    title: "Your Top Expense",
    description: "Food & Dining takes 28% of your budget",
    amount: 8400,
    percentage: 28,
    icon: "🍔",
    color: "#F59E0B"
  },
  {
    title: "Hidden Cost",
    description: "Transport costs increased by 15% this month",
    amount: 4200,
    percentage: 15,
    icon: "🚗",
    color: "#EF4444"
  }
];
```

2. **Category Leaderboard**
```
Top Spending Categories (This Month)
1. 🏠 Bills & Utilities     ₹10,000  (35.8%)
2. 🍔 Food & Dining         ₹8,000   (28.5%)
3. 🚗 Transport             ₹4,200   (15.0%)
4. 🛍️ Shopping              ₹3,500   (12.5%)
5. 🎬 Entertainment         ₹2,300   (8.2%)
```

3. **Saving Recommendations**
```typescript
interface SavingTip {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

// Algorithm for generating tips
const generateSavingTips = (expenses: Expense[], avgData: AvgData): SavingTip[] => {
  const tips: SavingTip[] = [];
  
  // Check if spending exceeds average
  expenses.forEach(category => {
    const userAvg = category.average;
    const nationalAvg = avgData[category.name];
    
    if (userAvg > nationalAvg * 1.2) { // 20% above average
      tips.push({
        title: `Reduce ${category.name} Spending`,
        description: `You spend ₹${userAvg} on ${category.name}, which is 20% above average`,
        potentialSaving: userAvg - nationalAvg,
        category: category.name,
        priority: 'high',
        actionable: true
      });
    }
  });
  
  return tips;
};
```

4. **Overspending Alerts**
```typescript
interface OverspendAlert {
  category: string;
  current: number;
  average: number;
  excess: number;
  excessPercentage: number;
  severity: 'warning' | 'danger';
}

// Trigger alerts
const checkOverspending = (current: number, average: number): boolean => {
  return current > average * 1.3; // 30% threshold
};
```

5. **Spending Trajectory**
```typescript
// Predict next month spending based on current trend
const predictNextMonth = (expenses: Expense[]): number => {
  const last3Months = getLastNMonths(expenses, 3);
  const trend = calculateLinearTrend(last3Months);
  const avgGrowth = trend.slope;
  
  return last3Months[last3Months.length - 1] * (1 + avgGrowth);
};
```

**Analytics Dashboard Layout:**
```
Insights Tab
├── Quick Stats Bar
│   ├── Avg Daily: ₹933
│   ├── High Day: ₹2,100
│   └── Low Day: ₹420
├── Where Your Money Goes
│   ├── Card: Top Expense (Food 28%)
│   ├── Card: Hidden Cost (Transport ↑15%)
│   └── Card: Best Category (Entertainment ↓10%)
├── Category Leaderboard
│   └── Ranked list with percentages
├── Saving Opportunities
│   ├── Tip: Cook at home 2x/week → Save ₹1,200
│   ├── Tip: Use public transport → Save ₹800
│   └── Tip: Cancel unused subscriptions → Save ₹500
├── Alerts & Warnings
│   └── ⚠️ Shopping 30% above average
└── Spending Prediction
    └── Next Month Forecast: ₹29,500
```

**Insight Algorithms:**
```typescript
// Best/Worst spending days
const analyzeDays = (expenses: Expense[]) => {
  const dailyTotals = groupByDay(expenses);
  
  return {
    bestDay: {
      date: minBy(dailyTotals, 'amount').date,
      amount: minBy(dailyTotals, 'amount').amount
    },
    worstDay: {
      date: maxBy(dailyTotals, 'amount').date,
      amount: maxBy(dailyTotals, 'amount').amount
    },
    averageDay: mean(dailyTotals.map(d => d.amount))
  };
};

// Category performance
const categoryPerformance = (current: Expense[], previous: Expense[]) => {
  const currentRatios = calculateRatios(current);
  const previousRatios = calculateRatios(previous);
  
  return currentRatios.map(curr => {
    const prev = previousRatios.find(p => p.category === curr.category);
    return {
      ...curr,
      change: prev ? curr.ratio - prev.ratio : 0,
      performance: curr.ratio < prev?.ratio ? 'improved' : 'worsened'
    };
  });
};
```

---

### 8. Export & Backup

**Overview:**
Secure data export and cloud synchronization options.

**Key Features:**
- 📄 Export data to CSV/Excel
- 📧 Email export files
- ☁️ Cloud backup (Firebase/Supabase - Phase 2)
- 🔄 Auto-sync across devices (Phase 2)
- 📦 Local backup with encryption
- 🔐 Data import/restore functionality
- 📊 PDF report generation

**Export Formats:**

1. **CSV Export**
```csv
Date,Type,Category,Amount,Note,IsRecurring
2025-12-05,Expense,Food,1200,"Groceries at Walmart",false
2025-12-05,Expense,Transport,800,"Fuel",false
2025-12-04,Income,Salary,50000,"Monthly salary",true
```

2. **PDF Report** (Future)
- Monthly summary with charts
- Category breakdown
- Insights and recommendations
- Recurring expenses list

**Implementation:**
```typescript
// Export to CSV
const exportToCSV = (expenses: Expense[]): string => {
  const header = 'Date,Type,Category,Amount,Note,IsRecurring\n';
  const rows = expenses.map(exp => 
    `${exp.date},${exp.type},${exp.category},${exp.amount},"${exp.note || ''}",${exp.isRecurring || false}`
  ).join('\n');
  
  return header + rows;
};

// Save and share
const exportAndShare = async () => {
  const csvData = exportToCSV(allExpenses);
  const fileUri = await FileSystem.writeAsStringAsync(
    FileSystem.documentDirectory + 'finpool_export.csv',
    csvData
  );
  
  await Sharing.shareAsync(fileUri);
};

// Cloud sync (Phase 2)
const syncToCloud = async (userId: string, data: AppState) => {
  try {
    await firebase.firestore()
      .collection('users')
      .doc(userId)
      .set({
        expenses: data.expenses,
        recurring: data.recurring,
        settings: data.settings,
        lastSync: new Date().toISOString()
      }, { merge: true });
    
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
```

**UI Components:**
- Export options menu
- Date range selector
- Format picker (CSV, PDF)
- Share sheet
- Backup status indicator
- Last sync timestamp

---

## v2.0 App Structure (Revised Tabs)

### Bottom Navigation Tabs

```
┌─────────┬───────────┬─────────┬───────────┬─────────┐
│  Home   │ Recurring │   Add   │ Reminders │ Profile │
│   🏠    │    🔄     │   ➕    │    ⏰     │   👤   │
└─────────┴───────────┴─────────┴───────────┴─────────┘
```

### Tab Details:

#### 1. 🏠 Home (Dashboard)
**Purpose:** Monthly overview and quick insights

**Sections:**
- Balance Card (Income, Expense, Remaining)
- Weekly Summary Card
- Category Ratio Pie Chart
- Quick Add FAB
- Top Spending Categories
- Month-over-Month Comparison
- Quick Stats (Avg Daily, Total Days, etc.)

**Actions:**
- Quick add expense/income
- Navigate to detailed views
- View daily breakdown
- Access insights

---

#### 2. 🔄 Recurring (Static Expenses)
**Purpose:** Manage all fixed, predictable expenses

**Sections:**
- Total Recurring Amount Card
- Add New Recurring Button
- Active Recurring List
- Inactive/Archived List
- Payment History

**Actions:**
- Add new recurring expense
- Edit existing recurring expense
- Toggle active/inactive
- View payment history
- Delete recurring expense
- Set reminders

---

#### 3. ➕ Add (Center Button)
**Purpose:** Quick expense/income entry

**Behavior:**
- Opens as modal/bottom sheet
- Quick entry form
- Category selection
- Amount input with calculator
- Date picker (default: today)
- Mark as recurring toggle
- Save & Add Another option

**Form Fields:**
- Type selector (Expense/Income)
- Amount (₹)
- Category
- Date
- Note (optional)
- Is Recurring? (checkbox)
- Tags (optional)

---

#### 4. 📊 History (Replaces old Loans)
**Purpose:** Detailed expense tracking and analysis

**Sections:**
- Period Filter (Day/Week/Month)
- Date Range Picker
- Summary Cards (Total, Avg, Top Category)
- Chart View (Line/Bar)
- Ratio View (Pie Chart)
- Transaction List (Grouped by date)
- Search & Filter Options

**Actions:**
- Filter by period
- Search transactions
- Edit transaction
- Delete transaction
- View details
- Export data

---

#### 5. ⏰ Reminders (Replaces old Activity)
**Purpose:** Bill reminders and payment tracking

**Sections:**
- Upcoming Reminders (Next 7 days)
- Overdue Bills (Red alert)
- Today's Reminders
- This Week
- Paid This Month
- Notification Settings

**Actions:**
- Mark as paid
- Snooze reminder
- Edit reminder
- View payment history
- Configure notification settings
- Add new reminder

---

#### 6. 👤 Profile (Settings & Export)
**Purpose:** User settings and data management

**Sections:**
- User Info Card
- **Export & Backup**
  - Export to CSV
  - Generate PDF Report
  - Cloud Sync (Phase 2)
- **Settings**
  - Notification Preferences
  - Default Categories
  - Currency Settings
  - Theme (Dark/Light)
- **About**
  - App Version
  - Privacy Policy
  - Terms of Service
- Logout

---

## v2.0 State Management (Redux)

### Complete State Structure

```typescript
interface AppState {
  // Authentication
  auth: {
    isAuthenticated: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      currency: string; // Default: 'INR'
      timezone: string;
    };
    token?: string;
  };

  // Expenses
  expenses: {
    list: Expense[];
    filterType: 'daily' | 'weekly' | 'monthly' | 'custom';
    filterDate: {
      start: string;
      end: string;
    };
    totalIncome: number;
    totalExpense: number;
    balance: number;
    categories: Category[];
  };

  // Recurring Expenses
  recurring: {
    list: RecurringExpense[];
    active: RecurringExpense[];
    inactive: RecurringExpense[];
    nextDue: RecurringExpense[];
    totalMonthly: number;
    totalYearly: number;
  };

  // Analytics & Insights
  analytics: {
    dailyAverage: number;
    weeklyTrend: WeeklyTrend;
    monthlyOverview: MonthlyOverview;
    categoryRatios: CategoryRatio[];
    topCategories: CategorySpend[];
    insights: Insight[];
    savingTips: SavingTip[];
    predictions: {
      nextMonth: number;
      nextWeek: number;
    };
  };

  // Notifications & Reminders
  notifications: {
    list: Notification[];
    unreadCount: number;
    reminders: BillReminder[];
    settings: {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
      defaultReminderDays: number[];
      timeOfDay: string;
    };
  };

  // App Settings
  settings: {
    theme: 'light' | 'dark' | 'auto';
    currency: string;
    defaultView: 'daily' | 'weekly' | 'monthly';
    categories: Category[];
    notifications: NotificationSettings;
    sync: {
      enabled: boolean;
      lastSync?: string;
    };
  };

  // UI State
  ui: {
    loading: boolean;
    error: string | null;
    activeTab: string;
    modalOpen: boolean;
  };
}
```

### Data Models

#### Expense
```typescript
interface Expense {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note?: string;
  date: string; // ISO format
  timestamp: number;
  isRecurring?: boolean;
  recurringId?: string;
  tags?: string[];
  attachments?: string[]; // Future: receipt images
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}
```

#### Recurring Expense
```typescript
type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: Frequency;
  startDate: string;
  endDate?: string; // Optional: for fixed-term expenses
  nextDueDate: string;
  reminderBeforeDays: number;
  active: boolean;
  autoAdd: boolean; // Auto-add to expenses on due date
  notes?: string;
  lastPaidDate?: string;
  history: PaymentHistory[];
  createdAt: string;
  updatedAt: string;
}

interface PaymentHistory {
  date: string;
  paid: boolean;
  amount: number;
  note?: string;
}
```

#### Bill Reminder
```typescript
interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  reminderDate: string;
  recurringExpenseId?: string;
  status: 'pending' | 'snoozed' | 'paid' | 'overdue';
  notificationIds: string[];
  snoozeCount: number;
  reminderSettings: {
    daysBefore: number[];
    timeOfDay: string;
  };
  paidDate?: string;
  createdAt: string;
}
```

#### Category
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  budget?: number; // Optional category budget
  isDefault: boolean;
  isCustom: boolean;
}
```

### Redux Slices

#### expenseSlice.ts
```typescript
const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense(state, action: PayloadAction<Expense>) {
      state.list.unshift(action.payload);
      // Update totals
      if (action.payload.type === 'income') {
        state.totalIncome += action.payload.amount;
      } else {
        state.totalExpense += action.payload.amount;
      }
      state.balance = state.totalIncome - state.totalExpense;
    },
    
    updateExpense(state, action: PayloadAction<Expense>) {
      const index = state.list.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        const old = state.list[index];
        // Revert old amounts
        if (old.type === 'income') {
          state.totalIncome -= old.amount;
        } else {
          state.totalExpense -= old.amount;
        }
        // Add new amounts
        if (action.payload.type === 'income') {
          state.totalIncome += action.payload.amount;
        } else {
          state.totalExpense += action.payload.amount;
        }
        state.list[index] = action.payload;
        state.balance = state.totalIncome - state.totalExpense;
      }
    },
    
    deleteExpense(state, action: PayloadAction<string>) {
      const expense = state.list.find(e => e.id === action.payload);
      if (expense) {
        if (expense.type === 'income') {
          state.totalIncome -= expense.amount;
        } else {
          state.totalExpense -= expense.amount;
        }
        state.list = state.list.filter(e => e.id !== action.payload);
        state.balance = state.totalIncome - state.totalExpense;
      }
    },
    
    setFilter(state, action: PayloadAction<FilterState>) {
      state.filterType = action.payload.type;
      state.filterDate = action.payload.date;
    }
  }
});
```

#### recurringSlice.ts
```typescript
const recurringSlice = createSlice({
  name: 'recurring',
  initialState,
  reducers: {
    addRecurring(state, action: PayloadAction<RecurringExpense>) {
      state.list.unshift(action.payload);
      if (action.payload.active) {
        state.active.push(action.payload);
        state.totalMonthly += calculateMonthlyAmount(action.payload);
      }
    },
    
    updateRecurring(state, action: PayloadAction<RecurringExpense>) {
      const index = state.list.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
        // Recalculate totals
        state.totalMonthly = state.active.reduce(
          (sum, r) => sum + calculateMonthlyAmount(r), 
          0
        );
      }
    },
    
    toggleActive(state, action: PayloadAction<string>) {
      const recurring = state.list.find(r => r.id === action.payload);
      if (recurring) {
        recurring.active = !recurring.active;
        // Update active/inactive lists
        state.active = state.list.filter(r => r.active);
        state.inactive = state.list.filter(r => !r.active);
        // Recalculate totals
        state.totalMonthly = state.active.reduce(
          (sum, r) => sum + calculateMonthlyAmount(r),
          0
        );
      }
    },
    
    markAsPaid(state, action: PayloadAction<{ id: string; date: string }>) {
      const recurring = state.list.find(r => r.id === action.payload.id);
      if (recurring) {
        recurring.history.push({
          date: action.payload.date,
          paid: true,
          amount: recurring.amount
        });
        recurring.lastPaidDate = action.payload.date;
        recurring.nextDueDate = calculateNextDueDate(recurring);
      }
    }
  }
});
```

#### analyticsSlice.ts
```typescript
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    calculateAnalytics(state, action: PayloadAction<Expense[]>) {
      const expenses = action.payload;
      
      // Daily average
      state.dailyAverage = calculateDailyAverage(expenses);
      
      // Weekly trend
      state.weeklyTrend = calculateWeeklyTrend(expenses);
      
      // Category ratios
      state.categoryRatios = calculateCategoryRatios(expenses);
      
      // Top categories
      state.topCategories = getTopCategories(expenses, 5);
      
      // Generate insights
      state.insights = generateInsights(expenses, state);
      
      // Saving tips
      state.savingTips = generateSavingTips(expenses, state);
      
      // Predictions
      state.predictions = {
        nextMonth: predictNextMonth(expenses),
        nextWeek: predictNextWeek(expenses)
      };
    }
  }
});
```

---

## v2.0 Development Phases

### Phase 1: Core MVP Refactor (Weeks 1-4)

**Goal:** Transform loan tracking into expense tracking foundation

**Tasks:**
1. ✅ Replace loanSlice with expenseSlice
   - Create new expense data model
   - Implement CRUD operations
   - Update Redux store configuration

2. ✅ Replace recurringSlice
   - Migrate loan EMI logic to recurring expenses
   - Implement frequency-based calculations
   - Add auto-add functionality

3. ✅ Redesign Home/Dashboard
   - Remove loan-specific components
   - Add balance card with income/expense split
   - Implement category ratio cards
   - Add weekly summary section

4. ✅ Update Add screen
   - Remove loan-specific fields
   - Add expense/income toggle
   - Simplify category selection
   - Add recurring checkbox

5. ✅ History filter implementation
   - Add period selector (Day/Week/Month)
   - Implement date range picker
   - Create filtered views
   - Add transaction list

6. ✅ Update navigation
   - Rename tabs
   - Update icons
   - Configure routing
   - Hide unnecessary screens

**Deliverables:**
- Working expense tracking
- Recurring expenses management
- Basic history view
- Updated dashboard

---

### Phase 2: Notifications & Reminders (Weeks 5-6)

**Goal:** Implement bill reminders and push notifications

**Tasks:**
1. ✅ Expo Notifications setup
   - Configure permissions
   - Setup notification channels
   - Implement background tasks

2. ✅ Reminder system
   - Create reminder data model
   - Implement scheduling logic
   - Add notification actions

3. ✅ Reminders UI
   - Build reminders list
   - Add upcoming/overdue views
   - Implement mark as paid
   - Add snooze functionality

4. ✅ Notification settings
   - Create settings panel
   - Add preference controls
   - Implement reminder customization

**Deliverables:**
- Local push notifications
- Bill reminder system
- Reminders screen
- Notification settings

---

### Phase 3: Analytics & Insights (Weeks 7-9)

**Goal:** Add intelligence and data visualization

**Tasks:**
1. ✅ Analytics engine
   - Implement ratio calculations
   - Create trend analysis
   - Build prediction models

2. ✅ Charts & Visualizations
   - Integrate charting library (Victory/Recharts Native)
   - Create pie charts for ratios
   - Add line charts for trends
   - Build bar charts for comparisons

3. ✅ Insights generation
   - Implement insight algorithms
   - Create saving tip generator
   - Add overspending alerts
   - Build performance tracking

4. ✅ History enhancements
   - Add chart views
   - Implement ratio views
   - Create category drill-down
   - Add search functionality

**Deliverables:**
- Complete analytics dashboard
- Interactive charts
- Automated insights
- Enhanced history view

---

### Phase 4: Export & Polish (Weeks 10-12)

**Goal:** Data export, optimization, and final polish

**Tasks:**
1. ✅ Export functionality
   - CSV export implementation
   - Email sharing
   - PDF generation (future)

2. ✅ Performance optimization
   - Implement pagination
   - Add memoization
   - Optimize re-renders
   - Cache calculations

3. ✅ UI/UX polish
   - Add animations
   - Improve transitions
   - Enhance loading states
   - Add empty states

4. ✅ Testing
   - Unit tests for Redux
   - Integration tests
   - E2E testing
   - Bug fixes

**Deliverables:**
- Export functionality
- Optimized performance
- Polished UI
- Tested app

---

### Phase 5: Cloud Sync (Weeks 13-16) - Post-MVP

**Goal:** Cloud backup and multi-device sync

**Tasks:**
1. ✅ Backend setup
   - Firebase/Supabase configuration
   - Authentication integration
   - Database schema design

2. ✅ Sync implementation
   - Bidirectional sync logic
   - Conflict resolution
   - Offline support

3. ✅ Security
   - Data encryption
   - Secure API calls
   - Biometric authentication

**Deliverables:**
- Cloud backup
- Multi-device sync
- Enhanced security

---

## v2.0 UI/UX Enhancements

### Design Consistency

**Maintain from v1.0:**
- Purple gradient theme
- Color palette
- Typography system
- Component styles
- Bottom tab design
- Card layouts
- Button styles

### New Components

**Charts & Graphs:**
```typescript
// Pie Chart for category ratios
<PieChart
  data={categoryData}
  width={width}
  height={220}
  chartConfig={chartConfig}
  accessor="ratio"
  backgroundColor="transparent"
  paddingLeft="15"
/>

// Line Chart for trends
<LineChart
  data={weeklyData}
  width={width}
  height={220}
  chartConfig={chartConfig}
  bezier
/>

// Bar Chart for comparisons
<BarChart
  data={dailyData}
  width={width}
  height={220}
  chartConfig={chartConfig}
  verticalLabelRotation={30}
/>
```

### Animation Patterns

**Page Transitions:**
- Smooth slide transitions
- Fade in/out for modals
- Scale animations for cards
- Ripple effects for buttons

**Micro-interactions:**
- Button press animations
- Loading skeletons
- Success checkmarks
- Error shakes
- Swipe gestures

---

## v2.0 Performance Optimization

### Strategies

1. **Virtualized Lists**
   - Use FlatList for transactions
   - Implement windowing
   - Add pagination

2. **Memoization**
   - React.memo for components
   - useMemo for calculations
   - useCallback for functions
   - Reselect for Redux selectors

3. **Code Splitting**
   - Lazy load screens
   - Dynamic imports
   - Route-based splitting

4. **Caching**
   - Cache chart data
   - Memoize analytics
   - Store computed values

5. **Debouncing**
   - Search inputs
   - Filter changes
   - Auto-save

---

## v2.0 Testing Strategy

### Test Coverage

**Unit Tests:**
- Redux reducers (100%)
- Utility functions
- Calculation logic
- Date/time helpers

**Integration Tests:**
- Redux + React
- Navigation flows
- Data persistence
- Notification handling

**E2E Tests:**
- Add expense flow
- Recurring expense setup
- Filter and search
- Export functionality

### Test Tools

- Jest (unit tests)
- React Native Testing Library
- Detox (E2E)
- Maestro (UI automation)

---

## v2.0 Optional Enhancements

### Future Features

1. **Budget Goals**
   - Set monthly/category budgets
   - Progress tracking
   - Visual indicators
   - Overspend warnings

2. **AI Predictions**
   - ML-based spending predictions
   - Anomaly detection
   - Smart categorization
   - Personalized tips

3. **Social Features**
   - Bill splitting
   - Shared expenses
   - Group budgets
   - Expense challenges

4. **Advanced Analytics**
   - Year-over-year comparisons
   - Seasonal trends
   - Category forecasting
   - Custom reports

5. **Integrations**
   - Bank account linking
   - Receipt scanning (OCR)
   - SMS parser for expenses
   - Calendar integration

6. **Gamification**
   - Saving streaks
   - Achievement badges
   - Leaderboards
   - Reward points

---

## v2.0 Migration Strategy

### Data Migration Plan

**From v1.0 to v2.0:**

```typescript
// Migration function
const migrateFromV1toV2 = async () => {
  try {
    // Get v1.0 data
    const v1Data = await AsyncStorage.getItem('persist:root');
    const parsed = JSON.parse(v1Data);
    
    // Migrate loans to recurring expenses
    const loans = parsed.loans?.loans || [];
    const recurringExpenses = loans.map(loan => ({
      id: loan.id,
      title: `${loan.loanType} Loan - ${loan.lenderName}`,
      amount: loan.emiAmount,
      category: 'Loans & EMI',
      frequency: 'monthly',
      startDate: loan.startDate,
      nextDueDate: calculateNextEMI(loan),
      reminderBeforeDays: 3,
      active: loan.status === 'active',
      autoAdd: true,
      notes: loan.description
    }));
    
    // Migrate transactions (keep as-is)
    const transactions = parsed.transactions?.transactions || [];
    
    // Create v2.0 structure
    const v2Data = {
      auth: parsed.auth,
      expenses: {
        list: transactions,
        filterType: 'monthly',
        filterDate: {
          start: startOfMonth(new Date()).toISOString(),
          end: endOfMonth(new Date()).toISOString()
        },
        totalIncome: parsed.transactions?.totalIncome || 0,
        totalExpense: parsed.transactions?.totalExpense || 0,
        balance: parsed.transactions?.balance || 0,
        categories: defaultCategories
      },
      recurring: {
        list: recurringExpenses,
        active: recurringExpenses.filter(r => r.active),
        inactive: recurringExpenses.filter(r => !r.active),
        nextDue: recurringExpenses.filter(r => isUpcoming(r.nextDueDate)),
        totalMonthly: recurringExpenses.reduce((sum, r) => sum + r.amount, 0),
        totalYearly: 0
      },
      notifications: parsed.notifications || initialNotifications,
      analytics: calculateInitialAnalytics(transactions),
      settings: defaultSettings,
      ui: initialUIState
    };
    
    // Save v2.0 data
    await AsyncStorage.setItem('persist:root', JSON.stringify(v2Data));
    await AsyncStorage.setItem('migration:completed', 'v2.0');
    
    return { success: true, data: v2Data };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
};
```

**Migration Steps:**
1. Check if migration is needed
2. Backup v1.0 data
3. Run migration function
4. Verify data integrity
5. Mark migration as complete
6. Show success message to user

---

## v2.0 Success Metrics

### KPIs to Track

1. **User Engagement**
   - Daily active users (DAU)
   - Monthly active users (MAU)
   - Session duration
   - Expenses added per day

2. **Feature Adoption**
   - % users with recurring expenses
   - % users with reminders enabled
   - % users viewing insights
   - Export usage rate

3. **User Retention**
   - Day 1, 7, 30 retention
   - Churn rate
   - User lifetime value

4. **Performance**
   - App load time
   - Screen transition time
   - Crash-free rate
   - API response time

5. **Business**
   - App store ratings
   - User reviews sentiment
   - Feature requests
   - Bug reports

---

**Document Version:** 2.0.0-DRAFT  
**Last Updated:** November 11, 2025  
**Status:** Planning & Design Phase

