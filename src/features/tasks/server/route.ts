import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schema";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../type";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/type";


const app = new Hono()
    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createTaskSchema),
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { name, description, workspaceId, assigneeId, dueDate, projectId, status } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1)
                ]
            )

            const newPosition =
                highestPositionTask.documents.length > 0
                    ? highestPositionTask.documents[0].position + 1000
                    : 1000;


            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    description,
                    workspaceId,
                    assigneeId,
                    dueDate,
                    projectId,
                    status,
                    position: newPosition
                }
            )

            return c.json({ data: task })

        }
    )

    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string(),
            projectId: z.string().nullish(),
            assigneeId: z.string().nullish(),
            status: z.nativeEnum(TaskStatus).nullish(),
            search: z.string().nullish(),
            dueDate: z.string().nullish(),
        })),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId, projectId, assigneeId, status, search, dueDate } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const query = [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt"),
            ]

            if (projectId) {
                query.push(Query.equal("projectId", projectId))
            }

            if (assigneeId) {
                query.push(Query.equal("assigneeId", assigneeId))
            }
            if (status) {
                query.push(Query.equal("status", status))
            }
            if (search) {
                query.push(Query.search("name", search))
            }
            if (dueDate) {
                query.push(Query.equal("dueDate", dueDate))
            }

            const tasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                query
            )

            const projectIds = tasks.documents.map((task) => task.projectId);
            const assigneeIds = tasks.documents.map((task) => task.assigneeId);

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
            )

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
            )

            const asignees = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name,
                        email: user.email
                    }
                }))

            const populatedTasks = tasks.documents.map((task) => {
                const project = projects.documents.find((project) => project.$id === task.projectId);
                const assignee = asignees.find((assignee) => assignee.$id === task.assigneeId);

                return {
                    ...task,
                    project,
                    assignee
                }
            })

            return c.json({
                data: {
                    ...tasks,
                    documents: populatedTasks
                }
            })
        }
    )

    .delete(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            await databases.deleteDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )


            return c.json({ data: { $id: task.$id } })
        }
    )

    .patch(
        "/:taskId",
        sessionMiddleware,
        zValidator("json", createTaskSchema.partial()),
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");

            const { name, description, assigneeId, dueDate, projectId, status } = c.req.valid("json");

            const { taskId } = c.req.param();

            const existingTask = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            const member = await getMember({
                databases,
                workspaceId: existingTask.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }





            const task = await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                {
                    name,
                    description,
                    assigneeId,
                    dueDate,
                    projectId,
                    status,
                }
            )

            return c.json({ data: task })

        }
    )

    .get(
        "/:taskId",
        sessionMiddleware,
        async (c) => {

            const user = c.get("user");
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            )

            const currentMember = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id
            })

            if (!currentMember) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                task.projectId
            );
            const member = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                task.assigneeId
            )

            const userData = await users.get(member.userId);

            const assignee = {
                ...member,
                name: userData.name,
                email: userData.email
            }

            return c.json({
                data: {
                    ...task,
                    project,
                    assignee
                }
            })

        }
    )

    .post(
        "/bulk-update",
        sessionMiddleware,
        zValidator("json", z.object({
            tasks: z.array(z.object({
                $id: z.string(),
                status: z.nativeEnum(TaskStatus),
                position: z.number().int().positive().min(1000).max(1_000_000)
            }))
        })),
        async (c) => {

            const user = c.get("user");
            const databases = c.get("databases");
            const { tasks } = c.req.valid("json");

            const taskToUpdate = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.contains("$id", tasks.map((task) => task.$id)),
                ]
            )

            const workspaceIds = new Set(taskToUpdate.documents.map((task) => task.workspaceId));
            if (workspaceIds.size !== 1) {
                return c.json({ error: "All tasks must be in the same workspace" }, 400)
            }

            const workspaceId = workspaceIds.values().next().value;

            if (!workspaceId) {
                return c.json({ error: "Workspace not found" }, 400)
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const updateTasks = await Promise.all(
                tasks.map(async (task) => {
                    const { $id, status, position } = task;
                    return await databases.updateDocument<Task>(
                        DATABASE_ID,
                        TASKS_ID,
                        $id,
                        {
                            status,
                            position
                        }
                    )
                })
            )

            return c.json({ data: updateTasks })

        }
    )


export default app