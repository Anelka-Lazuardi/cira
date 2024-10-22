import { DottedSeperator } from "@/components/dotted-seperator"
import { Button } from "@/components/ui/button"
import { PencilIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Task } from "../type"
import { useUpdateTask } from "../api/use-update-task"
import { Textarea } from "@/components/ui/textarea"

interface TaskDecriptionProps {
    task: Task
}

export const TaskDecription = ({ task }: TaskDecriptionProps) => {
    const [isEditing, setEditing] = useState(false)
    const [value, setValue] = useState(task.description)
    const { mutate, isPending } = useUpdateTask()

    const handleSave = () => {
        if (!value) return
        mutate({
            param: { taskId: task.$id },
            json: { description: value }
        }, {
            onSuccess: () => {
                setEditing(false)
            }
        })
    }

    return (
        <div className="p-4 border rounde-lg">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Description</p>
                <Button
                    size={"sm"}
                    variant={"secondary"}
                    onClick={() => setEditing(!isEditing)}
                    disabled={isPending}
                >
                    {
                        isEditing ?
                            (
                                <XIcon className="size-4 mr-2" />
                            ) :
                            (
                                <PencilIcon className="size-4 mr-2" />
                            )
                    }
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>
            <DottedSeperator className="my-4" />
            {
                isEditing ? (
                    <div className="flex flex-col gap-y-4">
                        <Textarea
                            placeholder="Add a description"
                            value={value}
                            rows={4}
                            onChange={e => setValue(e.target.value)}
                            disabled={isPending}
                        />
                        <Button
                            size={"sm"}
                            className="w-fit ml-auto"
                            onClick={handleSave}
                            disabled={isPending}
                        >
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                ) :
                    (
                        <div className="">
                            {task.description || (
                                <span className="text-muted-foreground">
                                    No description
                                </span>
                            )}
                        </div>
                    )
            }


        </div>
    )
}