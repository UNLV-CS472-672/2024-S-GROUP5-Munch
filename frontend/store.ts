import { Store, registerInDevtools } from "pullstate";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { FIREBASE_APP, FIREBASE_AUTH } from "./firebaseConfig";

export const AuthStore = new Store({
  isLoggedIn: false,
  initialized: false,
  user: null,
});

//
// GoogleSignin.configure({
//   iosClientId:
//     "927916149392-ta9j1djvvmfg32t7b3bllbv4ffvp9b6q.apps.googleusercontent.com",
//   webClientId:
//     "927916149392-nd1l4agsqfu1brnldr18l71pv5ukq78h.apps.googleusercontent.com",
// });

const unsub = onAuthStateChanged(FIREBASE_AUTH, (user) => {
  console.log("change", FIREBASE_AUTH);
  AuthStore.update((store) => {
    store.user = user;
    (store.isLoggedIn = user ? true : false), (store.initialized = true);
  });
});

export const _signIn = async (email: string, password: string) => {
  console.log(email, password);
  try {
    const res = await signInWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password,
    );
    AuthStore.update((store) => {
      store.user = res.user;
      store.isLoggedIn = res.user ? true : false;
    });

    return { user: FIREBASE_AUTH.currentUser };
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
