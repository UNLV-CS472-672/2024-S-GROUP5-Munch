import { YelpRecommendation } from '@/types/firebaseTypes';
import { EvilIcons } from '@expo/vector-icons';
import { FC } from 'react';
import { Dimensions, Linking, Platform } from 'react-native';
import { Button, Image, Text, View, XStack, YStack } from 'tamagui';

interface YelpPostProps {
  post: YelpRecommendation;
}
const YelpPost: FC<YelpPostProps> = ({ post }) => {
  const { height, width } = Dimensions.get('screen');

  const openMaps = async () => {
    const iosLink = `maps://0,0?q=${post.coordinates}`;
    const androidLink = `geo:0,0?q=${post.coordinates}`;
    Linking.openURL(Platform.OS === 'ios' ? iosLink : androidLink);
  };

  return (
    <View>
      <Image
        source={{ uri: post.image_url, height: height / 1.5, width: width }}
        // borderRadius={'$2'}
      />
      <YStack display='flex' rowGap={'$1'} marginBottom={'$10'}>
        <XStack
          display='flex'
          justifyContent='center'
          alignItems='center'
          columnGap={'$2'}
        >
          <Text fontSize={'$5'}>{post.price}</Text>
          <Text fontSize={'$5'}>{`Rating ${post.rating}`}</Text>
          <Button
            size={'$4'}
            circular
            icon={<EvilIcons name={'location'} size={30} />}
            display='flex'
            justifyContent='center'
            alignItems='center'
            onPress={openMaps}
            unstyled
          />
        </XStack>
        <XStack gap={'$2'} rowGap={'$5'} px={'$2.5'}>
          <Text fontWeight={'800'}>{post.name}</Text>
          <Text>{post.description}</Text>
        </XStack>
      </YStack>
    </View>
  );
};

export default YelpPost;
