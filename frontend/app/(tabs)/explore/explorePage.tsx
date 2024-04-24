import Post from '@/components/Post/Post';
import { UserContext } from '@/contexts/UserContext';
import { Byte, Recipe } from '@/types/post';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useContext } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { Text, View } from 'tamagui';

const Explore = () => {
  const { token, user_id } = useContext(UserContext);

  const { isLoading, data } = useQuery({
    queryKey: ['explore'],
    queryFn: async () =>
      (
        await axios.get<Byte[] | Recipe[]>(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/${user_id}/nonfollowing`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
      ).data,
  });
  const renderItem = useCallback(({ item }: { item: Byte | Recipe }) => {
    return <Post post={item} />;
  }, []);

  return (
    <View display={'flex'} alignItems='center'>
      {!isLoading &&
        (data.length > 0 ? (
          <FlatList
            data={data}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            decelerationRate={'fast'}
            initialNumToRender={5}
          />
        ) : (
          <Text mt={'$6'}> No new posts to show...</Text>
        ))}
    </View>
  );
};

export default Explore;
