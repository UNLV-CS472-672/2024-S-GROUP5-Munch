/*  Homepage layout
 *   Posts are displayed sequentially and user can
 *   scroll through the posts.
 *   Each post has an associated image and a right-hand panel
 *   to view post's creator's profile, like, comment, and share.
 *   Posts come with a background image, recipe title, and description
 */

import Post from '@/components/Post/Post';
import { FlatList } from 'react-native';
import { View } from 'tamagui';

export default function Index() {
  //the data should be fetched from the backend
  return (
    <View>
      <FlatList
        data={[]}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        decelerationRate={'fast'}
      />
    </View>
  );
}
