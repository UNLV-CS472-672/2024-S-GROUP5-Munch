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
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import UserInput from '@/components/UserInput';
import { UserContext } from '@/contexts/UserContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentPositionAsync } from 'expo-location';
import { getCurrentDateTime } from '@/utils/getCurrentDateTime';
import Toast from 'react-native-toast-message';

export default function Create() {
  const { userId } = useAuth();

  const {
    token,
    user_data: { username, posts },
  } = useContext(UserContext);

  const [isEnabled, setEnabledElements] = useState(false);
  const [allowLocation, setAllowLocation] = useState(false);
  const [file, setFile] = useState(null);
  const [errorUpload, setError] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const queryClient = useQueryClient();

  const pickImg = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      <AlertDialog>
        <AlertDialogTitle>No Permission Granted</AlertDialogTitle>
        <AlertDialogDescription>{errorUpload}</AlertDialogDescription>
      </AlertDialog>;
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
      });

      let uriStr = '';
      let base64Str = '';

      result.assets.map(({ uri, base64 }) => {
        uriStr = uri;
        base64Str = base64;
      });

      if (!result.canceled) {
        setFile(uriStr);
        setBase64Image(base64Str);
        setError(null);
      }
    }
  };

  const postData = {
    author: `users/${userId}`,
    comments: [],
    creation_date: '',
    description: '',
    likes: [],
    location: '',
    pictures: [],
    username: username,
  };

  const recipeData = {
    author: `users/${userId}`,
    comments: [],
    creation_date: '',
    description: '',
    likes: [],
    location: '',
    ingredients: '',
    steps: '',
    pictures: [],
    username: username,
  };

  const { mutate, error } = useMutation({
    mutationKey: ['createPost'], // Optional: Descriptive key to identify this specific mutation
    mutationFn: async (newData: any) => {
      // for byte
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${!isEnabled ? 'posts' : 'recipes'}`,
        newData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    }, // Function that defines how to fetch data for this mutation
    onSuccess: () => {
      // Invalidate cache for all post queries
      posts.forEach((post) => {
        queryClient.invalidateQueries({ queryKey: [post] });
      });

      Toast.show({ text1: 'Post created!' });
    },
    // Show error message
    onError: (error) => {
      Toast.show({
        text1: 'Error, post not created. Please submit a bug report. :)',
      });
      console.log('error:', error.message);
    },
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
      postData.pictures = [base64Image];
      postData.creation_date = getCurrentDateTime();
      mutate(postData);
    } catch (err) {
      // error
      throw new Error(err.message);
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
      recipeData.pictures = [base64Image];
      recipeData.creation_date = getCurrentDateTime();
      mutate(recipeData);
    } catch (err) {
      //error
      throw new Error(err.message);
    }
  };

  return (
    <SafeAreaView>
      <YStack paddingTop={'$3'}>
        <H4 style={{ alignSelf: 'center' }}>NEW POST</H4>
        <XStack paddingTop={'$5'} paddingBottom={'$2'}>
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

        <XStack paddingTop={'$2'} paddingBottom={'$2'}>
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
                <Button backgroundColor={'$red9'} paddingTop={'$2'}>
                  Post
                </Button>
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
          paddingBottom={'$2'}
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
        <Button
          onPress={pickImg}
          mx={'$19'}
          icon={<Feather name='image' size={30} />}
        ></Button>
        <XStack paddingTop={'$2'} paddingBottom={'$2'}>
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
      </YStack>
    </SafeAreaView>
  );
}
