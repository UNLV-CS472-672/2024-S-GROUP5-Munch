import { Byte, Recipe } from '@/types/post';

export const isByte = (post: Byte | Recipe): post is Byte => {
  return (post as Byte).location !== undefined;
};

export const isRecipe = (post: Byte | Recipe): post is Recipe => {
  return (post as Recipe).steps !== undefined;
};
