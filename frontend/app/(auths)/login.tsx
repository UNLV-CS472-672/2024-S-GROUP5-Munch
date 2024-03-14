import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useAuth, useOAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect } from "react";
import { View } from "react-native";
import { Button, Input, Separator, Text, XStack, YStack } from "tamagui";
import { app } from "../firebaseConfig";

enum Strategies {
  Google = "oauth-google",
  Apple = "oauth-apple",
}
const Login = () => {
  useWarmUpBrowser();

  const { isSignedIn, user } = useUser();
  const db = getFirestore(app);
  const router = useRouter();

  const { startOAuthFlow: gOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: aOAuth } = useOAuth({ strategy: "oauth_apple" });

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn]);

  const onPress = useCallback(async (strategy: Strategies) => {
    try {
      const curAuth = {
        [Strategies.Apple]: aOAuth,
        [Strategies.Google]: gOAuth,
      }[strategy];

      const { createdSessionId, signIn, signUp, setActive } = await curAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });

        collection(db, "users");

        router.back();
      }
    } catch (err) {
      console.error("OAuth err", err);
    }
  }, []);
  return (
    <View>
      <YStack gap={"$1"} paddingVertical={"$2"} marginHorizontal={15}>
        <Input
          size="$4"
          borderWidth={2}
          placeholder="Username"
          autoCapitalize={"none"}
        />
        <Input
          size="$4"
          borderWidth={4}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry={true}
        />
        <Button backgroundColor={"$red9"} mx={"$1"}>
          <Text>Continue</Text>
        </Button>
      </YStack>
      <XStack paddingVertical={"$5"}>
        <Separator alignSelf="stretch" />
        <Text alignContent="center">Or</Text>
        <Separator alignSelf="stretch" />
      </XStack>
      <YStack gap={"$1"} rowGap={"$2"}>
        <Button
          mx={"$4"}
          icon={<Ionicons name="logo-google" size={24} />}
          onPress={() => onPress(Strategies.Google)}
        >
          Continue with Google
        </Button>
        <Button
          mx={"$4"}
          icon={<Ionicons name="logo-apple" size={24} />}
          onPress={() => onPress(Strategies.Apple)}
        >
          Continue with Apple
        </Button>
      </YStack>
      <YStack></YStack>
    </View>
  );
};

export default Login;
