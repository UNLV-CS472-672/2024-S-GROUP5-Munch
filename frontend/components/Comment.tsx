import { getDateDifference } from '@/utils/getCurrentDateTime';
import { Dimensions } from 'react-native';
import { Text, View } from 'tamagui';

export default function CommentComponent({
  id, // id,
  parent_id, // parent comment id,
  name, // commenting person name,
  image, // commenting person image,
  text, // comment text,
  creation_date, // comment creation
  post_id,
  children,
}) {
  const width = Dimensions.get('window').width - 75;
  return (
    // view to hold one comment
    <View
      width={width}
      height={'auto'}
      flexDirection='row'
      alignItems='center'
      flex={1}
      marginLeft='$3'
      marginBottom='$3'
    >
      {/* view to hold username, text, and time */}
      <View marginLeft={'$4'} flex={1}>
        {/* hodl username and time */}
        <Text marginBottom={'$1.5'}>
          <Text fontWeight={'bold'} fontSize={14}>
            {name}
          </Text>
          <Text color={'$gray10'} fontSize={12}>
            {' '}
            {getDateDifference(creation_date)}
          </Text>
        </Text>
        {/* hold actual comment message */}
        <Text>{text}</Text>
      </View>
      {/* child for potential delete button if user owns the comment */}
      {children}
    </View>
  );
}
