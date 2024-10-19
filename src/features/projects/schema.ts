import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((val) => val === "" ? undefined : val)
    ]).optional(),
    workspaceId: z.string()
})

export const updateProjectSchema = z.object({
    name: z.string().trim().min(1, "Name is required").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().transform((val) => val === "" ? undefined : val)
    ]).optional(),

})