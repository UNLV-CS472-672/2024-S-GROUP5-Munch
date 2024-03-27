import tamaguiConfig from '@/tamagui.config';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import { tokenCache } from './utils/tokenCache';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY!} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();

  const router = useRouter();
  useEffect(() => {
    if (!isLoaded) return;
    const inTabGroup = segments[0] === '(auth)';

    if (isSignedIn && !inTabGroup) {
      router.replace('/');
    }
    if (!isSignedIn) {
      router.replace('/login');
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme as string}
      >
        <Slot />
      </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme as string}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen
            name='(auth)/login'
            options={{
              presentation: 'card',
              title: 'Log in',
            }}
          />
          <Stack.Screen
            name='(auth)/register'
            options={{
              presentation: 'card',
              title: 'Register ',
            }}
          />
        </Stack>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
