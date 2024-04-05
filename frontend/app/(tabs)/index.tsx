/*  Homepage layout
 *   Posts are displayed sequentially and user can
 *   scroll through the posts.
 *   Each post has an associated image and a right-hand panel
 *   to view post's creator's profile, like, comment, and share.
 *   Posts come with a background image, recipe title, and description
 */

import Post from '@/components/Post/Post';
import { UserContext } from '@/contexts/UserContext';
import { useContext } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { user_id, token } = useContext(UserContext);
  //the data should be fetched from the backend
  return (
    <SafeAreaView>
      <FlatList
        data={[]}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        decelerationRate={'fast'}
      />
    </SafeAreaView>
  );
}
