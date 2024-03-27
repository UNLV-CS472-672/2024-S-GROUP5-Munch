import { isClerkAPIResponseError, useAuth, useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Avatar,
  Button,
  Card,
  H3,
  Paragraph,
  XStack,
  YStack,
  Text,
  View,
  H4,
} from "tamagui";
import {
  MediaTypeOptions,
  launchCameraAsync,
  launchImageLibraryAsync,
} from "expo-image-picker";
import { TouchableOpacity } from "react-native";
import { Label } from "tamagui";
import { Link } from "expo-router";
export default function Profile() {
  const { isSignedIn, signOut } = useAuth();

  const { user } = useUser();
  const router = useRouter();

  const [edit, setEdit] = useState(false);
  // const handleEdit = async () => {
  //   if (edit) {
  //     try {
  //       await user?.update({
  //         firstName: userInfo.firstName!,
  //         lastName: userInfo.lastName!,
  //       });
  //     } catch (err) {
  //       if (isClerkAPIResponseError(err)) {
  //         console.log(err.errors);
  //       }
  //     }
  //   }

  //   // setEdit(!edit);
  //   return;
  // };

  const handleUserProfileChange = async () => {
    let pfp = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!pfp.canceled) {
      const base64 = `data:image/png;base64,${pfp.assets[0].base64}`;
      try {
        user?.setProfileImage({ file: base64 });
      } catch (err) {
        if (isClerkAPIResponseError(err)) {
          console.log(err.errors);
        }
      }
    }
  };

  return (
    <SafeAreaView>
      {isSignedIn && (
        <View
          style={{
            display: "flex",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Card elevate size={"$4"} bordered unstyled>
            <XStack justifyContent="space-between">
              <Card.Header
                display="flex"
                flexDirection="row"
                gap={"$3"}
                justifyContent="space-between"
                alignItems="center"
              >
                <TouchableOpacity onPress={handleUserProfileChange}>
                  <Avatar circular size={"$5"}>
                    <Avatar.Image src={user?.hasImage ? user.imageUrl : " "} />
                  </Avatar>
                </TouchableOpacity>
                <YStack gap={"$2"}>
                  <H4>{user?.username}</H4>
                  <Paragraph>{`${user?.firstName} ${
                    user?.lastName ?? ""
                  }`}</Paragraph>
                </YStack>
              </Card.Header>
              <XStack gap={"$3"}>
                <YStack display="flex" alignItems="center">
                  <Label fontSize={"$2"}>Followers</Label>
                  <Text>{user?.followersCount ?? 0}</Text>
                </YStack>

                <YStack display="flex" alignItems="center">
                  <Label fontSize={"$2"}>Following</Label>
                  <Text>{user?.followingCount ?? 0}</Text>
                </YStack>
              </XStack>
              <Link href="/profile/profileEditModal" asChild>
                <Button
                  iconAfter={
                    <Feather name={edit ? "save" : "edit"} size={20} />
                  }
                  unstyled
                  p={"$2"}
                />
              </Link>
            </XStack>
          </Card>
          <Button onPress={() => signOut()} backgroundColor={"$red9"} mx={"$4"}>
            Sign out
          </Button>
        </View>
      )}
      {!isSignedIn && (
        <Button
          onPress={() => router.push("/(auth)/login")}
          marginHorizontal={"$4"}
          backgroundColor={"$background"}
        >
          Log in
        </Button>
      )}
    </SafeAreaView>
  );
}
