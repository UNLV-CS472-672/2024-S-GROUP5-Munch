import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View,
  Button,
  H1,
  H2,
  H4,
  YStack,
  Text,
  TextArea,
  Switch,
  XStack,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  Image,
  ScrollView,
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
import { EditPostDialog } from '../edit/editPost';

export default function Create() {
  const [isEnabled, setEnabledElements] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const pickImg = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      <AlertDialog>
        <AlertDialogTitle>No Permission Granted</AlertDialogTitle>
        <AlertDialogDescription>{error}</AlertDialogDescription>
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
  const createByte: SubmitHandler<ByteSchemaInputs> = (data) => {
    try {
    } catch (err) {
      // error
    }
  };
  const createRecipe: SubmitHandler<RecipeSchemaInputs> = (data) => {
    try {
    } catch (err) {
      //error
    }
  };

  return (
    <SafeAreaView>
      <EditPostDialog />
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
        <Button onPress={pickImg} backgroundColor={'orange'} mx={'$4'}>
          <Text color={'$black2'}>Upload Image</Text>
        </Button>
        <XStack>
          {file ? (
            <Image
              source={{
                uri: file,
              }}
              width={150}
              aspectRatio={1}
              height={150}
            />
          ) : null}
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
              {/* <TextArea
              placeholder={'Upload IMG...'}
              multiline={true}
              style={{
                height: 150,
                width: 260,
                textAlignVertical: 'top',
              }}
            /> */}
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
              {/* {errorsRecipe.description?.message && (
              <Text color={'$red10'}>{errors.description.message}</Text>
            )} */}
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
