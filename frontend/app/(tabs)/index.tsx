import { useUser } from "@clerk/clerk-expo";
import { collection, getDocs } from "firebase/firestore";
import { SafeAreaView } from "react-native";
import { Text, View } from "tamagui";
import { db } from "../firebaseConfig";
import { useEffect } from "react";

export default function Index() {
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
        <Text>{`hello ${user?.username ? user.username : user?.firstName}`}</Text>
      </View>
    </SafeAreaView>
  );
}
