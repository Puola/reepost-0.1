import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { connectSocialAccount } from '../social-accounts';
import { OAUTH_CONFIG } from '../oauth-config';

export class TwitterAuthClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private userId: string;

  constructor(userId: string) {
    const config = OAUTH_CONFIG.twitter;
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
    
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code_verifier: 'verifier', // This should match the challenge
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get access token: ${error.error_description || 'Unknown error'}`);
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<{
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  }> {
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get user info: ${error.error_description || 'Unknown error'}`);
    }

    return response.json().then(res => res.data);
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
        platform: 'twitter',
        username: userInfo.username,
        displayName: userInfo.name,
        profilePicture: userInfo.profile_image_url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      });

    } catch (error) {
      console.error('Error handling Twitter callback:', error);
      throw error;
    }
  }
}