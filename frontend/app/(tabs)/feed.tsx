import React, { useCallback, useContext, useState, useEffect } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import axios from 'axios';
import { Text, View, Button } from 'tamagui';
import { useQueries } from '@tanstack/react-query';
import { UserContext } from '@/contexts/UserContext';
import { Byte, Recipe } from '@/types/post';

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
                  const res = await axios.get(
                    `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${post}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                  );
                  const postData = res.data;
                  return { ...postData, key: post };
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

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <PostWithActivity
          post={item}
          key={index}
          user_data={user_data}
          token={token}
        />
      );
    },
    [user_data, token],
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

const PostWithActivity = ({ post, user_data, token }) => {
  const { likes, comments, username } = post;
  const { following } = user_data;
  const [followingUsers, setFollowingUsers] = useState([]);

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      const followingData = await Promise.all(
        following.map(async (followee) => {
          const res = await axios.get(
            `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${followee.user}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          return { ...followee, username: res.data.username };
        }),
      );
      setFollowingUsers(followingData);
    };

    fetchFollowingUsers();
  }, [following, token]);

  return (
    <View>
      {likes &&
        likes.length > 0 &&
        likes.map((like, index) => (
          <Text key={`like-${index}`}>
            {like.user} liked your post! - {like.timestamp}
          </Text>
        ))}
      {comments &&
        comments.length > 0 &&
        comments.map((comment, index) => (
          <Text key={`comment-${index}`}>
            {comment.username} commented on your post! - {comment.creation_date}
          </Text>
        ))}
      {followingUsers &&
        followingUsers.length > 0 &&
        followingUsers.map((followee, index) => (
          <Text key={`following-${index}`}>
            {username} started following you! - {followee.timestamp}
          </Text>
        ))}
    </View>
  );
};

export default Feed;
