"use server";

import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { cretaeSessionClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { MemberRole } from "../members/type";
import { getMember } from "../members/utils";
import { Workspace } from "./type";

export const getWorkspaces = async () => {

    const { account, databases } = await cretaeSessionClient();
    const user = await account.get()



    const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id)],
    );

    if (members.total === 0) {
        return { documents: [], total: 0 }

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

    return workspaces


}


interface GetWorkspaceProps {
    workspaceId: string;

}
export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {

    const { account, databases } = await cretaeSessionClient();

    const user = await account.get()


    const member = await getMember(
        { userId: user.$id, workspaceId, databases });

    if (!member || member.role !== MemberRole.ADMIN) {
        throw new Error("Unauthorized")
    }

    const workspaces = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
    );

    return workspaces


}


interface GetWorkspaceInfoProps {
    workspaceId: string;

}
export const getWorkspaceInfo = async ({ workspaceId }: GetWorkspaceInfoProps) => {

    const { databases } = await cretaeSessionClient();



    const workspaces = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
    );

    if (!workspaces) {
        throw new Error("Workspace not found")
    }

    return {
        name: workspaces.name,
        imageUrl: workspaces?.imageUrl || null
    }
}

