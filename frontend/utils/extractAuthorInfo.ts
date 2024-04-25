import { UserResource } from '@clerk/types';
import { UserType } from '@/types/firebaseTypes';
import { Byte, Recipe } from '@/types/post';
export const extractAuthorInfo = (
  user: UserResource,
  user_data: UserType,
  posts: (Byte | Recipe)[],
) => {};
