import { UserContext } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'tamagui';

const UserSlug = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user_id, user, user_data, token } = useContext(UserContext);
  const isCurrentUser = id === user_id;

  const { data, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data, status, statusText } = await axios.get(
        `https://api.clerk.com/v1/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log(data, status, statusText);
      // return Promise.resolve({ data: {} });
      return data;
    },
  });

  return (
    <SafeAreaView>
      <Text>hello</Text>
    </SafeAreaView>
  );
};

export default UserSlug;
