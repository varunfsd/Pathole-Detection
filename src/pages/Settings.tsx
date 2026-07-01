import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Palette, Shield, Activity } from "lucide-react"
import { useAppContext } from "@/context/AppContext"

export function Settings() {
  const userStr = localStorage.getItem("smart-pothole-user")
  const user = userStr ? JSON.parse(userStr) : { name: "System Admin", email: "admin@smartpothole.com", role: "admin" }

  const { auditLogs } = useAppContext()

  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and system configuration.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4 mr-2" /> Appearance</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" /> Security</TabsTrigger>
          {user.role === "admin" && (
            <TabsTrigger value="audit"><Activity className="h-4 w-4 mr-2" /> Audit Logs</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={profile.email} 
                  onChange={(e) => setProfile({...profile, email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user.role} disabled className="capitalize" />
                <p className="text-[0.8rem] text-muted-foreground">Your role cannot be changed from this account.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what updates you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label>Email Notifications</Label>
                  <span className="text-[0.8rem] text-muted-foreground">Receive a daily digest of new potholes.</span>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label>SMS Alerts</Label>
                  <span className="text-[0.8rem] text-muted-foreground">Get text messages for critical severity alerts.</span>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label>System Updates</Label>
                  <span className="text-[0.8rem] text-muted-foreground">Receive alerts when the system is down for maintenance.</span>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-1">
                <Label className="text-base">Theme</Label>
                <span className="text-[0.8rem] text-muted-foreground">Select your preferred color theme. Note: Theme toggling is currently managed by system defaults in the prototype.</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 justify-start flex-col gap-2 p-4 border-2 border-primary">
                  <div className="flex gap-2 w-full items-center">
                    <div className="w-4 h-4 rounded-full bg-background border shadow-sm"></div>
                    <span className="text-sm font-medium">Light</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start flex-col gap-2 p-4">
                  <div className="flex gap-2 w-full items-center">
                    <div className="w-4 h-4 rounded-full bg-slate-950 shadow-sm border border-slate-800"></div>
                    <span className="text-sm font-medium">Dark</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-20 justify-start flex-col gap-2 p-4">
                  <div className="flex gap-2 w-full items-center">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-background to-slate-950 shadow-sm border"></div>
                    <span className="text-sm font-medium">System</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input id="confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>
                View recent administrative actions in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No actions recorded yet.</p>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">{log.action}</span>
                        <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{log.details}</span>
                      <span className="text-xs font-medium">User: {log.userId}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
