import Post from '@/components/Post/Post';
import { UserContext } from '@/contexts/UserContext';
import { UserType } from '@/types/firebaseTypes';
import { Byte, Recipe } from '@/types/post';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import React, { useCallback, useContext } from 'react';
import { FlatList, SafeAreaView } from 'react-native';

const Friends = () => {
  const { token, user_data } = useContext(UserContext);
  const { isLoading, posts } = useQueries({
    queries: user_data.following.map((follower) => ({
      queryKey: [follower],
      queryFn: async () => {
        //first get all the users info
        const follower_data = (
          await axios.get<UserType>(
            `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${follower}`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
        ).data;

        //then get all the posts of the user
        //since we are mapping promises, we await all of the promises to be settled before we return
        const data = await Promise.all(
          follower_data.posts.map((post) =>
            (async () => {
              const res = (
                await axios.get<Byte | Recipe>(
                  `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${post}`,
                  { headers: { Authorization: `Bearer ${token}` } },
                )
              ).data;
              return { ...res, key: post };
            })(),
          ),
        );
        return data;
      },
    })),
    combine: (data) => ({
      isLoading: data.some((d) => d.isLoading),
      posts: data.flatMap((d) => d.data),
    }),
  });

  const renderItem = useCallback(({ item }: { item: Byte | Recipe }) => {
    return <Post post={item} />;
  }, []);

  return (
    <SafeAreaView>
      {!isLoading && (
        <FlatList
          data={posts}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          decelerationRate={'fast'}
          initialNumToRender={5}
        />
      )}
    </SafeAreaView>
  );
};

export default Friends;
