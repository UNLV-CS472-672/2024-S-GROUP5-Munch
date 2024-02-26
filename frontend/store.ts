import { Store, registerInDevtools } from "pullstate";

import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
} from "firebase/auth";

import { FIREBASE_APP, FIREBASE_AUTH } from "./firebaseConfig";

export const AuthStore = new Store({
  isLoggedIn: false,
  initialized: false,
  user: null,
});

const unsub = onAuthStateChanged(FIREBASE_AUTH, (user) => {
  AuthStore.update((store) => {
    store.user = user;
    (store.isLoggedIn = user ? true : false), (store.initialized = true);
  });
});

export const _signIn = async () => {
  try {
    // const { user, idToken } = await GoogleSignin.signIn();
    // console.log(user);
  } catch (err) {
    return { error: err };
  }
};

export const _signOut = async () => {
  try {
    await signOut(FIREBASE_AUTH);
  } catch (err) {
    return { error: err };
  }
};
