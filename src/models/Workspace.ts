/**
 * Workspace configuration for isolated client environments
 */
export interface Workspace {
  name: string;
  prefix: string;
  active: boolean;
}

/**
 * Workspace manager for handling isolated Whiteglove client spaces
 */
export class WorkspaceManager {
  private workspaces: Map<string, Workspace> = new Map();

  constructor(workspacesConfig?: Record<string, string>) {
    if (workspacesConfig) {
      Object.entries(workspacesConfig).forEach(([name, prefix]) => {
        this.addWorkspace(name, prefix);
      });
    }
  }

  /**
   * Add a new workspace
   */
  addWorkspace(name: string, prefix: string): void {
    this.workspaces.set(name, {
      name,
      prefix: prefix.toLowerCase(),
      active: true,
    });
  }

  /**
   * Get workspace by name
   */
  getWorkspace(name: string): Workspace | undefined {
    return this.workspaces.get(name);
  }

  /**
   * Determine workspace from email subject or sender
   */
  identifyWorkspace(subject: string, sender: string): string {
    const searchText = `${subject} ${sender}`.toLowerCase();
    
    for (const [name, workspace] of this.workspaces.entries()) {
      if (searchText.includes(workspace.prefix)) {
        return name;
      }
    }
    
    return 'default';
  }

  /**
   * Get all active workspaces
   */
  getActiveWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values()).filter(w => w.active);
  }

  /**
   * List all workspace names
   */
  listWorkspaceNames(): string[] {
    return Array.from(this.workspaces.keys());
  }
}
