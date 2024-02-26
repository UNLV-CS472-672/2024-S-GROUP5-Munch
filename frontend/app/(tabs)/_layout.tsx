import React, { useEffect } from "react";
import {
  Tabs,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { AuthStore } from "@/store";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const segments = useSegments();
  const router = useRouter();

  const navigationState = useRootNavigationState();
  const { initialized, isLoggedIn } = AuthStore.useState();

  useEffect(() => {
    if (!navigationState?.key || !initialized) {
      return;
    }
    const inAuthGroup = segments[0] === "(auth)";

    console.log(inAuthGroup);
    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isLoggedIn) {
      router.replace("/(tabs)/login");
    }
  }, [segments, navigationState?.key, initialized]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
