import UserInput from '@/components/UserInput';
import { UserContext } from '@/contexts/UserContext';
import { RegisterSchema, RegisterSchemaInputs } from '@/types/user';
import {
  isClerkAPIResponseError,
  useAuth,
  useSignUp,
  useUser,
} from '@clerk/clerk-expo';
import { SignUpStatus } from '@clerk/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { Button, Form, Separator, Text, View, XStack, YStack } from 'tamagui';

const Register = () => {
  const { isSignedIn, user } = useUser();
  const { userId, getToken } = useAuth();
  const { setUserProperties } = useContext(UserContext);
  const {
    signUp: { create },
    setActive,
  } = useSignUp();

  useEffect(() => {
    (async () => {
      setUserProperties({
        token: await getToken(),
        user: user,
        user_id: userId,
      });
    })();
  }, [isSignedIn]);
  const router = useRouter();
  const [status, setStatus] = useState<SignUpStatus>();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterSchemaInputs>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const registerUser: SubmitHandler<RegisterSchemaInputs> = async (data) => {
    try {
      const { createdSessionId, status } = await create({
        username: data.username,
        password: data.password,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
      });

      if (status === 'abandoned' || status === 'missing_requirements') {
        setStatus(status);
        return;
      }
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const { errors } = err;
        Toast.show({ text1: errors[0].longMessage, type: 'error' });
      } else {
        Toast.show({ text1: 'Something unexpected happened', type: 'error' });
      }
    }
  };

  return (
    <View>
      <YStack pt={'$6'}>
        <Form
          onSubmit={handleSubmit(registerUser)}
          gap={'$2'}
          marginHorizontal={15}
          px={'$2'}
        >
          <XStack>
            {/* FIRST NAME */}
            <Controller
              name='firstName'
              control={control}
              render={({ field }) => (
                <UserInput
                  field={field}
                  labelID={'firstName'}
                  placeholder={'Happy'}
                  key={'firstName'}
                  sx={{ borderWidth: 1, size: '$4', width: '50%' }}
                />
              )}
            />
            {errors.firstName?.message && (
              <Text color={'$red10'}>{errors.firstName.message}</Text>
            )}

            {/* LAST NAME */}
            <Controller
              name='lastName'
              control={control}
              render={({ field }) => (
                <UserInput
                  field={field}
                  labelID={'lastName'}
                  placeholder={'Muncher'}
                  key={'lastName'}
                  sx={{ borderWidth: 1, size: '$4', width: '50%' }}
                />
              )}
            />
            {errors.lastName?.message && (
              <Text color={'$red10'}>{errors.lastName.message}</Text>
            )}
          </XStack>

          {/* USERNAME */}
          <Controller
            name='username'
            control={control}
            render={({ field }) => (
              <UserInput
                field={field}
                labelID={'username'}
                placeholder={'Username'}
                key={'username'}
                sx={{ borderWidth: 1, size: '$4' }}
              />
            )}
          />
          {errors.username?.message && (
            <Text color={'$red10'}>{errors.username.message}</Text>
          )}

          {/* PASSWORD */}
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <UserInput
                field={field}
                labelID={'password'}
                placeholder={'Password'}
                key={'password'}
                sx={{ borderWidth: 1, size: '$4', secureTextEntry: true }}
              />
            )}
          />
          {errors.password?.message && (
            <Text color={'$red10'}>{errors.password.message}</Text>
          )}
          <Form.Trigger asChild>
            <Button backgroundColor={'$red9'}>Register</Button>
          </Form.Trigger>
        </Form>
      </YStack>
      <XStack paddingVertical={'$7'}>
        <Separator pr={'$4'} />
        <Button
          my={'$-2.5'}
          onPress={() => {
            router.back();
          }}
          unstyled
        >
          <Text>Already have an account?</Text>
        </Button>
        <Separator alignSelf='stretch' />
      </XStack>
      {status && <>ERROR</>}
    </View>
  );
};

export default Register;
