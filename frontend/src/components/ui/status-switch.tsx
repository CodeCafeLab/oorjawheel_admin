"use client"

import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState, useTransition } from "react"

interface StatusSwitchProps {
    id: string;
    initialStatus: 'active' | 'inactive' | 'locked' | 'disabled' | 'never_used';
    onStatusChange: (id: string, newStatus: boolean) => Promise<{ success: boolean; message: string }>;
    activeValue?: 'active' | 'inactive' | 'locked' | 'disabled' | 'never_used';
    inactiveValue?: 'active' | 'inactive' | 'locked' | 'disabled' | 'never_used';
    labelMap?: Record<string, string>;
    onLocalUpdate?: (checked: boolean) => void;
}

export function StatusSwitch({ id, initialStatus, onStatusChange, activeValue = 'active', inactiveValue = 'inactive', labelMap, onLocalUpdate }: StatusSwitchProps) {
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()
    const [isChecked, setIsChecked] = useState(initialStatus === activeValue)

    // Keep UI in sync if upstream status changes (e.g., after page refresh or refetch)
    useEffect(() => {
        setIsChecked(initialStatus === activeValue)
    }, [initialStatus, activeValue])

    const defaultLabels: Record<string, string> = {
        active: 'Active',
        inactive: 'Inactive',
        enabled: 'Enabled',
        disabled: 'Disabled',
        locked: 'Inactive',
        never_used: 'Inactive',
    }

    const formatLabel = (value: string) => {
        const fallback = value.replace(/_/g, ' ')
        return (labelMap && labelMap[value]) || defaultLabels[value] || (fallback.charAt(0).toUpperCase() + fallback.slice(1))
    }

    const handleCheckedChange = (checked: boolean) => {
        setIsChecked(checked);
        startTransition(async () => {
            const result = await onStatusChange(id, checked);
            if (!result.success) {
                // Revert the switch on failure
                setIsChecked(!checked);
                toast({
                    variant: "destructive",
                    title: "Error updating status",
                    description: result.message,
                })
            } else {
                 toast({
                    title: "Status Updated",
                    description: result.message,
                })
                onLocalUpdate && onLocalUpdate(checked)
            }
        })
    }
    
    return (
        <div className="flex items-center gap-2">
            <Badge variant={isChecked ? 'default' : 'secondary'} className="capitalize">
                {isChecked ? formatLabel(String(activeValue)) : formatLabel(String(inactiveValue))}
            </Badge>
            <Switch
                checked={isChecked}
                onCheckedChange={handleCheckedChange}
                disabled={isPending}
                aria-label="Toggle Status"
            />
        </div>
    )
}
