/*  Homepage layout
 *   Posts are displayed sequentially and user can
 *   scroll through the posts.
 *   Each post has an associated image and a right-hand panel
 *   to view post's creator's profile, like, comment, and share.
 *   Posts come with a background image, recipe title, and description
 */

import { Dimensions } from 'react-native';
import { ScrollView } from 'tamagui';
import Post from '../../components/Post';
export default function Index() {
  return (
    <ScrollView
      snapToInterval={Dimensions.get('window').height - 100}
      disableIntervalMomentum={true}
      decelerationRate='fast'
    >
      {/*Example posts*/}
      <Post
        title='Greek salad'
        description="Try my family's famous greek salad. It is sure to be a crowd pleaser with tangy and refreshing vegetables"
        image={{ uri: 'https://picsum.photos/1080/1920' }}
        avatarImage='https://picsum.photos/300/300'
      />
      <Post
        title='Banana cream pie'
        description="My auntie's banana cream pie is to die for! She uses reduced plantains as a secret ingredient"
        image={{
          uri: 'https://fastly.picsum.photos/id/376/1080/1920.jpg?hmac=jowyHgQNXzKXZpoM25AeaYGH1WewzmOT18IQO6A-KRY'
        }}
        avatarImage='https://fastly.picsum.photos/id/788/300/300.jpg?hmac=vZbkqAx5e6Wjik2rP-gC-xLBHoE6tjXGGKebHc_0CAI'
      />
      <Post
        title='Kimchi Fried Rice'
        description='A quick an easy breakfast that I learned from a college roommate. You just need rice, kimchi, an egg, and whatever seasonings you want'
        image={{
          uri: 'https://fastly.picsum.photos/id/348/1080/1920.jpg?hmac=JaRpzUiCbui3ranCaln8sSuScy1nnnSVkh9FZVVRGVs'
        }}
        avatarImage='https://fastly.picsum.photos/id/175/300/300.jpg?hmac=vC3FhlD3cqzNijD5Bt9mBvZCzA6MSj3QsQNrIBv1uSo'
      />
    </ScrollView>
  );
}
