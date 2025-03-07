import { createPortal } from 'react-dom';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { GoogleAuthClient } from '@/lib/google/auth';
import { OAUTH_CONFIG } from '@/lib/oauth-config';
import { handleOAuthError, OAuthError } from '@/lib/oauth-error';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/auth';

interface ConnectAccountDialogProps {
  isOpen: boolean;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'drive' | 'dropbox' | 'twitter' | 'snapchat';
  onClose: () => void;
}

export function ConnectAccountDialog({ isOpen, platform, onClose }: ConnectAccountDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  if (!isOpen) return null;

  const getPlatformConfig = () => {
    const configs = {
      tiktok: {
        name: 'TikTok',
        bgColor: 'bg-black',
        textColor: 'text-white'
      },
      instagram: {
        name: 'Instagram',
        bgColor: 'bg-[#E1306C]',
        textColor: 'text-white'
      },
      youtube: {
        name: 'YouTube',
        bgColor: 'bg-[#FF0000]',
        textColor: 'text-white'
      },
      facebook: {
        name: 'Facebook',
        bgColor: 'bg-[#1877F2]',
        textColor: 'text-white'
      },
      linkedin: {
        name: 'LinkedIn',
        bgColor: 'bg-[#0A66C2]',
        textColor: 'text-white'
      },
      drive: {
        name: 'Google Drive',
        bgColor: 'bg-[#FBBC04]',
        textColor: 'text-black'
      },
      dropbox: {
        name: 'Dropbox',
        bgColor: 'bg-[#0061FF]',
        textColor: 'text-white'
      },
      twitter: {
        name: 'X / Twitter',
        bgColor: 'bg-black',
        textColor: 'text-white'
      },
      snapchat: {
        name: 'Snapchat',
        bgColor: 'bg-[#FFFC00]',
        textColor: 'text-black'
      }
    };
    return configs[platform as keyof typeof configs];
  };

  const config = getPlatformConfig();
  const oauthConfig = OAUTH_CONFIG[platform];

  // Create cleanup function outside the main handler
  const cleanup = (
    popup: Window | null,
    messageHandler?: (e: MessageEvent) => void,
    popupChecker?: NodeJS.Timeout
  ) => {
    if (messageHandler) {
      window.removeEventListener('message', messageHandler);
    }
    if (popupChecker) {
      clearInterval(popupChecker);
    }
    if (popup && !popup.closed) {
      popup.close();
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    
    let popup: Window | null = null;
    let messageHandler: ((e: MessageEvent) => void) | undefined;
    let popupChecker: NodeJS.Timeout | undefined;
    
    try {
      setIsConnecting(true);
      setError(null);

      if (!oauthConfig) {
        throw new Error('Cette plateforme n\'est pas encore disponible');
      }
      
      if (!oauthConfig.clientId) {
        throw new OAuthError(
          'La configuration de cette plateforme est incomplète. Veuillez contacter le support.',
          'invalid_configuration',
          platform
        );
      }

      // Generate random state for CSRF protection
      const state = Math.random().toString(36).substring(7);
      sessionStorage.setItem('oauth_state', state);

      // Set popup window dimensions and position
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const windowFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=1,toolbar=1,location=1`;

      // Handle platform-specific auth
      let authUrl = '';
      if (platform === 'youtube' || platform === 'drive') {
        const googleAuth = new GoogleAuthClient({
          clientId: oauthConfig.clientId,
          clientSecret: oauthConfig.clientSecret || '',
          redirectUri: oauthConfig.redirectUri,
          scope: oauthConfig.scope,
          platform: platform as 'youtube' | 'drive'
        }, user.uid);

        authUrl = googleAuth.getAuthUrl(state);
      } else {
        // Base parameters
        const baseParams = {
          ...(platform === 'dropbox' ? { client_id: oauthConfig.clientId } : {}),
          redirect_uri: oauthConfig.redirectUri,
          response_type: oauthConfig.responseType || 'code',
          scope: oauthConfig.scope.join(' '),
          state: state
        };

        // Special handling for Dropbox
        if (platform === 'dropbox') {
          baseParams.token_access_type = 'offline';
          baseParams.force_reapprove = 'true';
        }

        // Add platform-specific extra parameters
        const params = new URLSearchParams({
          ...baseParams,
          ...(oauthConfig.extraParams || {})
        });
        
        authUrl = `${oauthConfig.authUrl}?${params.toString()}`;
      }

      // Open popup directly with auth URL
      popup = window.open(authUrl, 'oauth_popup', windowFeatures);

      if (!popup) {
        throw new OAuthError('Le popup a été bloqué. Veuillez autoriser les popups pour ce site.', 'popup_error', platform);
      }

      // Focus the popup
      popup.focus();

      return new Promise((resolve, reject) => {
        // Listen for OAuth callback message
        messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (!event.data || typeof event.data !== 'object') return;

          if (event.data.type === 'oauth_success') {
            resolve(undefined);
          } else if (event.data.type === 'oauth_error') {
            reject(event.data.error);
          }
        };

        // Check if popup was closed
        popupChecker = setInterval(() => {
          if (popup?.closed) {
            cleanup(popup, messageHandler, popupChecker);
            reject(new OAuthError('La fenêtre de connexion a été fermée.', 'popup_closed_by_user', platform));
          }
        }, 1000);

        // Add message listener
        window.addEventListener('message', messageHandler);
      });

    } catch (err) {
      const errorMessage = handleOAuthError(err, platform);
      setError(errorMessage);
      throw err;
    }
  };

  const handleConnectClick = async () => {
    try {
      await handleConnect();
      toast.success(`Compte ${config.name} connecté avec succès !`);
      onClose();
    } catch (err) {
      const errorMessage = handleOAuthError(err, platform);
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md">
        <div className={`${config.bgColor} ${config.textColor} p-6 rounded-t-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={platform === 'drive' 
                  ? 'https://img.icons8.com/ios_filled/512/FFFFFF/google-drive--v2.png'
                  : platform === 'dropbox'
                  ? 'https://companieslogo.com/img/orig/DBX.D-806154b5.png?t=1720244491'
                  : platform === 'twitter'
                  ? 'https://www.blog-fontainebleau.com/wp-content/uploads/2025/01/Twitter-X-White-Logo-PNG-copie-2.png'
                  : platform === 'snapchat'
                  ? 'https://static.vecteezy.com/system/resources/previews/023/986/916/non_2x/snapchat-logo-snapchat-logo-transparent-snapchat-icon-transparent-free-free-png.png'
                  : `/icons/${platform}.svg`}
                alt={platform}
                className="w-8 h-8"
              />
              <h2 className="text-xl font-semibold">
                Connecter un compte {config.name}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              En connectant votre compte, vous autorisez Reepost à :
              <ul className="mt-2 space-y-2">
                {(platform === 'drive' || platform === 'dropbox') ? (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Accéder à vos fichiers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Importer des vidéos
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Accéder à vos vidéos
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Publier du contenu en votre nom
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Voir vos statistiques basiques
                    </li>
                  </>
                )}
              </ul>
            </div>

            <button
              onClick={handleConnectClick}
              disabled={isConnecting}
              className={`w-full py-2 rounded-lg ${config.bgColor} ${config.textColor} font-medium flex items-center justify-center gap-2`}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>Connecter avec {config.name}</>
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              En continuant, vous acceptez les{' '}
              <a href="#" className="text-primary hover:underline">conditions d'utilisation</a>
              {' '}de {config.name}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}