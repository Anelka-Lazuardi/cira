"use client"

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { RiAddCircleFill } from 'react-icons/ri'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar"
import { useRouter } from "next/navigation"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal"
export const WorkspaceSwitcher = () => {

    const { open } = useCreateWorkspaceModal()

    const workspaceId = useWorkspaceId()

    const router = useRouter()
    const { data: workspaces } = useGetWorkspaces()

    const onSelect = (workspaceId: string) => {
        router.push(`/workspaces/${workspaceId}`)
    }

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutral-500">Workspaces</p>
                <RiAddCircleFill className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition " onClick={open} />
            </div>

            <Select onValueChange={onSelect} value={workspaceId}>
                <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
                    <SelectValue placeholder="No workspace selected" />
                </SelectTrigger>
                <SelectContent>
                    {workspaces?.documents.map((workspace) => (
                        <SelectItem
                            key={workspace.$id}
                            value={workspace.$id}
                        >
                            <div className="flex justify-start items-center gap-3 font-medium">
                                <WorkspaceAvatar
                                    image={workspace.imageUrl}
                                    name={workspace.name}
                                />
                                <span className="truncate">{workspace.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}