import CommentComponent from '@/components/Comment';
import { UserContext } from '@/contexts/UserContext';
import { CommentSchema, CommentSchemaInputs } from '@/types/commentInput';
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  Octicons,
} from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Dimensions, KeyboardAvoidingView, Modal, useColorScheme } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Button, Form, Input, ScrollView, Text, View } from 'tamagui';

export default function CommentPage() {
  //get user information
  const { token, user_id } = useContext(UserContext);

  //get parameters from the post
  const item = useLocalSearchParams();
  const stringedItem = JSON.stringify(item);
  const params = JSON.parse(stringedItem.toString());

  //router to move between modal and friends page
  const router = useRouter();

  //states
  const [comments, setComments] = useState([]);
  const [goFetch, setGoFetch] = useState(true);
  const [input, setInput] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [enableShowDelete, setEnableShowDelete] = useState(false);

  //refetch data
  const refetch = async () => {
    //try and make get call for the post of the comments
    try {
      const postCheck = await axios.get(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${params['post_id'].slice(1, -1)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      //return the comments of the post
      return postCheck.data['comments'];
    } catch (err) {
      console.log(err);
    }
  };

  //if goFetch is true, refetch data
  useEffect(() => {
    if (goFetch) {
      const fetchData = async () => {
        //set comments from refetch response, set go fetch to false because you've already fetched
        try {
          const response = await refetch();
          setComments(response);
          setGoFetch(false);
        } catch (err) {
          console.log(err);
        }
      };

      fetchData();
    }
  }, [goFetch]);

  //set goFetch to true wheenver there is a change to comments
  useEffect(() => {
    setGoFetch(true);
    //also check if user owns any comments on this comment page
    setEnableShowDelete(checkForOwnComments());
  }, [comments]);

  //swap icon color based on light/dark mode
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  const slashIndex = params['post_id'].indexOf('/');

  //display all comments
  const allComments = () => {
    return comments.map((comment) => {
      return (
        <CommentComponent
          key={comment['comment_id']}
          id={comment['comment_id']}
          parent_id={0}
          name={comment['username']}
          image=''
          text={comment['comment']}
          creation_date={comment['creation_date']}
          post_id={params['post_id'].substring(slashIndex + 1).slice(0, -1)}
        >
          <></>
        </CommentComponent>
      );
    });
  };

  //check if user has any of their own comments on the page
  const checkForOwnComments = () => {
    for (const comment in comments) {
      if (comments[comment]['author'] === `users/${user_id}`) {
        return true;
      }
    }
    return false;
  };

  //form resolving for submitting a comment
  const {
    handleSubmit: handleSubmitComment,
    control: controlComment,
    reset: resetCommentForm,
  } = useForm<CommentSchemaInputs>({
    resolver: zodResolver(CommentSchema),
    defaultValues: {
      comment: '',
    },
  });

  //create a comment
  const createComment: SubmitHandler<CommentSchemaInputs> = async (data) => {
    //make api call to create comment
    try {
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/comment/${user_id}/${params['post_id'].substring(slashIndex + 1).slice(0, -1)}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      //add new comment to comments variable, reset form
      setShowDelete(false);
      const newComment = response.data;
      setComments((prevComments) => [...prevComments, newComment]);
      resetCommentForm();
      setInput('');
    } catch (err) {}
  };

  //delete comment
  const deleteComment = async (data) => {
    //make api call to delete comment
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/comment/${user_id}/${params['post_id'].substring(slashIndex + 1).slice(0, -1)}/${data}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      //remove deleted comment from comments variable
      setComments((prevComments) =>
        prevComments.filter((comment) => comment['comment_id'] !== data),
      );
    } catch (err) {
      console.log(err);
    }
  };

  //function to show deletable comments (i.e. comments the current user owns)
  const showDeletableComments = () => {
    return comments.map((comment) => {
      //if comment author is the same as current user, show delete button
      if (comment['author'] === `users/${user_id}`) {
        return (
          <CommentComponent
            key={comment['comment_id']}
            id={comment['comment_id']}
            parent_id={0}
            name={comment['username']}
            image=''
            text={comment['comment']}
            creation_date={comment['creation_date']}
            post_id={params['post_id'].substring(slashIndex + 1).slice(0, -1)}
          >
            <Button
              onPress={() => deleteComment(comment['comment_id'])}
              width={30}
              height={30}
              borderRadius={50}
              backgroundColor={'$red10'}
              textAlign='center'
              padding={0}
              justifyContent='center'
              alignItems='center'
              marginRight={'$-6'}
              marginTop={'$2.5'}
              icon={<AntDesign name='minus' size={24} color='white' />}
            ></Button>
          </CommentComponent>
        );
        //other wise, don't show delete button
      } else {
        return (
          <CommentComponent
            key={comment['comment_id']}
            id={comment['comment_id']}
            parent_id={0}
            name={comment['username']}
            image=''
            text={comment['comment']}
            creation_date={comment['creation_date']}
            post_id={params['post_id'].substring(slashIndex + 1).slice(0, -1)}
          >
            <></>
          </CommentComponent>
        );
      }
    });
  };

  //NOTE USE THE Comment.tsx COMPONENT
  return (
    //used to allow for swipe down to close
    <GestureRecognizer
      style={{ flex: 1 }}
      onSwipeDown={() => {
        router.back();
      }}
    >
      {/* modal to hold the comments and input field */}
      <Modal animationType='slide' transparent={true} visible={true}>
        {/* button to allow user to click back to friends page */}
        <Button
          onPress={router.back}
          backgroundColor={'black'}
          opacity={0}
          height={'40%'}
          marginTop={0}
          paddingTop={0}
        ></Button>
        {/* actual view that holds all the comments and input field */}
        <View
          height={'70%'}
          marginTop='auto'
          backgroundColor={colorScheme === 'dark' ? '$black4' : '$white2'}
          borderTopStartRadius={25}
          borderTopEndRadius={25}
        >
          {/* button to close comments modal */}
          <Button
            unstyled
            flexDirection='row'
            backgroundColor='transparent'
            pressStyle={{ opacity: 0.5 }}
            width={'$25'}
            justifyContent='center'
            paddingBottom={0}
            onPress={router.back}
          >
            <Octicons name='horizontal-rule' size={30} color='gray' />
          </Button>
          <Text textAlign='center' fontSize={16} paddingBottom={'$2'}>
            Comments
          </Text>
          {/* scroll view to scroll through all comments */}
          <ScrollView
            snapToInterval={Dimensions.get('window').height / 2}
            disableIntervalMomentum={true}
            showsVerticalScrollIndicator={true}
            decelerationRate='fast'
            borderTopColor={'gray'}
            borderTopWidth={0.45}
            borderBottomColor={'gray'}
            borderBottomWidth={0.45}
            paddingTop={'$3'}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* if user clicks button to delete comment, show all comments they own with a delete button, otherwise just show comments normally */}
            {showDelete ? showDeletableComments() : allComments()}
          </ScrollView>
          {/* Input field */}
          <View marginBottom='$2.5' marginTop='$2.5'>
            {/* make sure keyboard doesnt cover input field */}
            <KeyboardAvoidingView>
              <View display='flex' borderWidth={0} borderColor='transparent'>
                {/* form to submit a comment */}
                <Form
                  onSubmit={handleSubmitComment(createComment)}
                  flexDirection='row'
                  justifyContent='center'
                >
                  {/* view that holds the text input */}
                  <View
                    flexDirection='row'
                    borderWidth={0.5}
                    width={'80%'}
                    borderRadius={50}
                    borderColor={iconColor}
                    backgroundColor={'transparent'}
                  >
                    {/* controller for user input for comment */}
                    <Controller
                      name='comment'
                      control={controlComment}
                      render={({ field: { onChange, value } }) => (
                        // actuall input area
                        <Input
                          placeholder={'Comment...'}
                          style={{
                            borderWidth: 0,
                            width: '90%',
                            marginLeft: 6,
                            marginRight: -20,
                            paddingLeft: 10,
                            borderRadius: 50,
                            backgroundColor: 'transparent',
                            borderColor: 'transparent',
                          }}
                          onChangeText={(text) => {
                            //set input variable to text user types in
                            onChange(text);
                            setInput(text);
                          }}
                          value={value}
                        />
                      )}
                    />
                    {/* declare this button as the form trigger */}
                    <Form.Trigger asChild>
                      {/* disable the button if the input is empty */}
                      <Button
                        backgroundColor='transparent'
                        textAlign='center'
                        style={{
                          height: 45,
                          width: 45,
                          padding: 0,
                        }}
                        borderRadius={50}
                        disabled={input.trim().length === 0 ? true : false}
                        icon={
                          <MaterialCommunityIcons
                            name='silverware-fork'
                            size={24}
                            color={
                              input.trim().length === 0 ? 'gray' : iconColor
                            }
                          />
                        }
                      ></Button>
                    </Form.Trigger>
                  </View>
                  {/* button user can click to show delete button next to their own comments, disabled if user has no comments on that page */}
                  <Button
                    backgroundColor={'$red10'}
                    opacity={enableShowDelete ? 1 : 0.3}
                    textAlign='center'
                    style={{
                      height: 45,
                      width: 45,
                      borderRadius: 50,
                      padding: 0,
                      marginHorizontal: 6,
                    }}
                    disabled={enableShowDelete ? false : true}
                    onPress={() => {
                      setShowDelete((prevState) => !prevState);
                    }}
                    icon={<Feather name='trash' size={24} color='white' />}
                  ></Button>
                </Form>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </GestureRecognizer>
  );
}
