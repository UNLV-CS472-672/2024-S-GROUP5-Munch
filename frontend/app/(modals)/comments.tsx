import CommentComponent from '@/components/Comment';
import { Container, Main } from '@/tamagui.config';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions } from 'react-native';
import { Button, ScrollView, Text, TextArea, XStack } from 'tamagui';

export default function CommentPage() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  {
    /*This is the back button that goes back to the home page*/
  }

  //NOTE USE THE Comment.tsx COMPONENT
  return (
    <ScrollView
      snapToInterval={Dimensions.get('window').height / 2}
      disableIntervalMomentum={true}
      decelerationRate='fast'
    >
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
    </ScrollView>
  );
}
