"use client"

import { DottedSeperator } from "@/components/dotted-seperator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useJoinWorkspace } from "../api/use-join-workspace"
import { useInviteCode } from "../hooks/use-invite-code"
import { useWorkspaceId } from "../hooks/use-workspace-id"
import { useRouter } from "next/navigation"

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string
        imageUrl: string | null
    }
}

export const JoinWorkspaceForm = ({
    initialValues
}: JoinWorkspaceFormProps) => {
    const router = useRouter();

    const workspaceId = useWorkspaceId();
    const inviteCode = useInviteCode();
    const { mutate, isPending } = useJoinWorkspace();

    const onSubmit = () => {
        mutate({
            param: { workspaceId },
            json: { code: inviteCode }
        }, {
            onSuccess: ({ data }) => {
                router.push(`/workspaces/${data.$id}`)
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7 flex flex-col gap-2">
                <CardTitle className="text-xl font-bold">
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                    <Button
                        className="w-full lg:w-fit"
                        variant={"secondary"}
                        type="button"
                        asChild
                        size={"lg"}
                        disabled={isPending}

                    >
                        <Link href={'/'}>
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        className="w-full lg:w-fit"
                        type="button"
                        size={"lg"}
                        disabled={isPending}
                        onClick={onSubmit}
                    >
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}