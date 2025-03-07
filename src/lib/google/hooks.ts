import { useState, useEffect } from 'react';
import { DriveFile, YouTubeChannel, YouTubeVideo } from './types';
import { GoogleDriveClient } from './drive';
import { YouTubeClient } from './youtube';
import { useAuth } from '../auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useGoogleAccount(platform: 'drive' | 'youtube') {
  const [account, setAccount] = useState<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const accountRef = doc(db, 'social_accounts', `${user.uid}_${platform}`);
    
    const unsubscribe = onSnapshot(accountRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setAccount({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt.toDate(),
        });
      } else {
        setAccount(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, platform]);

  return { account, loading };
}

export function useDriveFiles(params: {
  pageSize?: number;
  orderBy?: string;
  q?: string;
} = {}) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useGoogleAccount('drive');

  useEffect(() => {
    if (!account) {
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        const client = new GoogleDriveClient(account.accessToken);
        const response = await client.listFiles(params);
        setFiles(response.files);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [account, params]);

  return { files, loading, error };
}

export function useYouTubeChannel() {
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useGoogleAccount('youtube');

  useEffect(() => {
    if (!account) {
      setLoading(false);
      return;
    }

    const fetchChannel = async () => {
      try {
        const client = new YouTubeClient(account.accessToken);
        const channelData = await client.getChannel();
        setChannel(channelData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [account]);

  return { channel, loading, error };
}

export function useYouTubeVideos(params: {
  maxResults?: number;
  order?: 'date' | 'rating' | 'viewCount';
} = {}) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useGoogleAccount('youtube');

  useEffect(() => {
    if (!account) {
      setLoading(false);
      return;
    }

    const fetchVideos = async () => {
      try {
        const client = new YouTubeClient(account.accessToken);
        const response = await client.getVideos(params);
        setVideos(response.items);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [account, params]);

  return { videos, loading, error };
}