import UserInput from '@/components/UserInput';
import { UserState } from '@/types/user';
import { isClerkAPIResponseError, useUser } from '@clerk/clerk-expo';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native';
import { Avatar, Button, Form, Separator, View, XStack, YStack } from 'tamagui';
import Toast from 'react-native-toast-message';

const ProfileEditModal = () => {
  const { user } = useUser();
  const {
    handleSubmit,
    control,
    formState: { errors, dirtyFields },
  } = useForm<UserState>({
    defaultValues: {
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
    },
  });

  const [updateSuccess, setUpdateSuccess] = useState(true);
  const handleUserInfoUpdate: SubmitHandler<UserState> = async (data) => {
    try {
      if (
        dirtyFields['bio'] ||
        dirtyFields['username'] ||
        dirtyFields['firstName']
      ) {
        await user?.update({
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }
      if (dirtyFields['bio']) {
        //axios update
      }

      Toast.show({
        type: 'success',
        text1: 'Profile Updated!',
        position: 'bottom',
      });
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        console.error(err.errors);
        return;
      }
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Profile Update Failed!',
        position: 'bottom',
        visibilityTime: 1000,
      });
    }
  };
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

        Toast.show({
          type: 'error',
          text1: 'Profile Picture Update Failed!',
          position: 'bottom',
          visibilityTime: 1000,
        });
      }
    }
  };

  return (
    <View>
      <Stack.Screen options={{ headerTitle: 'Edit Profile' }} />
      <YStack gap={'$1'} px={'$2'}>
        <TouchableOpacity onPress={handleUserProfileChange}>
          <Avatar circular margin={'auto'} size={'$5'} my={'$4'}>
            <Avatar.Image src={user.hasImage ? user.imageUrl! : ' '} />
          </Avatar>
        </TouchableOpacity>
        <Separator />
        <Form onSubmit={handleSubmit(handleUserInfoUpdate)}>
          <Controller
            name={'username'}
            control={control}
            render={({ field }) => (
              <XStack>
                <UserInput
                  field={field}
                  useLabel
                  labelID='Username'
                  placeholder={user?.username ?? 'username'}
                />
              </XStack>
            )}
          />
          <Separator />
          <Controller
            name={'firstName'}
            control={control}
            render={({ field }) => (
              <XStack>
                <UserInput
                  field={field}
                  useLabel
                  labelID='First Name'
                  placeholder={user.firstName}
                />
              </XStack>
            )}
          />
          <Separator />
          <Controller
            name={'lastName'}
            control={control}
            render={({ field }) => (
              <XStack>
                <UserInput
                  field={field}
                  useLabel
                  labelID='Last Name'
                  placeholder={user.lastName}
                />
              </XStack>
            )}
          />
          <Separator />
          <Controller
            name={'bio'}
            control={control}
            render={({ field }) => (
              <XStack>
                <UserInput
                  field={field}
                  useLabel
                  labelID='Bio'
                  placeholder={user?.bio ?? 'Bio'}
                />
              </XStack>
            )}
          />
          <Form.Trigger asChild>
            <Button backgroundColor={'$red10'}>Update</Button>
          </Form.Trigger>
        </Form>
      </YStack>
    </View>
  );
};

export default ProfileEditModal;
