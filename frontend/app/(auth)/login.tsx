import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth, useSignIn, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect } from "react";
import { View } from "react-native";
import { Button, Input, Separator, Text, XStack, YStack } from "tamagui";
import { app } from "../firebaseConfig";

enum Strategies {
  Google = "oauth-google",
  Apple = "oauth-apple",
  Manual = "manual",
}
const Login = () => {
  useWarmUpBrowser();

  const { isSignedIn, user } = useUser();
  const { signIn, isLoaded, setActive } = useSignIn();

  const db = getFirestore(app);
  const router = useRouter();

  const { startOAuthFlow: gOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: aOAuth } = useOAuth({ strategy: "oauth_apple" });

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn]);

  const manualSignIn = async () => {};
  const authProviderSignIn = useCallback(async (strategy: Strategies) => {
    try {
      const curAuth = {
        [Strategies.Apple]: aOAuth,
        [Strategies.Google]: gOAuth,
      }[strategy];

      const { createdSessionId, signIn, signUp, setActive } = await curAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });

        collection(db, "users");
        //ISSUE here
        // router.back();
      }
    } catch (err) {
      console.error("OAuth err", err);
    }
  }, []);

  return (
    <View>
      <YStack gap={"$2"} paddingTop={"$5"} marginHorizontal={15}>
        <Input
          size="$4"
          borderWidth={1}
          placeholder="Username"
          autoCapitalize={"none"}
          borderColor={"$accentColor"}
          unstyled
        />
        <Input
          size="$4"
          borderWidth={1}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry={true}
          borderColor={"$accentColor"}
          unstyled
        />
        <Button backgroundColor={"$red9"} onPress={manualSignIn}>
          <Text>Continue</Text>
        </Button>

        <Button
          justifyContent="center"
          display="flex"
          alignItems="center"
          pt={"$4"}
          onPress={() => {
            router.push("/register");
          }}
          unstyled
        >
          <Text>Need an account?</Text>
        </Button>
      </YStack>
      <XStack paddingVertical={"$5"}>
        <Separator alignSelf="stretch" />
        <Text alignContent="center" my={"$-2"}>
          Or
        </Text>
        <Separator alignSelf="stretch" />
      </XStack>
      <YStack gap={"$1"} rowGap={"$2"}>
        <Button
          mx={"$4"}
          icon={<Ionicons name="logo-google" size={24} />}
          onPress={() => authProviderSignIn(Strategies.Google)}
        >
          Continue with Google
        </Button>
        <Button
          mx={"$4"}
          icon={<Ionicons name="logo-apple" size={24} />}
          onPress={() => authProviderSignIn(Strategies.Apple)}
        >
          Continue with Apple
        </Button>
      </YStack>
    </View>
  );
};

export default Login;
