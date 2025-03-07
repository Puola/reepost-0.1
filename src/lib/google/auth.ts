import { GoogleAuthConfig } from './types';
import { OAUTH_CONFIG } from '../oauth-config';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { connectSocialAccount } from '../social-accounts';

export class GoogleAuthClient {
  private config: GoogleAuthConfig;
  private userId: string;

  async handleCallback(code: string): Promise<void> {
    try {
      // Exchange code for tokens
      const tokens = await this.getTokens(code);
      
      // Get user profile info
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await userInfoResponse.json();

      // Connect social account
      await connectSocialAccount({
        userId: this.userId,
        platform: this.config.platform,
        username: userInfo.name || userInfo.email,
        email: userInfo.email,
        displayName: userInfo.name,
        profilePicture: userInfo.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      });

    } catch (error) {
      console.error('Error handling Google callback:', error);
      throw error;
    }
  }

  constructor(config: GoogleAuthConfig, userId: string) {
    this.config = config;
    this.userId = userId;
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
      access_type: 'offline',
      state: state,
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get tokens');
    }

    return response.json();
  }

  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return response.json();
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.aud === this.config.clientId;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  async revokeToken(token: string): Promise<void> {
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to revoke token');
    }
  }
}