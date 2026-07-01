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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit2 } from "lucide-react"

import { useAppContext } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"
import type { Technician } from "@/types"

export function Technicians() {
  const { technicians, addTechnician, areas, updateTechnician } = useAppContext()
  const { user } = useAuth()
  
  const userRole = user?.role.toLowerCase()
  const userArea = user?.area

  const filteredTechnicians = technicians

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [selectedTech, setSelectedTech] = useState<Technician | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", area: userArea || "", password: "" })

  const handleOpenAdd = () => {
    setFormData({ name: "", email: "", phone: "", area: userArea || (areas[0]?.id || ""), password: "" })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (tech: Technician) => {
    setSelectedTech(tech)
    setFormData({ name: tech.name, email: tech.email, phone: tech.phone || "", area: tech.area, password: "" })
    setIsEditOpen(true)
  }

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault()
    const newTech: Technician = {
      id: `tech-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: "Technician",
      area: userRole === "agent" ? userArea : formData.area
    }
    await addTechnician(newTech)
    setIsAddOpen(false)
  }

  const handleEditTech = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTech) return
    await updateTechnician(selectedTech.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      area: userRole === "agent" ? userArea : formData.area
    })
    setIsEditOpen(false)
  }

  const getAreaName = (id: string) => {
    return areas.find(a => a.id === id)?.name || id
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Technician Management</h2>
          <p className="text-muted-foreground mt-2">
            Add, edit, and manage field technicians.
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Technician
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddTech}>
              <DialogHeader>
                <DialogTitle>Add New Technician</DialogTitle>
                <DialogDescription>
                  Enter the details of the new field technician.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                {userRole === "admin" && (
                  <div className="grid gap-2">
                    <Label htmlFor="area">Assign Area</Label>
                    <Select value={formData.area} onValueChange={v => setFormData({...formData, area: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Area" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Save Technician</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{userRole === "agent" ? "My Technicians" : "Technicians Directory"}</CardTitle>
          <CardDescription>
            A list of active field technicians in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTechnicians.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium text-xs text-muted-foreground">{tech.id}</TableCell>
                    <TableCell className="font-medium">
                      {tech.name}
                      <Badge variant="outline" className="ml-2 text-[10px]">{getAreaName(tech.area)}</Badge>
                    </TableCell>
                    <TableCell>{getAreaName(tech.area)}</TableCell>
                    <TableCell>{tech.email}</TableCell>
                    <TableCell>{tech.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="icon" onClick={() => handleOpenEdit(tech)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTechnicians.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No technicians found.
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
          <form onSubmit={handleEditTech}>
            <DialogHeader>
              <DialogTitle>Edit Technician</DialogTitle>
              <DialogDescription>
                Update details for {selectedTech?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input id="edit-email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input id="edit-phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <Input id="edit-password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              {userRole === "admin" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-area">Assign Area</Label>
                  <Select value={formData.area} onValueChange={v => setFormData({...formData, area: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
