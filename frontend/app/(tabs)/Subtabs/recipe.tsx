import { Feather } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Button, Text, TextArea, YStack, Image } from 'tamagui';
import { Container, Main, Subtitle, Title } from '../../../tamagui.config.ts';
//Recipe Page

export default function Recipe() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  {/*This is the back button that goes back to the home page*/}
  const BackButton = () => (
    <Button
      unstyled
      flexDirection="row"
      backgroundColor="transparent"
      paddingLeft={0}
      pressStyle={{ opacity: 0.5 }}
      onPress={router.back}
      icon={<Feather name="chevron-left" size={16} color="#007AFF" />}>
      <Text color="#007AFF">Back</Text>
    </Button>
  );

  return(
    <Container>
      <Stack.Screen options={{ title: 'Super Cool Recipe', headerCenter: () => <BackButton /> }} />
      <Main>
          {/* This is the main body of the recipe page*/}
        <YStack>
          {/* This Button navigates back to home*/}
          <BackButton/>
          {/* This Image is a Placeholder but shows the food*/}
          <Image
            style={{width: 400, height: 300}}
            resizeMode="contain"
            source={{ uri: 'https://cdn.loveandlemons.com/wp-content/uploads/2021/04/green-salad.jpg'}}
          />
          {/* Title of the Recipe*/}
          <Title color="white">Recipe Title</Title>
          {/* Small bio with author*/}
          <Subtitle color="white">Showing recipe details for user {name}.</Subtitle>
          {/* Steps everything else etc*/}
          <Text color="white">steps, testing, testing</Text>
        </YStack>
      </Main>
    </Container>
  );
}
