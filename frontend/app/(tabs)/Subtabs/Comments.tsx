import { Link } from 'expo-router';
import { TouchableHighlight, Dimensions } from 'react-native';
import {
  Button,
  XStack,
  YStack,
  Image,
  Avatar,
  Text,
  View,
  ScrollView,
  TextArea,
} from 'tamagui';
import { Title, Subtitle, Container, Main } from '../../../tamagui.config.ts';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import CommentComponent from '../../../components/CommentComponent';

export default function CommentPage() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  {
    /*This is the back button that goes back to the home page*/
  }
  const BackButton = () => (
    <Button
      unstyled
      flexDirection='row'
      backgroundColor='transparent'
      paddingLeft={0}
      pressStyle={{ opacity: 0.5 }}
      onPress={router.back}
      icon={<Feather name='chevron-left' size={16} color='#007AFF' />}
    >
      <Text color='#007AFF'>Back</Text>
    </Button>
  );

  return (
    <ScrollView
      snapToInterval={Dimensions.get('window').height - 100}
      disableIntervalMomentum={true}
      decelerationRate='fast'
    >
      <BackButton
        style={{
          height: 60,
          padding: 10,
        }}
      />
      <Container>
        <Main>
          <XStack>
            <TextArea
              placeholder={'Comment...'}
              multiline={true}
              style={{
                height: 60,
                width: 300,
                borderRadius: 5,
                paddingHorizontal: 10,
                textAlignVertical: 'top',
              }}
            />
            <Button
              backgroundColor='cyan'
              style={{
                height: 60,
                width: 100,
              }}
            >
              Send
            </Button>
          </XStack>
        </Main>
      </Container>
      <CommentComponent
        id='1'
        parent_id='0'
        name='david'
        image=''
        text='this is parent cooment 1'
      />
      <CommentComponent
        id='2'
        parent_id='0'
        name='kumar'
        image=''
        text='this is parent cooment 2'
      />
      <CommentComponent
        id='3'
        parent_id='0'
        name='selva'
        image=''
        text='this is parent cooment 3'
      />
      <Container>
        <Stack.Screen
          options={{
            title: 'Comment Section',
            headerCenter: () => <BackButton />,
          }}
        />
        <Main>
          <YStack>
            <BackButton />
          </YStack>
        </Main>
      </Container>
    </ScrollView>
  );
}
