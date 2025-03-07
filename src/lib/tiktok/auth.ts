import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { connectSocialAccount } from '../social-accounts';
import { OAUTH_CONFIG } from '../oauth-config';

export class TikTokAuthClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private userId: string;

  constructor(userId: string) {
    const config = OAUTH_CONFIG.tiktok;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret || '';
    this.redirectUri = config.redirectUri;
    this.userId = userId;
  }

  async getAccessToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    open_id: string;
    scope: string;
  }> {
    const response = await fetch('https://open.tiktok.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get access token: ${error.message || error.error_description || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getUserInfo(accessToken: string, openId: string): Promise<{
    username: string;
    display_name: string;
    avatar_url: string;
  }> {
    const response = await fetch(`https://open.tiktok.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get user info: ${error.message || error.error_description || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data;
  }

  async handleCallback(code: string): Promise<void> {
    try {
      // Exchange code for tokens
      const tokens = await this.getAccessToken(code);
      
      // Get user info
      const userInfo = await this.getUserInfo(tokens.access_token, tokens.open_id);

      // Connect social account
      await connectSocialAccount({
        userId: this.userId,
        platform: 'tiktok',
        username: userInfo.username,
        displayName: userInfo.display_name,
        profilePicture: userInfo.avatar_url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      });

    } catch (error) {
      console.error('Error handling TikTok callback:', error);
      throw error;
    }
  }
}