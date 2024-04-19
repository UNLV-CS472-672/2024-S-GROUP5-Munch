import { UserType } from '@/types/firebaseTypes';
import { Byte, Recipe } from '@/types/post';
import { UserResource } from '@clerk/types';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { FC } from 'react';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
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
  return (
    <View display='flex' justifyContent='space-between'>
      <YStack>
        <Card elevate size={'$3'} bordered unstyled>
          <XStack justifyContent='space-between'>
            <Card.Header
              display='flex'
              flexDirection='row'
              gap={'$3'}
              justifyContent='space-between'
              alignItems='center'
            >
              {isCurrentUser && (
                <TouchableOpacity onPress={profilePicChange}>
                  <Avatar circular size={'$5'}>
                    <Avatar.Image src={user.imageUrl ?? ' '} />
                  </Avatar>
                </TouchableOpacity>
              )}
              <YStack gap={'$2'}>
                <H4>{user?.username}</H4>
                <Paragraph>{`${user?.firstName} ${
                  user?.lastName ?? ''
                }`}</Paragraph>
                <Paragraph>{`${user_data.bio}`}</Paragraph>
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
    </View>
  );
};
export default Author;
