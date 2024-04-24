import { UserContext } from '@/contexts/UserContext';
import { UserType } from '@/types/firebaseTypes';
import { Byte, Recipe } from '@/types/post';
import { UserResource } from '@clerk/types';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';
import { FC, useContext, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
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

interface AuthorProps {
  isCurrentUser: boolean;
  user_data: UserType & { posts_data: (Byte | Recipe)[] };
  user?: UserResource;
  profilePicChange?: () => Promise<void>;
}
const Author: FC<AuthorProps> = ({
  user,
  isCurrentUser,
  profilePicChange,
  user_data,
}) => {
  const { token, user_data: self_data, user_id } = useContext(UserContext);
  const [isFollowing, setIsFollowing] = useState(
    Object.values(self_data.following).some(
      (user) => user.user === `users/${user_data.clerk_user_id}`,
    ),
  );

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate } = useMutation({
    mutationKey: [],
    mutationFn: async () =>
      (
        await axios.patch<{ message: string }>(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/users/${user_id}/follow/${user_data.clerk_user_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['userData', user_id, 'explore'],
      });
      setIsFollowing(!isFollowing);
    },
    onError: () => {
      Toast.show({
        text1: `Error unfollowing user ${user_data.username}`,
        type: 'error',
      });
    },
  });

  return (
    <View display='flex' justifyContent='space-around'>
      <YStack>
        <Card elevate size={'$3'} bordered unstyled>
          <XStack justifyContent='space-around'>
            {/*PROFILE PIC IF AVAILABLE*/}
            <Card.Header
              display='flex'
              flexDirection='row'
              gap={'$3'}
              justifyContent='space-between'
              alignItems='center'
            >
              <TouchableOpacity
                onPress={() => {
                  if (!isCurrentUser) return;
                  profilePicChange();
                }}
              >
                <Avatar circular size={'$5'}>
                  <Avatar.Image
                    src={
                      user?.imageUrl ??
                      require('../assets/images/munch_logos.png')
                    }
                  />
                </Avatar>
              </TouchableOpacity>
              <YStack gap={'$2'}>
                <XStack gap={'$1'}>
                  <H4>{user?.username ?? user_data.username}</H4>
                  {!isCurrentUser && (
                    <Button
                      size={'$2'}
                      variant='outlined'
                      backgroundColor={!isFollowing ? '$white0' : '$blue1'}
                      alignSelf='center'
                      onPress={() => mutate()}
                      unstyled
                    >
                      {!isFollowing ? 'Follow' : 'Unfollow'}
                    </Button>
                  )}
                </XStack>
                {(user?.firstName || user?.lastName) && (
                  <Paragraph>{`${user.firstName} ${user.lastName}`}</Paragraph>
                )}
                <Paragraph>{`${user_data.bio ?? ''}`}</Paragraph>
              </YStack>
            </Card.Header>
            <XStack gap={'$3'}>
              <YStack display='flex' alignItems='center'>
                <Label fontSize={'$2'}>Followers</Label>
                <Text>{user_data.followers.length ?? 0}</Text>
              </YStack>
              <YStack display='flex' alignItems='center'>
                <Label fontSize={'$2'}>Following</Label>
                <Text>{user_data.following.length ?? 0}</Text>
              </YStack>
            </XStack>
            {isCurrentUser && (
              <Link href='/profile/profileEditModal' asChild>
                <Button
                  iconAfter={<Feather name={'edit'} size={20} />}
                  unstyled
                  p={'$2'}
                />
              </Link>
            )}
          </XStack>
        </Card>
        {user_data.posts_data.length > 0 && (
          <View py={'$3'} rowGap={'$1'}>
            <Separator />
            <FlatList
              data={user_data.posts_data}
              renderItem={({ item, index }) => (
                <Card size={'$2'} mx={'$1'} bordered elevate>
                  <Link
                    href={{
                      pathname: `/post/${user_data.posts[index].split('/')[1]}`,
                      params: { prev: 'Author' },
                    }}
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
    </View>
  );
};
export default Author;
