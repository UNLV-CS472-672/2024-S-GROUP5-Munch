/*  Homepage layout
 *   Posts are displayed sequentially and user can
 *   scroll through the posts.
 *   Each post has an associated image and a right-hand panel
 *   to view post's creator's profile, like, comment, and share.
 *   Posts come with a background image, recipe title, and description
 */

import YelpPost from '@/components/YelpPost';
import { UserContext } from '@/contexts/UserContext';
import { YelpRecommendation } from '@/types/firebaseTypes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getCurrentPositionAsync } from 'expo-location';
import { useCallback, useContext } from 'react';
import { FlatList, SafeAreaView } from 'react-native';

export default function Index() {
  const { token } = useContext(UserContext);

  //current route is wrong should use yelp api
  const { isLoading, data } = useQuery({
    queryKey: ['recommendation'],
    queryFn: async () => {
      const {
        coords: { longitude, latitude },
      } = await getCurrentPositionAsync({ mayShowUserSettingsDialog: true });
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
