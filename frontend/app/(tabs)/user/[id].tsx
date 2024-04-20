import Author from '@/components/Author';
import { UserContext } from '@/contexts/UserContext';
import { UserType } from '@/types/firebaseTypes';
import { Byte, Recipe } from '@/types/post';
import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserSlug = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user_id, token } = useContext(UserContext);
  const isCurrentUser = id === user_id;

  const { data: id_user_data, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const data = (
        await axios.get<UserType>(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/users/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      ).data;

      return data;
    },
  });

  const { isLoading: post_isLoading, posts } = useQueries({
    queries: id_user_data?.posts
      ? id_user_data.posts.map((post) => ({
          queryKey: [post],
          queryFn: async () =>
            (
              await axios.get<Byte | Recipe>(
                `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${post}`,
                { headers: { Authorization: `Bearer ${token}` } },
              )
            ).data,
        }))
      : [],
    combine: (data) => ({
      isLoading: data.some((d) => d.isLoading),
      posts: data.map((d) => d.data),
    }),
  });

  return (
    <SafeAreaView>
      {!isLoading && !post_isLoading && (
        <Author
          isCurrentUser={isCurrentUser}
          user_data={{ ...(id_user_data as UserType), posts_data: posts }}
        />
      )}
    </SafeAreaView>
  );
};

export default UserSlug;
