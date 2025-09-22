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
      const { fetchData } = await import('@/lib/api-utils');
      const data = await fetchData("/command-logs") as { data?: any[] } | any[];
      setCommands(Array.isArray(data) ? data : (data.data ?? []));
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
      const { postData } = await import('@/lib/api-utils');
      await postData("/command-logs", commandData);
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
      const { updateData } = await import('@/lib/api-utils');
      await updateData(`/command-logs/${id}`, commandData);
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
      const { deleteData } = await import('@/lib/api-utils');
      await deleteData(`/command-logs/${id}`);
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

    let commandData;

    if (activeTab === "manual") {
      const manualType = formData.get("manual-command-type") as
        | "wheel"
        | "sound"
        | "light"
        | null;
      const commandString = formData.get("command-string") as string | null;

      if (!manualType || !commandString || !device_id || !user_id) {
        toast({
          variant: "destructive",
          title: "Missing fields",
          description: "Please fill all required fields for manual command.",
        });
        setLoading(false);
        return;
      }

      commandData = {
        device_id: parseInt(device_id),
        user_id: parseInt(user_id),
        command: JSON.stringify({ type: manualType, command: commandString }),
        sent_at: new Date().toISOString(),
        result: "pending",
      };
    } else {
      const autoTitle = formData.get("auto-command-title") as string | null;
      const commandJson = formData.get("command-json") as string | null;

      if (!autoTitle || !commandJson || !device_id || !user_id) {
        toast({
          variant: "destructive",
          title: "Missing fields",
          description: "Please fill all required fields for auto command.",
        });
        setLoading(false);
        return;
      }
      try {
        JSON.parse(commandJson);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "The provided JSON for the auto command is not valid.",
        });
        setLoading(false);
        return;
      }

      commandData = {
        device_id: parseInt(device_id),
        user_id: parseInt(user_id),
        command: JSON.stringify({ title: autoTitle, json: commandJson }),
        sent_at: new Date().toISOString(),
        result: "pending",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">Command Management</h1>
          <p className="text-muted-foreground">
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
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Command
            </Button>
          </SheetTrigger>
          <SheetContent className="md:max-w-xl">
            <SheetHeader>
              <SheetTitle>
                {selectedCommand ? "Edit Command" : "Create New Command"}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-full">
              <form onSubmit={handleSubmit}>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full px-6 py-4"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="manual"
                      disabled={
                        !!(selectedCommand && selectedCommand.type !== "manual")
                      }
                    >
                      Manual
                    </TabsTrigger>
                    <TabsTrigger
                      value="auto"
                      disabled={
                        !!(selectedCommand && selectedCommand.type !== "auto")
                      }
                    >
                      Auto
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="manual">
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="device-id">Device ID</Label>
                        <Input
                          name="device-id"
                          id="device-id"
                          type="number"
                          placeholder="e.g., 1"
                          defaultValue={
                            selectedCommand ? selectedCommand.device_id : ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-id">User ID</Label>
                        <Input
                          name="user-id"
                          id="user-id"
                          type="number"
                          placeholder="e.g., 1"
                          defaultValue={
                            selectedCommand ? selectedCommand.user_id : ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manual-command-type">Type</Label>
                        <Select
                          name="manual-command-type"
                          defaultValue={
                            selectedCommand?.type === "manual"
                              ? JSON.parse(selectedCommand.command).type
                              : undefined
                          }
                        >
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
                        <Input
                          name="command-string"
                          id="command-string"
                          placeholder="e.g., S20"
                          defaultValue={
                            selectedCommand?.type === "manual"
                              ? JSON.parse(selectedCommand.command).command
                              : ""
                          }
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {selectedCommand
                          ? "Save Changes"
                          : "Save Manual Command"}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="auto">
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="device-id">Device ID</Label>
                        <Input
                          name="device-id"
                          id="device-id"
                          type="number"
                          placeholder="e.g., 1"
                          defaultValue={
                            selectedCommand ? selectedCommand.device_id : ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-id">User ID</Label>
                        <Input
                          name="user-id"
                          id="user-id"
                          type="number"
                          placeholder="e.g., 1"
                          defaultValue={
                            selectedCommand ? selectedCommand.user_id : ""
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auto-command-title">Title</Label>
                        <Input
                          name="auto-command-title"
                          id="auto-command-title"
                          placeholder="e.g., Evening Mode"
                          defaultValue={
                            selectedCommand?.type === "auto"
                              ? JSON.parse(selectedCommand.command).title
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="command-json">JSON</Label>
                        <Textarea
                          name="command-json"
                          id="command-json"
                          placeholder='{ "light": "on", "speed": "15" }'
                          rows={5}
                          defaultValue={
                            selectedCommand?.type === "auto"
                              ? JSON.parse(selectedCommand.command).json
                              : ""
                          }
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {selectedCommand ? "Save Changes" : "Save Auto Command"}
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
        <Card className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-4">Loading commands...</p>
        </Card>
      ) : commands.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Command List</CardTitle>
            <CardDescription>
              Search, filter, and manage all available commands.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div> // or a more complex loading component
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
        <Card className="flex flex-col items-center justify-center py-20">
          <CardHeader>
            <CardTitle className="text-xl font-headline">
              No Commands Found
            </CardTitle>
            <CardDescription>
              Get started by creating the first command definition.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Command
                </Button>
              </SheetTrigger>
            </Sheet>
          </CardContent>
        </Card>
      )}
    </div>
  );
}