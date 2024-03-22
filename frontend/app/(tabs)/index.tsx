/*  Homepage layout
*   Includes a background image of a recipe image
*   Includes a side bar with an Avatar, like button, comment
*   button, and a share button. 
*/


import { Link } from 'expo-router';
import { TouchableHighlight, ImageBackground } from 'react-native';
import { Button, YStack, Image, styled, Avatar, Text, View } from 'tamagui';

export default function Index() {
  const backgroundImage = {uri:'https://picsum.photos/1080/1920'}
  const StyledBG = styled(ImageBackground, {flex:1})
  return (
    <View flex={1}>
        <StyledBG resizeMode='contain' source={backgroundImage}>
            <Text>homepage</Text>
            <YStack backgroundColor={'grey'} width={70} height={240} x={338} y={300}
                    justifyContent={'space-around'} alignItems={'center'}>
                <Avatar circular size = "$6">
                    <Avatar.Image src="https://picsum.photos/300/300"/>
                </Avatar>
                <TouchableHighlight onPress={() => console.log("Button pressed")}
                                    underlayColor='crimson' activeOpacity={1} >
                    <Image source={require('../../assets/images/heart.png')}/>
                </TouchableHighlight>
                <Button size="$5" circular>comm</Button>
                <Button size="$5" circular>share</Button>
            </YStack>
       </StyledBG>
    </View>
  );
}
