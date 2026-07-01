import type { User, Pothole, Agent, Technician, Area, AuditLog } from "@/types"
import { mockPotholes, mockAgents, mockTechnicians, mockAreas } from "@/data/mockData"

// Simulated in-memory database
let db = {
  potholes: [...mockPotholes],
  agents: [...mockAgents],
  technicians: [...mockTechnicians],
  areas: mockAreas.map(a => ({ ...a, isActive: true })),
  auditLogs: [] as AuditLog[]
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const logAction = (action: string, details: string, userId: string = "System") => {
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  })
}

// Helper to check access
const requireAdmin = (user: User | null) => {
  if (!user || user.role !== "Admin") throw new Error("403 Forbidden: Admin access required")
}

const requireAdminOrAgent = (user: User | null) => {
  if (!user || (user.role !== "Admin" && user.role !== "Agent")) throw new Error("403 Forbidden: Admin or Agent access required")
}

export const api = {
  login: async (email: string, password: string):Promise<User> => {
    await delay(500)
    // Mock login logic
    if (email === "admin@smartpothole.com") {
      return { id: "u-admin", name: "System Admin", email, role: "Admin" } as User
    }
    const agent = db.agents.find(a => a.email === email)
    if (agent) return agent
    const tech = db.technicians.find(t => t.email === email)
    if (tech) return tech
    
    throw new Error("Invalid credentials")
  },

  // Areas
  getAreas: async (user: User | null) => {
    await delay(200)
    return [...db.areas]
  },
  createArea: async (user: User | null, area: Area) => {
    await delay(300)
    requireAdmin(user)
    db.areas.push(area)
    logAction("Create Area", `Created area ${area.name}`, user?.name)
    return area
  },
  updateArea: async (user: User | null, id: string, updates: Partial<Area>) => {
    await delay(300)
    requireAdmin(user)
    db.areas = db.areas.map(a => a.id === id ? { ...a, ...updates } : a)
    logAction("Update Area", `Updated area ${id}`, user?.name)
  },

  // Agents
  getAgents: async (user: User | null) => {
    await delay(200)
    requireAdmin(user)
    return [...db.agents]
  },
  createAgent: async (user: User | null, agent: Agent) => {
    await delay(300)
    requireAdmin(user)
    db.agents.push(agent)
    logAction("Create Agent", `Created agent ${agent.name}`, user?.name)
    return agent
  },
  updateAgent: async (user: User | null, id: string, updates: Partial<Agent>) => {
    await delay(300)
    requireAdmin(user)
    db.agents = db.agents.map(a => a.id === id ? { ...a, ...updates } : a)
    logAction("Update Agent", `Updated agent ${id}`, user?.name)
  },

  // Technicians
  getTechnicians: async (user: User | null) => {
    await delay(200)
    requireAdminOrAgent(user)
    if (user?.role === "Agent") {
      return db.technicians.filter(t => t.area === (user as Agent).area)
    }
    return [...db.technicians]
  },
  createTechnician: async (user: User | null, tech: Technician) => {
    await delay(300)
    requireAdminOrAgent(user)
    if (user?.role === "Agent" && tech.area !== (user as Agent).area) {
      throw new Error("403 Forbidden: Cannot create technician outside your area")
    }
    db.technicians.push(tech)
    logAction("Create Technician", `Created technician ${tech.name}`, user?.name)
    return tech
  },
  updateTechnician: async (user: User | null, id: string, updates: Partial<Technician>) => {
    await delay(300)
    requireAdminOrAgent(user)
    const tech = db.technicians.find(t => t.id === id)
    if (user?.role === "Agent" && tech?.area !== (user as Agent).area) {
      throw new Error("403 Forbidden: Cannot update technician outside your area")
    }
    db.technicians = db.technicians.map(t => t.id === id ? { ...t, ...updates } : t)
    logAction("Update Technician", `Updated technician ${id}`, user?.name)
  },

  // Potholes
  getPotholes: async (user: User | null) => {
    await delay(200)
    if (user?.role === "Agent") {
      return db.potholes.filter(p => p.area === (user as Agent).area)
    }
    if (user?.role === "Technician") {
      return db.potholes.filter(p => p.assignedTechnician === user.id)
    }
    return [...db.potholes]
  },
  updatePothole: async (user: User | null, id: string, updates: Partial<Pothole>) => {
    await delay(300)
    const pothole = db.potholes.find(p => p.id === id)
    if (!pothole) throw new Error("404 Not Found")

    if (user?.role === "Agent" && pothole.area !== (user as Agent).area) {
      throw new Error("403 Forbidden")
    }
    if (user?.role === "Technician" && pothole.assignedTechnician !== user.id) {
      throw new Error("403 Forbidden")
    }

    db.potholes = db.potholes.map(p => p.id === id ? { ...p, ...updates } : p)
    logAction("Update Pothole", `Updated pothole ${id}`, user?.name)
  },

  // Audit Logs
  getAuditLogs: async (user: User | null) => {
    await delay(200)
    requireAdmin(user)
    return [...db.auditLogs]
  }
}
