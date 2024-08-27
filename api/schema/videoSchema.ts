import { z } from "zod";
import { ACCEPTED_VIDEO_TYPES, MAX_FILE_SIZE } from "../constants";

export const createVideoSchema = z.object({
  title: z.string({
    required_error: "title is required",
    invalid_type_error: "title field must be string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description field must be string",
  }),
  duration: z.string({
    required_error: "duration is required",
    invalid_type_error: "duration field must be string",
  }),
  videoFile: z
    .any()
    .refine((files) => files?.length == 1, "videoFile is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `videoFile Max file size is 5MB.`
    )
    .refine(
      (files) => !ACCEPTED_VIDEO_TYPES.includes(files?.[0]?.type),
      ".mp4 and .webm files are accepted."
    ),
  thumbnail: z
    .any()
    .refine((files) => files?.length == 1, "thumbnail is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `thumbnail Max file size is 5MB.`
    )
    .refine(
      (files) => !ACCEPTED_VIDEO_TYPES.includes(files?.[0]?.type),
      ".mp4 and .webm files are accepted."
    ),
})

export const createLiveStreamSchema = z.object({
  title: z.string({
    required_error: "title is required",
    invalid_type_error: "title field must be string",
  }),
  description: z.string({
    required_error: "description is required",
    invalid_type_error: "description field must be string",
  }),
  duration: z.string({
    required_error: "duration is required",
    invalid_type_error: "duration field must be string",
  }),
  scheduledAt: z.string({
    required_error: "scheduledAt is required",
    invalid_type_error: "scheduledAt field must be date",
  }),
})


export type liveStreamSchemaType = z.infer<typeof createLiveStreamSchema>

export type createVideoSchemaType = z.infer<typeof createVideoSchema>