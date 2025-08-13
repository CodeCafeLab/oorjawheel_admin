"use client"

import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useState, useTransition } from "react"

interface StatusSwitchProps {
    id: string;
    initialStatus: 'active' | 'inactive' | 'locked' | 'disabled' | 'never_used';
    onStatusChange: (id: string, newStatus: boolean) => Promise<{ success: boolean; message: string }>;
    activeValue?: 'active' | 'inactive' | 'locked' | 'disabled' | 'never_used';
    inactiveValue?: 'active' | 'inactive' | 'locked' | 'disabled' | 'never_used';
}

export function StatusSwitch({ id, initialStatus, onStatusChange, activeValue = 'active', inactiveValue = 'inactive' }: StatusSwitchProps) {
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()
    const [isChecked, setIsChecked] = useState(initialStatus === activeValue)

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
            }
        })
    }
    
    return (
        <Switch
            checked={isChecked}
            onCheckedChange={handleCheckedChange}
            disabled={isPending}
            aria-label="Toggle Status"
        />
    )
}
