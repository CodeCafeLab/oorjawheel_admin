"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { commandSchema, Command } from "./schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";


export default function CommandManagementPage() {
  const [commands, setCommands] = React.useState<Command[]>([]);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [selectedCommand, setSelectedCommand] = React.useState<Command | null>(
    null
  );
  const [activeTab, setActiveTab] = React.useState("manual");
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const { toast } = useToast();

  const fetchCommands = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/command-logs`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch commands");
      setCommands(data.data ?? data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch commands",
      });
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    fetchCommands();
  }, []);

  React.useEffect(() => {
    if (selectedCommand) {
      setActiveTab(selectedCommand.type);
    } else {
      setActiveTab("manual");
    }
  }, [selectedCommand]);

  const addCommand = async (commandData: any) => {
    try {
      const res = await fetch(`${API_BASE}/command-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(commandData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to add command");

      return { success: true, message: "Command added successfully" };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to add command",
      };
    }
  };

  const updateCommand = async (id: string, commandData: any) => {
    try {
      const res = await fetch(`${API_BASE}/command-logs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(commandData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update command");

      return { success: true, message: "Command updated successfully" };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update command",
      };
    }
  };

  const deleteCommand = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/command-logs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete command");

      return { success: true, message: "Command deleted successfully" };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete command",
      };
    }
  };

  const handleEdit = (command: Command) => {
    setSelectedCommand(command);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const result = await deleteCommand(id);
    if (result.success) {
      toast({
        title: "Command Deleted",
        description: `Command has been deleted.`,
      });
      fetchCommands();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
    setLoading(false);
  };

  const handleDeleteSelected = async (ids: string[]) => {
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => deleteCommand(id)));
      toast({
        title: "Bulk Delete Complete",
        description: `${ids.length} commands deleted.`,
      });
      fetchCommands();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete some commands",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const device_id = formData.get("device-id") as string;
    const user_id = formData.get("user-id") as string;
    const resultValue = formData.get("result") as string;
    const status = formData.get("status") as string;

    let commandData;

    if (activeTab === "manual") {
      const commandString = formData.get("command-string") as string | null;

      if (!commandString || !device_id) {
        toast({
          variant: "destructive",
          title: "Missing fields",
          description: "Please fill all required fields for manual command.",
        });
        setLoading(false);
        return;
      }

      // Validate user_id is numeric if provided
      if (user_id && isNaN(parseInt(user_id))) {
        toast({
          variant: "destructive",
          title: "Invalid User ID",
          description: "User ID must be a number (e.g., 1, 2, 3).",
        });
        setLoading(false);
        return;
      }

      // Convert ISO datetime to MySQL format
      const mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      // Generate unique ID for new commands
      const commandId = `CMD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      commandData = {
        id: commandId,
        device_id: device_id,
        user_id: user_id ? parseInt(user_id) : null,
        command: commandString,
        sent_at: mysqlDateTime,
        result: resultValue || null,
        type: "manual",
        status: status || "active",
        details: null,
      };
    } else {
      const commandString = formData.get("command-string") as string | null;

      if (!commandString || !device_id) {
        toast({
          variant: "destructive",
          title: "Missing fields",
          description: "Please fill all required fields for automated command.",
        });
        setLoading(false);
        return;
      }

      // Validate user_id is numeric if provided
      if (user_id && isNaN(parseInt(user_id))) {
        toast({
          variant: "destructive",
          title: "Invalid User ID",
          description: "User ID must be a number (e.g., 1, 2, 3).",
        });
        setLoading(false);
        return;
      }

      // Try to parse as JSON if it looks like JSON, otherwise use as plain string
      let parsedCommand = commandString;
      try {
        if (commandString.trim().startsWith('{') || commandString.trim().startsWith('[')) {
          JSON.parse(commandString); // Validate JSON
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "The provided JSON for the automated command is not valid.",
        });
        setLoading(false);
        return;
      }

      // Convert ISO datetime to MySQL format
      const mysqlDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      // Generate unique ID for new commands
      const commandId = `CMD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      commandData = {
        id: commandId,
        device_id: device_id,
        user_id: user_id ? parseInt(user_id) : null,
        command: parsedCommand,
        sent_at: mysqlDateTime,
        result: resultValue || null,
        type: "auto",
        status: status || "active",
        details: null,
      };
    }

    const result = selectedCommand
      ? await updateCommand(selectedCommand.id, commandData)
      : await addCommand(commandData);

    if (result.success) {
      toast({
        title: selectedCommand ? "Command Updated" : "Command Created",
        description: result.message,
      });
      fetchCommands();
      setIsSheetOpen(false);
      setSelectedCommand(null);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-headline truncate">Command Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage manual and automated device commands.
          </p>
        </div>
        <Sheet
          open={isSheetOpen}
          onOpenChange={(isOpen) => {
            setIsSheetOpen(isOpen);
            if (!isOpen) setSelectedCommand(null);
          }}
        >
          <SheetTrigger asChild>
            <Button
              onClick={() => {
                setSelectedCommand(null);
                setIsSheetOpen(true);
              }}
              className="w-full sm:w-auto flex-shrink-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Command</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl">
            <SheetHeader>
              <SheetTitle className="text-lg sm:text-xl">
                {selectedCommand ? "Edit Command" : "Create New Command"}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-full">
              <form onSubmit={handleSubmit}>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full px-4 sm:px-6 py-4"
                >
                  <TabsList className="grid w-full grid-cols-2 h-9">
                    <TabsTrigger
                      value="manual"
                      disabled={
                        !!(selectedCommand && selectedCommand.type !== "manual")
                      }
                      className="text-xs sm:text-sm"
                    >
                      Manual
                    </TabsTrigger>
                    <TabsTrigger
                      value="auto"
                      disabled={
                        !!(selectedCommand && selectedCommand.type !== "auto")
                      }
                      className="text-xs sm:text-sm"
                    >
                      Auto
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="manual">
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="device-id">Device ID *</Label>
                        <Input
                          name="device-id"
                          id="device-id"
                          type="text"
                          placeholder="e.g., DEV001"
                          defaultValue={
                            selectedCommand ? selectedCommand.device_id : ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-id">User ID (Optional)</Label>
                        <Input
                          name="user-id"
                          id="user-id"
                          type="number"
                          placeholder="e.g., 1"
                          defaultValue={
                            selectedCommand?.user_id?.toString() || ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="command-string">Command *</Label>
                        <Input
                          name="command-string"
                          id="command-string"
                          placeholder="e.g., L255,0,255 or S20"
                          defaultValue={
                            selectedCommand?.command || ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="result">Result (Optional)</Label>
                        <Textarea
                          name="result"
                          id="result"
                          placeholder="Command execution result"
                          defaultValue={
                            selectedCommand?.result || ""
                          }
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue={selectedCommand?.status || "active"}>
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <span className="text-xs sm:text-sm">
                          {selectedCommand
                            ? "Save Changes"
                            : "Save Manual Command"}
                        </span>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="auto">
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="device-id">Device ID *</Label>
                        <Input
                          name="device-id"
                          id="device-id"
                          type="text"
                          placeholder="e.g., DEV001"
                          defaultValue={
                            selectedCommand ? selectedCommand.device_id : ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-id">User ID (Optional)</Label>
                        <Input
                          name="user-id"
                          id="user-id"
                          type="number"
                          placeholder="e.g., 1"
                          defaultValue={
                            selectedCommand?.user_id?.toString() || ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="command-string">Command/JSON *</Label>
                        <Textarea
                          name="command-string"
                          id="command-string"
                          placeholder='{ "light": "on", "speed": "15" } or simple command like L255,0,255'
                          rows={5}
                          defaultValue={
                            selectedCommand?.command || ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="result">Result (Optional)</Label>
                        <Textarea
                          name="result"
                          id="result"
                          placeholder="Command execution result"
                          defaultValue={
                            selectedCommand?.result || ""
                          }
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue={selectedCommand?.status || "active"}>
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <span className="text-xs sm:text-sm">
                          {selectedCommand ? "Save Changes" : "Save Auto Command"}
                        </span>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {fetching ? (
        <Card className="flex flex-col items-center justify-center py-12 sm:py-20">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
          <p className="mt-4 text-sm sm:text-base">Loading commands...</p>
        </Card>
      ) : commands.length > 0 ? (
        <Card className="overflow-hidden">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Command List</CardTitle>
            <CardDescription className="text-sm">
              Search, filter, and manage all available commands.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm">Loading...</span>
              </div>
            ) : (
              <DataTable
                columns={columns(handleEdit, handleDelete)}
                data={commands}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 sm:py-20">
          <CardHeader className="text-center px-4">
            <CardTitle className="text-lg sm:text-xl font-headline">
              No Commands Found
            </CardTitle>
            <CardDescription className="text-sm">
              Get started by creating the first command definition.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <Sheet
              open={isSheetOpen}
              onOpenChange={(isOpen) => {
                setIsSheetOpen(isOpen);
                if (!isOpen) setSelectedCommand(null);
              }}
            >
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  onClick={() => {
                    setSelectedCommand(null);
                    setIsSheetOpen(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Add Your First Command</span>
                </Button>
              </SheetTrigger>
            </Sheet>
          </CardContent>
        </Card>
      )}
    </div>
  );
}