import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "../hooks/use-create-project-modal";
import { Project } from "../type";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { DottedSeperator } from "@/components/dotted-seperator";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectAvatar } from "./project-avatar";

interface ProjectListProps {
    data: Project[]
    total: number
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
    const { open: createProject } = useCreateProjectModal();
    const workspaceId = useWorkspaceId();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Projects ({total})
                    </p>
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={createProject}
                    >
                        <PlusIcon className="size-4 textt-neutral-400" />
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {
                        data.map((project) => (
                            <li
                                key={project.$id}
                            >
                                <Link href={`/workspaces/${workspaceId}/projects/${project.id}`}>
                                    <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                        <CardContent className="p-4 flex items-center gap-x-2.5">
                                            <ProjectAvatar
                                                name={project.name}
                                                image={project.imageUrl}
                                                className="size-12"
                                                fallbackClassName="text-lg"
                                            />
                                            <p className="text-lg font-medium truncate">
                                                {project.name}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </li>
                        ))
                    }

                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No projects found
                    </li>
                </ul>
            </div>
        </div>
    )
}