import { UserContext } from '@/contexts/UserContext';
import { Byte, Recipe } from '@/types/post';
import { isClerkAPIResponseError, useAuth } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker';
import { Link, useRouter } from 'expo-router';
import { useContext } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Avatar,
  Button,
  Card,
  H4,
  Image,
  Label,
  Paragraph,
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';
export default function Profile() {
  const { isSignedIn, signOut } = useAuth();
  const { user, token, user_data } = useContext(UserContext);

  const router = useRouter();
  //use query to get all posts from user_data
  let { isLoading, posts } = useQueries({
    queries: user_data?.posts
      ? user_data.posts.map((post) => ({
          queryKey: [post],
          queryFn: async () => {
            const res = await axios.get<Byte | Recipe>(
              `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${post}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            return { ...res.data, key: post };
          },
        }))
      : [],
    combine: (data) => ({
      isLoading: data.some((d) => d.isLoading),
      posts: data.map((d) => d.data),
    }),
  });

  // handle profile pic change
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
        <View height={'100%'} display='flex' justifyContent='space-between'>
          <YStack>
            <Card elevate size={'$3'} bordered unstyled>
            {/* Card header*/}
              <XStack
                backgroundColor={'whitesmoke'}
                justifyContent='space-between'
              >
                <Card.Header
                  display='flex'
                  flexDirection='row'
                  gap={'$3'}
                  justifyContent='space-between'
                  alignItems='center'
                ></Card.Header>
                 {/* Avatar*/}
                <XStack>
                  <TouchableOpacity onPress={handleUserProfileChange}>
                    <Avatar
                      circular
                      size={'$5'}
                      marginRight={17}
                      marginLeft={-50}
                      marginTop={7}
                    >
                      <Avatar.Image src={user.imageUrl ?? ' '} />
                    </Avatar>
                  </TouchableOpacity>
                  {/* User Info */}
                  <YStack gap={'$2'}>
                    {/* User name*/}
                    <H4>{user?.username}</H4>
                    {/* Name*/}
                    <Paragraph>{`${user?.firstName} ${
                      user?.lastName ?? ''
                    }`}</Paragraph>
                    {/* Bio */}
                    <Paragraph>{`${user_data.bio}`}</Paragraph>
                  </YStack>
                </XStack>
                <XStack gap={'$3'}>
                  {/* Follower count */}
                  <YStack display='flex' alignItems='center'>
                    <Label fontSize={'$2'}>Followers</Label>
                    <Text>{user_data.followers.length ?? 0}</Text>
                  </YStack>
                  {/* Following count*/}
                  <YStack display='flex' alignItems='center'>
                    <Label fontSize={'$2'}>Following</Label>
                    <Text>{user_data.following.length ?? 0}</Text>
                  </YStack>
                </XStack>
                {/* Edit button */}
                <Link href='/profile/profileEditModal' asChild>
                  <Button
                    iconAfter={<Feather name={'edit'} size={20} />}
                    unstyled
                    p={'$2'}
                  />
                </Link>
              </XStack>
            </Card>
            {!isLoading && posts.length > 0 && (
              <View py={'$3'} rowGap={'$1'}>
                <Separator />
                <FlatList
                  data={posts}
                  renderItem={({ item, index }) => (
                    <Card size={'$2'} mx={'$1.5'} bordered elevate>
                      <Link
                        href={`/post/${user_data.posts[index].split('/')[1]}`}
                        asChild
                      >
                        <Image
                          source={{
                            uri: item.pictures[0],
                            height: 125,
                            width: 125,
                          }}
                        />
                      </Link>
                    </Card>
                  )}
                  numColumns={3}
                  scrollEnabled={false}
                />
              </View>
            )}
          </YStack>
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
