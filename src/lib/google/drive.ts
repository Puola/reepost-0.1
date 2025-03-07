import { DriveFile, DriveListResponse } from './types';

export class GoogleDriveClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://www.googleapis.com/drive/v3/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.statusText}`);
    }

    return response.json();
  }

  async listFiles(params: {
    pageSize?: number;
    pageToken?: string;
    orderBy?: string;
    q?: string;
  } = {}): Promise<DriveListResponse> {
    const searchParams = new URLSearchParams({
      pageSize: (params.pageSize || 100).toString(),
      ...(params.pageToken && { pageToken: params.pageToken }),
      ...(params.orderBy && { orderBy: params.orderBy }),
      ...(params.q && { q: params.q }),
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,thumbnailLink,webViewLink,parents),nextPageToken'
    });

    return this.fetchWithAuth(`files?${searchParams.toString()}`);
  }

  async getFile(fileId: string): Promise<DriveFile> {
    return this.fetchWithAuth(`files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,thumbnailLink,webViewLink,parents`);
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response.blob();
  }

  async createUploadSession(metadata: {
    name: string;
    mimeType: string;
    parents?: string[];
  }): Promise<string> {
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to create upload session');
    }

    const location = response.headers.get('Location');
    if (!location) {
      throw new Error('No upload URL received');
    }

    return location;
  }

  async uploadFile(uploadUrl: string, file: Blob, onProgress?: (progress: number) => void): Promise<DriveFile> {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const fileSize = file.size;
    let uploaded = 0;

    while (uploaded < fileSize) {
      const chunk = file.slice(uploaded, Math.min(uploaded + CHUNK_SIZE, fileSize));
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes ${uploaded}-${uploaded + chunk.size - 1}/${fileSize}`,
        },
        body: chunk,
      });

      if (!response.ok && response.status !== 308) {
        throw new Error('Upload failed');
      }

      uploaded += chunk.size;
      onProgress?.(Math.round((uploaded / fileSize) * 100));

      if (response.status === 200 || response.status === 201) {
        return response.json();
      }
    }

    throw new Error('Upload failed to complete');
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.fetchWithAuth(`files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async watchChanges(channelId: string, address: string): Promise<void> {
    await this.fetchWithAuth('changes/watch', {
      method: 'POST',
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address,
      }),
    });
  }
}