import React, { FC, useEffect } from 'react';
import { Link } from 'expo-router';
import { Subtitle } from '@/tamagui.config';
import {
  TouchableHighlight,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { Button, YStack, Image, Avatar, Text, View, XStack } from 'tamagui';
import { Byte, Recipe } from '@/types/post';
import { getCurrentPositionAsync } from 'expo-location';
import { EvilIcons } from '@expo/vector-icons';
import { isByte, isRecipe } from '@/app/utils/typeGuard';
import { useAuth } from '@clerk/clerk-expo';

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
  const { getToken } = useAuth();
  const byte = isByte(post) ? post : null;
  const recipe = isRecipe(post) ? post : null;
  const { height } = Dimensions.get('screen');

  const openMaps = async () => {
    const iosLink = `maps://0,0?q=${byte?.location}`;
    const androidLink = `geo:0,0?q=${byte?.location}`;
    Linking.openURL(Platform.OS === 'ios' ? iosLink : androidLink);
  };

  const testPost = async () => {
    const token = await getToken();
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
          ContentType: 'application/json',
        },
        method: 'GET',
      });
      // const data = await res.json();
      // console.log(data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleLike = async () => {};
  return (
    <View py={'$3'}>
      {/*Avatar*/}
      <Avatar circular size='$6'>
        <Avatar.Image src={' '} />
      </Avatar>
      <Image
        source={{ uri: pictures[0], cache: 'force-cache' }}
        height={height / 2}
        borderRadius={'$2'}
      />
      <YStack display='flex'>
        <XStack display='flex' justifyContent='center'>
          {/*Like*/}
          <Button
            size={'$4'}
            circular
            icon={<EvilIcons name='heart' size={30} />}
            display='flex'
            justifyContent='center'
            alignItems='center'
            onPress={handleLike}
            unstyled
          />
          {/*Comment*/}
          <Button
            size='$4'
            circular
            //change color of icon based on theme
            icon={<EvilIcons name='comment' size={30} />}
            display='flex'
            justifyContent='center'
            alignItems='center'
            unstyled
          />
          {/*Bookmark*/}
          <Button
            size='$4'
            circular
            icon={<EvilIcons name='star' size={30} />}
            display='flex'
            justifyContent='center'
            alignItems='center'
            unstyled
          />
          {byte?.location && (
            <Button
              size='$4'
              unstyled
              circular
              display='flex'
              justifyContent='center'
              alignItems='center'
              icon={<EvilIcons name='location' size={30} />}
              onPress={openMaps}
            />
          )}
        </XStack>
        <YStack px={'$2.5'}>
          {/* Description */}
          <Text onPress={testPost}>CLICK HERE </Text>
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
