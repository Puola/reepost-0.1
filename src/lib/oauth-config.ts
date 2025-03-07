interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  isAvailable: boolean;
  responseType?: string;
  extraParams?: Record<string, string>;
}

const BASE_URL = window.location.origin;

const CLIENT_IDS = {
  tiktok: 'sbawbz2o1d6jy29dto',
  youtube: '516558558056-bn5fa7saonr1lr8no3nvecpb0ccdor9t.apps.googleusercontent.com',
  instagram: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
  facebook: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
  linkedin: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
  drive: '516558558056-bn5fa7saonr1lr8no3nvecpb0ccdor9t.apps.googleusercontent.com',
  dropbox: '3c024c1pnqtja3s',
  snapchat: import.meta.env.VITE_SNAPCHAT_CLIENT_ID || '',
  twitter: '2CZJmDtbwieom46s1xMYoWXmY'
};

const CLIENT_SECRETS = {
  tiktok: 'eZZ0vBQBwrbEayLaqzcMYkmHhMwKNPgs',
  youtube: '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',
  drive: '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',
  dropbox: 'jj7xrhl0tfq53s0',
  twitter: 'drMGF71Igt10fod1z8wNN5GEwi92su9FkhUNfv6NFuFcIVvXN0'
};

export const OAUTH_CONFIG: Record<string, OAuthConfig> = {
  tiktok: {
    clientId: CLIENT_IDS.tiktok,
    clientSecret: CLIENT_SECRETS.tiktok,
    redirectUri: `${BASE_URL}/auth/callback/tiktok`,
    scope: [
      'user.info.basic',
      'video.list',
      'video.upload',
      'video.publish',
      'user.info.profile'
    ],
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktok.com/v2/oauth/token/',
    isAvailable: true,
    extraParams: {
      response_type: 'code',
      client_key: CLIENT_IDS.tiktok
    }
  },
  youtube: {
    clientId: CLIENT_IDS.youtube,
    clientSecret: CLIENT_SECRETS.youtube,
    redirectUri: `${BASE_URL}/auth/callback/youtube`,
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    isAvailable: true,
    responseType: 'code',
    extraParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  },
  instagram: {
    clientId: CLIENT_IDS.instagram,
    redirectUri: `${BASE_URL}/auth/callback/instagram`,
    scope: ['user_profile', 'user_media'],
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    isAvailable: process.env.NODE_ENV === 'development'
  },
  facebook: {
    clientId: CLIENT_IDS.facebook,
    redirectUri: `${BASE_URL}/auth/callback/facebook`,
    scope: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    isAvailable: process.env.NODE_ENV === 'development'
  },
  linkedin: {
    clientId: CLIENT_IDS.linkedin,
    redirectUri: `${BASE_URL}/auth/callback/linkedin`,
    scope: ['r_liteprofile', 'w_member_social'],
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    isAvailable: process.env.NODE_ENV === 'development'
  },
  drive: {
    clientId: CLIENT_IDS.drive,
    clientSecret: CLIENT_SECRETS.drive,
    redirectUri: `${BASE_URL}/auth/callback/drive`,
    scope: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    isAvailable: true
  },
  dropbox: {
    clientId: CLIENT_IDS.dropbox,
    clientSecret: CLIENT_SECRETS.dropbox,
    redirectUri: `${BASE_URL}/auth/callback/dropbox`,
    scope: [
      'files.content.read',
      'files.metadata.read',
      'account_info.read'
    ],
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropbox.com/oauth2/token',
    isAvailable: true,
    extraParams: {
      response_type: 'code',
      token_access_type: 'offline',
      force_reapprove: 'true'
    }
  },
  snapchat: {
    clientId: CLIENT_IDS.snapchat,
    redirectUri: `${BASE_URL}/auth/callback/snapchat`,
    scope: [
      'snapchat-content.upload',
      'snapchat-profile.read'
    ],
    authUrl: 'https://accounts.snapchat.com/login/oauth2/authorize',
    tokenUrl: 'https://accounts.snapchat.com/login/oauth2/access_token',
    isAvailable: process.env.NODE_ENV === 'development'
  },
  twitter: {
    clientId: CLIENT_IDS.twitter,
    clientSecret: CLIENT_SECRETS.twitter,
    redirectUri: `${BASE_URL}/auth/callback/twitter`,
    scope: [
      'tweet.read',
      'tweet.write',
      'users.read',
      'offline.access'
    ],
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    isAvailable: true,
    responseType: 'code',
    extraParams: {
      code_challenge_method: 'S256',
      code_challenge: 'challenge', // This should be dynamically generated
    }
  }
};