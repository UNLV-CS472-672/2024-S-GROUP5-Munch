import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native";
import { Text, View } from "tamagui";

export default function TabTwoScreen() {
  const { isSignedIn } = useAuth();
  return (
    <SafeAreaView>
      <View>
        <Text>Feed view</Text>
      </View>
    </SafeAreaView>
  );
}
