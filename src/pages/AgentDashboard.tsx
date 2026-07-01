import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

import { useAppContext } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"

export function AgentDashboard() {
  const { potholes, technicians, areas } = useAppContext()
  const { user } = useAuth()
  const agentArea = user?.area

  const areaName = useMemo(() => {
    return areas.find(a => a.id === agentArea)?.name || "Unknown Area"
  }, [areas, agentArea])

  const stats = useMemo(() => {
    return {
      total: potholes.length,
      pending: potholes.filter(p => p.status === "Reported" || p.status === "Assigned").length,
      inProgress: potholes.filter(p => p.status === "In Progress").length,
      repaired: potholes.filter(p => p.status === "Resolved" || p.status === "Closed").length,
      technicians: technicians.length
    }
  }, [potholes, technicians])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Resolved":
      case "Closed": return "default"
      case "In Progress": return "secondary"
      case "Reported": return "destructive"
      default: return "outline"
    }
  }

  const recentIncidents = [...potholes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Agent Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of pothole repairs and technician activity in <strong>{areaName}</strong>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Pending</CardTitle>
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
            <CardTitle className="text-sm font-medium text-emerald-500">Repaired</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.repaired}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 w-full overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Incidents in {areaName}</CardTitle>
            <CardDescription>
              The most recent pothole reports in your jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">
                      {incident.id} <Badge variant="outline" className="ml-2 text-[10px]">{areaName}</Badge>
                    </TableCell>
                    <TableCell>{incident.severity}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(incident.status)}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(incident.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Technician Roster</CardTitle>
            <CardDescription>
              {stats.technicians} technicians currently assigned to this area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {technicians.slice(0, 5).map(tech => (
                <div key={tech.id} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium border border-primary/20">
                    {tech.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium leading-none">{tech.name}</span>
                      <Badge variant="outline" className="text-[10px] h-4 py-0 px-1">{areaName}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{tech.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
