import { View } from "@/components/Themed";
import { useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "tamagui";

export default function Profile() {
  const { isSignedIn, signOut, userId } = useAuth();

  return (
    <SafeAreaView>
      <View>
        {isSignedIn && <Button onPress={() => signOut()}>Sign out</Button>}
        {!isSignedIn && (
          <Link href="/(auths)/login">
            <Button>Log in</Button>
          </Link>
        )}
      </View>
    </SafeAreaView>
  );
}
