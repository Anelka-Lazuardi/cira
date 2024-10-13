import { z } from 'zod'

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((val) => val === "" ? undefined : val)
    ]).optional()
})



export const updateWorkspaceSchema = z.object({
    name: z.string().trim().min(1, "Must be at least 1 character").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().transform((val) => val === "" ? undefined : val)
    ]).optional()
})
