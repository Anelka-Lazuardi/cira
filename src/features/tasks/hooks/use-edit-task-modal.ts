import { parseAsString, useQueryState } from 'nuqs'

export const useEditTaskModal = () => {
    const [taskId, setTaksId] = useQueryState(
        "edit-task",
        parseAsString,
    )

    const open = (id: string) => setTaksId(id)
    const close = () => setTaksId(null)

    return {
        taskId,
        open,
        close,
        setTaksId
    }
}