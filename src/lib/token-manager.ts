import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { GoogleAuthClient } from './google/auth';
import { OAUTH_CONFIG } from './oauth-config';
import { toast } from 'react-hot-toast';

// Refresh token 5 minutes before expiration
const REFRESH_BUFFER = 5 * 60 * 1000;

// Maximum number of retry attempts
const MAX_RETRIES = 3;

// Exponential backoff delay (in ms)
const BACKOFF_DELAY = 1000;

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export class TokenManager {
  private static refreshPromises: Map<string, Promise<TokenInfo>> = new Map();
  private static refreshTimers: Map<string, NodeJS.Timeout> = new Map();

  static async refreshGoogleToken(
    accountId: string,
    userId: string,
    platform: 'youtube' | 'drive',
    refreshToken: string,
    retryCount = 0
  ): Promise<TokenInfo> {
    // Check if a refresh is already in progress
    const existingPromise = this.refreshPromises.get(accountId);
    if (existingPromise) {
      return existingPromise;
    }

    const refreshPromise = (async () => {
      try {
        const config = OAUTH_CONFIG[platform];
        if (!config?.clientId || !config?.clientSecret) {
          throw new Error(`Invalid configuration for ${platform}`);
        }

        const googleAuth = new GoogleAuthClient({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: config.redirectUri,
          scope: config.scope,
          platform
        }, userId);

        // Validate current refresh token
        const isValid = await googleAuth.validateToken(refreshToken);
        if (!isValid) {
          throw new Error('refresh_token_invalid');
        }

        // Get new tokens
        const tokens = await googleAuth.refreshToken(refreshToken);
        if (!tokens?.access_token) {
          throw new Error('invalid_token_response');
        }

        // Validate new access token
        const isNewTokenValid = await googleAuth.validateToken(tokens.access_token);
        if (!isNewTokenValid) {
          throw new Error('new_token_invalid');
        }

        // Calculate new expiration
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        // Update tokens in Firestore
        const accountRef = doc(db, 'social_accounts', accountId);
        await updateDoc(accountRef, {
          accessToken: tokens.access_token,
          expiresAt
        });

        // Schedule next refresh
        this.scheduleRefresh(accountId, userId, platform, refreshToken, expiresAt);

        return {
          accessToken: tokens.access_token,
          refreshToken,
          expiresAt
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error refreshing ${platform} token:`, error);

        // Handle specific error cases
        if (errorMessage.includes('invalid_grant') || 
            errorMessage.includes('refresh_token_invalid') ||
            errorMessage.includes('Token has been expired or revoked')) {
          
          // Clear any existing refresh timer
          const timer = this.refreshTimers.get(accountId);
          if (timer) {
            clearTimeout(timer);
            this.refreshTimers.delete(accountId);
          }

          // Notify user to reconnect account
          toast.error(`Votre compte ${platform} a été déconnecté. Veuillez vous reconnecter.`);
          
          // Delete account from database
          const accountRef = doc(db, 'social_accounts', accountId);
          await updateDoc(accountRef, { 
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            isDisconnected: true
          });

          throw new Error('account_disconnected');
        }

        // Implement retry with exponential backoff
        if (retryCount < MAX_RETRIES) {
          const delay = BACKOFF_DELAY * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.refreshGoogleToken(accountId, userId, platform, refreshToken, retryCount + 1);
        }

        throw error;
      } finally {
        this.refreshPromises.delete(accountId);
      }
    })();

    this.refreshPromises.set(accountId, refreshPromise);
    return refreshPromise;
  }

  static scheduleRefresh(
    accountId: string,
    userId: string,
    platform: 'youtube' | 'drive',
    refreshToken: string,
    expiresAt: Date
  ) {
    // Clear any existing timer
    const existingTimer = this.refreshTimers.get(accountId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Calculate when to refresh (5 minutes before expiration)
    const refreshTime = expiresAt.getTime() - Date.now() - REFRESH_BUFFER;
    
    // Schedule refresh
    const timer = setTimeout(() => {
      this.refreshGoogleToken(accountId, userId, platform, refreshToken)
        .catch(error => console.error(`Failed to refresh token for ${platform}:`, error));
    }, Math.max(0, refreshTime));

    this.refreshTimers.set(accountId, timer);
  }

  static clearRefreshTimer(accountId: string) {
    const timer = this.refreshTimers.get(accountId);
    if (timer) {
      clearTimeout(timer);
      this.refreshTimers.delete(accountId);
    }
  }
}