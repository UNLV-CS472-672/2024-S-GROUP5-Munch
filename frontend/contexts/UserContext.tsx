import { UserResource } from '@clerk/types';
import { Dispatch, SetStateAction, createContext } from 'react';
import { UserType } from '../types/firebaseTypes';

export type UserContextType = {
  user_id: string;
  token: string;
  user: UserResource;
  user_data: UserType;
  setUserProperties?: Dispatch<SetStateAction<UserContextType>>;
  user_loading?: boolean;
};

export const UserContext = createContext<UserContextType>({
  token: '',
  user: {} as UserResource,
  user_id: '',
  user_data: {} as UserType,
});
