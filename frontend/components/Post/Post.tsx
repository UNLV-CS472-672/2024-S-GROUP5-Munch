import { Subtitle } from '@/tamagui.config';
import { Byte, Recipe } from '@/types/post';
import { getDateDifference } from '@/utils/getCurrentDateTime';
import { isByte, isRecipe } from '@/utils/typeGuard';
import { Link, useRouter } from 'expo-router';
import React, { FC } from 'react';
import { Dimensions, Linking, Platform, SafeAreaView } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image, Text, XStack, YStack } from 'tamagui';
import ButtonIcon from './ButtonIcon';

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

  const handleLike = async () => {};
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
        <XStack display='flex' justifyContent='center'>
          {/*Like*/}
          <ButtonIcon iconName={'heart'} onPress={handleLike} />
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
