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

// Storage keys
const INDEX_KEY = 'jasper_index';
const USER_KEY = 'jasper_user';
const MAX_VERSIONS_PER_PROJECT = 5; // Limit versions to save space

// Project index stored separately
interface ProjectIndex {
  projectIds: string[];
}

// Get storage key for a specific project
function getProjectKey(projectId: string): string {
  return `jasper_proj_${projectId}`;
}

function getVersionsKey(projectId: string): string {
  return `jasper_ver_${projectId}`;
}

function getRunsKey(projectId: string): string {
  return `jasper_run_${projectId}`;
}

function getActionsKey(projectId: string): string {
  return `jasper_act_${projectId}`;
}

// Load project index
function loadIndex(): ProjectIndex {
  try {
    const stored = localStorage.getItem(INDEX_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load index:', e);
  }
  return { projectIds: [] };
}

// Save project index
function saveIndex(index: ProjectIndex): void {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.error('Failed to save index:', e);
  }
}

// Debounced save timers per project
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

function debouncedSaveProject(projectId: string, project: JasperProject): void {
  const existing = saveTimers.get(projectId);
  if (existing) {
    clearTimeout(existing);
  }
  
  const timer = setTimeout(() => {
    try {
      localStorage.setItem(getProjectKey(projectId), JSON.stringify(project));
      saveTimers.delete(projectId);
    } catch (e) {
      console.error('Failed to save project:', e);
    }
  }, 2000);
  
  saveTimers.set(projectId, timer);
}

// User operations
export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Failed to get user:', e);
    return null;
  }
}

export function setCurrentUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to set user:', e);
  }
}

