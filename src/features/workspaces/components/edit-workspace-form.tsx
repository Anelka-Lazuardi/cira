"use client"
import { DottedSeperator } from "@/components/dotted-seperator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useUpdateeWorkspace } from "../api/use-update-workspace"
import { updateWorkspaceSchema } from "../schemas"
import { Workspace } from "../type"
import { useConfirm } from "@/hooks/use-confirm"
import { useDeleteWorkspace } from "../api/use-delete-workspace"
import { toast } from "sonner"
import { useResetInviteCode } from "../api/use-reset-invite-code"

interface EditWorkspaceFormProps {
    onCancel?: () => void
    initialValues: Workspace
}

export const EditWorkspaceForm = ({ onCancel, initialValues }: EditWorkspaceFormProps) => {
    const router = useRouter()

    const { mutate, isPending } = useUpdateeWorkspace()
    const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace()
    const { mutate: resetInviteCode, isPending: isResetting } = useResetInviteCode()

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Workspace",
        "Are you sure you want to delete this workspace? This action cannot be undone.",
        "destructive",
    );

    const [ResetDialog, confirmReset] = useConfirm(
        "Reset Workspace Invite Code",
        "This will invalidate the current invite code and generate a new one. Are you sure you want to do this?",
        "destructive",
    );
    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        }
    })

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return
        deleteWorkspace({ param: { workspaceId: initialValues.$id } },
            {
                onSuccess: () => {
                    router.push("/")
                }
            }
        )
    }

    const handleResetInviteCode = async () => {
        const ok = await confirmReset();

        if (!ok) return
        resetInviteCode({ param: { workspaceId: initialValues.$id } },
            {
                onSuccess: () => {
                    router.refresh()
                }
            }
        )
    }

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        mutate({
            form: values,
            param: { workspaceId: initialValues.$id }
        }, {

            onSuccess: ({ data }) => {
                form.reset();
                router.push(`/workspaces/${data.$id}`)
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    }

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => {
                toast.success("Invite link copied to clipboard")
            })
    }

    return (
        <div className="flex flex-col gap-y-4">
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button size={"sm"} variant={"secondary"} onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeperator />
                </div>
                <CardContent className="p-7">
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Workspace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter workspace Name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2 ">
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size-[72px] relative rounded-md overflow-hidden">
                                                        <Image
                                                            src={
                                                                field.value instanceof File
                                                                    ? URL.createObjectURL(field.value)
                                                                    : field.value
                                                            }
                                                            alt="Workspace Image"
                                                            className="object-cover"
                                                            fill
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[36px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p className="text-sm">Workspace Icon</p>
                                                    <p className="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG, max 1MB</p>
                                                    <input
                                                        className="hidden"
                                                        type="file"
                                                        accept=".jpg, .png, .jpeg, .svg"
                                                        ref={inputRef}
                                                        disabled={isPending}
                                                        onChange={handleImageChange}
                                                    />
                                                    {
                                                        field.value ? (
                                                            <Button
                                                                type="button"
                                                                size={"xs"}
                                                                variant="destructive"
                                                                className="w-fit mt-2"
                                                                onClick={() => {
                                                                    field.onChange(null);
                                                                    if (inputRef.current) {
                                                                        inputRef.current.value = "";
                                                                    }
                                                                }}
                                                                disabled={isPending}
                                                            >
                                                                Remove
                                                            </Button>
                                                        )
                                                            : (<Button
                                                                type="button"
                                                                variant="teritary"
                                                                className="w-fit mt-2"
                                                                onClick={() => inputRef.current?.click()}
                                                                disabled={isPending}
                                                            >
                                                                Upload Image
                                                            </Button>)
                                                    }

                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <DottedSeperator className="py-7" />
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onCancel}
                                    size="lg"
                                    disabled={isPending}
                                    className={cn(!onCancel && "invisible")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    disabled={isPending}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col ">
                        <h3 className="font-bold">Invite Members</h3>
                        <p>
                            Use the invite link to add members to your workspace.
                        </p>
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input disabled value={fullInviteLink} />
                                <Button
                                    onClick={handleCopyInviteLink}
                                    variant={"secondary"}
                                    className="size-12"
                                >
                                    <CopyIcon className="size-5" />
                                </Button>
                            </div>

                        </div>
                        <DottedSeperator className="py-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size={"sm"}
                            variant={"destructive"}
                            type="button"
                            disabled={isPending || isResetting}
                            onClick={handleResetInviteCode}
                        >
                            Reset invite link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col ">
                        <h3 className="font-bold">Danger Zone</h3>
                        <p>
                            Deleting a workspace is irreversible and will remove all associated data
                        </p>
                        <DottedSeperator className="py-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size={"sm"}
                            variant={"destructive"}
                            type="button"
                            disabled={isDeleting || isPending}
                            onClick={handleDelete}
                        >Delete Workspace</Button>
                    </div>
                </CardContent>
            </Card>
            <DeleteDialog />
            <ResetDialog />
        </div>
    )
}