export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Status = "Reported" | "Assigned" | "In Progress" | "Resolved" | "Closed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Agent" | "Technician";
  avatar?: string;
  phone?: string;
}

export interface Agent extends User {
  role: "Agent";
  area: string;
}

export interface Technician extends User {
  role: "Technician";
  area: string; // Area ID
}

export interface Area {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  details: string;
  timestamp: string;
}

export interface Pothole {
  id: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  status: Status;
  assignedAgent: string | null; // Agent ID
  assignedTechnician: string | null; // Technician ID
  area: string; // Area ID
  createdAt: string; // ISO date string
  repairNotes: string[];
}
