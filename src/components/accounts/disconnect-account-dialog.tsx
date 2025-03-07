import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { disconnectSocialAccount } from '@/lib/social-accounts';
import { toast } from 'react-hot-toast';

interface DisconnectAccountDialogProps {
  isOpen: boolean;
  accountId: string;
  platform: string;
  username: string;
  onClose: () => void;
  onDisconnected: () => void;
}

export function DisconnectAccountDialog({
  isOpen,
  accountId,
  platform,
  username,
  onClose,
  onDisconnected
}: DisconnectAccountDialogProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus the cancel button when dialog opens
      initialFocusRef.current?.focus();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setError(null);

    try {
      await disconnectSocialAccount(accountId);
      toast.success(`Compte ${platform} déconnecté avec succès`);
      onDisconnected();
    } catch (err) {
      console.error('Error disconnecting account:', err);
      setError('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-labelledby="disconnect-dialog-title"
      aria-describedby="disconnect-dialog-description"
    >
      <div 
        className="fixed inset-0 bg-black/50" 
        aria-hidden="true"
      />
      <div 
        ref={dialogRef}
        className="relative bg-white rounded-xl w-full max-w-md p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 
              id="disconnect-dialog-title" 
              className="text-xl font-semibold"
            >
              Déconnecter le compte
            </h2>
            <p className="text-gray-500">@{username}</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div 
              className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}

          <p 
            id="disconnect-dialog-description"
            className="text-gray-600"
          >
            Êtes-vous sûr de vouloir déconnecter ce compte {platform} ? Cette action :
          </p>

          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Arrêtera toutes les publications automatiques
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Supprimera l'accès à vos statistiques
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Nécessitera une nouvelle connexion pour utiliser ce compte
            </li>
          </ul>

          <div className="flex gap-3 mt-6">
            <button
              ref={initialFocusRef}
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              aria-busy={isDisconnecting}
            >
              {isDisconnecting ? 'Déconnexion...' : 'Déconnecter'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}