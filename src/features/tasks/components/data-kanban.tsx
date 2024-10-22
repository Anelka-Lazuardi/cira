import { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "../type";
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

interface DataKanbanProps {
    data: Task[];
    onChange: (tasks: { $id: string, position: number, status: TaskStatus }[]) => void
}


const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE
]

type TaskState = {
    [key in TaskStatus]: Task[]
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {

    const [task, setTask] = useState<TaskState>(() => {
        const initialTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: []
        }

        data.forEach(task => {
            initialTasks[task.status].push(task)
        })

        Object.keys(initialTasks).forEach(status => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })
        return initialTasks
    })

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return

        const { source, destination } = result
        const sourceStatus = source.droppableId as TaskStatus
        const destinationStatus = destination.droppableId as TaskStatus

        const updatePayload: { $id: string, position: number, status: TaskStatus }[] = [];

        setTask((prevTask) => {
            const newTasks = { ...prevTask };

            // move task from source to destination
            const sourceColumn = [...newTasks[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index, 1);

            // if there`s no moved task
            if (!movedTask) {
                console.error("moved task not found")
                return prevTask
            }

            // create a new task object with potentially updated status
            const updatedMoveTask = sourceStatus !== destinationStatus
                ? { ...movedTask, status: destinationStatus }
                : movedTask

            // update the source column
            newTasks[sourceStatus] = sourceColumn

            // add the task to destination column
            const destColumn = [...newTasks[destinationStatus]]
            destColumn.splice(destination.index, 0, updatedMoveTask)
            newTasks[destinationStatus] = destColumn



            // always update the moved tasks
            updatePayload.push({
                $id: movedTask.$id,
                status: destinationStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            })

            // update positions for affected tasks in destionation column
            newTasks[destinationStatus].forEach((task, index) => {
                const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                if (task.position !== newPosition) {
                    updatePayload.push({
                        $id: task.$id,
                        status: destinationStatus,
                        position: newPosition
                    })
                }
            })

            // if the taks moved between columns, update positions in the source column
            if (sourceStatus !== destinationStatus) {
                newTasks[sourceStatus].forEach((task, index) => {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                    if (task.position !== newPosition) {
                        updatePayload.push({
                            $id: task.$id,
                            status: sourceStatus,
                            position: newPosition
                        })
                    }
                })
            }


            return newTasks
        })

        if (updatePayload) onChange(updatePayload)


    }, [onChange])

    useEffect(() => {
        const newTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: []
        }

        data.forEach(task => {
            newTasks[task.status].push(task)
        })

        Object.keys(newTasks).forEach(status => {
            newTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })
        setTask(newTasks)
    }, [data]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {
                    boards.map(board => (
                        <div className="flex-1 mx-2 bg-muted rounded-md min-w-[200px]" key={board}>
                            <KanbanColumnHeader
                                board={board}
                                taskCount={task[board].length}
                            />

                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[200px] py-1.5">
                                        {
                                            task[board].map((task, index) => (
                                                <Draggable key={task.$id} draggableId={task.$id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="">
                                                            <KanbanCard task={task} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        }
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))
                }
            </div>
        </DragDropContext>

    )
}