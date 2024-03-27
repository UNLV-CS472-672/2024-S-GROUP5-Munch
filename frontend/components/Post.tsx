/*  Post Component
 *    Custom component to create posts. Currently strictly UI, so the
 *    post's variables (eg likes, comments) are not passed yet.
 *       Parameters:
 *           title
 *              title of the recipe; default is "A yummy recipe"
 *          description
 *             description of the recipe; default is "Munch on this
 *              delicious recipe!"
 *           image
 *               the background image; used to fulfill the source prop
 *               from Tamagui's Image.
 *           avatarImage -
 *              the avatar image; used to fulfill the src prop for
 *               Avatar.Image from Tamagui's Avatar
 */

import { TouchableHighlight, Dimensions } from 'react-native';
import { Button, YStack, Image, Avatar, Text, View } from 'tamagui';
import { Title, Subtitle } from '../tamagui.config.ts';

export default function Post({
  title = 'A yummy recipe',
  description = 'Munch on this delicious recipe!',
  image,
  avatarImage,
}) {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height - 100;
  return (
    <View width={width} height={height} flexDirection='row-reverse'>
      {/*Background Image*/}
      <Image
        source={image}
        width={width}
        height={height}
        resizeImage={'contain'}
        position={'absolute'}
      />
      {/*Right-hand functions: Avatar, like, comment, share*/}
      <YStack
        backgroundColor={'grey'}
        width={70}
        height={320}
        y={300}
        justifyContent={'space-around'}
        alignItems={'center'}
      >
        {/*Avatar*/}
        <Avatar circular size='$6'>
          <Avatar.Image src={avatarImage} />
          <Avatar.Fallback bc='pink' />
        </Avatar>
        {/*Like*/}
        <TouchableHighlight
          onPress={() => console.log('Button pressed')}
          underlayColor='crimson'
          activeOpacity={1}
        >
          <Image source={require('../assets/images/heart.png')} />
        </TouchableHighlight>
        {/*Comment*/}
        <Link href={{ pathname: '(tabs)/Subtabs/Comments', params: { name: 'Name' } }} asChild>
          <Button size='$5' circular>comm</Button>
        </Link>
        {/*Bookmark*/}
        <Button size='$5' circular>
          save
        </Button>
        {/*Share*/}
        <Button size='$5' circular>
          share
        </Button>
      </YStack>
      {/*Title, description, recipe*/}
      <YStack
        backgroundColor={'grey'}
        width={300}
        height={200}
        justifyContent={'flex-end'}
        alignSelf={'flex-end'}
        x={-20}
        y={-20}
      >
        <YStack>
          {/*Recipe title*/}
          <Subtitle>{title}</Subtitle>
          {/*Recipe description*/}
          <Text>{description}</Text>
        </YStack>
        {/*The recipe*/}
        <Link
          href={{ pathname: '(tabs)/Subtabs/recipe', params: { name: 'Name' } }}
          asChild
        >
          <Button
            size='$5'
            borderRadius={25}
            width={250}
            radius={0}
            padding={10}
          >
            The Recipe
          </Button>
        </Link>
      </YStack>
    </View>
  );
}
