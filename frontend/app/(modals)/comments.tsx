import CommentComponent from '@/components/Comment';
import { Octicons, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, KeyboardAvoidingView, Modal } from 'react-native';
import { Button, ScrollView, View, XStack, Form, Input, Text } from 'tamagui';
import { CommentSchema, CommentSchemaInputs } from '@/types/commentInput';
import axios, { all } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/contexts/UserContext';
import { useColorScheme } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import GestureRecognizer from 'react-native-swipe-gestures';

export default function CommentPage() {
  const { token, user_id } = useContext(UserContext);

  const item = useLocalSearchParams();
  const stringedItem = JSON.stringify(item)
  const params = JSON.parse(stringedItem.toString());

  const router = useRouter();

  const [comments, setComments] = useState([]);
  const [goFetch, setGoFetch] = useState(true);
  const [input, setInput] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [enableShowDelete, setEnableShowDelete] = useState(false);

  const refetch = async () => {
    try {
      const postCheck = await axios.get(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/${params["post_id"].slice(1, -1)}`,
        { headers: { Authorization : `Bearer ${token}`}}
      )
      return postCheck.data["comments"]
    }
    catch(err) {

    }
  }

  useEffect(() => {
    if (goFetch) {
      const fetchData = async () => {
        try {
          const response = await refetch();
          setComments(response);
          setGoFetch(false);
        }
        catch (err) {

        }
      }
      
      fetchData();
    }
  }, [goFetch]);

  useEffect(() => {
    setGoFetch(true);
    setEnableShowDelete(checkForOwnComments());
  }, [comments])

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  const slashIndex = params["post_id"].indexOf("/");

  const allComments = () => {
    return comments.map(comment => {
      return <CommentComponent 
        key={comment["comment_id"]} 
        id={comment["comment_id"]} 
        parent_id={0} 
        name={comment["username"]} 
        image=''
        text={comment["comment"]}
        creation_date={comment["creation_date"]}
        post_id={params["post_id"].substring(slashIndex + 1).slice(0, -1)}
      >
        <></>
      </CommentComponent>
    })
  }

  const checkForOwnComments  = () => {
    for (const comment in comments) {
      if (comments[comment]["author"] === `users/${user_id}`) {
        return true;
      }
    }
    return false;
  }

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

  const createComment: SubmitHandler<CommentSchemaInputs> = async (data) => {
    try {
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/comment/${user_id}/${params["post_id"].substring(slashIndex + 1).slice(0, -1)}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      );
        const newComment = response.data;
        setComments((prevComments) => [...prevComments, newComment]);
        resetCommentForm();
        setInput("");
      } catch (err) {

    }
  };

  
  const deleteComment = async (data) => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_IP_ADDR}/api/posts/comment/${user_id}/${params["post_id"].substring(slashIndex + 1).slice(0, -1)}/${data}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setComments((prevComments) => prevComments.filter(comment => comment["comment_id"] !== data));
    }
    catch(err) {
      console.log(err);
    }
  }

  const showDeletableComments = () => {
    return comments.map(comment => {
      if (comment["author"] === `users/${user_id}`) {
      return <CommentComponent 
        key={comment["comment_id"]} 
        id={comment["comment_id"]} 
        parent_id={0} 
        name={comment["username"]} 
        image=''
        text={comment["comment"]}
        creation_date={comment["creation_date"]}
        post_id={params["post_id"].substring(slashIndex + 1).slice(0, -1)}
      >
        <Button
              onPress={() => deleteComment(comment["comment_id"])}
              width={30}
              height={30}
              borderRadius={50}
              backgroundColor={"$red10"}
              textAlign='center'
              padding={0}
              justifyContent='center'
              alignItems='center'
              marginRight={"$-6"}
              marginTop={"$2.5"}
              icon={<AntDesign name="minus" size={24} color="white" />
            }
            >       
          </Button>
      </CommentComponent>
      }
      else {
        return <CommentComponent 
        key={comment["comment_id"]} 
        id={comment["comment_id"]} 
        parent_id={0} 
        name={comment["username"]} 
        image=''
        text={comment["comment"]}
        creation_date={comment["creation_date"]}
        post_id={params["post_id"].substring(slashIndex + 1).slice(0, -1)}
      >
      <></>
      </CommentComponent>
      }
    })
  }
  
  //NOTE USE THE Comment.tsx COMPONENT
  return (
  <GestureRecognizer style={{flex: 1}} onSwipeDown={() => {router.back()}}>
    <Modal animationType='slide'
      transparent={true}
      visible={true}>
      <Button onPress={router.back} backgroundColor={"black"} opacity={0} height={"40%"} marginTop={0} paddingTop={0}></Button>
      <View height={"70%"} marginTop="auto" backgroundColor={colorScheme === 'dark' ? '$black4' : '$white2'} borderTopStartRadius={25} borderTopEndRadius={25}>
        <PanGestureHandler>
        <Button
          unstyled
          flexDirection='row'
          backgroundColor='transparent'
          pressStyle={{ opacity: 0.5 }}
          width={"$25"}
          justifyContent='center'
          paddingBottom={0}
          onPress={router.back}
        >
          <Octicons name='horizontal-rule' size={30} color='gray' />
        </Button>
        </PanGestureHandler>
        <Text textAlign='center' fontSize={16} paddingBottom={"$2"}>Comments</Text>
        <ScrollView
          snapToInterval={Dimensions.get('window').height / 2}
          disableIntervalMomentum={true}
          showsVerticalScrollIndicator={true}
          decelerationRate='fast'
          borderTopColor={"gray"}
          borderTopWidth={0.45}
          borderBottomColor={"gray"}
          borderBottomWidth={0.45}
          paddingTop={"$3"}
          contentContainerStyle={{paddingBottom: 20}}
        >
        {showDelete ? showDeletableComments() : allComments()}
        </ScrollView>
        <View marginBottom="$2.5" marginTop="$2.5">
          <KeyboardAvoidingView>
            <View display='flex' borderWidth={0} borderColor="transparent">
              <Form
                onSubmit={handleSubmitComment(createComment)} 
                flexDirection='row'
                justifyContent='center'>
                <View flexDirection='row' borderWidth={0.5} width={"80%"} borderRadius={50} borderColor={iconColor} backgroundColor={"transparent"}>
                  <Controller 
                    name='comment'
                    control={controlComment}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder={'Comment...'}
                        style={{
                          borderWidth: 0,
                          width: '90%',
                          marginLeft: 6,
                          marginRight: -20,
                          paddingLeft: 10,
                          borderRadius: 50,
                          backgroundColor: "transparent",
                          borderColor: "transparent",
                        }}
                        onChangeText={(text) => {
                          onChange(text);
                          setInput(text);
                        }}
                        value={value}
                      />
                    )}
                  />
                  <Form.Trigger asChild>
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
                      icon={<MaterialCommunityIcons name="silverware-fork" size={24} color={input.trim().length === 0 ? 'gray' : iconColor}/>}
                    >
                    </Button>
                  </Form.Trigger>
                </View>
                <Button 
                  backgroundColor={"$red10"}
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
                  onPress={() => {setShowDelete(prevState => !prevState)}}
                  icon={<Feather name="trash" size={24} color="white" />}
                >
                </Button>
              </Form>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  </GestureRecognizer>
  );
}
