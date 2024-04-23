import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Explore from './explorePage';
import Friends from './friends';
import { Button, XStack } from 'tamagui';

const SplitView = () => {
  const [curView, setView] = useState<'explore' | 'friends'>('explore');

  return (
    <SafeAreaView>
      <XStack
        display={'flex'}
        justifyContent='space-around'
        width={'50%'}
        alignItems='center'
      >
        <Button unstyled onPress={() => setView('explore')}>
          Explore
        </Button>
        <Button unstyled onPress={() => setView('friends')}>
          Friends
        </Button>
      </XStack>
      {curView === 'explore' ? <Explore /> : <Friends />}
    </SafeAreaView>
  );
};
export default SplitView;
