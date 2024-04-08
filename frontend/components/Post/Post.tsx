import { isByte, isRecipe } from '@/utils/typeGuard';
import { Subtitle } from '@/tamagui.config';
import { Byte, Recipe } from '@/types/post';
import { Link, useRouter } from 'expo-router';
import React, { FC } from 'react';
import { Dimensions, Linking, Platform } from 'react-native';
import { Avatar, Image, Text, View, XStack, YStack } from 'tamagui';
import ButtonIcon from './ButtonIcon';
import { getDateDifference } from '@/app/utils/getCurrentDateTime';

interface PostProps {
  post: Byte | Recipe;
}

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
