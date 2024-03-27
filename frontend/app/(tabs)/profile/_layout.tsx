import { Stack } from 'expo-router';

const ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{ headerShown: false, headerTitle: '' }}
      />
    </Stack>
  );
};

export default ProfileLayout;
