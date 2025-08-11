
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings.</p>
      </div>
      <Separator />
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[600px] lg:grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">General Settings</CardTitle>
              <CardDescription>
                Manage general application settings and branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="app-title">App Title</Label>
                <Input id="app-title" defaultValue="Oorja" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="official-email">Official Email</Label>
                <Input id="official-email" type="email" defaultValue="contact@oorjawheel.com" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="app-logo">App Logo URL</Label>
                <Input id="app-logo" placeholder="https://example.com/logo.png" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="app-icon">App Icon URL</Label>
                <Input id="app-icon" placeholder="https://example.com/icon.png" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="admin-logo">Admin Logo URL</Label>
                <Input id="admin-logo" placeholder="https://example.com/admin-logo.png" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="admin-icon">Admin Icon URL</Label>
                <Input id="admin-icon" placeholder="https://example.com/admin-icon.png" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="play-store-link">Play Store Link</Label>
                <Input id="play-store-link" placeholder="https://play.google.com/store/apps/details?id=..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-store-link">App Store Link</Label>
                <Input id="app-store-link" placeholder="https://apps.apple.com/app/id..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-number">Support Number</Label>
                <Input id="support-number" placeholder="+91 12345 67890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                <Input id="whatsapp-number" placeholder="+91 12345 67890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook-link">Facebook Link</Label>
                <Input id="facebook-link" placeholder="https://facebook.com/oorjawheel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-link">Instagram Link</Label>
                <Input id="instagram-link" placeholder="https://instagram.com/oorjawheel" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website-link">Website Link</Label>
                <Input id="website-link" placeholder="https://oorjawheel.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save General Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Admin User" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@oorja.com" readOnly disabled />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Notifications</CardTitle>
              <CardDescription>
                Manage your notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                            Receive emails about new orders and customer queries.
                        </p>
                    </div>
                     <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                            Get push notifications for important updates.
                        </p>
                    </div>
                     <Switch id="push-notifications" />
                </div>
            </CardContent>
            <CardFooter>
              <Button>Save preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
