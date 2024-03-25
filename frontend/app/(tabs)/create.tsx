import { View } from '@/components/Themed';
import React, { useState } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from "expo-image-picker";
import { Button, H1, H2, H4, YStack, Text, TextArea, Switch, XStack, AlertDialog, AlertDialogTrigger, AlertDialogTitle, AlertDialogDescription, Image, ScrollView } from 'tamagui';

// should open up gallery so people can upload vid/images
// have option to just do text so new recipe

export default function Create() {
  const [isEnabled, setEnabledElements] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const pickImg = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      <AlertDialog>
        <AlertDialogTitle>No Permission Granted</AlertDialogTitle>
        <AlertDialogDescription>Please allow access to upload image.</AlertDialogDescription>
      </AlertDialog>
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      var uri = '';
      result.assets.map((asset) => uri = asset.uri);
      if (!result.canceled) {
        setFile(uri);       
        setError(null);
      }
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <YStack>
          <H4 style={{ alignSelf: 'center' }}>NEW POST</H4>
          <XStack>
            <Text fontSize="$5" paddingStart="$5">is this a recipe?</Text>
            <Switch marginLeft="$2" size="$3" onCheckedChange={() => setEnabledElements(!isEnabled)}>
              <Switch.Thumb animation="bouncy" />
            </Switch>
          </XStack>
          <XStack flex={1}>
            <Button onPress={pickImg} backgroundColor={'cyan'} mx={'$4'}><Text color={'$black2'}>Upload Image</Text></Button>
            {
            file ? (             
                <Image
                  source={{
                    uri: file
                  }}
                  width="100%" height="100%"                
                />
            ) : null
          }
          </XStack>
          {
            !isEnabled ? (
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
            ) : null
          }
          {
            isEnabled ? (
              <YStack>
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
              </YStack>) : null
          }
          <Button backgroundColor={'cyan'} mx={'$4'}>
            <Text color={'$black2'}>Post</Text>
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
