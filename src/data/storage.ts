import type {
  User,
  JasperProject,
  ProjectVersion,
  SimulationRun,
  ActionLogEntry,
} from '../core/schema';
import { generateId } from '../core/ids';
import { stableHash } from '../core/hash';
import type { ThermoConfig, Component, FlowsheetGraph, SpecSet, ConstraintSet, Objective, EconomicConfig, ProjectStatus } from '../core/schema';

const STORAGE_KEY = 'jasper_v1';

interface StorageData {
  users: User[];
  projects: JasperProject[];
  versions: ProjectVersion[];
  runs: SimulationRun[];
  actions: ActionLogEntry[];
}

function loadStorage(): StorageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load storage:', e);
  }
  return {
    users: [],
    projects: [],
    versions: [],
    runs: [],
    actions: [],
  };
}

function saveStorage(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save storage:', e);
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(data: StorageData): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    saveStorage(data);
    saveTimer = null;
  }, 2000);
}

// User operations
export function getCurrentUser(): User | null {
  const data = loadStorage();
  return data.users[0] || null;
}

export function setCurrentUser(user: User): void {
  const data = loadStorage();
  data.users = [user];
  saveStorage(data);
}

// Project operations
export function listProjects(): JasperProject[] {
  const data = loadStorage();
  return data.projects;
}

export function getProject(projectId: string): JasperProject | null {
  const data = loadStorage();
  return data.projects.find(p => p.projectId === projectId) || null;
}

export function createProject(template: {
  name: string;
  thermodynamics: ThermoConfig;
  components: Component[];
  flowsheet: FlowsheetGraph;
  specs: SpecSet;
  constraints: ConstraintSet;
  objective: Objective;
  economics?: EconomicConfig;
  status?: ProjectStatus;
}): JasperProject {
  const data = loadStorage();
  const now = new Date().toISOString();
  const project: JasperProject = {
    projectId: generateId('proj'),
    name: template.name,
    createdAt: now,
    updatedAt: now,
    thermodynamics: template.thermodynamics,
    components: template.components,
    flowsheet: template.flowsheet,
    specs: template.specs,
    constraints: template.constraints,
    objective: template.objective,
    economics: template.economics,
    status: template.status || 'draft',
  };
  data.projects.push(project);
  saveStorage(data);
  return project;
}

export function updateProjectDraft(project: JasperProject): void {
  const data = loadStorage();
  const index = data.projects.findIndex(p => p.projectId === project.projectId);
  if (index >= 0) {
    project.updatedAt = new Date().toISOString();
    data.projects[index] = project;
    debouncedSave(data);
  }
}

export function deleteProject(projectId: string): void {
  const data = loadStorage();
  data.projects = data.projects.filter(p => p.projectId !== projectId);
  data.versions = data.versions.filter(v => v.projectId !== projectId);
  data.runs = data.runs.filter(r => r.projectId !== projectId);
  data.actions = data.actions.filter(a => a.projectId !== projectId);
  saveStorage(data);
}

// Version operations
export function listVersions(projectId: string): ProjectVersion[] {
  const data = loadStorage();
  return data.versions.filter(v => v.projectId === projectId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createVersion(
  projectId: string,
  label: string,
  project: JasperProject
): ProjectVersion {
  const data = loadStorage();
  const now = new Date().toISOString();
  const snapshotHash = stableHash(project);
  const version: ProjectVersion = {
    versionId: generateId('ver'),
    projectId,
    label,
    status: project.status,
    createdAt: now,
    snapshotJson: JSON.parse(JSON.stringify(project)),
    snapshotHash,
  };
  data.versions.push(version);
  
  // Update project's latestVersionId
  const projIndex = data.projects.findIndex(p => p.projectId === projectId);
  if (projIndex >= 0) {
    data.projects[projIndex].latestVersionId = version.versionId;
  }
  
  saveStorage(data);
  return version;
}

export function getVersion(versionId: string): ProjectVersion | null {
  const data = loadStorage();
  return data.versions.find(v => v.versionId === versionId) || null;
}

// Run operations
export function createRun(
  projectId: string,
  versionId: string,
  run: Omit<SimulationRun, 'runId' | 'projectId' | 'versionId' | 'createdAt'>
): SimulationRun {
  const data = loadStorage();
  const now = new Date().toISOString();
  const simulationRun: SimulationRun = {
    ...run,
    runId: generateId('run'),
    projectId,
    versionId,
    createdAt: now,
  };
  data.runs.push(simulationRun);
  saveStorage(data);
  return simulationRun;
}

export function listRuns(projectId: string): SimulationRun[] {
  const data = loadStorage();
  return data.runs.filter(r => r.projectId === projectId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getRun(runId: string): SimulationRun | null {
  const data = loadStorage();
  return data.runs.find(r => r.runId === runId) || null;
}

// Action log operations
export function appendAction(entry: ActionLogEntry): void {
  const data = loadStorage();
  data.actions.push(entry);
  saveStorage(data);
}

export function listActions(projectId: string): ActionLogEntry[] {
  const data = loadStorage();
  return data.actions.filter(a => a.projectId === projectId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

