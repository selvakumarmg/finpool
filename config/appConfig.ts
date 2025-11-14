const appConfig = {
  featureFlags: {
    enablePremiumUpsell: true,
    enableAdvancedAnalytics: true,
    enableRecurringExpenses: true,
    enableNotifications: true,
    enableExports: true,
  },
  premium: {
    monthlyAmount: 399, // INR per month
    currency: 'INR',
  },
  localization: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ta', 'ml', 'hi', 'te', 'ka'] as const,
  },
};

export type SupportedLanguage = (typeof appConfig.localization.supportedLanguages)[number];

export default appConfig;

