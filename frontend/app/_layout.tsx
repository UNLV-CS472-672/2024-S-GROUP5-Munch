import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';
import { tokenCache } from './utils/tokenCache';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/tamagui.config';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Prevent the splash screen from auto-hiding before asset loading is complete.
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
      <TamaguiProvider config={tamaguiConfig}>
        <RootLayoutNav />
      </TamaguiProvider>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded && !isSignedIn) {
      router.push('/(auths)/login');
    }
  }, [isLoaded]);
  useEffect(() => {
    console.log(isSignedIn);
  }, [isSignedIn]);
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen
          name='(auths)/login'
          options={{
            presentation: 'modal',
            title: 'Log in or Sign up to Munch',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name='close-outline' size={28} />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
