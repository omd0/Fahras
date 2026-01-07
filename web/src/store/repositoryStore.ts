import { create } from 'zustand';
import { File } from '@/types';

// File tree node types
export type FileTreeNodeType = 'file' | 'folder';

export type LoadingStatus = 'unloaded' | 'loading' | 'loaded' | 'error';

export interface FileTreeNode {
  path: string;
  type: FileTreeNodeType;
  parent: string | null;
  children: string[]; // Array of child paths
  name: string;
  meta?: {
    size?: number;
    size_human?: string;
    modified?: string;
    mime_type?: string;
    file_id?: number;
  };
  loadingStatus?: LoadingStatus; // For folders only
}

export interface RepositoryState {
  // Normalized file tree: path -> node
  fileTree: Record<string, FileTreeNode>;
  
  // UI state: expanded folder paths (stored as array for serialization)
  expandedPaths: string[];
  
  // Currently selected file path
  selectedFilePath: string | null;
  
  // Current project ID
  projectId: number | null;
  
  // Breadcrumb navigation
  breadcrumbs: string[];
  
  // Tab state persistence (keyed by tab name)
  tabState: Record<string, any>;
}

export interface RepositoryActions {
  // File tree operations
  setFileTree: (tree: Record<string, FileTreeNode>) => void;
  addFileNode: (node: FileTreeNode) => void;
  updateFileNode: (path: string, updates: Partial<FileTreeNode>) => void;
  removeFileNode: (path: string) => void;
  
  // Expansion operations
  toggleExpand: (path: string) => void;
  expandPath: (path: string) => void;
  collapsePath: (path: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  
  // Selection operations
  selectFile: (path: string | null) => void;
  
  // Project operations
  setProject: (projectId: number) => void;
  clearProject: () => void;
  
  // Breadcrumb operations
  setBreadcrumbs: (breadcrumbs: string[]) => void;
  
  // Tab state operations
  setTabState: (tabName: string, state: any) => void;
  getTabState: (tabName: string) => any;
  clearTabState: (tabName: string) => void;
  
  // Utility operations
  getVisibleItems: () => string[]; // Returns array of visible paths in order
  getChildren: (path: string) => FileTreeNode[];
  findNode: (path: string) => FileTreeNode | undefined;
  
  // Reset operations
  reset: () => void;
}

type RepositoryStore = RepositoryState & RepositoryActions;

const initialState: RepositoryState = {
  fileTree: {},
  expandedPaths: [],
  selectedFilePath: null,
  projectId: null,
  breadcrumbs: [],
  tabState: {},
};

export const useRepositoryStore = create<RepositoryStore>((set, get) => ({
  ...initialState,

  // File tree operations
  setFileTree: (tree) => set({ fileTree: tree }),

  addFileNode: (node) =>
    set((state) => ({
      fileTree: { ...state.fileTree, [node.path]: node },
    })),

  updateFileNode: (path, updates) =>
    set((state) => {
      const node = state.fileTree[path];
      if (!node) return state;
      return {
        fileTree: {
          ...state.fileTree,
          [path]: { ...node, ...updates },
        },
      };
    }),

  removeFileNode: (path) =>
    set((state) => {
      const { [path]: removed, ...rest } = state.fileTree;
      return { fileTree: rest };
    }),

  // Expansion operations
  toggleExpand: (path) =>
    set((state) => {
      const newExpanded = new Set(state.expandedPaths);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return { expandedPaths: newExpanded };
    }),

  expandPath: (path) =>
    set((state) => {
      const newExpanded = new Set(state.expandedPaths);
      newExpanded.add(path);
      return { expandedPaths: newExpanded };
    }),

  collapsePath: (path) =>
    set((state) => {
      const newExpanded = new Set(state.expandedPaths);
      newExpanded.delete(path);
      return { expandedPaths: newExpanded };
    }),

  expandAll: () =>
    set((state) => {
      const newExpanded = new Set(state.expandedPaths);
      Object.values(state.fileTree).forEach((node) => {
        if (node.type === 'folder') {
          newExpanded.add(node.path);
        }
      });
      return { expandedPaths: newExpanded };
    }),

  collapseAll: () => set({ expandedPaths: new Set() }),

  // Selection operations
  selectFile: (path) => set({ selectedFilePath: path }),

  // Project operations
  setProject: (projectId) => set({ projectId }),

  clearProject: () =>
    set({
      projectId: null,
      fileTree: {},
      expandedPaths: [],
      selectedFilePath: null,
      breadcrumbs: [],
    }),

  // Breadcrumb operations
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

  // Tab state operations
  setTabState: (tabName, state) =>
    set((current) => ({
      tabState: { ...current.tabState, [tabName]: state },
    })),

  getTabState: (tabName) => {
    const state = get();
    return state.tabState[tabName] || null;
  },

  clearTabState: (tabName) =>
    set((state) => {
      const { [tabName]: removed, ...rest } = state.tabState;
      return { tabState: rest };
    }),

  // Utility operations
  getVisibleItems: () => {
    const state = get();
    const visible: string[] = [];

    const traverse = (path: string) => {
      const node = state.fileTree[path];
      if (!node) return;

      visible.push(path);

      if (node.type === 'folder' && state.expandedPaths.includes(path)) {
        node.children.forEach((childPath) => traverse(childPath));
      }
    };

    // Start from root-level items (nodes with no parent or parent is null)
    Object.values(state.fileTree).forEach((node) => {
      if (!node.parent) {
        traverse(node.path);
      }
    });

    return visible;
  },

  getChildren: (path) => {
    const state = get();
    const node = state.fileTree[path];
    if (!node || node.type !== 'folder') return [];

    return node.children
      .map((childPath) => state.fileTree[childPath])
      .filter((child) => child !== undefined)
      .sort((a, b) => {
        // Folders first, then files, both alphabetically
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  },

  findNode: (path) => {
    const state = get();
    return state.fileTree[path];
  },

  // Reset operations
  reset: () => set(initialState),
}));

