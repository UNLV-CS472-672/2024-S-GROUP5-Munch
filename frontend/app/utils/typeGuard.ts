import { Byte, Recipe } from '@/types/post';

export const isByte = (post: Byte | Recipe): post is Byte => {
  return 'location' in post;
};

export const isRecipe = (post: Byte | Recipe): post is Recipe => {
  return 'steps' in post;
};
