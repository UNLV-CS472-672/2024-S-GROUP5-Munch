import React, { useState, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Feather } from '@expo/vector-icons';
import {
  Button,
  H4,
  YStack,
  Text,
  Switch,
  XStack,
  AlertDialog,
  AlertDialogTitle,
  AlertDialogDescription,
  Image,
  Form,
} from 'tamagui';
import {
  ByteSchema,
  ByteSchemaInputs,
  RecipeSchema,
  RecipeSchemaInputs,
} from '@/types/postInput';
import { Controller, SubmitHandler, set, useForm } from 'react-hook-form';
import UserInput from '@/components/UserInput';
//import { getCurrentDateTime } from '../utils/getCurrentDateTime';
import { UserContext } from '@/contexts/UserContext';
import { useMutation } from '@tanstack/react-query';
import { getCurrentPositionAsync } from 'expo-location';


export default function Create() {
  const [isEnabled, setEnabledElements] = useState(false);
  const [allowLocation, setAllowLocation] = useState(false);
  const [file, setFile] = useState(null);
  const [errorUpload, setError] = useState(null);


  const pickImg = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      <AlertDialog>
        <AlertDialogTitle>No Permission Granted</AlertDialogTitle>
        <AlertDialogDescription>{errorUpload}</AlertDialogDescription>
      </AlertDialog>;
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      var uri = '';
      result.assets.map((asset) => (uri = asset.uri));
      if (!result.canceled) {
        setFile(uri);
        setError(null);
      }
    }
  };

  const {
    token,
    user_data: { username },
  } = useContext(UserContext);
  const { getToken, userId } = useAuth();

  const postData = {
    author: `users/${userId}`,
    comments: [],
    creation_date: '',
    description: '',
    likes: 0,
    location: '',
    pictures: [file],
    username: username,
  };

  const recipeData = {
    author: `users/${userId}`,
    comments: [],
    creation_date: '',
    description: '',
    likes: 0,
    location: '',
    ingredients: '',
    steps: '',
    pictures: [file],
    username: username,
  };

  const { mutate, error } = useMutation({
    mutationKey: ['createPost'], // Optional: Descriptive key to identify this specific mutation
    mutationFn: () => {
      if (!isEnabled) {
        // for byte
        return axios.post(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts`,
          postData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        // for recipe
        return axios.post(
          `${process.env.EXPO_PUBLIC_IP_ADDR}/api/recipes`,
          recipeData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    }, // Function that defines how to fetch data for this mutation
  });

  const {
    handleSubmit: handleSubmitByte,
    control: controlByte,
    formState: { errors: errorsByte },
  } = useForm<ByteSchemaInputs>({
    resolver: zodResolver(ByteSchema),
    defaultValues: {
      description: '',
    },
  });

  const {
    handleSubmit: handleSubmitRecipe,
    control: controlRecipe,
    formState: { errors: errorsRecipe },
  } = useForm<RecipeSchemaInputs>({
    resolver: zodResolver(RecipeSchema),
    defaultValues: {
      descr: '',
      ingredients: '',
      steps: '',
    },
  });

  const createByte: SubmitHandler<ByteSchemaInputs> = async (data) => {
    const {
      coords: { longitude, latitude },
    } = await getCurrentPositionAsync({ mayShowUserSettingsDialog: true });

    try {
      postData.description = data.description;
      if (allowLocation) {
        postData.location = longitude + ',' + latitude;
      }
      console.log(postData.location);
      mutate();
    } catch (err) {
      // error
      throw new Error(error.message);
    }
  };
  const createRecipe: SubmitHandler<RecipeSchemaInputs> = async (data) => {
    const {
      coords: { longitude, latitude },
    } = await getCurrentPositionAsync({ mayShowUserSettingsDialog: true });

    try {
      recipeData.description = data.descr;
      recipeData.steps = data.steps;
      recipeData.ingredients = data.ingredients;
      if (allowLocation) {
        recipeData.location = longitude + ',' + latitude;
      }
      console.log(recipeData.location);
      mutate();
    } catch (err) {
      //error
      throw new Error(err.message);
    }
  };

  return (
    <SafeAreaView>
      <YStack>
        <H4 style={{ alignSelf: 'center' }}>NEW POST</H4>
        <XStack>
          <Text fontSize='$5' paddingStart='$5'>
            Is this a recipe?
          </Text>
          <Switch
            marginLeft='$2'
            size='$3'
            onCheckedChange={() => setEnabledElements(!isEnabled)}
          >
            <Switch.Thumb animation='bouncy' />
          </Switch>
        </XStack>
        <Button onPress={pickImg} mx={'$19'}
          icon={<Feather name='image' size={30} />}
        >

        </Button>
        <XStack>
          {file ? (
            <Image
              source={{
                uri: file,
              }}
              width={412}
              aspectRatio={1}
              height={150}
            />
          ) : null}
        </XStack>
        <XStack>
          <Text fontSize='$5' paddingStart='$5'>
            Include Location?
          </Text>
          <Switch
            marginLeft='$2'
            size='$3'
            onCheckedChange={() => setAllowLocation(!allowLocation)}
          >
            <Switch.Thumb animation='bouncy' />
          </Switch>
        </XStack>
        {/* byte form */}
        <Form
          onSubmit={handleSubmitByte(createByte)}
          gap={'$2'}
          marginHorizontal={15}
          px={'$2'}
        >
          {!isEnabled ? (
            <YStack>
              <Controller
                name='description'
                control={controlByte}
                render={({ field }) => (
                  <UserInput
                    field={field}
                    labelID={'description'}
                    placeholder={"Whatcha munchin' on?"}
                    key={'description'}
                    sx={{ borderWidth: 1, size: '$5', width: '100%' }}
                  />
                )}
              />
              {errorsByte.description?.message && (
                <Text color={'$red10'}>{errorsByte.description.message}</Text>
              )}
              <Form.Trigger asChild>
                <Button backgroundColor={'$red9'}>Post</Button>
              </Form.Trigger>
            </YStack>
          ) : null}
        </Form>
        {/* redipe form */}
        <Form
          onSubmit={handleSubmitRecipe(createRecipe)}
          gap={'$2'}
          marginHorizontal={15}
          px={'$2'}
        >
          {isEnabled ? (
            <YStack>
              <Controller
                name='descr'
                control={controlRecipe}
                render={({ field }) => (
                  <UserInput
                    field={field}
                    labelID={'descr'}
                    placeholder={"Whatcha munchin' on?"}
                    key={'descr'}
                    sx={{ borderWidth: 1, size: '$5', width: '100%' }}
                  />
                )}
              />
              {errorsRecipe.descr?.message && (
                <Text color={'$red10'}>{errorsRecipe.descr.message}</Text>
              )}
              <Controller
                name='ingredients'
                control={controlRecipe}
                render={({ field }) => (
                  <UserInput
                    field={field}
                    labelID={'ingredients'}
                    placeholder={"What's in your munch?"}
                    key={'ingredients'}
                    sx={{ borderWidth: 1, size: '$5', width: '100%' }}
                  />
                )}
              />
              {errorsRecipe.ingredients?.message && (
                <Text color={'$red10'}>{errorsRecipe.ingredients.message}</Text>
              )}
              <Controller
                name='steps'
                control={controlRecipe}
                render={({ field }) => (
                  <UserInput
                    field={field}
                    labelID={'steps'}
                    placeholder={'How did you make your munch?'}
                    key={'steps'}
                    sx={{ borderWidth: 1, size: '$5', width: '100%' }}
                  />
                )}
              />
              {errorsRecipe.steps?.message && (
                <Text color={'$red10'}>{errorsRecipe.steps.message}</Text>
              )}

              <Form.Trigger asChild>
                <Button backgroundColor={'$red9'}>Post</Button>
              </Form.Trigger>
            </YStack>
          ) : null}
        </Form>
      </YStack>
    </SafeAreaView>
  );
}
