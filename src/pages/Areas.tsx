import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit2, Power, PowerOff } from "lucide-react"

import { useAppContext } from "@/context/AppContext"
import type { Area } from "@/types"

export function Areas() {
  const { areas, addArea, updateArea, potholes, agents, technicians } = useAppContext()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })

  const handleOpenAdd = () => {
    setFormData({ name: "", description: "" })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (area: Area) => {
    setSelectedArea(area)
    setFormData({ name: area.name, description: area.description })
    setIsEditOpen(true)
  }

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault()
    const newArea: Area = {
      id: `area-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      isActive: true
    }
    addArea(newArea)
    setIsAddOpen(false)
  }

  const handleEditArea = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedArea) return
    updateArea(selectedArea.id, {
      name: formData.name,
      description: formData.description
    })
    setIsEditOpen(false)
  }

  const handleToggleStatus = (area: Area) => {
    updateArea(area.id, { isActive: !area.isActive })
  }

  const getAreaStats = (areaId: string) => {
    const areaPotholes = potholes.filter(p => p.area === areaId)
    const areaAgents = agents.filter(a => a.area === areaId)
    const areaTechs = technicians.filter(t => t.area === areaId)
    return {
      potholes: areaPotholes.length,
      agents: areaAgents.length,
      techs: areaTechs.length
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Area Management</h2>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage geographical zones.
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Area
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddArea}>
              <DialogHeader>
                <DialogTitle>Add New Area</DialogTitle>
                <DialogDescription>
                  Define a new operational zone for the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Area Name</Label>
                  <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Downtown District" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description of the zone" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Area</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Areas</CardTitle>
          <CardDescription>
            All configured zones and their current statistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => {
                  const stats = getAreaStats(area.id)
                  return (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground">{area.id}</TableCell>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{area.description}</TableCell>
                      <TableCell>
                        <Badge variant={area.isActive ? "default" : "secondary"}>
                          {area.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {stats.potholes} Potholes | {stats.agents} Agents | {stats.techs} Techs
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="secondary" size="icon" className="mr-2" onClick={() => handleOpenEdit(area)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant={area.isActive ? "destructive" : "default"} 
                          size="icon" 
                          onClick={() => handleToggleStatus(area)}
                          title={area.isActive ? "Deactivate" : "Activate"}
                        >
                          {area.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {areas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No areas configured.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleEditArea}>
            <DialogHeader>
              <DialogTitle>Edit Area</DialogTitle>
              <DialogDescription>
                Update details for {selectedArea?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Area Name</Label>
                <Input id="edit-name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input id="edit-description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
