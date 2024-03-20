import { z } from "zod";
export type UserState = {
  username: string;
  firstName: string;
  lastName: string;
};

//registration
export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be 3 characters long." })
    .max(10, { message: "Username must be 10 characters long." }),
  password: z
    .string()
    .refine(
      (val) =>
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test(
          val,
        ),
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
    ),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type RegisterSchemaInputs = z.infer<typeof RegisterSchema>;

//login
const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be 3 characters long." }),
  password: z
    .string()
    .refine(
      (val) =>
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test(
          val,
        ),
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
    ),
});

export type LoginSchema = z.infer<typeof loginSchema>;
