/*  Homepage layout
 *   Posts are displayed sequentially and user can
 *   scroll through the posts.
 *   Each post has an associated image and a right-hand panel
 *   to view post's creator's profile, like, comment, and share.
 *   Posts come with a background image, recipe title, and description
 */

import Post from '@/components/Post/Post';
import { UserContext } from '@/contexts/UserContext';
import { Byte, Recipe } from '@/types/post';
import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useContext, useEffect } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import { View } from 'tamagui';
import { getCurrentPositionAsync } from 'expo-location';
import { YelpRecommendation } from '@/types/firebaseTypes';
import YelpPost from '@/components/YelpPost';

export default function Index() {
  const { token, user_id } = useContext(UserContext);

  //current route is wrong should use yelp api
  const { isLoading, data } = useQuery({
    queryKey: ['recommendation'],
    queryFn: async () => {
      const {
        coords: { longitude, latitude },
      } = await getCurrentPositionAsync({ mayShowUserSettingsDialog: true });
      console.log(longitude, latitude);
      const recommendation = (
        await axios.get<YelpRecommendation[]>(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${latitude}/${longitude}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      ).data;

      return recommendation;
    },
  });

  const renderItem = useCallback(
    ({ item, index }: { item: YelpRecommendation; index: number }) => {
      return <YelpPost post={item} key={index} />;
    },
    [],
  );

  return (
    <SafeAreaView>
      {!isLoading && (
        <FlatList
          data={data}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          decelerationRate={'fast'}
          initialNumToRender={5}
        />
      )}
    </SafeAreaView>
  );
}
