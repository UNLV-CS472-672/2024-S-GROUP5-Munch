import { useState, useEffect } from "react";
import { YStack, Separator, View, Avatar } from "tamagui";
import { isClerkAPIResponseError, useAuth, useUser } from "@clerk/clerk-expo";
import { useColorScheme, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";
import { ProfileInput } from "@/components/ProfileInput";
import { UserState } from "@/types/user";

const ProfileEditModal = () => {
  const {} = useAuth();
  const { user } = useUser();
  const [_, setUserInfo] = useState<UserState>({
    username: user?.username,
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
      username: user.username,
    });
  }, [user]);

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
    <View>
      <Stack.Screen options={{ headerTitle: "Edit Profile" }} />
      <YStack gap={"$1"} px={"$2"}>
        <TouchableOpacity onPress={handleUserProfileChange}>
          <Avatar circular margin={"auto"} size={"$5"} my={"$4"}>
            <Avatar.Image src={user.hasImage ? user.imageUrl! : ""} />
          </Avatar>
        </TouchableOpacity>
        <Separator />
        <ProfileInput
          id="username"
          placeholder="Username"
          setUserInfo={setUserInfo}
          value={user.username}
        />
        <ProfileInput
          id="firstName"
          placeholder="First name"
          setUserInfo={setUserInfo}
          value={user.firstName}
        />
        <ProfileInput
          id="lastName"
          placeholder="Last name"
          setUserInfo={setUserInfo}
          value={user.lastName}
        />
        <ProfileInput
          id="bio"
          placeholder="Bio"
          setUserInfo={setUserInfo}
          value={user.bio}
        />
      </YStack>
    </View>
  );
};

export default ProfileEditModal;
