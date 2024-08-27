import { z } from "zod"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants"

export const loginSchema = z.object({
  email: z.string({
    required_error: "email is required",
    invalid_type_error: "email field must be string",
  }).email({ message: "Email is invalid" }),
  password: z.string({
    required_error: "password is required",
    invalid_type_error: "password field must be string",
  }).min(3, { message: "Password must be greater than 3 characters" }),
})

export const registerSchema = z.object({
  username: z.string({
    required_error: "User name is required",
    invalid_type_error: "user name field must be string",
  }),
  fullName: z.string({
    required_error: "Full name is required",
    invalid_type_error: "Full name field must be string",
  }),
  email: z.string({
    required_error: "email is required",
    invalid_type_error: "email field must be string",
  }).email({ message: "Email is invalid" }),
  password: z.string({
    required_error: "password is required",
    invalid_type_error: "password field must be string",
  }).min(3, { message: "Password must be greater than 3 characters" }),
  avatar: z
    .any()
    .refine((files) => files?.length == 1, "Avatar is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Avatar Max file size is 5MB.`
    )
    .refine(
      (files) => !ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  coverImage: z
    .any()
    .refine((files) => files?.length == 1, "Cover Image is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Cover Image Max file size is 5MB.`
    )
    .refine(
      (files) => !ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    )
})

export const changePasswordSchema = z.object({
  password: z.string({
    required_error: "password is required",
    invalid_type_error: "password field must be string",
  }).min(3, { message: "Password must be greater than 3 characters" }),
  oldPassword: z.string({
    required_error: "old password is required",
    invalid_type_error: "old password field must be string",
  }).min(3, { message: "old Password must be greater than 3 characters" }),
}).refine((data) => data.password !== data.oldPassword, {
  message: "Old password and new password can't be same"
});

export const updateUserSchema = z.object({
  fullName: z.string({
    required_error: "Full name is required",
    invalid_type_error: "Full name field must be string",
  }),
  email: z.string({
    required_error: "email is required",
    invalid_type_error: "email field must be string",
  }).email({ message: "Email is invalid" }),
});

export type loginType = z.infer<typeof loginSchema>
export type registerType = z.infer<typeof registerSchema>
export type changeCurrentPasswordType = z.infer<typeof changePasswordSchema>
export type updateUserType = z.infer<typeof updateUserSchema>
