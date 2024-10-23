import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'
import { cn } from '@/lib/utils'
interface AnalyticsCardProps {
    title: string
    value: number
    variant: "up" | "down"
    increaseValue: number
}

export const AnalyticsCard = ({ title, value, variant, increaseValue }: AnalyticsCardProps) => {
    const Icon = variant === "up" ? FaCaretUp : FaCaretDown
    const iconColor = variant === "up" ? "text-emerald-500" : "text-red-500"
    const incereaseValueColor = variant === "up" ? "text-green-500" : "text-red-500"

    return (
        <Card className='shadow-none border-none w-full'>
            <CardHeader>
                <div className="flex items-center gap-x-2.5">
                    <CardDescription className='flex items-center gap-x-2 font-medium overflow-hidden'>
                        <span className='truncate text-base'>{title}</span>
                        <div className="flex items-center gap-x-1">
                            <Icon className={cn(iconColor, "size-4")} />
                            <span className={cn(incereaseValueColor, "truncate text-base font-medium")}>
                                {increaseValue}
                            </span>
                        </div>
                    </CardDescription>
                </div>
                <CardTitle className='text-3xl font-semibold'>{value}</CardTitle>
            </CardHeader>
        </Card>
    )
}