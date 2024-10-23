"use client"

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdSettingsClient = () => {

    const workspaceId = useWorkspaceId()
    const { data, isLoading } = useGetWorkspaceInfo({ workspaceId })

    if (isLoading) {
        return (
            <PageLoader />
        )
    }

    if (!data) {
        return (
            <PageError message="Workspace not found" />
        )
    }
    return (
        <div className="w-full lg:max-w-xl">
            <JoinWorkspaceForm initialValues={data} />
        </div>
    );
}