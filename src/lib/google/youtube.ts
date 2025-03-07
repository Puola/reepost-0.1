import { YouTubeChannel, YouTubeVideo } from './types';

export class YouTubeClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getChannel(): Promise<YouTubeChannel> {
    const response = await this.fetchWithAuth('channels', {
      params: {
        part: 'snippet,statistics',
        mine: 'true',
      },
    });

    const channel = response.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnails: channel.snippet.thumbnails,
      statistics: channel.statistics,
    };
  }

  async getVideos(params: {
    maxResults?: number;
    pageToken?: string;
    order?: 'date' | 'rating' | 'viewCount';
  } = {}): Promise<{
    items: YouTubeVideo[];
    nextPageToken?: string;
  }> {
    const searchParams = new URLSearchParams({
      part: 'snippet,statistics,status',
      maxResults: (params.maxResults || 50).toString(),
      ...(params.pageToken && { pageToken: params.pageToken }),
      ...(params.order && { order: params.order }),
      mine: 'true',
    });

    const response = await this.fetchWithAuth(`videos?${searchParams.toString()}`);

    return {
      items: response.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        status: item.status,
        statistics: item.statistics,
      })),
      nextPageToken: response.nextPageToken,
    };
  }

  async uploadVideo(params: {
    file: Blob;
    title: string;
    description: string;
    privacyStatus: 'private' | 'unlisted' | 'public';
    publishAt?: string;
    onProgress?: (progress: number) => void;
  }): Promise<YouTubeVideo> {
    const metadata = {
      snippet: {
        title: params.title,
        description: params.description,
      },
      status: {
        privacyStatus: params.privacyStatus,
        ...(params.publishAt && { publishAt: params.publishAt }),
      },
    };

    // Create upload session
    const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': params.file.type,
        'X-Upload-Content-Length': params.file.size.toString(),
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

    // Upload the file in chunks
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const fileSize = params.file.size;
    let uploaded = 0;

    while (uploaded < fileSize) {
      const chunk = params.file.slice(uploaded, Math.min(uploaded + CHUNK_SIZE, fileSize));
      const uploadResponse = await fetch(location, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes ${uploaded}-${uploaded + chunk.size - 1}/${fileSize}`,
        },
        body: chunk,
      });

      if (!uploadResponse.ok && uploadResponse.status !== 308) {
        throw new Error('Upload failed');
      }

      uploaded += chunk.size;
      params.onProgress?.(Math.round((uploaded / fileSize) * 100));

      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        const result = await uploadResponse.json();
        return {
          id: result.id,
          title: result.snippet.title,
          description: result.snippet.description,
          thumbnails: result.snippet.thumbnails,
          status: result.status,
        };
      }
    }

    throw new Error('Upload failed to complete');
  }

  async updateVideo(videoId: string, params: {
    title?: string;
    description?: string;
    privacyStatus?: 'private' | 'unlisted' | 'public';
    publishAt?: string;
  }): Promise<YouTubeVideo> {
    const body: any = {
      id: videoId,
      snippet: {},
      status: {},
    };

    if (params.title) body.snippet.title = params.title;
    if (params.description) body.snippet.description = params.description;
    if (params.privacyStatus) body.status.privacyStatus = params.privacyStatus;
    if (params.publishAt) body.status.publishAt = params.publishAt;

    const response = await this.fetchWithAuth('videos', {
      method: 'PUT',
      body: JSON.stringify(body),
      params: {
        part: 'snippet,status',
      },
    });

    return {
      id: response.id,
      title: response.snippet.title,
      description: response.snippet.description,
      thumbnails: response.snippet.thumbnails,
      status: response.status,
    };
  }

  async deleteVideo(videoId: string): Promise<void> {
    await this.fetchWithAuth(`videos?id=${videoId}`, {
      method: 'DELETE',
    });
  }
}