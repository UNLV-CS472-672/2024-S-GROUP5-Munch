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
  View,
} from 'tamagui';
import type { TabsContentProps } from 'tamagui';

export default function EditPost() {
  return (
    <SafeAreaView>
      <View>
        <H4 style={{ alignSelf: 'center', paddingTop: 10 }}>EDIT POST</H4>
        <TextArea
          placeholder={'Change your Caption...'}
          multiline={true}
          style={{
            height: 130,
            borderRadius: 5,
            paddingHorizontal: 10,
            textAlignVertical: 'top',
          }}
        />
      </View>
    </SafeAreaView>
  );
}
