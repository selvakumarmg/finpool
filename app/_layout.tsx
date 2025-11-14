import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Href, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Text, TextInput } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LocaleProvider } from '@/locale/LocaleProvider';
import { persistor, store } from '@/store';
import { useAppSelector } from '@/store/hooks';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login' as Href);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)/' as Href);
    }
  }, [isAuthenticated, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const interFontSources = {
  Inter_400Regular: {
    uri: 'https://github.com/google/fonts/raw/main/ofl/inter/Inter-Regular.ttf',
  },
  Inter_500Medium: {
    uri: 'https://github.com/google/fonts/raw/main/ofl/inter/Inter-Medium.ttf',
  },
  Inter_600SemiBold: {
    uri: 'https://github.com/google/fonts/raw/main/ofl/inter/Inter-SemiBold.ttf',
  },
  Inter_700Bold: {
    uri: 'https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf',
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(interFontSources);
  const fontAppliedRef = useRef(false);

  useEffect(() => {
    if (!fontsLoaded || fontAppliedRef.current) {
      return;
    }

    const defaultFontFamily = 'Inter_400Regular';
    const applyDefaultFont = (Component: typeof Text | typeof TextInput) => {
      const component = Component as unknown as {
        defaultProps?: {
          style?: unknown;
          [key: string]: unknown;
        };
      };
      const defaultProps = component.defaultProps ?? {};
      const styleArray: unknown[] = [];
      if (defaultProps.style) {
        styleArray.push(
          ...(Array.isArray(defaultProps.style)
            ? defaultProps.style
            : [defaultProps.style]),
        );
      }
      styleArray.push({ fontFamily: defaultFontFamily });

      component.defaultProps = {
        ...defaultProps,
        style: styleArray,
      };
    };

    applyDefaultFont(Text);
    applyDefaultFont(TextInput);
    fontAppliedRef.current = true;
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocaleProvider>
        <RootLayoutNav />
        </LocaleProvider>
      </PersistGate>
    </Provider>
  );
}
