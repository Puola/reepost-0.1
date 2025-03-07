import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { GoogleAuthClient } from '@/lib/google/auth';
import { TikTokAuthClient } from '@/lib/tiktok/auth';
import { DropboxAuthClient } from '@/lib/dropbox/auth';
import { TwitterAuthClient } from '@/lib/twitter/auth';
import { OAUTH_CONFIG } from '@/lib/oauth-config';
import { OAuthError } from '@/lib/oauth-error';

export function OAuthCallback() {
  const navigate = useNavigate();
  const { platform } = useParams();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search.replace('#', '?'));
        const code = params.get('code');
        const state = params.get('state');
        const urlError = params.get('error');
        const errorDescription = params.get('error_description');

        // Verify state to prevent CSRF
        const savedState = sessionStorage.getItem('oauth_state');
        sessionStorage.removeItem('oauth_state');

        if (urlError) {
          setError(errorDescription || 'Une erreur est survenue');
          throw new OAuthError(
            errorDescription || 'Une erreur est survenue',
            urlError,
            platform || 'unknown'
          );
        }

        if (!code || !state || state !== savedState) {
          throw new OAuthError(
            'Paramètres de connexion invalides',
            'invalid_request',
            platform || 'unknown'
          );
        }

        if (!platform || !user || !OAUTH_CONFIG[platform]) {
          console.error('Invalid configuration:', { platform, user, config: !!OAUTH_CONFIG[platform] });
          throw new OAuthError(
            'Configuration invalide',
            'invalid_configuration',
            platform || 'unknown'
          );
        }

        // Handle platform-specific auth
        try {
          const authClient = await getAuthClient(platform, user.uid);
          
          // For Dropbox, we need to handle the fragment identifier
          if (platform === 'dropbox' && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const hashCode = hashParams.get('code');
            if (hashCode) {
              await authClient.handleCallback(hashCode);
            }
          } else {
            await authClient.handleCallback(code);
          }

          // Send success message and close window
          window.opener?.postMessage({ 
            type: 'oauth_success',
            platform 
          }, window.location.origin);
          window.close();

          // If window.opener is null, redirect to accounts page
          if (!window.opener) {
            navigate('/accounts');
          }
        } catch (err) { 
          console.error('Error in callback:', err);
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
          
          // Send error message and close window
          window.opener?.postMessage({ 
            type: 'oauth_error',
            error: err
          }, window.location.origin);
          window.close();

          // If window.opener is null, redirect to accounts page
          if (!window.opener) {
            navigate('/accounts');
          }
        }
      } catch (error) {
        // Only navigate if we're not in a popup
        if (!window.opener) {
          navigate('/accounts');
        }
      }
    };

    const getAuthClient = async (platform: string, userId: string) => {
      switch (platform) {
        case 'tiktok':
          return new TikTokAuthClient(userId);
        case 'youtube':
        case 'drive':
          return new GoogleAuthClient({
            clientId: OAUTH_CONFIG[platform].clientId,
            clientSecret: OAUTH_CONFIG[platform].clientSecret || '',
            redirectUri: OAUTH_CONFIG[platform].redirectUri,
            scope: OAUTH_CONFIG[platform].scope,
            platform: platform as 'youtube' | 'drive'
          }, userId);
        case 'dropbox':
          return new DropboxAuthClient(userId);
        case 'twitter':
          return new TwitterAuthClient(userId);
        default:
          throw new Error(`Platform ${platform} not supported`);
      }
    };

    handleCallback();
  }, [platform, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Connexion en cours...</p>
          </>
        )}
      </div>
    </div>
  );
}