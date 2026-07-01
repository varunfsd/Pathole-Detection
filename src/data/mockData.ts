import type { Agent, Technician, Area, Pothole } from "../types"

export const mockAreas: Area[] = [
  { id: "area-1", name: "Downtown District", description: "Central business district and high-traffic areas." },
  { id: "area-2", name: "North Hills", description: "Residential zones in the northern suburbs." },
  { id: "area-3", name: "Southside Industrial", description: "Industrial parks and main southern highways." }
]

export const mockAgents: Agent[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `agent-${i + 1}`,
  name: `Support Agent ${i + 1}`,
  email: `agent${i + 1}@smartpothole.com`,
  role: "Agent",
  area: `area-${(i % 3) + 1}`,
  phone: `+1-555-010${i}`
}))

export const mockTechnicians: Technician[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `tech-${i + 1}`,
  name: `Technician ${i + 1}`,
  email: `tech${i + 1}@smartpothole.com`,
  role: "Technician",
  phone: `+1-555-020${i}`,
  area: `area-${(i % 3) + 1}`,
}))

const severities: Pothole["severity"][] = ["Low", "Medium", "High", "Critical"]
const statuses: Pothole["status"][] = ["Reported", "Assigned", "In Progress", "Resolved", "Closed"]

// Predefined set of coordinates centered around a hypothetical city to make map points look natural
const baseLat = 34.0522
const baseLng = -118.2437

export const mockPotholes: Pothole[] = Array.from({ length: 50 }).map((_, i) => {
  // Generate semi-random state
  const isAssigned = Math.random() > 0.3 // 70% chance of being assigned
  const isWipOrDone = isAssigned && Math.random() > 0.3
  
  let statusIndex = 0 // Reported
  if (isAssigned) statusIndex = 1 // Assigned
  if (isWipOrDone) statusIndex = Math.floor(Math.random() * 3) + 2 // In Progress, Resolved, or Closed

  return {
    id: `pothole-${i + 1}`,
    latitude: baseLat + (Math.random() - 0.5) * 0.15,
    longitude: baseLng + (Math.random() - 0.5) * 0.15,
    severity: severities[Math.floor(Math.random() * severities.length)],
    status: statuses[statusIndex],
    assignedAgent: isAssigned ? `agent-${Math.floor(Math.random() * 5) + 1}` : null,
    assignedTechnician: statusIndex >= 1 ? `tech-${Math.floor(Math.random() * 10) + 1}` : null,
    area: `area-${Math.floor(Math.random() * 3) + 1}`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    repairNotes: statusIndex >= 2 ? ["Initial assessment completed."] : [],
  }
})
