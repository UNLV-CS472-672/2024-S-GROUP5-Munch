import { UserContext, UserContextType } from '@/contexts/UserContext';
import config from '@/tamagui.config';
import { UserType } from '@/types/firebaseTypes';
import { tokenCache } from '@/utils/tokenCache';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { UserResource } from '@clerk/types';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfigParams,
} from 'react-native-toast-message';
import { Spinner, TamaguiProvider, useTheme } from 'tamagui';

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
  const [userContext, setUserContext] = useState<UserContextType>({
    token: '',
    user: {} as UserResource,
    user_id: '',
    user_data: {} as UserType,
    user_loading: true,
  });
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
          <UserContext.Provider
            value={{
              token: userContext.token,
              user: userContext.user,
              user_id: userContext.user_id,
              setUserProperties: setUserContext,
              user_data: userContext.user_data,
              user_loading: userContext.user_loading,
            }}
          >
            <RootLayoutNav />
            {/* <DevToolsBubble />  // uncomment for dev tools */}
          </UserContext.Provider>
        </QueryClientProvider>
      </TamaguiProvider>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  //themes
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const { setUserProperties } = useContext(UserContext);
  const { getToken } = useAuth();
  const { user } = useUser();

  //routes
  const segments = useSegments();
  const router = useRouter();

  //auth
  const { isLoaded, isSignedIn } = useAuth();

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

  const { isLoading } = useQuery({
    queryKey: ['userData', user],
    queryFn: async () => {
      if (!user) return {} as UserType;
      const token = await getToken();
      const res = await axios.get<UserType>(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/users/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setUserProperties({
        token: token,
        user: user,
        user_id: user.id,
        user_data: res.data,
        user_loading: false,
      });

      return res.data;
    },
  });

  useEffect(() => {
    (async () => {
      if (!isLoaded) return;
      const inTabGroup = segments[0] === '(auth)';
      //token is only retrieved when signed in
      if (isSignedIn && !isLoading) {
        router.replace('/');
      } else if (!isSignedIn) {
        setUserProperties({
          token: '',
          user: {} as UserResource,
          user_id: '',
          user_data: {} as UserType,
          user_loading: false,
        });
        router.replace('/login');
      }
    })();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return <Slot />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {isLoading && <Spinner />}
      {!isLoading && (
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
      )}
      <Toast position='bottom' config={toastConfig} visibilityTime={2000} />
    </ThemeProvider>
  );
}
