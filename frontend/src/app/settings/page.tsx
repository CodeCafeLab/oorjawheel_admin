
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
import * as React from "react"
import { getAdminProfile, updateAdminProfile, changeAdminPassword, getAdminGeneralSettings, updateAdminGeneralSettings } from "@/actions/settings"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = React.useState<{ id: number; name: string | null; email: string } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [pwd, setPwd] = React.useState({ oldPassword: "", newPassword: "" })
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const { toast } = useToast()
  const [general, setGeneral] = React.useState<Record<string, any>>({})

  React.useEffect(() => {
    (async () => {
      try {
        const data = await getAdminProfile()
        if (data) setProfile(data)
        const g = await getAdminGeneralSettings()
        if (g) setGeneral(g)
      } catch {}
    })()
  }, [])

  const onSaveProfile = async () => {
    if (!profile) return
    setLoading(true)
    try {
      await updateAdminProfile({ name: profile.name ?? undefined, email: profile.email })
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' })
    } catch (e:any) {
      toast({ variant: 'destructive', title: 'Save failed', description: e?.message || 'Could not update profile.' })
    } finally { setLoading(false) }
  }

  const onSavePassword = async () => {
    if (!pwd.oldPassword || !pwd.newPassword) return
    setLoading(true)
    try { 
      await changeAdminPassword(pwd)
      toast({ title: 'Password changed', description: 'Your password was updated successfully.' })
      setPwd({ oldPassword: '', newPassword: '' })
    } catch (e:any) {
      toast({ variant: 'destructive', title: 'Password change failed', description: e?.message || 'Check current password and try again.' })
    } finally { setLoading(false) }
  }

  const onSaveGeneral = async () => {
    setLoading(true)
    try {
      await updateAdminGeneralSettings(general)
      toast({ title: 'General settings saved' })
    } catch (e:any) {
      toast({ variant: 'destructive', title: 'Save failed', description: e?.message || 'Could not save general settings.' })
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings.</p>
      </div>
      <Separator />
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[600px] lg:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
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
                <Input id="name" value={profile?.name ?? ''} onChange={(e)=> setProfile(p=> p? { ...p, name: e.target.value } : p)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile?.email ?? ''} onChange={(e)=> setProfile(p=> p? { ...p, email: e.target.value } : p)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onSaveProfile} disabled={loading || !profile}>Save changes</Button>
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
                <div className="relative">
                  <Input 
                    id="current-password" 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={pwd.oldPassword} 
                    onChange={(e)=> setPwd(s=>({ ...s, oldPassword: e.target.value }))}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showCurrentPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input 
                    id="new-password" 
                    type={showNewPassword ? "text" : "password"} 
                    value={pwd.newPassword} 
                    onChange={(e)=> setPwd(s=>({ ...s, newPassword: e.target.value }))}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showNewPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onSavePassword} disabled={loading || !pwd.oldPassword || !pwd.newPassword}>Save password</Button>
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
                <Input id="app-title" value={general.site_name ?? ''} onChange={(e)=> setGeneral(s=> ({...s, site_name: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="official-email">Official Email</Label>
                <Input id="official-email" type="email" value={general.official_email ?? ''} onChange={(e)=> setGeneral(s=> ({...s, official_email: e.target.value}))} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="app-logo">App Logo URL</Label>
                <Input id="app-logo" placeholder="https://example.com/logo.png" value={general.app_logo_url ?? ''} onChange={(e)=> setGeneral(s=> ({...s, app_logo_url: e.target.value}))} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="app-icon">App Icon URL</Label>
                <Input id="app-icon" placeholder="https://example.com/icon.png" value={general.app_icon_url ?? ''} onChange={(e)=> setGeneral(s=> ({...s, app_icon_url: e.target.value}))} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="admin-logo">Admin Logo URL</Label>
                <Input id="admin-logo" placeholder="https://example.com/admin-logo.png" value={general.admin_logo_url ?? ''} onChange={(e)=> setGeneral(s=> ({...s, admin_logo_url: e.target.value}))} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="admin-icon">Admin Icon URL</Label>
                <Input id="admin-icon" placeholder="https://example.com/admin-icon.png" value={general.admin_icon_url ?? ''} onChange={(e)=> setGeneral(s=> ({...s, admin_icon_url: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="play-store-link">Play Store Link</Label>
                <Input id="play-store-link" placeholder="https://play.google.com/store/apps/details?id=..." value={general.play_store_link ?? ''} onChange={(e)=> setGeneral(s=> ({...s, play_store_link: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-store-link">App Store Link</Label>
                <Input id="app-store-link" placeholder="https://apps.apple.com/app/id..." value={general.app_store_link ?? ''} onChange={(e)=> setGeneral(s=> ({...s, app_store_link: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-number">Support Number</Label>
                <Input id="support-number" placeholder="+91 12345 67890" value={general.support_number ?? ''} onChange={(e)=> setGeneral(s=> ({...s, support_number: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                <Input id="whatsapp-number" placeholder="+91 12345 67890" value={general.whatsapp_number ?? ''} onChange={(e)=> setGeneral(s=> ({...s, whatsapp_number: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook-link">Facebook Link</Label>
                <Input id="facebook-link" placeholder="https://facebook.com/oorjawheel" value={general.facebook_link ?? ''} onChange={(e)=> setGeneral(s=> ({...s, facebook_link: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-link">Instagram Link</Label>
                <Input id="instagram-link" placeholder="https://instagram.com/oorjawheel" value={general.instagram_link ?? ''} onChange={(e)=> setGeneral(s=> ({...s, instagram_link: e.target.value}))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website-link">Website Link</Label>
                <Input id="website-link" placeholder="https://oorjawheel.com" value={general.website_link ?? ''} onChange={(e)=> setGeneral(s=> ({...s, website_link: e.target.value}))} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onSaveGeneral} disabled={loading}>Save General Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
