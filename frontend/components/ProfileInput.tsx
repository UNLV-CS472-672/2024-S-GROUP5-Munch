import { UserState } from "@/types/user";
import { Dispatch, FC, SetStateAction } from "react";
import { useColorScheme } from "react-native";
import { Input, Label, XStack, Separator } from "tamagui";

interface ProfileInputProps {
  value: string;
  id: string;
  placeholder: string;
  setUserInfo: Dispatch<SetStateAction<UserState>>;
}
export const ProfileInput: FC<ProfileInputProps> = ({
  id: labelID,
  placeholder,
  setUserInfo,
  value,
}) => {
  const colorScheme = useColorScheme();
  return (
    <>
      <XStack>
        <Label htmlFor={labelID} width={"$7"}>
          {placeholder}
        </Label>
        <Input
          id={labelID}
          pt={"$1"}
          px={"$3"}
          defaultValue={value ?? ""}
          placeholder={value ?? placeholder}
          autoCapitalize={"none"}
          autoCorrect={false}
          onChangeText={(e) =>
            setUserInfo((prev) => ({ ...prev, userName: e }))
          }
          color={colorScheme === "dark" ? "white" : "black"}
          unstyled
        />
      </XStack>
      <Separator />
    </>
  );
};
