import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, Navigation, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { useAppContext } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"

export function TechnicianDashboard() {
  const { potholes, updatePothole } = useAppContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [newNote, setNewNote] = useState<Record<string, string>>({})

  const currentTechId = user?.id

  const assignedPotholes = useMemo(() => {
    return potholes.filter(p => p.assignedTechnician === currentTechId)
  }, [potholes, currentTechId])

  const stats = useMemo(() => {
    return {
      total: assignedPotholes.length,
      pending: assignedPotholes.filter(p => p.status === "Assigned").length,
      inProgress: assignedPotholes.filter(p => p.status === "In Progress").length,
      repaired: assignedPotholes.filter(p => p.status === "Resolved" || p.status === "Closed").length,
    }
  }, [assignedPotholes])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Resolved":
      case "Closed": return "default"
      case "In Progress": return "secondary"
      case "Assigned": return "destructive"
      default: return "outline"
    }
  }
  
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive"
      case "High": return "destructive"
      case "Medium": return "default"
      case "Low": return "secondary"
      default: return "outline"
    }
  }

  const handleStatusChange = (potholeId: string, newStatus: any) => {
    updatePothole(potholeId, { status: newStatus })
  }

  const handleAddNote = (potholeId: string) => {
    const note = newNote[potholeId]
    if (!note) return
    const pothole = assignedPotholes.find(p => p.id === potholeId)
    if (pothole) {
      updatePothole(potholeId, { repairNotes: [...(pothole.repairNotes || []), note] })
      setNewNote(prev => ({ ...prev, [potholeId]: "" }))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Technician Dashboard</h2>
        <p className="text-muted-foreground">
          View your assigned repair tasks and update their status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-500">To Do</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.repaired}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold mt-4">Repair Queue</h3>
        {assignedPotholes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mb-2 text-muted-foreground/50" />
              <p>You have no assigned tasks right now.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assignedPotholes
              .sort((a, b) => {
                // Sort by status (Assigned first, then In Progress, then Resolved)
                const statusWeight: Record<string, number> = { "Assigned": 0, "In Progress": 1, "Resolved": 2, "Closed": 3 }
                return statusWeight[a.status] - statusWeight[b.status]
              })
              .map(pothole => (
              <Card key={pothole.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pothole.id}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" /> Lat {pothole.latitude.toFixed(4)}, Lng {pothole.longitude.toFixed(4)}
                      </CardDescription>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(pothole.severity)}>
                      {pothole.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Update Status</Label>
                    <Select value={pothole.status} onValueChange={(v) => handleStatusChange(pothole.id, v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assigned">Assigned (To Do)</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Repair Notes</Label>
                    <div className="bg-muted p-2 rounded-md h-24 overflow-y-auto text-sm space-y-2">
                      {pothole.repairNotes && pothole.repairNotes.length > 0 ? (
                        pothole.repairNotes.map((note, i) => (
                          <div key={i} className="border-b border-border/50 pb-1 last:border-0">- {note}</div>
                        ))
                      ) : (
                        <span className="text-muted-foreground italic">No notes added yet.</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Textarea 
                        placeholder="Add a new note..." 
                        className="min-h-[40px] h-[40px] text-sm"
                        value={newNote[pothole.id] || ""}
                        onChange={(e) => setNewNote(prev => ({ ...prev, [pothole.id]: e.target.value }))}
                      />
                      <Button size="sm" className="h-[40px]" onClick={() => handleAddNote(pothole.id)}>Add</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t mt-auto bg-muted/20">
                  <Button variant="outline" className="w-full bg-background" onClick={() => navigate("/map")}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Find on Map
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
