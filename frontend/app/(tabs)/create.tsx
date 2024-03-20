import { View } from '@/components/Themed';
import React from 'react';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, H1, H2, H4, YStack, Text } from 'tamagui';

// should open up gallery so people can upload vid/images
// have option to just do text so new recipe

export default function Create() {
  return (
    <View>
      <YStack>
        <H4 style={{ alignSelf: 'center' }}>NEW POST</H4>
        <TextInput
          placeholder={'Hungry?'}
          multiline={true}
          style={{
            height: 130,
            borderRadius: 5,
            paddingHorizontal: 10,
            textAlignVertical: 'top',
          }}
        />
        <Button backgroundColor={'cyan'} mx={'$4'}>
          <Text color={'$black2'}>Post</Text>
        </Button>
      </YStack>
    </View>
  );
}
