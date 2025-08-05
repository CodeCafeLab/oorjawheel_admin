
"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound } from "lucide-react"

export default function SuperLoginPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
                <KeyRound className="h-12 w-12 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Super Login</CardTitle>
          <CardDescription>Enter a device's MAC address to perform diagnostics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mac-address">MAC Address</Label>
            <Input id="mac-address" type="text" placeholder="00:1A:2B:3C:4D:5E" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Access</Label>
            <Input id="reason" type="text" placeholder="e.g., Customer support ticket #12345" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full">Initiate Diagnostic Session</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
