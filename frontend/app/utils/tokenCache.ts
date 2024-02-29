import { getItemAsync, setItemAsync } from "expo-secure-store";
export const tokenCache = {
  async getToken(key: string) {
    try {
      return getItemAsync(key);
    } catch (err) {
      return null;
    }
  },

  async saveToken(key: string, value: string) {
    try {
      return setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};
