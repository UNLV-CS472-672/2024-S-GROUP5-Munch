import UserInput from '@/components/UserInput';
import { RegisterSchema, RegisterSchemaInputs } from '@/types/user';
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { SignUpStatus } from '@clerk/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button, Form, Separator, Text, View, XStack, YStack } from 'tamagui';

const Register = () => {
  const {
    signUp: { create },
    setActive,
  } = useSignUp();

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
        console.error({ ...err });
      } else {
        console.error(err);
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
