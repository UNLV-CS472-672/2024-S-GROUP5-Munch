import { Text, View } from "@/components/Themed";
import React from "react";
import { TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, H1, H2, H4, YStack, Image, Separator, SizableText, Tabs, XStack, H5 } from "tamagui";
import type { TabsContentProps } from 'tamagui';


// should open up gallery so people can upload vid/images
// have option to just do text so new recipe
const PLACEHOLDER_IMG = 'frontend\assets\images\placeholder.jpg'

export default function Create() {
  return (
    <View>
      <YStack>
        <H4 style={{ alignSelf: "center" }}>NEW POST</H4>
        {/* <Image
          source={{ width: 10, height: 10, uri: 'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg' }}
          width="100%"
          height="30%"
        /> */}
        <Tabs
          defaultValue="tab1"
          orientation="horizontal"
          flexDirection="column"
          width={400}
          height={150}
          borderRadius="$4"
          borderWidth="$0.25"
          overflow="hidden"
          borderColor="$borderColor"
        >
          <Tabs.List
            separator={<Separator vertical />}
            disablePassBorderRadius="bottom"
            aria-label="Manage your account"
          >
            <Tabs.Tab flex={1} value="tab1">
              <SizableText fontFamily="$body">Bite</SizableText>
            </Tabs.Tab>
            <Tabs.Tab flex={1} value="tab2">
              <SizableText fontFamily="$body">Recipe</SizableText>
            </Tabs.Tab>
          </Tabs.List>
          <Separator />
          <TextInput
              placeholder={"Write a caption..."}
              multiline={true}
              style={{
                height: 130,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top'
              }
              }
            />
            <TextInput
              placeholder={"Enter Image URL"}
              multiline={true}
              style={{
                height: 130,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top',
              }}
            />
          <Tabs.Content value="tab1">            
          </Tabs.Content>         
          <Tabs.Content value="tab2"> 
          <H4>BLAH</H4>           
          </Tabs.Content>
        </Tabs>
        <Button backgroundColor={'cyan'} mx={'$4'}>
          <Text color={'$black2'}>Post</Text>
        </Button>
      </YStack>
    </View>
  );
}
