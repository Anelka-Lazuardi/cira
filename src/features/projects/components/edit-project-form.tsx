"use client"
import { DottedSeperator } from "@/components/dotted-seperator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useConfirm } from "@/hooks/use-confirm"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, ImageIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useDeleteProject } from "../api/use-delete-project"
import { useUpdateProject } from "../api/use-update-project"
import { updateProjectSchema } from "../schema"
import { Project } from "../type"

interface EditProjectFormProps {
    onCancel?: () => void
    initialValues: Project
}

export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => {
    const router = useRouter()

    const { mutate, isPending } = useUpdateProject()
    const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject()

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Project",
        "Are you sure you want to delete this project? This action cannot be undone.",
        "destructive",
    );


    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        }
    })

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return
        deleteProject({ param: { projectId: initialValues.$id } },
            {
                onSuccess: () => {
                    router.push(`/workspaces/${initialValues.workspaceId}`)
                }
            }
        )
    }


    const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        }
        mutate({
            form: finalValues,
            param: { projectId: initialValues.$id }
        }, {

            onSuccess: () => {
                form.reset();
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    }




    return (
        <div className="flex flex-col gap-y-4">
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button size={"sm"} variant={"secondary"} onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}>
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
                                                Project Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter project Name" />
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
                                                            alt="Project Image"
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
                                                    <p className="text-sm">Project Icon</p>
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
                        <h3 className="font-bold">Danger Zone</h3>
                        <p>
                            Deleting a project is irreversible and will remove all associated data
                        </p>
                        <DottedSeperator className="py-7" />
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size={"sm"}
                            variant={"destructive"}
                            type="button"
                            disabled={isPending || isDeleting}
                            onClick={handleDelete}
                        >Delete Project</Button>
                    </div>
                </CardContent>
            </Card>
            <DeleteDialog />
        </div>
    )
}