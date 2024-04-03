import { Link } from 'expo-router';
import { TouchableHighlight, Dimensions } from 'react-native';
import { Button, YStack, Image, Avatar, Text, View } from 'tamagui';

export default function CommentComponent({
  id, // id,
  parent_id, // parent comment id,
  name, // commenting person name,
  image, // commenting person image,
  text, // comment text,
}) {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height - 100;
  return (
    <View width={width} height={height} flexDirection='row-reverse'></View>
  );
}
