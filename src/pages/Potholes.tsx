import { useState, useMemo } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

import { useAppContext } from "@/context/AppContext"

const ITEMS_PER_PAGE = 10

export function Potholes() {
  const { potholes, agents, technicians, areas, updatePothole } = useAppContext()
  
  const userStr = localStorage.getItem("smart-pothole-user")
  const user = userStr ? JSON.parse(userStr) : null
  const userRole = user?.role
  const userArea = user?.area

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [severityFilter, setSeverityFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when filters change
  const handleFilterChange = (setter: any, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const filteredPotholes = useMemo(() => {
    return potholes.filter(p => {
      const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "All" || p.status === statusFilter
      const matchesSeverity = severityFilter === "All" || p.severity === severityFilter
      return matchesSearch && matchesStatus && matchesSeverity
    })
  }, [potholes, searchQuery, statusFilter, severityFilter])

  const totalPages = Math.ceil(filteredPotholes.length / ITEMS_PER_PAGE)
  const paginatedPotholes = filteredPotholes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive"
      case "High": return "destructive"
      case "Medium": return "default"
      case "Low": return "secondary"
      default: return "outline"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Resolved":
      case "Closed": return "default"
      case "In Progress": return "secondary"
      case "Assigned": return "destructive"
      default: return "outline"
    }
  }

  const getAgentName = (id: string | null) => {
    if (!id) return "Unassigned"
    return agents.find(a => a.id === id)?.name || id
  }

  const getTechName = (id: string | null) => {
    if (!id) return "Unassigned"
    return technicians.find(t => t.id === id)?.name || id
  }

  const getAreaName = (id: string) => {
    return areas.find(a => a.id === id)?.name || id
  }

  const handleSeverityChange = (id: string, severity: any) => {
    updatePothole(id, { severity })
  }

  const handleAgentAssign = (id: string, agentId: string) => {
    updatePothole(id, { assignedAgent: agentId === "unassigned" ? null : agentId })
  }

  const handleTechAssign = (id: string, techId: string) => {
    updatePothole(id, { assignedTechnician: techId === "unassigned" ? null : techId, status: "Assigned" })
  }

  return (
    <div className="flex flex-col gap-8 overflow-x-hidden">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pothole Management</h2>
        <p className="text-muted-foreground mt-2">
          {userRole === "agent" 
            ? `Manage pothole reports for ${getAreaName(userArea)}.`
            : "View, filter, and manage all reported potholes in the system."}
        </p>
      </div>

      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle>{userRole === "agent" ? "Area Potholes" : "All Potholes"}</CardTitle>
          <CardDescription>
            Use the filters below to find specific reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={(val) => handleFilterChange(setStatusFilter, val)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Reported">Reported</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={(val) => handleFilterChange(setSeverityFilter, val)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Severities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pothole ID</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  {userRole !== "agent" && <TableHead>Area</TableHead>}
                  {userRole !== "agent" && <TableHead>Assigned Agent</TableHead>}
                  <TableHead>Assigned Tech</TableHead>
                  <TableHead>Date Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPotholes.map((pothole) => (
                  <TableRow key={pothole.id}>
                    <TableCell className="font-medium">
                      {pothole.id}
                      <Badge variant="outline" className="ml-2 text-[10px]">{getAreaName(pothole.area)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {pothole.latitude.toFixed(4)}, {pothole.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {userRole === "agent" ? (
                        <Select value={pothole.severity} onValueChange={(val) => handleSeverityChange(pothole.id, val)}>
                          <SelectTrigger className="h-7 text-xs px-2 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getSeverityBadgeVariant(pothole.severity)}>
                          {pothole.severity}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(pothole.status)}>
                        {pothole.status}
                      </Badge>
                    </TableCell>
                    {userRole !== "agent" && (
                      <TableCell className="whitespace-nowrap">{getAreaName(pothole.area)}</TableCell>
                    )}
                    {userRole !== "agent" && (
                      <TableCell>
                        <Select value={pothole.assignedAgent || "unassigned"} onValueChange={(val) => handleAgentAssign(pothole.id, val)}>
                          <SelectTrigger className="h-7 text-xs px-2 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {agents.filter(a => a.area === pothole.area).map(agent => (
                              <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                    <TableCell>
                      {userRole === "admin" || userRole === "agent" ? (
                        <Select value={pothole.assignedTechnician || "unassigned"} onValueChange={(val) => handleTechAssign(pothole.id, val)}>
                          <SelectTrigger className="h-7 text-xs px-2 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {technicians.filter(t => t.area === pothole.area).map(tech => (
                              <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="whitespace-nowrap text-sm text-muted-foreground">{getTechName(pothole.assignedTechnician)}</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(pothole.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedPotholes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={userRole === "agent" ? 6 : 8} className="text-center py-6 text-muted-foreground">
                      No potholes found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPotholes.length)} of {filteredPotholes.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm font-medium px-2">
                Page {currentPage} of {Math.max(1, totalPages)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
