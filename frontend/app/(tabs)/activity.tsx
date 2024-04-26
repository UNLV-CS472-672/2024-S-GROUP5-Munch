import React, { useCallback, useContext, useState, useEffect } from 'react';
import { SafeAreaView, FlatList } from 'react-native';
import axios from 'axios';
import { Input, View } from 'tamagui';
import { useQueries } from '@tanstack/react-query';
import { UserContext } from '@/contexts/UserContext';
import { getDateDifference } from '@/utils/getCurrentDateTime';
import { Byte, Recipe } from '@/types/post';

type Comment = {
  type: 'comment';
  author: string;
  comment: string;
  creation_date: string;
  comment_id: string;
  username: string;
};

type Like = {
  type: 'like';
  timestamp: string;
  user: string;
  username: string;
};

type Follower = {
  type: 'follower';
  timestamp: string;
  user: string;
  username: string;
};

type Post = Comment | Like | Follower;

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
      return {
        isLoading: data.some((query) => query.isLoading),
        posts: data.flatMap((query) => {
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
          return [...(commentsLikes ?? []), ...(follower_data ?? [])].flat();
        }),
      };
    },
  });

  const sortedPosts = posts.sort((a: Post, b: Post) => {
    let dateA;
    let dateB;

    if (a.type === 'comment') {
      dateA = new Date(a.creation_date).getTime();
    } else {
      dateA = new Date(a.timestamp).getTime();
    }
    if (b.type === 'comment') {
      dateB = new Date(b.creation_date).getTime();
    } else {
      dateB = new Date(b.timestamp).getTime();
    }

    return dateB - dateA;
  });

  const renderActivity = (activity: Post) => {
    switch (activity.type) {
      case 'comment':
        return (
          <Input readOnly>
            {activity.username ?? 'A Muncher'} commented on your post{' '}
            {getDateDifference(activity.creation_date)}!
          </Input>
        );
      case 'like':
        return (
          <Input readOnly>
            {activity.username ?? 'A Muncher'} liked your post{' '}
            {getDateDifference(activity.timestamp)}!
          </Input>
        );
      case 'follower':
        return (
          <Input readOnly>
            {activity.username ?? 'A Muncher'} started following you{' '}
            {getDateDifference(activity.timestamp)}!
          </Input>
        );
    }
  };

  const renderItem = useCallback(({ item }: { item: Post }) => {
    return renderActivity(item);
  }, []);

  return (
    <SafeAreaView style={{ paddingTop: 40 }}>
      {/*@ts-ignore */}
      {!isLoading && <FlatList data={posts} renderItem={renderItem} />}
    </SafeAreaView>
  );
};

export default Feed;