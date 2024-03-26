import { useUser } from "@clerk/clerk-expo";
import { collection, getDocs } from "firebase/firestore";
import { SafeAreaView } from "react-native";
import { Text, View } from "tamagui";
import { db } from "../firebaseConfig";
import { useEffect } from "react";

export default function Index() {
  const backgroundImage = { uri: "https://picsum.photos/1080/1920" };
  const StyledBG = styled(ImageBackground, { flex: 1 });
  return (
    <View flex={1}>
      <StyledBG resizeMode="contain" source={backgroundImage}>
        <Text>homepage</Text>
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
  );
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
      <View>
        <Text>{`hello ${
          user?.username ? user.username : user?.firstName
        }`}</Text>
      </View>
    </SafeAreaView>
  );
}
