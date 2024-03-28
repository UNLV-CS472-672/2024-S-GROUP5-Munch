import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View,
  Button,
  H1,
  H2,
  H4,
  YStack,
  Image,
  Separator,
  SizableText,
  Tabs,
  XStack,
  H5,
  Text,
  TextArea,
  Switch,
} from 'tamagui';

export default function Create() {
  const [isEnabled, setEnabledElements] = useState(false);

  return (
    <View>
      <YStack>
        <H4 style={{ alignSelf: 'center', color: '$accentColor' }}>NEW POST</H4>
        <XStack>
          <Text color={'$accentColor'} fontSize='$5' paddingStart='$5'>
            is this a recipe?
          </Text>
          <Switch
            marginLeft='$2'
            size='$3'
            onCheckedChange={() => setEnabledElements(!isEnabled)}
          >
            <Switch.Thumb animation='bouncy' />
          </Switch>
        </XStack>
        {isEnabled ? (
          <YStack>
            <TextArea
              placeholder={'Description...'}
              multiline={true}
              style={{
                height: 130,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top',
              }}
            />
            <TextArea
              placeholder={'List Steps...'}
              multiline={true}
              style={{
                height: 130,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top',
              }}
            />
            <TextArea
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
        ) : null}
        {!isEnabled ? (
          <YStack>
            <TextArea
              placeholder={'Upload IMG...'}
              multiline={true}
              style={{
                height: 130,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top',
              }}
            />
            <TextArea
              placeholder={'Caption...'}
              multiline={true}
              style={{
                height: 130,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top',
              }}
            />
          </YStack>
        ) : null}
        <Button backgroundColor={'cyan'} mx={'$4'} unstyled>
          <Text>Post</Text>
        </Button>
      </YStack>
    </View>
  );
}
