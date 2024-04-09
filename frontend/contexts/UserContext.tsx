import { Dispatch, SetStateAction, createContext } from 'react';
import { UserResource } from '@clerk/types';

export type UserContextType = {
  user_id: string;
  token: string;
  user: UserResource;
  setUserProperties?: Dispatch<SetStateAction<UserContextType>>;
};

export const UserContext = createContext<UserContextType>({
  token: '',
  user: {} as UserResource,
  user_id: '',
});
