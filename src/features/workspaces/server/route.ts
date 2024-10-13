import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { MemberRole } from "@/features/members/type";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";


const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const databases = c.get('databases');
        const user = c.get('user');

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)],
        );

        if (members.total === 0) {
            return c.json({ data: { documents: [], total: 0 } });
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId);

        const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACE_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds)
            ],
        );

        return c.json({ data: workspaces })
    })

    .post(
        '/',
        zValidator("form", createWorkspaceSchema),
        sessionMiddleware,
        async (c) => {

            const databases = c.get('databases');
            const user = c.get('user');
            const storage = c.get('storage');

            const { name, image } = c.req.valid("form");

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

            const workspace = await databases.createDocument(
                DATABASE_ID,
                WORKSPACE_ID,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadImageUrl,
                    inviteCode: generateInviteCode(7)
                },
            );


            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId: workspace.$id,
                    userId: user.$id,
                    role: MemberRole.ADMIN
                }
            )

            return c.json({ data: workspace })
        }
    )

    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (c) => {
            const databases = c.get('databases');
            const storage = c.get('storage');
            const user = c.get('user');

            const { workspaceId } = c.req.param();
            const { name, image } = c.req.valid("form");

            const member = await getMember(
                { userId: user.$id, workspaceId, databases });

            if (!member || member.role !== MemberRole.ADMIN) {
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

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACE_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadImageUrl
                },
            );
            return c.json({ data: workspace })

        }
    )

export default app