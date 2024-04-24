import Post from '@/components/Post/Post';
import { UserContext } from '@/contexts/UserContext';
import { UserType } from '@/types/firebaseTypes';
import { Byte, Recipe, Comment } from '@/types/post';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import React, { useCallback, useContext } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import { Text, View, Button } from 'tamagui';
import LikeButton from '@/components/Post/LikeButton';

const Feed = () => {
  const { token, user_data } = useContext(UserContext);

  const { isLoading, posts } = useQueries({
    queries: [
      {
        queryKey: ['userPosts'],
        queryFn: async () => {
          try {
            const user_post = await Promise.all(
              user_data.posts.map((post) =>
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

            return user_post;
          } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
          }
        },
      },
    ],
    combine: (data) => {
      return {
        isLoading: data.some((query) => query.isLoading),
        posts: data.flatMap((query) => query.data || []),
      };
    },
  });

  console.log(posts);

  const renderItem = useCallback(
    ({ item, index }: { item: Byte | Recipe; index: number }) => {
      return <Post post={item} key={index} />;
    },
    [],
  );

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

export default Feed;
