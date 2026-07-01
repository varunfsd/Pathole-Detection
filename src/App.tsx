import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { Login } from "./pages/Login"
import { Dashboard } from "./pages/Dashboard"
import { AgentDashboard } from "./pages/AgentDashboard"
import { TechnicianDashboard } from "./pages/TechnicianDashboard"
import { Potholes } from "./pages/Potholes"
import { Agents } from "./pages/Agents"
import { Technicians } from "./pages/Technicians"
import { MapView } from "./pages/MapView"
import { Settings } from "./pages/Settings"
import { Areas } from "./pages/Areas"
import { AppProvider } from "./context/AppContext"
import { AuthProvider, useAuth } from "./context/AuthContext"

// Mock Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// Role Route guard
function RoleRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  
  const roleLower = user.role.toLowerCase()
  if (!allowedRoles.includes(roleLower) && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

// Route handler for root dashboard depending on role
function RootDashboard() {
  const { user } = useAuth()
  if (user) {
    if (user.role === "Agent" || user.role === "agent") {
      return <AgentDashboard />
    } else if (user.role === "Technician" || user.role === "technician") {
      return <TechnicianDashboard />
    }
  }
  // Default to admin dashboard
  return <Dashboard />
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="smart-pothole-theme">
      <AuthProvider>
        <AppProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<RootDashboard />} />

                {/* Available to Admin and Agent */}
                <Route path="/potholes" element={
                  <RoleRoute allowedRoles={["admin", "agent"]}>
                    <Potholes />
                  </RoleRoute>
                } />
                <Route path="/technicians" element={
                  <RoleRoute allowedRoles={["admin", "agent"]}>
                    <Technicians />
                  </RoleRoute>
                } />

                {/* Available to Admin only */}
                <Route path="/agents" element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <Agents />
                  </RoleRoute>
                } />
                <Route path="/areas" element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <Areas />
                  </RoleRoute>
                } />
                <Route path="/settings" element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <Settings />
                  </RoleRoute>
                } />

                {/* Available to all authenticated users */}
                <Route path="/map" element={<MapView />} />
              </Route>
            </Routes>
          </div>
        </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
