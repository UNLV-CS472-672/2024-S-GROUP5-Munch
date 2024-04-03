import { UserContext, UserContextType } from '@/contexts/UserContext';
import config from '@/tamagui.config';
import { tokenCache } from '@/utils/tokenCache';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { UserResource } from '@clerk/types';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfigParams,
} from 'react-native-toast-message';
import { TamaguiProvider, useTheme } from 'tamagui';

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
      <TamaguiProvider config={config} defaultTheme={colorScheme as string}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
          {/* <DevToolsBubble />  // uncomment for dev tools */}
        </QueryClientProvider>
      </TamaguiProvider>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  //themes
  const colorScheme = useColorScheme();
  const theme = useTheme();

  //routes
  const segments = useSegments();
  const router = useRouter();

  //auth
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [userContext, setUserContext] = useState<UserContextType>({
    token: '',
    user: {} as UserResource,
    user_id: '',
  });

  //config

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

  useEffect(() => {
    (async () => {
      if (!isLoaded) return;
      const inTabGroup = segments[0] === '(auth)';

      if (isSignedIn && !inTabGroup) {
        //fill in the context if we are signed in
        setUserContext({
          token: await getToken(),
          user: user,
          user_id: user.id,
        });
        router.replace('/');
      }
      if (!isSignedIn) {
        router.replace('/login');
      }
    })();
  }, [isSignedIn]);

  if (!isLoaded) {
    return <Slot />;
  }

  return (
    <UserContext.Provider
      value={{
        token: userContext.token,
        user: userContext.user,
        user_id: userContext.user_id,
        setUserProperties: setUserContext,
      }}
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
    </UserContext.Provider>
  );
}
