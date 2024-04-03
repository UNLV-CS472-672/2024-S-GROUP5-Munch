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
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfigParams,
} from 'react-native-toast-message';
import { TamaguiProvider, useTheme } from 'tamagui';
import { tokenCache } from './utils/tokenCache';
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme as string}
      >
        <RootLayoutNav />
      </TamaguiProvider>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const theme = useTheme();
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

  const toastConfig = {
    success: (props: ToastConfigParams<any>) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.green10.get(),
          backgroundColor: theme.backgroundHover.get(),
        }}
        text1Style={{
          color: theme.accentColor.get(),
        }}
        text1NumberOfLines={3}
      />
    ),
    error: (props: ToastConfigParams<any>) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.red10.get(),
          backgroundColor: theme.backgroundHover.get(),
        }}
        text1Style={{
          color: theme.accentColor.get(),
        }}
        text1NumberOfLines={3}
      />
    ),
  };
  if (!isLoaded) {
    return <Slot />;
  }

  return (
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
        <Stack.Screen
          name='(modals)/comments'
          options={{
            presentation: 'modal',
            title: 'Comments',
            animation: 'slide_from_bottom',
            contentStyle: { height: '50%' },
          }}
        />
      </Stack>
      <Toast position='bottom' config={toastConfig} visibilityTime={2000} />
    </ThemeProvider>
  );
}
