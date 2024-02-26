import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { _signIn } from "@/store";
import { Button } from "react-native";

export default function TabOneScreen() {
  return (
    <View>
      <Text>Tab start</Text>
      <Button title="Google Sign in" onPress={() => _signIn()} />
    </View>
  );
}
