import { apiService } from './api';
import { File } from '../types';
import { FileTreeNode, FileTreeNodeType, LoadingStatus } from '../store/repositoryStore';

export interface FileTreeResponse {
  files: File[];
  tree?: Record<string, any>; // Optional pre-built tree structure
}

export interface FileContentResponse {
  content: string;
  encoding: string;
  size: number;
  mime_type: string;
}

export interface FileBlameResponse {
  lines: Array<{
    line_number: number;
    content: string;
    author: string;
    timestamp: string;
    commit?: string;
  }>;
}

class RepositoryService {
  /**
   * Convert flat file list to normalized file tree structure
   */
  buildFileTree(files: File[]): Record<string, FileTreeNode> {
    const tree: Record<string, FileTreeNode> = {};

    // Helper to ensure a path exists in the tree
    const ensurePath = (path: string, type: FileTreeNodeType = 'folder'): void => {
      if (tree[path]) return;

      const parts = path.split('/').filter(Boolean);
      const name = parts[parts.length - 1] || path;
      const parent = parts.length > 1 ? parts.slice(0, -1).join('/') : null;

      tree[path] = {
        path,
        type,
        parent,
        children: [],
        name,
      };

      // Ensure parent exists
      if (parent) {
        ensurePath(parent, 'folder');
        if (!tree[parent].children.includes(path)) {
          tree[parent].children.push(path);
        }
      }
    };

    // Process each file
    files.forEach((file) => {
      // Use filename as path (or construct from storage_url if available)
      // For now, we'll use the filename directly
      // In a real implementation, you might need to parse storage_url
      const filePath = file.filename || file.original_filename;
      
      ensurePath(filePath, 'file');
      
      tree[filePath] = {
        ...tree[filePath],
        meta: {
          size: file.size_bytes,
          size_human: file.size_human,
          modified: file.uploaded_at,
          mime_type: file.mime_type,
          file_id: file.id,
        },
      };
    });

    return tree;
  }

  /**
   * Get file tree for a project
   */
  async getFileTree(projectId: number): Promise<Record<string, FileTreeNode>> {
    try {
      const response = await apiService.getProjectFiles(projectId);
      const files = response.files || [];
      return this.buildFileTree(files);
    } catch (error) {
      console.error('Failed to fetch file tree:', error);
      throw error;
    }
  }

  /**
   * Get file content
   */
  async getFileContent(projectId: number, filePath: string): Promise<FileContentResponse> {
    try {
      // First, find the file ID from the path
      const files = await apiService.getProjectFiles(projectId);
      const file = (files.files || []).find(
        (f) => f.filename === filePath || f.original_filename === filePath
      );

      if (!file) {
        throw new Error('File not found');
      }

      // Download file content
      const blob = await apiService.downloadFile(file.id);
      
      // Convert blob to text (for text files)
      const content = await blob.text();
      
      return {
        content,
        encoding: 'utf-8',
        size: blob.size,
        mime_type: file.mime_type,
      };
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      throw error;
    }
  }

  /**
   * Get file blame (attribution) - placeholder for future implementation
   */
  async getFileBlame(projectId: number, filePath: string): Promise<FileBlameResponse> {
    // TODO: Implement when backend supports it
    // This would require version tracking in the backend
    throw new Error('File blame not yet implemented');
  }

  /**
   * Get README content for a project
   */
  async getReadme(projectId: number): Promise<string | null> {
    try {
      const files = await apiService.getProjectFiles(projectId);
      const readmeFile = (files.files || []).find(
        (f) =>
          f.original_filename.toLowerCase() === 'readme.md' ||
          f.filename.toLowerCase() === 'readme.md'
      );

      if (!readmeFile) {
        return null;
      }

      const blob = await apiService.downloadFile(readmeFile.id);
      return await blob.text();
    } catch (error) {
      console.error('Failed to fetch README:', error);
      return null;
    }
  }
}

export const repositoryService = new RepositoryService();



