import React, { useState } from 'react';
import {
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
  View
} from 'tamagui';
import type { TabsContentProps } from 'tamagui';

export default function Create() {
  const [isEnabled, setEnabledElements] = useState(false);

  return (
    <View>
      <YStack>
        <H4 style={{ alignSelf: 'center', paddingTop: 75 }}>EDIT RECIPE</H4>
        <TextArea
          placeholder={'Change your Description...'}
          multiline={true}
          style={{
            height: 130,
            borderRadius: 5,
            paddingHorizontal: 10,
            textAlignVertical: 'top'
          }}
        />
        <TextArea
          placeholder={'Change your Steps...'}
          multiline={true}
          style={{
            height: 130,
            borderRadius: 5,
            paddingHorizontal: 10,
            textAlignVertical: 'top'
          }}
        />
        <TextArea
          placeholder={'Change your Ingredients...'}
          multiline={true}
          style={{
            height: 130,
            borderRadius: 5,
            paddingHorizontal: 10,
            textAlignVertical: 'top'
          }}
        />
      </YStack>
    </View>
  );
}
