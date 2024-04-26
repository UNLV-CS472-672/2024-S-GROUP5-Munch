import React, { useCallback, useContext, useState, useEffect } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import axios from 'axios';
import { Text } from 'tamagui'; // assuming this is your custom UI library
import { useQueries } from '@tanstack/react-query';
import { UserContext } from '@/contexts/UserContext';
import { getDateDifference } from '@/utils/getCurrentDateTime';
import { Byte, Recipe } from '@/types/post';

const Feed = () => {
  const { token, user_data } = useContext(UserContext);

  // Fetch user posts and combine loading state
  const { isLoading, posts } = useQueries({
    queries: [
      {
        queryKey: ['userPosts'],
        queryFn: async () => {
          const user_post = await Promise.all(
            user_data.posts.map((post) =>
              (async () => {
                const res = (
                  await axios.get<Byte | Recipe>(
                    `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${post}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                  )
                ).data;
                return { likes: res.likes, comments: res.comments, key: post };
              })(),
            ),
          );
          return { followers: user_data.following, user: user_post };
        },
      },
    ],
    combine: (data) => {
      //this is one post
      // console.log('data', data[0].data);
      return {
        isLoading: data.some((query) => query.isLoading),
        posts: data.flatMap((query) => {
          // const commentLikes = query.data?.user?.reduce
          // console.log(query.data)
          const commentsLikes = query.data?.user?.flatMap((user) => {
            const comments = user.comments.map((comment) => ({
              ...comment,
              type: 'comment',
            }));
            const likes = user.likes.map((like) => ({
              ...like,
              type: 'like',
            }));
            return [...comments, ...likes].flat();
          });
          const follower_data = query.data?.followers
            ?.flatMap((follower) => ({ ...follower, type: 'follower' }))
            .flat();
          return [...commentsLikes, ...follower_data].flat();
        }),
      };
    },
  });

  // console.log('posts', posts);
  const renderActivity = (activity) => {
    switch (activity.type) {
      case 'comment':
        return (
          <Text>
            {activity.username} commented on your post {getDateDifference(activity.creation_date)}!
          </Text>
        );
      case 'like':
        return (
          <Text>
            {activity.user} liked your post {getDateDifference(activity.timestamp)}!
          </Text>
        );
      case 'follower':
        return (
          <Text>
            {activity.user} started following you {getDateDifference(activity.creation_date)}!
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView>
      {posts.map((activity, index) => (
        <React.Fragment key={index}>{renderActivity(activity)}</React.Fragment>
      ))}
    </SafeAreaView>
  );
};

export default Feed;
