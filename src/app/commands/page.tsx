
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
import { commandSchema } from "./schema"
  
  // Mock data fetching
async function getCommands() {
    const data = [
      { id: "CMD001", type: "manual", status: "active" },
      { id: "CMD002", type: "auto", status: "active" },
      { id: "CMD003", type: "manual", status: "inactive" },
    ]
    return z.array(commandSchema).parse(data)
}


export default function CommandManagementPage() {
    const [commands, setCommands] = React.useState<z.infer<typeof commandSchema>[]>([])

    React.useEffect(() => {
        getCommands().then(setCommands)
    }, [])

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline">Command Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage manual and automated device commands.
                    </p>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Command
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create New Command</SheetTitle>
                        </SheetHeader>
                        <Tabs defaultValue="manual" className="w-full pt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual">Manual</TabsTrigger>
                                <TabsTrigger value="auto">Auto</TabsTrigger>
                            </TabsList>
                            <TabsContent value="manual">
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="command-type">Type</Label>
                                        <Select>
                                            <SelectTrigger id="command-type">
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
                                        <Input id="command-string" placeholder="e.g., S20" />
                                    </div>
                                    <Button>Save Manual Command</Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="auto">
                                <div className="space-y-4 py-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="auto-command-title">Title</Label>
                                        <Input id="auto-command-title" placeholder="e.g., Evening Mode" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="command-json">JSON</Label>
                                        <Textarea id="command-json" placeholder='{ "light": "on", "speed": "15" }' rows={5} />
                                    </div>
                                    <Button>Save Auto Command</Button>
                                </div>
                            </TabsContent>
                        </Tabs>
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
                    <DataTable columns={columns} data={commands} />
                </CardContent>
            </Card>
        </div>
    )
}
