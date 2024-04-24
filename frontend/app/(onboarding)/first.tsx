import UserInput from '@/components/UserInput';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Form, Separator, Text, XStack, YStack, Image } from 'tamagui';

const First = () => {
  const router = useRouter();


  return (
    <View>
    <Image
        style={{ width: 450, height: 800 }}
        source={{
          uri: 'https://i.ibb.co/J2Fzbqp/Munch-Onboarding-01.png',
        }}
      />
      <YStack gap={'$2'} paddingTop={'$5'} marginHorizontal={15}>
      </YStack>
      <YStack gap={'$1'} rowGap={'$2'}>
        <Button
          mx={'$4'}
          onPress={() => {
          router.push('/second');
        }}
        >
          Continue
        </Button>
      </YStack>
    </View>
  );
};

export default First;
