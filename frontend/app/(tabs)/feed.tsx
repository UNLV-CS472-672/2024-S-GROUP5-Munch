import { SafeAreaView } from 'react-native';
import { Text, View, Button } from 'tamagui';
import LikeButton from '@/components/Post/LikeButton';

export default function TabTwoScreen() {
  return (
    <SafeAreaView>
      <View>
        <Text>Feed view</Text>
        <LikeButton/>
      </View>
    </SafeAreaView>
  );
}
