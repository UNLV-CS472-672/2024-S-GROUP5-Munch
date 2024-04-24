import axios from 'axios';
import { useContext } from 'react';
import { LogBox } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Adapt, Button, Dialog, Sheet, XStack } from 'tamagui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/contexts/UserContext';

export default function DeletePostDialog({ postId }: { postId: string }) {
  LogBox.ignoreLogs(['??']);
  const {
    token,
    user_data: { posts },
  } = useContext(UserContext);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    // delete the post
    onSuccess: () => {
      // Invalidate cache for all post queries
      posts.forEach((post) => {
        queryClient.invalidateQueries({ queryKey: [post] });
      });
      Toast.show({ text1: 'Post Deleted' });
    },
    // Show error message in console
    onError: (error) => {
      Toast.show({
        text1: 'Error, post not deleted. Please submit a bug report.',
      });
      console.log('error:', error.message);
    },
  });

  // run when submitted
  const handleSubmit = async () => {
    try {
      mutate();
      router.navigate('/(tabs)/profile'); //post is deleted, go to profile home page
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return (
    <>
      <Dialog modal>
        <Dialog.Trigger asChild>
          <Button backgroundColor={'$red9'} minWidth='$14'>
            Delete
          </Button>
        </Dialog.Trigger>

        <Adapt when='sm' platform='touch'>
          <Sheet animation='medium' zIndex={200000} modal dismissOnSnapToBottom>
            <Sheet.Frame padding='$4' gap='$4'>
              <Adapt.Contents />
            </Sheet.Frame>
            <Sheet.Overlay
              animation='lazy'
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>

        <Dialog.Portal>
          <Dialog.Overlay
            key='overlay'
            animation='slow'
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />

          <Dialog.Content
            bordered
            elevate
            key='content'
            animateOnly={['transform', 'opacity']}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            gap='$4'
          >
            <Dialog.Title>Delete Post</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this post? This action is
              irreversible!
            </Dialog.Description>

            <XStack alignSelf='center' gap='$20' margin='$4'>
              <Dialog.Close displayWhenAdapted asChild>
                <Button aria-label='Cancel'>Cancel</Button>
              </Dialog.Close>

              <Dialog.Close displayWhenAdapted asChild>
                <Button
                  backgroundColor={'$red9'}
                  aria-label='Delete'
                  onPress={handleSubmit}
                >
                  Delete
                </Button>
              </Dialog.Close>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
