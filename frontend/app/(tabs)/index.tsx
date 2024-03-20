import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import { TouchableHighlight, ImageBackground } from 'react-native';
import { Button, YStack, Image, styled, Avatar } from 'tamagui';

export default function Index() {
  const StyledYStack = styled(YStack,{
        backgroundColor:'grey',
        padding: 0,
        width:70, height:240,
        x:338, y:300,
        justifyContent:'space-around',
        alignItems:'center'
  })
  const StyledView = styled(View, {flex:1})
  const backgroundImage = {uri:'https://picsum.photos/1080/1920'}
  const StyledBG = styled(ImageBackground, {flex:1})
  return (
    <StyledView>
        <StyledBG resizeMode='contain' source={backgroundImage}>
            <Text>homepage</Text>
            <StyledYStack>
                <Avatar circular size = "$6">
                    <Avatar.Image src="https://picsum.photos/300/300"/>
                </Avatar>
                <TouchableHighlight onPress={() => console.log("Button pressed")}
                                    underlayColor='crimson' activeOpacity={1} >
                    <Image source={require('./heart.png')}/>
                </TouchableHighlight>
                <Button size="$5" circular>comm</Button>
                <Button size="$5" circular>share</Button>
            </StyledYStack>
       </StyledBG>

    </StyledView>
  );
}
