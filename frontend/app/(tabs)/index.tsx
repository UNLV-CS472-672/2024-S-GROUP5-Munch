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
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { useContext } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import { View } from 'tamagui';

export default function Index() {
  const { token, user_data } = useContext(UserContext);

  //current route is wrong should use yelp api
  // const { isLoading, recommendedPosts } = useQueries({
  //   queries: user_data?.posts
  //     ? user_data.posts.map((post) => ({
  //         queryKey: [post],
  //         queryFn: async () => {
  //           const res = await axios.get<Byte | Recipe>(
  //             `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${post}`,
  //             {
  //               headers: { Authorization: `Bearer ${token}` },
  //             },
  //           );
  //           return res.data;
  //         },
  //       }))
  //     : [],
  //   combine: (data) => ({
  //     isLoading: data.some((d) => d.isLoading),
  //     followingPosts: data.map((d) => d.data),
  //   }),
  // });

  return (
    <SafeAreaView>
      {/* {!isLoading && (
        <FlatList
          data={[]}
          renderItem={({ item }) => <Post post={item} />}
          showsVerticalScrollIndicator={false}
          decelerationRate={'fast'}
        />
      )} */}
    </SafeAreaView>
  );
}
