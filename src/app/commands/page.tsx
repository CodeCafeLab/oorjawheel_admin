

"use client"

import * as React from "react"
import { z } from "zod"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { commandSchema, Command } from "./schema"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
  
  // Mock data fetching
async function getCommands(): Promise<Command[]> {
    const data = [
      { id: "CMD001", type: "manual", status: "active", details: { type: "wheel", command: "S20"} },
      { id: "CMD002", type: "auto", status: "active", details: { title: "Evening Mode", json: '{ "light": "on", "speed": "15" }'} },
      { id: "CMD003", type: "manual", status: "inactive", details: { type: "light", command: "L100,50,10" } },
    ]
    return z.array(commandSchema).parse(data)
}


export default function CommandManagementPage() {
    const [commands, setCommands] = React.useState<Command[]>([])
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [selectedCommand, setSelectedCommand] = React.useState<Command | null>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        getCommands().then(setCommands)
    }, [])

    const handleEdit = (command: Command) => {
        setSelectedCommand(command);
        setIsSheetOpen(true);
    }
    
    const handleDelete = (id: string) => {
        setCommands(prev => prev.filter(c => c.id !== id));
        toast({ title: 'Command Deleted', description: `Command ${id} has been deleted.` });
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const commandType = formData.get('command-tab') as 'manual' | 'auto';
        
        let newCommand: Command;

        if (commandType === 'manual') {
            newCommand = {
                id: selectedCommand?.id || `CMD${Date.now()}`,
                type: 'manual',
                status: 'active',
                details: {
                    type: formData.get('manual-command-type') as 'wheel' | 'sound' | 'light',
                    command: formData.get('command-string') as string
                }
            };
        } else {
            newCommand = {
                id: selectedCommand?.id || `CMD${Date.now()}`,
                type: 'auto',
                status: 'active',
                details: {
                    title: formData.get('auto-command-title') as string,
                    json: formData.get('command-json') as string
                }
            };
        }

        if (selectedCommand) {
            setCommands(prev => prev.map(c => c.id === selectedCommand.id ? newCommand : c));
            toast({ title: 'Command Updated', description: `Command ${newCommand.id} updated.` });
        } else {
            setCommands(prev => [...prev, newCommand]);
            toast({ title: 'Command Created', description: `New command ${newCommand.id} created.` });
        }

        setIsSheetOpen(false);
        setSelectedCommand(null);
    }

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline">Command Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage manual and automated device commands.
                    </p>
                </div>
                <Button onClick={() => { setSelectedCommand(null); setIsSheetOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Command
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Command List</CardTitle>
                    <CardDescription>
                        Search, filter, and manage all available commands.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns(handleEdit, handleDelete)} data={commands} />
                </CardContent>
            </Card>

             <Sheet open={isSheetOpen} onOpenChange={(isOpen) => {
                setIsSheetOpen(isOpen);
                if (!isOpen) setSelectedCommand(null);
            }}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{selectedCommand ? 'Edit Command' : 'Create New Command'}</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-full">
                        <form onSubmit={handleSubmit}>
                        <Tabs defaultValue={selectedCommand?.type || "manual"} className="w-full px-6 py-4">
                            <input type="hidden" name="command-tab" value={selectedCommand?.type || "manual"} />
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual" disabled={!!(selectedCommand && selectedCommand.type !== 'manual')}>Manual</TabsTrigger>
                                <TabsTrigger value="auto" disabled={!!(selectedCommand && selectedCommand.type !== 'auto')}>Auto</TabsTrigger>
                            </TabsList>
                            <TabsContent value="manual">
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="manual-command-type">Type</Label>
                                        <Select name="manual-command-type" defaultValue={selectedCommand?.type === 'manual' ? selectedCommand.details.type : undefined}>
                                            <SelectTrigger id="manual-command-type">
                                                <SelectValue placeholder="Select command type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="wheel">Wheel</SelectItem>
                                                <SelectItem value="sound">Sound</SelectItem>
                                                <SelectItem value="light">Light</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="command-string">Command</Label>
                                        <Input name="command-string" id="command-string" placeholder="e.g., S20" defaultValue={selectedCommand?.type === 'manual' ? selectedCommand.details.command : ''}/>
                                    </div>
                                    <Button type="submit">{selectedCommand ? 'Save Changes' : 'Save Manual Command'}</Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="auto">
                                <div className="space-y-4 py-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="auto-command-title">Title</Label>
                                        <Input name="auto-command-title" id="auto-command-title" placeholder="e.g., Evening Mode" defaultValue={selectedCommand?.type === 'auto' ? selectedCommand.details.title : ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="command-json">JSON</Label>
                                        <Textarea name="command-json" id="command-json" placeholder='{ "light": "on", "speed": "15" }' rows={5} defaultValue={selectedCommand?.type === 'auto' ? selectedCommand.details.json : ''}/>
                                    </div>
                                    <Button type="submit">{selectedCommand ? 'Save Changes' : 'Save Auto Command'}</Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                        </form>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    )
}
