/*  Homepage layout
 *   Posts are displayed sequentially and user can
 *   scroll through the posts.
 *   Each post has an associated image and a right-hand panel
 *   to view post's creator's profile, like, comment, and share.
 *   Posts come with a background image, recipe title, and description
 */

<<<<<<< HEAD
<<<<<<< HEAD
import { Dimensions, TouchableHighlight } from "react-native";
import { Avatar, Button, Image, ScrollView, View, YStack } from "tamagui";
=======
import { Dimensions, TouchableHighlight } from 'react-native';
import { Avatar, Button, Image, ScrollView, View, YStack } from 'tamagui';
>>>>>>> 12b5ceba1766fb33c5f1b8ade2104149fb32dc2b

export default function Index() {
  const backgroundImage = { uri: 'https://picsum.photos/1080/1920' };
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  return (
    <ScrollView>
      <View
        flexDirection={'row-reverse'}
        width={windowWidth}
        height={windowHeight}
        verticalPadding={60}
      >
        <Image
          source={backgroundImage}
          width={windowWidth}
          height={windowHeight - 100}
          resizeImage={'contain'}
          position={'absolute'}
        />
        <YStack
          backgroundColor={'grey'}
          width={70}
          height={240}
          y={300}
          justifyContent={'space-around'}
          alignItems={'center'}
        >
          <Avatar circular size='$6'>
            <Avatar.Image src='https://picsum.photos/300/300' />
          </Avatar>
          <TouchableHighlight
            onPress={() => console.log('Button pressed')}
            underlayColor='crimson'
            activeOpacity={1}
          >
            <Image source={require('../../assets/images/heart.png')} />
          </TouchableHighlight>
          <Button size='$5' circular>
            comm
          </Button>
          <Button size='$5' circular>
            share
          </Button>
        </YStack>
      </View>
=======
import { Link } from 'expo-router';
import { Dimensions } from 'react-native';
import { View, ScrollView } from 'tamagui';
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
>>>>>>> 5dc0636bdf6d97460ee502860bded0b3536d6b1f
    </ScrollView>
  );
}
