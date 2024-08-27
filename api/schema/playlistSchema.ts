import { z } from "zod";

export const playListCreateSchema = z.object({
    name: z.string({
        required_error: "name is required",
        invalid_type_error: "name field must be string",
    }),
    description: z.string({
        required_error: "description is required",
        invalid_type_error: "description field must be string",
    })
})

// Export type
export type playListCreateSchemaType = z.infer<typeof playListCreateSchema>