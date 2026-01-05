import {
  listProjects,
  getProject,
  createProject,
  updateProjectDraft,
  deleteProject,
  listVersions,
  createVersion,
  getVersion,
  listRuns,
  createRun,
  getRun,
  appendAction,
  listActions,
  getCurrentUser,
  setCurrentUser,
  getStorageInfo,
} from './storage';
import type {
  JasperProject,
  ProjectVersion,
  SimulationRun,
  ActionLogEntry,
  User,
} from '../core/schema';
import type { ThermoConfig, Component, FlowsheetGraph, SpecSet, ConstraintSet, Objective, EconomicConfig, ProjectStatus } from '../core/schema';

// Promise-based API for TanStack Query
export const api = {
  // User
  getCurrentUser: (): Promise<User | null> => Promise.resolve(getCurrentUser()),
  setCurrentUser: (user: User): Promise<void> => {
    setCurrentUser(user);
    return Promise.resolve();
  },

  // Projects
  listProjects: (): Promise<JasperProject[]> => Promise.resolve(listProjects()),
  getProject: (projectId: string): Promise<JasperProject | null> =>
    Promise.resolve(getProject(projectId)),
  createProject: (template: {
    name: string;
    thermodynamics: ThermoConfig;
    components: Component[];
    flowsheet: FlowsheetGraph;
    specs: SpecSet;
    constraints: ConstraintSet;
    objective: Objective;
    economics?: EconomicConfig;
    status?: ProjectStatus;
  }): Promise<JasperProject> => Promise.resolve(createProject(template)),
  updateProjectDraft: (project: JasperProject): Promise<void> => {
    updateProjectDraft(project);
    return Promise.resolve();
  },
  deleteProject: (projectId: string): Promise<void> => {
    deleteProject(projectId);
    return Promise.resolve();
  },

  // Versions
  listVersions: (projectId: string): Promise<ProjectVersion[]> =>
    Promise.resolve(listVersions(projectId)),
  createVersion: (projectId: string, label: string, project: JasperProject): Promise<ProjectVersion> =>
    Promise.resolve(createVersion(projectId, label, project)),
  getVersion: (versionId: string): Promise<ProjectVersion | null> =>
    Promise.resolve(getVersion(versionId)),

  // Runs
  listRuns: (projectId: string): Promise<SimulationRun[]> =>
    Promise.resolve(listRuns(projectId)),
  createRun: (
    projectId: string,
    versionId: string,
    run: Omit<SimulationRun, 'runId' | 'projectId' | 'versionId' | 'createdAt'>
  ): Promise<SimulationRun> => Promise.resolve(createRun(projectId, versionId, run)),
  getRun: (runId: string): Promise<SimulationRun | null> => Promise.resolve(getRun(runId)),

  // Actions
  listActions: (projectId: string): Promise<ActionLogEntry[]> =>
    Promise.resolve(listActions(projectId)),
  appendAction: (entry: ActionLogEntry): Promise<void> => {
    appendAction(entry);
    return Promise.resolve();
  },

  // Storage utilities
  getStorageInfo: () => Promise.resolve(getStorageInfo()),
};

