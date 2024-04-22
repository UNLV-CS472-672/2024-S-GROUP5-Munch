import Author from '@/components/Author';
import { UserContext } from '@/contexts/UserContext';
import { Byte, Recipe } from '@/types/post';
import { isClerkAPIResponseError, useAuth } from '@clerk/clerk-expo';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, View } from 'tamagui';
export default function Profile() {
  const { isSignedIn, signOut } = useAuth();
  const { user, token, user_data } = useContext(UserContext);

  const router = useRouter();

  //use query to get all posts from user_data
  const { isLoading, posts } = useQueries({
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

  //handle profile pic change
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
          {!isLoading && (
            <Author
              isCurrentUser={true}
              user={user}
              user_data={{ ...user_data, posts_data: posts }}
              profilePicChange={handleUserProfileChange}
            />
          )}
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
