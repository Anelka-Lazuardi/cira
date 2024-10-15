import { getCurrent } from "@/features/auth/queries";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

interface WorkspaceJoinPageProps {
    params: {
        workspaceId: string
    }
}

const WorkspaceJoinPage = async ({ params }: WorkspaceJoinPageProps) => {
    const user = await getCurrent();

    if (!user) redirect("/sign-in")


    const workspace = await getWorkspaceInfo(
        { workspaceId: params.workspaceId }
    )

    if (!workspace) redirect(`/`)

    return (
        <div className="w-full lg:max-w-xl">
            <JoinWorkspaceForm initialValues={workspace} />
        </div>
    );
}

export default WorkspaceJoinPage;