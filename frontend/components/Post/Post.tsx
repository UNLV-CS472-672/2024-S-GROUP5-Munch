import React, { FC, useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
import { Subtitle } from '@/tamagui.config';
import {
  TouchableHighlight,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import {
  Button,
  YStack,
  Image,
  Avatar,
  Text,
  View,
  XStack,
  Tooltip,
} from 'tamagui';
import { Byte, Recipe } from '@/types/post';
import { EvilIcons } from '@expo/vector-icons';
import { isByte, isRecipe } from '@/app/utils/typeGuard';
import { useAuth } from '@clerk/clerk-expo';
import ButtonIcon from './ButtonIcon';

interface PostProps {
  post: Byte | Recipe;
}

const getDateDifference = (creation_date: string) => {
  const currentDate = new Date();
  const creationDate = new Date(creation_date);

  const dateDiff = currentDate.getDate() - creationDate.getDate();
  const hourDiff = currentDate.getHours() - creationDate.getHours();
  const minuteDiff = currentDate.getMinutes() - creationDate.getMinutes();

  if (dateDiff > 1) {
    return `${dateDiff} days ago`;
  } else if (hourDiff < 24 && hourDiff > 0) {
    return `${hourDiff} hours ago`;
  } else if (minuteDiff < 60) {
    return `${minuteDiff} minutes ago`;
  }
};

const Post: FC<PostProps> = ({ post }) => {
  const { author, comments, creation_date, description, likes, pictures, key } =
    post;

  const byte = isByte(post) ? post : null;
  const recipe = isRecipe(post) ? post : null;

  const router = useRouter();
  const { height } = Dimensions.get('screen');

  const openMaps = async () => {
    const iosLink = `maps://0,0?q=${byte?.location}`;
    const androidLink = `geo:0,0?q=${byte?.location}`;
    Linking.openURL(Platform.OS === 'ios' ? iosLink : androidLink);
  };

  const handleLike = async () => {};
  const handleBookmark = async () => {};
  return (
    <View py={'$3'}>
      {/*Avatar*/}
      <Avatar circular size='$6'>
        <Avatar.Image src={' '} />
      </Avatar>
      <Image
        source={{ uri: pictures[0], cache: 'force-cache' }}
        height={height / 1.5}
        borderRadius={'$2'}
      />
      <YStack display='flex'>
        <XStack display='flex' justifyContent='center'>
          {/*Like*/}
          <ButtonIcon iconName={'heart'} onPress={handleLike} />
          {/*Comment*/}
          <ButtonIcon
            iconName='comment'
            onPress={() => {
              router.push('/(modals)/comments');
            }}
          />
          {/*Bookmark*/}
          <ButtonIcon iconName='star' onPress={handleBookmark} />
          {/*Location*/}
          {byte?.location && (
            <ButtonIcon iconName='location' onPress={openMaps} />
          )}
        </XStack>
        <YStack px={'$2.5'}>
          {/* Description */}
          <Link href={`/post/${key}`} replace>
            <Text>{description}</Text>
          </Link>
          {/* Date */}
          <Subtitle unstyled size={'$1'}>
            {getDateDifference(creation_date)}
          </Subtitle>
        </YStack>
      </YStack>
    </View>
  );
};
export default Post;
