/*  Homepage layout
 *   Includes a background image of a recipe image
 *   Includes a side bar with an Avatar, like button, comment
 *   button, and a share button.
 */

import { Link } from 'expo-router';
import { TouchableHighlight, ImageBackground, Dimensions } from 'react-native';
import {
  Button,
  YStack,
  Image,
  styled,
  Avatar,
  Text,
  View,
  ScrollView,
} from 'tamagui';

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
    </ScrollView>
  );
}
