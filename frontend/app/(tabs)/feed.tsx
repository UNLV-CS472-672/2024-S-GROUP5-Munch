import { useAuth } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native';
import { Text, View, Button } from 'tamagui';
import LikeButton from '@/components/Post/LikeButton';

export default function TabTwoScreen() {
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
