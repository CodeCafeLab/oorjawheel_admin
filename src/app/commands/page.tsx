
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
import { addCommand, updateCommand, deleteCommand } from "@/actions/commands"
  
async function getCommands(): Promise<Command[]> {
    // This is a placeholder. The DB schema doesn't show a `commands` table.
    // In a real app, this would fetch from a table you create to store these command definitions.
    const data = [
        { id: '1', type: 'manual', status: 'active', details: { type: 'light', command: 'L255,0,0' } },
        { id: '2', type: 'manual', status: 'active', details: { type: 'sound', command: 'S15' } },
        { id: '3', type: 'auto', status: 'inactive', details: { title: 'Sunset Mode', json: '{ "light": "L255,100,0", "sound": "S5" }' } },
        { id: '4', type: 'manual', status: 'active', details: { type: 'wheel', command: 'W50' } },
    ];
    return z.array(commandSchema).parse(data);
}


export default function CommandManagementPage() {
    const [commands, setCommands] = React.useState<Command[]>([])
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [selectedCommand, setSelectedCommand] = React.useState<Command | null>(null);
    const [activeTab, setActiveTab] = React.useState("manual");
    const { toast } = useToast();

    const refreshCommands = () => {
        getCommands().then(setCommands);
    };

    React.useEffect(() => {
        refreshCommands();
    }, []);

    React.useEffect(() => {
        if (selectedCommand) {
            setActiveTab(selectedCommand.type);
        } else {
            setActiveTab("manual");
        }
    }, [selectedCommand]);

    const handleEdit = (command: Command) => {
        setSelectedCommand(command);
        setIsSheetOpen(true);
    }
    
    const handleDelete = async (id: string) => {
        const result = await deleteCommand(id);
        if (result.success) {
            toast({ title: 'Command Deleted', description: `Command ${id} has been deleted.` });
            refreshCommands();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    }

    const handleDeleteSelected = (ids: string[]) => {
        Promise.all(ids.map(id => deleteCommand(id))).then(() => {
            toast({ title: 'Bulk Delete Complete', description: `${ids.length} commands deleted.` });
            refreshCommands();
        });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        let commandData;

        if (activeTab === 'manual') {
            const manualType = formData.get('manual-command-type') as 'wheel' | 'sound' | 'light' | null;
            const commandString = formData.get('command-string') as string | null;

            if (!manualType || !commandString) {
                toast({ variant: "destructive", title: "Missing fields", description: "Please fill all required fields for manual command." });
                return;
            }

            commandData = {
                type: 'manual' as const,
                status: 'active' as const,
                details: { type: manualType, command: commandString }
            };
        } else {
            const autoTitle = formData.get('auto-command-title') as string | null;
            const commandJson = formData.get('command-json') as string | null;

            if (!autoTitle || !commandJson) {
                toast({ variant: "destructive", title: "Missing fields", description: "Please fill all required fields for auto command." });
                return;
            }
            try {
                JSON.parse(commandJson);
            } catch (error) {
                toast({ variant: "destructive", title: "Invalid JSON", description: "The provided JSON for the auto command is not valid." });
                return;
            }

            commandData = {
                type: 'auto' as const,
                status: 'active' as const,
                details: { title: autoTitle, json: commandJson }
            };
        }
        
        const result = selectedCommand
            ? await updateCommand(selectedCommand.id, commandData)
            : await addCommand(commandData);

        if (result.success) {
            toast({ title: selectedCommand ? 'Command Updated' : 'Command Created', description: result.message });
            refreshCommands();
            setIsSheetOpen(false);
            setSelectedCommand(null);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
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
                <Sheet open={isSheetOpen} onOpenChange={(isOpen) => {
                    setIsSheetOpen(isOpen);
                    if (!isOpen) setSelectedCommand(null);
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={() => { setSelectedCommand(null); setIsSheetOpen(true); }}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Command
                        </Button>
                    </SheetTrigger>
                    <SheetContent className='md:max-w-xl'>
                        <SheetHeader>
                            <SheetTitle>{selectedCommand ? 'Edit Command' : 'Create New Command'}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-full">
                            <form onSubmit={handleSubmit}>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-6 py-4">
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
                                            <Textarea name="command-json" id="command-json" placeholder='{ "light": "on", "speed": "15" }' rows={5} defaultValue={selectedCommand?.type === 'auto' ? JSON.stringify(selectedCommand.details.json, null, 2) : ''}/>
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
            <Card>
                <CardHeader>
                    <CardTitle>Command List</CardTitle>
                    <CardDescription>
                        Search, filter, and manage all available commands.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns(handleEdit, handleDelete)} data={commands} onDelete={handleDelete} onDeleteSelected={handleDeleteSelected} />
                </CardContent>
            </Card>
        </div>
    )
}
