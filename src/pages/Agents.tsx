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
import type { Agent } from "@/types"

export function Agents() {
  const { agents, addAgent, areas, updateAgent, potholes } = useAppContext()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", area: "", password: "" })

  const handleOpenAdd = () => {
    setFormData({ name: "", email: "", phone: "", area: areas[0]?.id || "", password: "" })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (agent: Agent) => {
    setSelectedAgent(agent)
    setFormData({ name: agent.name, email: agent.email, phone: agent.phone || "", area: agent.area, password: "" })
    setIsEditOpen(true)
  }

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: "Agent",
      area: formData.area
    }
    await addAgent(newAgent)
    setIsAddOpen(false)
  }

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAgent) return
    await updateAgent(selectedAgent.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      area: formData.area
    })
    setIsEditOpen(false)
  }

  const getAreaName = (id: string) => {
    return areas.find(a => a.id === id)?.name || id
  }

  const getAgentStats = (agent: Agent) => {
    const agentPotholes = potholes.filter(p => p.area === agent.area)
    const resolved = agentPotholes.filter(p => p.status === "Resolved" || p.status === "Closed").length
    return {
      resolved,
      pending: agentPotholes.length - resolved
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Management</h2>
          <p className="text-muted-foreground mt-2">
            Add, edit, and assign geographic areas to managing agents.
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddAgent}>
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
                <DialogDescription>
                  Enter the details of the new agent and assign their operational area.
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
              </div>
              <DialogFooter>
                <Button type="submit">Save Agent</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agents Directory</CardTitle>
          <CardDescription>
            A list of all active agents in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Assigned Area</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium text-xs text-muted-foreground">{agent.id}</TableCell>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{getAreaName(agent.area)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">{getAgentStats(agent).resolved} Resolved</Badge>
                        <Badge variant="outline" className="text-destructive border-destructive/20">{getAgentStats(agent).pending} Pending</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="icon" onClick={() => handleOpenEdit(agent)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleEditAgent}>
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogDescription>
                Update details or reassign the operational area for {selectedAgent?.name}.
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
