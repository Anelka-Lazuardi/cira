"use client"
import { DottedSeperator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, PlusIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/user-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { DataKanban } from "./data-kanban";
import { useCallback } from "react";
import { TaskStatus } from "../type";
import { useBulkUpdateTask } from "../api/use-bulk-update-task";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";


interface TaskViewSwitcherProps {
    hideProjectFilter?: boolean
}


export const TaskViewSwitcher = ({ hideProjectFilter }: TaskViewSwitcherProps) => {
    const [view, sertView] = useQueryState("task-view", {
        defaultValue: "table",
    })

    const [{
        status,
        assigneeId,
        projectId,
        search,
        dueDate
    }] = useTaskFilters()

    const { open } = useCreateTaskModal()
    const { mutate: bulkUpdate } = useBulkUpdateTask()
    const workspaceId = useWorkspaceId()
    const paramProjectId = useProjectId()

    const { data: task, isLoading: isLoadingTasks } = useGetTasks({
        workspaceId, status, assigneeId, projectId: paramProjectId || projectId, search, dueDate
    });

    const onKanbanChange = useCallback((
        tasks: { $id: string, position: number, status: TaskStatus }[]
    ) => {
        bulkUpdate({
            json: { tasks }
        })

    }, [bulkUpdate])


    return (
        <Tabs className="flex-1 w-full border rounded-lg" value={view} onValueChange={sertView}>
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="table"
                        >
                            Table
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="kanban"
                        >
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="calendar"
                        >
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                    <Button
                        onClick={open}
                        size={"sm"}
                        className="w-full lg:w-auto"
                    >
                        <PlusIcon className="size-4 mr-2" />
                        New
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <DataFilters hideProjectFilter={hideProjectFilter} />
                <DottedSeperator className="my-4" />
                {
                    isLoadingTasks ? (
                        <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center ">
                            <Loader className="size-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (<>
                        <TabsContent value="table" className="mt-0">
                            <DataTable data={task?.documents ?? []} columns={columns} />
                        </TabsContent>
                        <TabsContent value="kanban" className="mt-0">
                            <DataKanban data={task?.documents ?? []} onChange={onKanbanChange} />
                        </TabsContent>
                        <TabsContent value="calendar" className="mt-0 h-full pb-4">
                            <DataCalendar data={task?.documents ?? []} />
                        </TabsContent>
                    </>)
                }


            </div>
        </Tabs>
    );
}