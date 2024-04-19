import { z } from 'zod';

export const CommentSchema = z.object({
  comment: z.string().min(1, { message: 'Comment must have one character.' }),
});

export type CommentSchemaInputs = z.infer<typeof CommentSchema>;
