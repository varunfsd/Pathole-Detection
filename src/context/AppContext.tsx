import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Pothole, Agent, Technician, Area, AuditLog } from "../types";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

interface AppContextType {
  potholes: Pothole[];
  agents: Agent[];
  technicians: Technician[];
  areas: Area[];
  auditLogs: AuditLog[];
  loadingData: boolean;
  refreshData: () => Promise<void>;
  addArea: (area: Area) => Promise<void>;
  updateArea: (id: string, updates: Partial<Area>) => Promise<void>;
  addTechnician: (tech: Technician) => Promise<void>;
  updateTechnician: (id: string, updates: Partial<Technician>) => Promise<void>;
  addAgent: (agent: Agent) => Promise<void>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  updatePothole: (id: string, updates: Partial<Pothole>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const refreshData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const fetchedAreas = await api.getAreas(user);
      const fetchedPotholes = await api.getPotholes(user);
      setAreas(fetchedAreas);
      setPotholes(fetchedPotholes);

      if (user.role === "Admin" || user.role === "Agent") {
        const fetchedTechs = await api.getTechnicians(user);
        setTechnicians(fetchedTechs);
      }
      if (user.role === "Admin") {
        const fetchedAgents = await api.getAgents(user);
        const fetchedLogs = await api.getAuditLogs(user);
        setAgents(fetchedAgents);
        setAuditLogs(fetchedLogs);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setPotholes([]);
      setAgents([]);
      setTechnicians([]);
      setAreas([]);
      setAuditLogs([]);
    }
  }, [user]);

  const addArea = async (area: Area) => {
    await api.createArea(user, area);
    await refreshData();
  };

  const updateArea = async (id: string, updates: Partial<Area>) => {
    await api.updateArea(user, id, updates);
    await refreshData();
  };

  const addAgent = async (agent: Agent) => {
    await api.createAgent(user, agent);
    await refreshData();
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    await api.updateAgent(user, id, updates);
    await refreshData();
  };

  const addTechnician = async (tech: Technician) => {
    await api.createTechnician(user, tech);
    await refreshData();
  };

  const updateTechnician = async (id: string, updates: Partial<Technician>) => {
    await api.updateTechnician(user, id, updates);
    await refreshData();
  };

  const updatePothole = async (id: string, updates: Partial<Pothole>) => {
    await api.updatePothole(user, id, updates);
    await refreshData();
  };

  return (
    <AppContext.Provider value={{
      potholes, agents, technicians, areas, auditLogs, loadingData, refreshData,
      addArea, updateArea, addAgent, updateAgent, addTechnician, updateTechnician, updatePothole
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
