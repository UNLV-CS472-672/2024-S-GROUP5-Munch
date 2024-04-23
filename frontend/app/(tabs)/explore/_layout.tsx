import { Stack } from 'expo-router';

const ExploreLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{ headerShown: false, headerTitle: '' }}
      />
    </Stack>
  );
};

export default ExploreLayout;
