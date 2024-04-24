import { Subtitle } from '@/tamagui.config';
import { Byte, Recipe } from '@/types/post';
import { getDateDifference } from '@/utils/getCurrentDateTime';
import { isByte, isRecipe } from '@/utils/typeGuard';
import { Link, useRouter } from 'expo-router';
import React, { FC, useContext, useState } from 'react';
import { Dimensions, Linking, Platform, SafeAreaView } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image, Text, XStack, YStack } from 'tamagui';
import ButtonIcon from './ButtonIcon';
import DeletePostDialog from './DeletePostDialog';
import { EditPostDialog } from './EditPostDialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/contexts/UserContext';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';

interface PostProps {
  post: Byte | Recipe;
}

const Post: FC<PostProps> = ({ post }) => {
  const {
    author,
    comments,
    creation_date,
    description,
    likes,
    pictures,
    username,
    key,
  } = post;

  const byte = isByte(post) ? post : null;
  const recipe = isRecipe(post) ? post : null;
  const router = useRouter();
  const { height, width } = Dimensions.get('screen');

  const openMaps = async () => {
    const iosLink = `maps://0,0?q=${byte?.location}`;
    const androidLink = `geo:0,0?q=${byte?.location}`;
    Linking.openURL(Platform.OS === 'ios' ? iosLink : androidLink);
  };

  // Used to query and mutate
  const queryClient = useQueryClient();
  const { token } = useContext(UserContext);
  const { getToken, userId } = useAuth();
  const postId = key.split('/')[1];
  // Like button state
  const [liked, setLiked] = useState(true);

  // Data that will be passed in order to change the post's likes
  const likeData = {
    user_id: userId,
    post_id: postId,
  };
  // Get number of likes
  const getLikes = async () => {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/${postId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.likes;
  };

  const {
    data: likesCount,
    error: likesError,
    isLoading: likesLoading,
  } = useQuery({
    queryKey: ['likes'],
    queryFn: getLikes,
  });

  // Like/Unlike a post
  const {
    mutateAsync: changeLikes,
    isPending,
    data,
    error,
  } = useMutation({
    mutationFn: async () => {
      // Determine whether to like or unlike the post
      const likeAction = liked ? 'like' : 'unlike';

      // Status message to show the API call
      console.log(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/users/${userId}/${likeAction}/${postId}`,
      );

      // Do the API call
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/users/${userId}/${likeAction}/${postId}`,
        likeData,
        {
          headers: { Authorization: `Bearer: ${await getToken()}` },
        },
      );
      return response.data;
    },
    // Update the like count
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes'] });
    },
    // Show error message in console
    onError: () => {
      console.log('error:', error.message);
    },
  });

  // Handle user liking the post
  const handleLike = async () => {
    // Invert the like state
    setLiked(!liked);

    // Status message
    liked ? console.log('Liking the post!') : console.log('Unliking the post!');

    // Like or unlike the post based on liked state
    await changeLikes();
  };
  const handleBookmark = async () => {};
  const carouselConfig = {
    width: width,
    height: height / 1.5,
    vertical: false,
    mode: 'parallax',
    snapEnabled: true,
    modeConfig: {
      parallaxScrollingScale: 1,
      parallaxScrollingOffset: 50,
    },
  } as const;
  return (
    <SafeAreaView>
      <Carousel
        {...carouselConfig}
        data={pictures}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item, cache: 'force-cache' }}
            height={height / 1.5}
            borderRadius={'$2'}
          />
        )}
      />
      <YStack display='flex' rowGap={'$1'} marginBottom={'$10'}>
        {userId === author.split('/')[1] && (
          <XStack  display='flex' justifyContent='space-around'>
            <EditPostDialog post={post} />
            <DeletePostDialog postId={postId} />
          </XStack>
        )}
        <XStack display='flex' justifyContent='center'>
          <XStack alignItems='center'>
            {/*Like*/}
            <ButtonIcon iconName={'heart'} onPress={handleLike} />
            {/*Display number of likes*/}
            {likesLoading ? (
              <Text>Loading</Text>
            ) : likesError ? (
              <Text>-1</Text>
            ) : (
              <Text>{likesCount}</Text>
            )}
          </XStack>
          {/*Comment*/}
          <ButtonIcon
            iconName='comment'
            onPress={() => {
              router.push({
                pathname: '/(modals)/comments',
                params: {
                  comments: JSON.stringify(comments),
                  post_id: JSON.stringify(key),
                },
              });
            }}
          />
          {/*Bookmark*/}
          <ButtonIcon iconName='star' onPress={handleBookmark} />
          {/*Location*/}
          {byte?.location && (
            <ButtonIcon iconName='location' onPress={openMaps} />
          )}
        </XStack>
        {/*USER INFO*/}
        <YStack px={'$2.5'} gap={'$1'}>
          <XStack gap={'$2'} rowGap={'$5'}>
            <Link href={'/'}>
              <Text fontWeight={'800'}>{username}</Text>
            </Link>
            <Text>{description}</Text>
          </XStack>
          <Subtitle unstyled size={'$1'}>
            {getDateDifference(creation_date)}
          </Subtitle>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
};
export default Post;