// Project operations
export function listProjects(): JasperProject[] {
  const index = loadIndex();
  const projects: JasperProject[] = [];
  
  for (const projectId of index.projectIds) {
    try {
      const stored = localStorage.getItem(getProjectKey(projectId));
      if (stored) {
        projects.push(JSON.parse(stored));
      }
    } catch (e) {
      console.error(`Failed to load project ${projectId}:`, e);
    }
  }
  
  return projects.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getProject(projectId: string): JasperProject | null {
  try {
    const stored = localStorage.getItem(getProjectKey(projectId));
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error(`Failed to get project ${projectId}:`, e);
    return null;
  }
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
  
  // Save project
  try {
    localStorage.setItem(getProjectKey(project.projectId), JSON.stringify(project));
    
    // Update index
    const index = loadIndex();
    index.projectIds.push(project.projectId);
    saveIndex(index);
  } catch (e) {
    console.error('Failed to create project:', e);
  }
  
  return project;
}

export function updateProjectDraft(project: JasperProject): void {
  project.updatedAt = new Date().toISOString();
  debouncedSaveProject(project.projectId, project);
}

export function deleteProject(projectId: string): void {
  try {
    // Remove project
    localStorage.removeItem(getProjectKey(projectId));
    localStorage.removeItem(getVersionsKey(projectId));
    localStorage.removeItem(getRunsKey(projectId));
    localStorage.removeItem(getActionsKey(projectId));
    
    // Update index
    const index = loadIndex();
    index.projectIds = index.projectIds.filter(id => id !== projectId);
    saveIndex(index);
  } catch (e) {
    console.error(`Failed to delete project ${projectId}:`, e);
  }
}

// Version operations - OPTIMIZED: Only store metadata, not full snapshots
export function listVersions(projectId: string): ProjectVersion[] {
  try {
    const stored = localStorage.getItem(getVersionsKey(projectId));
    if (stored) {
      const versions = JSON.parse(stored) as ProjectVersion[];
      return versions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (e) {
    console.error(`Failed to list versions for ${projectId}:`, e);
  }
  return [];
}

export function createVersion(
  projectId: string,
  label: string,
  project: JasperProject
): ProjectVersion {
  const now = new Date().toISOString();
  const snapshotHash = stableHash(project);
  
  // OPTIMIZATION: Store only metadata, NOT the full snapshot
  // The current project state is always available via getProject()
  const version: ProjectVersion = {
    versionId: generateId('ver'),
    projectId,
    label,
    status: project.status,
    createdAt: now,
    snapshotJson: project, // Required by type, but we'll strip it when saving
    snapshotHash,
  };
  
  try {
    // Get existing versions
    let versions = listVersions(projectId);
    
    // Add new version
    versions.unshift(version);
    
    // LIMIT: Keep only last N versions to save space
    if (versions.length > MAX_VERSIONS_PER_PROJECT) {
      versions = versions.slice(0, MAX_VERSIONS_PER_PROJECT);
    }
    
    // Save versions (without full snapshots to save space)
    const lightVersions = versions.map(v => ({
      ...v,
      snapshotJson: null as any, // Strip full snapshot, keep only metadata
    }));
    localStorage.setItem(getVersionsKey(projectId), JSON.stringify(lightVersions));
    
    // Update project's latestVersionId
    const proj = getProject(projectId);
    if (proj) {
      proj.latestVersionId = version.versionId;
      localStorage.setItem(getProjectKey(projectId), JSON.stringify(proj));
    }
  } catch (e) {
    console.error('Failed to create version:', e);
  }
  
  return version;
}

export function getVersion(versionId: string): ProjectVersion | null {
  // Since we don't store full snapshots anymore, we can only return metadata
  // To get the actual project state, use the current project
  const index = loadIndex();
  
  for (const projectId of index.projectIds) {
    const versions = listVersions(projectId);
    const version = versions.find(v => v.versionId === versionId);
    if (version) {
      // If this is the latest version, return current project state
      const project = getProject(projectId);
      if (project && project.latestVersionId === versionId) {
        return {
          ...version,
          snapshotJson: project,
        };
      }
      return version;
    }
  }
  
  return null;
}

// Run operations
export function createRun(
  projectId: string,
  versionId: string,
  run: Omit<SimulationRun, 'runId' | 'projectId' | 'versionId' | 'createdAt'>
): SimulationRun {
  const now = new Date().toISOString();
  const simulationRun: SimulationRun = {
    ...run,
    runId: generateId('run'),
    projectId,
    versionId,
    createdAt: now,
  };
  
  try {
    let runs = listRuns(projectId);
    runs.unshift(simulationRun);
    
    // Limit runs per project to save space
    if (runs.length > 20) {
      runs = runs.slice(0, 20);
    }
    
    localStorage.setItem(getRunsKey(projectId), JSON.stringify(runs));
  } catch (e) {
    console.error('Failed to create run:', e);
  }
  
  return simulationRun;
}

export function listRuns(projectId: string): SimulationRun[] {
  try {
    const stored = localStorage.getItem(getRunsKey(projectId));
    if (stored) {
      const runs = JSON.parse(stored) as SimulationRun[];
      return runs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (e) {
    console.error(`Failed to list runs for ${projectId}:`, e);
  }
  return [];
}

export function getRun(runId: string): SimulationRun | null {
  const index = loadIndex();
  
  for (const projectId of index.projectIds) {
    const runs = listRuns(projectId);
    const run = runs.find(r => r.runId === runId);
    if (run) return run;
  }
  
  return null;
}

// Action log operations
export function appendAction(entry: ActionLogEntry): void {
  try {
    let actions = listActions(entry.projectId);
    actions.unshift(entry);
    
    // Limit actions per project to save space
    if (actions.length > 50) {
      actions = actions.slice(0, 50);
    }
    
    localStorage.setItem(getActionsKey(entry.projectId), JSON.stringify(actions));
  } catch (e) {
    console.error('Failed to append action:', e);
  }
}

export function listActions(projectId: string): ActionLogEntry[] {
  try {
    const stored = localStorage.getItem(getActionsKey(projectId));
    if (stored) {
      const actions = JSON.parse(stored) as ActionLogEntry[];
      return actions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (e) {
    console.error(`Failed to list actions for ${projectId}:`, e);
  }
  return [];
}

// Utility: Get storage size info
export function getStorageInfo(): { totalSize: number; breakdown: Record<string, number> } {
  let totalSize = 0;
  const breakdown: Record<string, number> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('jasper_')) {
      const value = localStorage.getItem(key);
      const size = value ? new Blob([value]).size : 0;
      totalSize += size;
      breakdown[key] = size;
    }
  }
  
  return { totalSize, breakdown };
}

// Migration: Convert old storage format to new split format
export function migrateFromLegacyStorage(): void {
  try {
    const oldData = localStorage.getItem('jasper_v1');
    if (!oldData) return; // Nothing to migrate
    
    const data = JSON.parse(oldData);
    console.log('Migrating legacy storage to optimized format...');
    
    // Migrate users
    if (data.users?.[0]) {
      setCurrentUser(data.users[0]);
    }
    
    // Migrate projects
    const index: ProjectIndex = { projectIds: [] };
    if (data.projects) {
      for (const project of data.projects) {
        localStorage.setItem(getProjectKey(project.projectId), JSON.stringify(project));
        index.projectIds.push(project.projectId);
      }
    }
    saveIndex(index);
    
    // Migrate versions (strip snapshots)
    if (data.versions) {
      const versionsByProject = new Map<string, ProjectVersion[]>();
      for (const version of data.versions) {
        if (!versionsByProject.has(version.projectId)) {
          versionsByProject.set(version.projectId, []);
        }
        versionsByProject.get(version.projectId)!.push({
          ...version,
          snapshotJson: null as any, // Strip snapshot
        });
      }
      
      for (const [projectId, versions] of versionsByProject) {
        // Keep only last N versions
        const limited = versions.slice(0, MAX_VERSIONS_PER_PROJECT);
        localStorage.setItem(getVersionsKey(projectId), JSON.stringify(limited));
      }
    }
    
    // Migrate runs
    if (data.runs) {
      const runsByProject = new Map<string, SimulationRun[]>();
      for (const run of data.runs) {
        if (!runsByProject.has(run.projectId)) {
          runsByProject.set(run.projectId, []);
        }
        runsByProject.get(run.projectId)!.push(run);
      }
      
      for (const [projectId, runs] of runsByProject) {
        localStorage.setItem(getRunsKey(projectId), JSON.stringify(runs.slice(0, 20)));
      }
    }
    
    // Migrate actions
    if (data.actions) {
      const actionsByProject = new Map<string, ActionLogEntry[]>();
      for (const action of data.actions) {
        if (!actionsByProject.has(action.projectId)) {
          actionsByProject.set(action.projectId, []);
        }
        actionsByProject.get(action.projectId)!.push(action);
      }
      
      for (const [projectId, actions] of actionsByProject) {
        localStorage.setItem(getActionsKey(projectId), JSON.stringify(actions.slice(0, 50)));
      }
    }
    
    // Remove old storage
    localStorage.removeItem('jasper_v1');
    console.log('Migration complete! Storage optimized.');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}

// Auto-run migration on first load
if (typeof window !== 'undefined' && localStorage.getItem('jasper_v1')) {
  migrateFromLegacyStorage();
}


