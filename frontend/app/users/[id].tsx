import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const Post = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Post {id}</Text>
    </View>
  );
};

export default Post;
