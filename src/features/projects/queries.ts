"use server";

import { DATABASE_ID, PROJECTS_ID } from "@/config";
import { cretaeSessionClient } from "@/lib/appwrite";
import { getMember } from "../members/utils";
import { Project } from "./type";

interface GetProjectProps {
    projectId: string;
}


export const getProject = async ({ projectId }: GetProjectProps) => {


    const { account, databases } = await cretaeSessionClient();
    const user = await account.get()

    const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
    );

    const member = await getMember(
        {
            userId: user.$id,
            workspaceId: project.workspaceId,
            databases

        });

    if (!member) {
        throw new Error("Unauthorized")
    }

    return project
}



