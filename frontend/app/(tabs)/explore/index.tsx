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
        justifyContent='center'
        width={'100%'}
        alignItems='center'
        gap={'$8'}
        py={'$2'}
      >
        <Button
          variant={curView === 'explore' ? 'outlined' : undefined}
          size={'$3'}
          display={'flex'}
          justifyContent='center'
          alignItems='center'
          unstyled
          onPress={() => setView('explore')}
        >
          Explore
        </Button>
        <Button
          variant={curView === 'friends' ? 'outlined' : undefined}
          display={'flex'}
          justifyContent='center'
          alignItems='center'
          size={'$3'}
          unstyled
          onPress={() => setView('friends')}
        >
          Friends
        </Button>
      </XStack>
      {curView === 'explore' ? <Explore /> : <Friends />}
    </SafeAreaView>
  );
};
export default SplitView;
