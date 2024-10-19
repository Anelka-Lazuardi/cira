import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../type";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string()
        })),
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases');

            const { workspaceId } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            const projects = await databases.listDocuments(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]
            )

            return c.json({ data: projects })

        }
    )

    .post(
        "/",
        zValidator("form", createProjectSchema),
        sessionMiddleware,
        async (c) => {

            const databases = c.get('databases');
            const user = c.get('user');
            const storage = c.get('storage');

            const { name, image, workspaceId } = c.req.valid("form");

            const member = await getMember(
                { userId: user.$id, workspaceId, databases });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }


            let uploadImageUrl: undefined | string;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                )

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id
                )

                uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`
            }

            const project = await databases.createDocument(
                DATABASE_ID,
                PROJECTS_ID,
                ID.unique(),
                {
                    name,
                    imageUrl: uploadImageUrl,
                    workspaceId
                },
            );



            return c.json({ data: project })
        }
    )

    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("form", updateProjectSchema),
        async (c) => {
            const databases = c.get('databases');
            const storage = c.get('storage');
            const user = c.get('user');

            const { projectId } = c.req.param();
            const { name, image } = c.req.valid("form");

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            );


            const member = await getMember(
                { userId: user.$id, workspaceId: existingProject.workspaceId, databases });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }


            let uploadImageUrl: undefined | string;


            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                )

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id
                )

                uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`
            }
            else {
                uploadImageUrl = image
            }

            const project = await databases.updateDocument(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
                {
                    name,
                    imageUrl: uploadImageUrl
                },
            );
            return c.json({ data: project })

        }
    )

    .delete(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get('databases');
            const user = c.get('user');

            const { projectId } = c.req.param();

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            );
            const member = await getMember(
                { userId: user.$id, workspaceId: existingProject.workspaceId, databases });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // TODO: Delete workspace and members and task


            await databases.deleteDocument(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            );

            return c.json({
                data: {
                    $id: projectId
                }
            })

        }
    )




export default app