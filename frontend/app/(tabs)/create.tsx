import { Text, View } from "@/components/Themed";
import React from "react";
import { TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, H1, H2, H4 } from "tamagui";

// should open up gallery so people can upload vid/images
// have option to just do text so new recipe

export default function TabTwoScreen() {
  return (
    <SafeAreaView>
      <View>
        <H4>NEW POST</H4>
        <View>
          <Button></Button>
          <TextInput
            placeholder={"Hungry?"}
            multiline={true}
            style={{
              height: 130,
              borderRadius: 5,
              paddingHorizontal: 10,
              textAlignVertical: 'top'
            }
            }
          />


        </View>
      </View>
    </SafeAreaView>
  );
}
