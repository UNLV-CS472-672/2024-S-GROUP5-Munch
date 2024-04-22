import { useContext } from 'react';
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
import {
  ByteSchema,
  ByteSchemaInputs,
  RecipeSchema,
  RecipeSchemaInputs,
} from '@/types/postInput';
import { Feather } from '@expo/vector-icons';
import { isByte } from '@/utils/typeGuard';
import { Byte, Recipe } from '@/types/post';
import { Controller, SubmitHandler, set, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserContext } from '@/contexts/UserContext';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import UserInput from '@/components/UserInput';

interface PostProps {
  post: Byte | Recipe;
}

export function EditPost({ post }: FC<PostProps>) {
  const { token } = useContext(UserContext);
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();
  let updatedPostData = post;

  const { mutate, error } = useMutation({
    mutationFn: (postData) => {
      if (isByte(post)) {
        return axios.post(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts`,
          postData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        return axios.post(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/recipes`,
          postData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    },
  });

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

  const updateByte: SubmitHandler<ByteSchemaInputs> = async (data) => {
    try {
      updatedPostData.description = data.description;
      console.log('updatedPost' + updatedPost);
      console.log(`users/${userId}`);
      console.log(username);
      console.log('data' + data);
      await mutate(updatedPost);

      // Invalidate cache and trigger refetch
      queryClient.invalidateQueries('posts');
    } catch (err) {
      // error
      throw new Error(err.message);
    }
  };
  return (
    <>
      <Dialog modal>
        <Dialog.Trigger asChild>
          <Button>Edit</Button>
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
                    placeholder={post.description ?? 'description'}
                  />
                )}
              />
              <Separator />
              <Label width={160} justifyContent='flex-end' htmlFor='username'>
                {/* <TooltipSimple label="Pick your favorite" placement="bottom-start">
                <Paragraph>Food</Paragraph>
              </TooltipSimple> */}
              </Label>

              <XStack alignSelf='flex-end' gap='$4'>
                <Dialog.Close displayWhenAdapted asChild>
                  <Form.Trigger asChild>
                    <Button theme='active' aria-label='Close' type='submit'>
                      Save changes
                    </Button>
                  </Form.Trigger>
                </Dialog.Close>
              </XStack>

              <Unspaced>
                <Dialog.Close asChild>
                  <Button
                    position='absolute'
                    top='$3'
                    right='$3'
                    size='$2'
                    circular
                    icon={<Feather name='x-circle' size={16} color='#007AFF' />}
                  />
                </Dialog.Close>
              </Unspaced>
            </Form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
