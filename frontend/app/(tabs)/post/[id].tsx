import Post from '@/components/Post/Post';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'tamagui';

const PostSlug = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  //use use query to get the post and render it
  //for future use when getting the post from the user page
  return (
    <SafeAreaView>
      <View>
        {/* <Post post={{ pictures: [''] }} /> */}
        <Text fontSize={15}>{id}</Text>
      </View>
    </SafeAreaView>
  );
};
export default PostSlug;
