import { useUser } from "@clerk/clerk-expo";
import { collection, getDocs } from "firebase/firestore";
import { useEffect } from "react";
import {
  ImageBackground,
  SafeAreaView,
  TouchableHighlight,
} from "react-native";
import { Avatar, Text, View, YStack, styled, Button, Image } from "tamagui";
import { db } from "../firebaseConfig";

export default function Index() {
  const backgroundImage = { uri: "https://picsum.photos/1080/1920" };
  const StyledBG = styled(ImageBackground, { flex: 1 });
  const { user } = useUser();

  const users = collection(db, "users");

  const getUsers = async () => {
    try {
      const userSnapshot = await getDocs(users);

      // userSnapshot.forEach((item) => console.log(item.data()));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <SafeAreaView>
      <View flex={1}>
        <StyledBG resizeMode="contain" source={backgroundImage}>
          <YStack
            backgroundColor={"grey"}
            width={70}
            height={240}
            x={338}
            y={300}
            justifyContent={"space-around"}
            alignItems={"center"}
          >
            <Avatar circular size="$6">
              <Avatar.Image src="https://picsum.photos/300/300" />
            </Avatar>
            <TouchableHighlight
              onPress={() => console.log("Button pressed")}
              underlayColor="crimson"
              activeOpacity={1}
            >
              <Image source={require("../../assets/images/heart.png")} />
            </TouchableHighlight>
            <Button size="$5" circular>
              comm
            </Button>
            <Button size="$5" circular>
              share
            </Button>
          </YStack>
        </StyledBG>
      </View>
    </SafeAreaView>
  );
}
