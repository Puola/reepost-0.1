import { connectSocialAccount } from '../social-accounts';
import { OAUTH_CONFIG } from '../oauth-config';

export class DropboxAuthClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private userId: string;

  constructor(userId: string) {
    const config = OAUTH_CONFIG.dropbox;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret || '';
    this.redirectUri = config.redirectUri;
    this.userId = userId;
  }

  async getAccessToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const basicAuth = btoa(`${this.clientId}:${this.clientSecret}`);

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get access token: ${error.error_description || 'Unknown error'}`);
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<{
    email: string;
    name: { display_name: string; familiar_name: string };
    profile_photo_url?: string;
  }> {
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get user info: ${error.error_summary || 'Unknown error'}`);
    }

    return response.json();
  }

  async handleCallback(code: string): Promise<void> {
    try {
      // Exchange code for tokens
      const tokens = await this.getAccessToken(code);
      
      // Get user info
      const userInfo = await this.getUserInfo(tokens.access_token);

      // Connect social account
      await connectSocialAccount({
        userId: this.userId,
        platform: 'dropbox',
        username: userInfo.name.familiar_name,
        email: userInfo.email,
        displayName: userInfo.name.display_name,
        profilePicture: userInfo.profile_photo_url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expires_in || 14400) * 1000) // Default to 4 hours if not provided
      });

    } catch (error) {
      console.error('Error handling Dropbox callback:', error);
      throw error;
    }
  }
}