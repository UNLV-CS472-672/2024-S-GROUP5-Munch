import axios from 'axios';
import { useContext } from 'react';
import { LogBox } from 'react-native';
import { useAuth } from '@clerk/clerk-react';
import { router, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, set, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import {
  Adapt,
  Button,
  Dialog,
  Fieldset,
  Input,
  Label,
  Paragraph,
  Sheet,
  TooltipSimple,
  Unspaced,
  XStack,
  Form,
  Separator,
} from 'tamagui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import UserInput from '@/components/UserInput';
import { UserContext } from '@/contexts/UserContext';
import { Byte, Recipe } from '@/types/post';
import {
  ByteSchema,
  ByteSchemaInputs,
  RecipeSchema,
  RecipeSchemaInputs,
} from '@/types/postInput';
import { isByte } from '@/utils/typeGuard';

interface PostProps {
  post: Byte | Recipe;
}

export function EditPostDialog({ post }: FC<PostProps>) {
  LogBox.ignoreLogs(['??']);

  const { token } = useContext(UserContext);
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();
  let updatedPostData = { ...post };
  delete updatedPostData.key;
  const postLocation = usePathname();
  const postId = postLocation.split('/').pop();

  const { mutate, error } = useMutation({
    mutationFn: (postData) => {
      const response = axios.patch(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/${postId}`,
        postData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    },
    // Update the post with the edit
    onSuccess: () => {
      Toast.show({ text1: 'Post edited!' });
      queryClient.invalidateQueries({ queryKey: [postId] });
    },
    // Show error message in console
    onError: () => {
      Toast.show({
        text1: 'Error, post not edited. Please submit a bug report.',
      });
      console.log('error:', error.message);
    },
  });

  // validators
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ByteSchemaInputs>({
    resolver: zodResolver(ByteSchema),
    defaultValues: {
      ...post,
    },
  });

  // run when submitted
  const updateByte: SubmitHandler<ByteSchemaInputs> = async (data) => {
    try {
      updatedPostData.description = data.description;
      await mutate(updatedPostData);
      router.replace(postLocation); //reload page for newest updates on frontend
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return (
    <>
      <Dialog modal>
        <Dialog.Trigger asChild>
          <Button bordered minWidth='$14' >Edit</Button>
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
            <Form onSubmit={handleSubmit(updateByte)}>
              <Dialog.Title>Edit Post</Dialog.Title>
              <Dialog.Description>
                Make changes to your post here. Click save when you're done.
              </Dialog.Description>
              <Controller
                name={'description'}
                control={control}
                render={({ field }) => (
                  <UserInput
                    field={field}
                    useLabel
                    labelID='Description'
                    key={'description'}
                    placeholder={post.description || ''}
                    sx={{ borderWidth: 1, size: '$5', width: '95%' }}
                  />
                )}
              />

              <XStack alignSelf='flex-end' gap='$4' margin='$4'>
                <Dialog.Close displayWhenAdapted asChild>
                  <Form.Trigger asChild>
                    <Button
                      backgroundColor={'$red9'}
                      aria-label='Close'
                      type='submit'
                    >
                      Save changes
                    </Button>
                  </Form.Trigger>
                </Dialog.Close>
              </XStack>
            </Form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
