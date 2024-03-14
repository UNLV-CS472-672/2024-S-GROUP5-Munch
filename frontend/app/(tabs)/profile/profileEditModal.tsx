import { useState, useEffect } from "react";
import { Input, Label, YStack, XStack, Separator } from "tamagui";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { View } from "tamagui";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

const ProfileEditModal = () => {
  const {} = useAuth();
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const [userInfo, setUserInfo] = useState({
    userName: user?.username,
    firstName: user?.firstName,
    lastName: user?.lastName,
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    setUserInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.username,
    });
  }, [user]);

  return (
    <View>
      <Stack.Screen options={{ headerTitle: "Edit Profile" }} />
      <YStack gap={"$1"} px={"$2"}>
        <Separator />
        <XStack>
          <Label htmlFor="username">Username</Label>
          <Input
            id={"username"}
            pt={"$1"}
            px={"$3"}
            defaultValue={userInfo.userName ?? ""}
            placeholder={user?.username ?? "Username"}
            autoCapitalize={"none"}
            autoCorrect={false}
            onChangeText={(e) =>
              setUserInfo((prev) => ({ ...prev, userName: e }))
            }
            color={colorScheme === "dark" ? "white" : "black"}
            unstyled
          />
        </XStack>
        <Separator />
        <XStack>
          <Label htmlFor="firstName">First name</Label>
          <Input
            id={"firstName"}
            placeholder="First name"
            pt={"$1"}
            px={"$3"}
            defaultValue={user?.firstName ?? ""}
            autoCapitalize="none"
            autoCorrect={false}
            borderWidth={2}
            onChangeText={(e) =>
              setUserInfo((prev) => ({ ...prev, firstName: e }))
            }
            color={colorScheme === "dark" ? "white" : "black"}
            unstyled
          />
        </XStack>
        <Separator />
        <XStack>
          <Label htmlFor="lastName">Last name</Label>
          <Input
            defaultValue={user?.lastName ?? ""}
            pt={"$1"}
            px={"$3"}
            placeholder="Last name"
            autoCapitalize="none"
            autoCorrect={false}
            borderWidth={2}
            onChangeText={(e) =>
              setUserInfo((prev) => ({ ...prev, lastName: e }))
            }
            color={colorScheme === "dark" ? "white" : "black"}
            unstyled
          />
        </XStack>
        <Separator />
        <XStack>
          <Label htmlFor="bio">Bio</Label>
          <Input
            defaultValue={""}
            pt={"$1"}
            px={"$3"}
            placeholder="Bio"
            autoCapitalize="none"
            autoCorrect={false}
            borderWidth={2}
            onChangeText={(e) => setUserInfo((prev) => ({ ...prev, bio: e }))}
            color={colorScheme === "dark" ? "white" : "black"}
            unstyled
          />
        </XStack>
        <Separator />
      </YStack>
    </View>
  );
};

export default ProfileEditModal;
