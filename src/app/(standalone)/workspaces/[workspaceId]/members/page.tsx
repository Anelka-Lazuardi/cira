import { getCurrent } from "@/features/auth/queries";
import { MemberListForm } from "@/features/workspaces/components/members-list";
import { redirect } from "next/navigation";

const WorkspcaeIdMembersPage = async () => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in")


    return (
        <MemberListForm />
    );
}

export default WorkspcaeIdMembersPage;