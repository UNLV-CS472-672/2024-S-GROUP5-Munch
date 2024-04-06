import { z } from 'zod';

// for checking image
const ACCEPTED_IMAGE_TYPES = ['image/HEIC', 'image/jpeg'];
const MAX_IMAGE_SIZE = 4;

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

export type ByteState = {
  //image?: string[];
  description?: string;
};

export type RecipeState = {
  image?: string[];
  descr?: string;
  ingredients?: string;
  steps?: string;
};

// byte post
export const ByteSchema = z.object({
  // image: z
  //   .custom<FileList>()
  //   .refine((files) => {
  //     return Array.from(files ?? []).length !== 0;
  //   }, 'Image is required')
  //   .refine((files) => {
  //     return Array.from(files ?? []).every(
  //       (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
  //     );
  //   }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
  //   .refine((files) => {
  //     return Array.from(files ?? []).every((file) =>
  //       ACCEPTED_IMAGE_TYPES.includes(file.type),
  //     );
  //   }, 'File type is not supported'),
  description: z
    .string()
    .min(1, { message: 'Description must have one character.' }),
});

export type ByteSchemaInputs = z.infer<typeof ByteSchema>;

// recipe post
export const RecipeSchema = z.object({
  // image: z
  //   .custom<FileList>()
  //   .refine((files) => {
  //     return Array.from(files ?? []).length !== 0;
  //   }, 'Image is required')
  //   .refine((files) => {
  //     return Array.from(files ?? []).every(
  //       (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
  //     );
  //   }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
  //   .refine((files) => {
  //     return Array.from(files ?? []).every((file) =>
  //       ACCEPTED_IMAGE_TYPES.includes(file.type),
  //     );
  //   }, 'File type is not supported'),
  descr: z.string().min(3, { message: 'Description must have one character.' }),
  ingredients: z
    .string()
    .min(3, { message: 'Recipe must have at least one ingredient.' }),
  steps: z.string().min(3, { message: 'Recipe must have at least one step.' }),
});

export type RecipeSchemaInputs = z.infer<typeof RecipeSchema>;
