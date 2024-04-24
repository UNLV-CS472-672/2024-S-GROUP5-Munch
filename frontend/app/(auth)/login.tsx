import UserInput from '@/components/UserInput';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { LoginSchema, LoginSchemaInputs } from '@/types/user';
import {
  isClerkAPIResponseError,
  useOAuth,
  useSignIn,
  useUser,
} from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Form, Separator, Text, XStack, YStack } from 'tamagui';

enum Strategies {
  Google = 'oauth-google',
  Apple = 'oauth-apple',
  Manual = 'manual',
}
const Login = () => {
  useWarmUpBrowser();

  const { isSignedIn } = useUser();
  const {
    signIn: { create },
    setActive,
  } = useSignIn();

  const router = useRouter();

  const { startOAuthFlow: gOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: aOAuth } = useOAuth({ strategy: 'oauth_apple' });

  //on mount sign in
  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn]);

  const manualSignIn: SubmitHandler<LoginSchemaInputs> = async (data) => {
    try {
      const { createdSessionId } = await create({
        identifier: data.username,
        password: data.password,
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const { errors } = err;
        Toast.show({ text1: errors[0].longMessage, type: 'error' });
      }
    }
  };
  const authProviderSignIn = useCallback(async (strategy: Strategies) => {
    try {
      const curAuth = {
        [Strategies.Apple]: aOAuth,
        [Strategies.Google]: gOAuth,
      }[strategy];

      const { createdSessionId, setActive } = await curAuth();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth err', err);
    }
  }, []);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginSchemaInputs>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  return (
    <View>
      <YStack gap={'$2'} paddingTop={'$5'} marginHorizontal={15}>
        <Image
          style={{ width: 400, height: 300 }}
          resizeMode='contain'
          source={{
            uri: 'https://drive.google.com/thumbnail?id=1iKHSAfc3ll-ACyneu2fVnKeZAxb8hBNy',
          }}
        />
        <Image
          style={{ width: 400, height: 150 }}
          resizeMode='contain'
          source={{
            uri: 'https://drive.google.com/thumbnail?id=15h-LZk8-ng-VGI6ex5pkgFJaByvrEr8J',
          }}
        />
        <Form onSubmit={handleSubmit(manualSignIn)} gap={'$3'}>
          <Controller
            name='username'
            control={control}
            render={({ field }) => (
              <UserInput
                field={field}
                labelID='username'
                placeholder='Username'
                key={'username'}
                sx={{ borderWidth: 1, size: '$4' }}
              />
            )}
          />
          {errors.username?.message && (
            <Text color={'$red10'}>{errors.username.message}</Text>
          )}
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <UserInput
                field={field}
                labelID='password'
                placeholder='Password'
                key={'password'}
                sx={{ borderWidth: 1, size: '$4', secureTextEntry: true }}
              />
            )}
          />
          {errors.password?.message && (
            <Text color={'$red10'}>{errors.password.message}</Text>
          )}
          <Form.Trigger asChild>
            <Button backgroundColor={'$red9'}>
              <Text>Continue</Text>
            </Button>
          </Form.Trigger>
        </Form>

        <Button
          justifyContent='center'
          display='flex'
          alignItems='center'
          pt={'$4'}
          onPress={() => {
            router.push('/register');
          }}
          unstyled
        >
          <Text>Need an account?</Text>
        </Button>
      </YStack>
      <XStack paddingVertical={'$5'}>
        <Separator alignSelf='stretch' />
        <Text alignContent='center' my={'$-2'}>
          Or
        </Text>
        <Separator alignSelf='stretch' />
      </XStack>
      <YStack gap={'$1'} rowGap={'$2'}>
        <Button
          mx={'$4'}
          icon={<Ionicons name='logo-google' size={24} />}
          onPress={() => authProviderSignIn(Strategies.Google)}
        >
          Continue with Google
        </Button>
        <Button
          mx={'$4'}
          icon={<Ionicons name='logo-apple' size={24} />}
          onPress={() => authProviderSignIn(Strategies.Apple)}
        >
          Continue with Apple
        </Button>
      </YStack>
    </View>
  );
};

export default Login;
