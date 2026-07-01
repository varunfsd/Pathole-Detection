import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MapPin,
  Users,
  Wrench,
  Map as MapIcon,
  Settings,
  Bell,
  Menu,
  LogOut,
  User,
  ShieldAlert,
  FileText,
  Layers
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { useAppContext } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"

const adminNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Areas", href: "/areas", icon: Layers },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Technicians", href: "/technicians", icon: Wrench },
  { name: "Potholes", href: "/potholes", icon: MapPin },
  { name: "Map", href: "/map", icon: MapIcon },
  { name: "Settings", href: "/settings", icon: Settings },
]

const agentNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Potholes", href: "/potholes", icon: MapPin },
  { name: "Technicians", href: "/technicians", icon: Wrench },
  { name: "Map", href: "/map", icon: MapIcon },
]

const technicianNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Map", href: "/map", icon: MapIcon },
]

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { areas } = useAppContext()
  const { user, logout } = useAuth()

  const userRole = user?.role.toLowerCase() || "admin"

  let navigation = adminNavigation
  let avatarInitials = "AD"
  if (userRole === "agent") {
    navigation = agentNavigation
    avatarInitials = "AG"
  } else if (userRole === "technician") {
    navigation = technicianNavigation
    avatarInitials = "TC"
  }

  const userAreaId = (user as any)?.area || (user as any)?.assignedArea
  const userAreaName = userAreaId 
    ? areas.find(a => a.id === userAreaId)?.name || "Unknown Area" 
    : null

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/20 md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
            <ShieldAlert className="h-6 w-6" />
            <span>Smart Pothole System</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-col flex-1 sm:gap-4 sm:py-4">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">

          {/* Mobile Sidebar Toggle */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-lg font-semibold text-primary"
                >
                  <ShieldAlert className="h-6 w-6" />
                  <span className="sr-only">Smart Pothole System</span>
                </Link>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-4 px-2.5 hover:text-foreground",
                      location.pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Role and Area info */}
          <div className="flex-1 flex items-center gap-2">
            <span className="font-semibold md:hidden">Smart Pothole System</span>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="capitalize border-primary text-primary bg-primary/10">
                {userRole} Role
              </Badge>
              {userAreaName ? (
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" /> {userAreaName}
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Header Right Side */}
          <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full border shadow-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>{avatarInitials}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user?.name || "My Account"}</span>
                  <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {userRole === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
