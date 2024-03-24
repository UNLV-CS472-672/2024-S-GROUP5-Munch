import { View } from '@/components/Themed';
import React from 'react';
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
} from 'tamagui';
import type { TabsContentProps } from 'tamagui';

// should open up gallery so people can upload vid/images
// have option to just do text so new recipe
const PLACEHOLDER_IMG = 'frontendassetsimagesplaceholder.jpg';

export default function Create() {
  return (
    <View>
      <YStack>
        <H4 style={{ alignSelf: 'center' }}>NEW POST</H4>
        <Tabs
          defaultValue='tab1'
          orientation='horizontal'
          flexDirection='column'
          width={400}
          height={150}
          borderRadius='$4'
          borderWidth='$0.25'
          overflow='hidden'
          borderColor='$borderColor'
        >
          <Tabs.List
            disablePassBorderRadius='bottom'
            aria-label='Creating a New Post'
          >
            <Tabs.Tab flex={1} value='tab1'>
              <SizableText fontFamily='$body'>Byte</SizableText>
            </Tabs.Tab>
            <Tabs.Tab flex={1} value='tab2'>
              <SizableText fontFamily='$body'>Recipe</SizableText>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Content value='tab1'>
            <TextArea
              placeholder={'Write a Caption...'}
              multiline={true}
              style={{
                height: 130,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top',
              }}
            />
          </Tabs.Content>
          <Tabs.Content value='tab2'>
            <TextArea
              placeholder={'List Steps for Recipe...'}
              multiline={true}
              style={{
                height: 130,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top',
              }}
            />
          </Tabs.Content>
        </Tabs>
        <Button backgroundColor={'cyan'} mx={'$4'}>
          <Text color={'$black2'}>Post</Text>
        </Button>
      </YStack>
    </View>
  );
}
