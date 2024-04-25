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
import { TouchableHighlight, Dimensions } from 'react-native';

const Third = () => {
  const router = useRouter();
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  return (
    <View flexDirection='column' flex={1}>
      <Image
        width={width}
        height={height}
        source={{
          uri: 'https://i.ibb.co/B4mbqSp/Munch-Onboarding-03.png',
        }}
        resizeImage={'contain'}
        position={'absolute'}
      />
      <YStack gap={'$2'} paddingTop={'$5'} marginHorizontal={15}></YStack>
      <YStack
        gap={'$1'}
        rowGap={'$2'}
        paddingTop={675}
        flexDirection='column-reverse'
      >
        <Button
          mx={'$4'}
          onPress={() => {
            router.push('/login');
          }}
        >
          Continue
        </Button>
      </YStack>
    </View>
  );
};

export default Third;
