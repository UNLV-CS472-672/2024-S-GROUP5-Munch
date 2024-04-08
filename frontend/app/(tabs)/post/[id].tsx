import Post from '@/components/Post/Post';
import { UserContext } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native';
import { Spinner, Text, View } from 'tamagui';

const PostSlug = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useContext(UserContext);

  const { isLoading, data, error } = useQuery({
    queryKey: [id],
    queryFn: async () =>
      (
        await axios.get(`${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).data,
  });

  return (
    <SafeAreaView>
      {isLoading && <Spinner />}
      {!isLoading && <Post post={data} />}
    </SafeAreaView>
  );
};
export default PostSlug;
