import ButtonIcon from './ButtonIcon';
import { UserContext } from '@/contexts/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { XStack, Text, Button } from 'tamagui';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

export default function LikeButton() {
  const queryClient = useQueryClient();

  const { token, user_data } = useContext(UserContext);
  const { getToken, userId } = useAuth();
  const postId = '5cSbSLKmhBktYCgJQpz1';

  const isFirstRender = useRef(false);

  // Default state should be false (known logic error: default state should be whatever the user has it liked as)
  const [liked, setLiked] = useState(
    user_data.likes.includes('posts/5cSbSLKmhBktYCgJQpz1'),
  );

  // Only update the like count locally to reduce API calls
  const [localLikes, setLocalLikes] = useState(0); // Default state is number of likes

  // // Get user's likes
  // let likedPosts = user_data.likes
  // let testvar = likedPosts.includes('posts/5cSbSLKmhBktYCgJQpz1')

  // Get number of likes
  const getLikes = async () => {
    console.log('getting like count');
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/${postId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.likes;
  };

  // Query function
  const {
    data: likesCount,
    error: likesError,
    isLoading: likesLoading,
  } = useQuery({
    queryKey: ['likes'],
    queryFn: getLikes,
  });

  useEffect(() => {
    isFirstRender.current = true;
    setLocalLikes(likesCount);
  }, []);

  // Data that will be passed in order to change the post's likes
  const likeData = {
    user_id: userId,
    post_id: postId,
  };

  // Like/Unlike API call
  const {
    mutateAsync: changeLikes,
    isPending,
    data,
    error,
  } = useMutation({
    mutationFn: async () => {
      console.log('in the mutation: it is ', liked);
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
          headers: { Authorization: `Bearer: ${token}` },
        },
      );
      return response.data;
    },
    // Update the local like count
    onSuccess: () => {
      setLocalLikes(liked ? localLikes + 1 : localLikes - 1);
      // queryClient.invalidateQueries({ queryKey: ['likes'] });
    },
    // Show error message in console
    onError: () => {
      console.log('error:', error.message);
    },
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    console.log('just inverted the like state is, ', liked);
    // Status message
    liked ? console.log('Liking the post!') : console.log('Unliking the post!');
    changeLikes();
  }, [liked]);

  // Handle user liking the post
  const handleLike = () => {
    console.log('just entered the like state is, ', liked);
    // Invert the like state
    setLiked((liked) => !liked);

    // Like or unlike the post based on liked state
    //await changeLikes();
  };

  return (
    <XStack alignItems='center' justifyContent='space-between'>
      {/*Change the number of likes when user interacts*/}
      <Button onPress={async () => console.log(liked)}>Get liked posts</Button>
      <Button
        animation={'bouncy'}
        animateOnly={['transform']}
        icon={
          <AntDesign
            size={22}
            name={liked ? 'heart' : 'hearto'}
            color={liked ? 'red' : 'black'}
          />
        }
        onPress={handleLike}
        pressStyle={{ scale: 0.4 }}
        unstyled
      />

      {/*Display number of likes*/}
      {likesLoading ? (
        <Text>Loading</Text>
      ) : likesError ? (
        <Text>-1</Text>
      ) : (
        <Text>{localLikes}</Text>
      )}
    </XStack>
  );
}
