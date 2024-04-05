import Post from '@/components/Post/Post';
import { UserContext } from '@/contexts/UserContext';
import { UserType } from '@/types/firebaseTypes';
import { isClerkAPIResponseError, useAuth } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker';
import { Link, useRouter } from 'expo-router';
import { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Avatar,
  Button,
  Card,
  H4,
  Label,
  Paragraph,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';
export default function Profile() {
  const { isSignedIn, signOut } = useAuth();
  const { user, user_id, token } = useContext(UserContext);

  const { data, isLoading } = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () =>
      (
        await axios.get<UserType>(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/users/${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      ).data,
  });

  const router = useRouter();

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
      {isLoading && <Spinner />}
      {isSignedIn && !isLoading && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Card elevate size={'$4'} bordered unstyled>
            <XStack justifyContent='space-between'>
              <Card.Header
                display='flex'
                flexDirection='row'
                gap={'$3'}
                justifyContent='space-between'
                alignItems='center'
              >
                <TouchableOpacity onPress={handleUserProfileChange}>
                  <Avatar circular size={'$5'}>
                    <Avatar.Image src={user.imageUrl ?? ' '} />
                  </Avatar>
                </TouchableOpacity>
                <YStack gap={'$2'}>
                  <H4>{user?.username}</H4>
                  <Paragraph>{`${user?.firstName} ${
                    user?.lastName ?? ''
                  }`}</Paragraph>
                  <Paragraph>{`${data.bio}`}</Paragraph>
                </YStack>
              </Card.Header>
              <XStack gap={'$3'}>
                <YStack display='flex' alignItems='center'>
                  <Label fontSize={'$2'}>Followers</Label>
                  <Text>{data.followers.length ?? 0}</Text>
                </YStack>

                <YStack display='flex' alignItems='center'>
                  <Label fontSize={'$2'}>Following</Label>
                  <Text>{data.following.length ?? 0}</Text>
                </YStack>
              </XStack>
              <Link href='/profile/profileEditModal' asChild>
                <Button
                  iconAfter={<Feather name={'edit'} size={20} />}
                  unstyled
                  p={'$2'}
                />
              </Link>
            </XStack>
          </Card>

          {data.posts.map((post) => (
            <Post key={post} post={post} />
          ))}
          <Button onPress={() => signOut()} backgroundColor={'$red9'} mx={'$4'}>
            Sign out
          </Button>
        </View>
      )}
      {!isSignedIn && (
        <Button
          onPress={() => router.push('/(auth)/login')}
          marginHorizontal={'$4'}
          backgroundColor={'$background'}
        >
          Log in
        </Button>
      )}
    </SafeAreaView>
  );
}
