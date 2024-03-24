import { View } from '@/components/Themed';
import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, H1, H2, H4, YStack, Text, Switch, XStack } from 'tamagui';

// should open up gallery so people can upload vid/images
// have option to just do text so new recipe

export default function Create() {
  const [isEnabled, setEnabledElements] = useState(false);

  return (
    <View>
      <YStack>
        <H4 style={{ alignSelf: 'center' }}>NEW POST</H4>
        <XStack>
          <Text fontSize="$5" paddingStart="$5">is this a recipe?</Text>
          <Switch marginLeft="$2" size="$3" onCheckedChange={() => setEnabledElements(!isEnabled)}>
            <Switch.Thumb animation="bouncy" />
          </Switch>
        </XStack>
        {
          !isEnabled ? (
            <YStack>          
              <TextInput
                placeholder={'Description...'}
                multiline={true}
                style={{
                  height: 130,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  textAlignVertical: 'top',
                }}
              />
              <TextInput
                placeholder={'List Steps...'}
                multiline={true}
                style={{
                  height: 130,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  textAlignVertical: 'top',
                }}
              />
              <TextInput
                placeholder={'List Ingredients...'}
                multiline={true}
                style={{
                  height: 130,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  textAlignVertical: 'top',
                }}
              />
            </YStack>
          ) : null
        }
        {
          isEnabled ? (
            <YStack>
              <TextInput
                placeholder={'Upload IMG...'}
                multiline={true}
                style={{
                  height: 130,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  textAlignVertical: 'top',
                }} />
              <TextInput
                placeholder={'Caption...'}
                multiline={true}
                style={{
                  height: 130,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  textAlignVertical: 'top',
                }}
              />
            </YStack>) : null
        }
        <Button backgroundColor={'cyan'} mx={'$4'}>
          <Text color={'$black2'}>Post</Text>
        </Button>
      </YStack>
    </View>
  );
}
