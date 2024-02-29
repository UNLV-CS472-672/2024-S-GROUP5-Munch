import { TouchableOpacity, View } from "react-native";
import React, { useCallback } from "react";
import { Button, Input, Text, TextArea, YStack } from "tamagui";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { Ionicons } from "@expo/vector-icons";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

enum Strategies {
  Google = "oauth-google",
  Apple = "oauth-apple",
}
const Login = () => {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.back();
      }
    } catch (err) {
      console.error("OAuth err", err);
    }
  }, []);
  return (
    <View>
      <YStack>
        <Input
          size="$4"
          borderWidth={2}
          placeholder="Username"
          autoCapitalize={"none"}
        />
        <Input
          size="$4"
          borderWidth={2}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry={true}
        />
        <Button backgroundColor={"cyan"} mx={"$4"}>
          <Text color={"$black2"}>Continue</Text>
        </Button>
      </YStack>

      <Button
        backgroundColor={"$black025"}
        mx={"$4"}
        icon={<Ionicons name="logo-google" size={24} />}
        onPress={onPress}
      >
        Continue with Google
      </Button>
      <YStack></YStack>
    </View>
  );
};

export default Login;
