import { PlatformIcon } from '../platform-icon';
import { ChevronDown } from 'lucide-react';
import { useSocialAccounts } from '@/lib/social-accounts';
import { useState, useEffect, useRef } from 'react';

interface AccountDropdownProps {
  platform: string;
  accounts: any[];
  selectedAccount: string | null;
  onSelect: (accountId: string) => void;
}

function AccountDropdown({ platform, accounts, selectedAccount, onSelect }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedAccountData, setSelectedAccountData] = useState<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const account = accounts.find(account => account.id === selectedAccount);
    if (account) {
      setSelectedAccountData(account);
    }
  }, [selectedAccount, accounts]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between h-[42px] px-4 border border-black rounded-lg"
      >
        <div className="flex items-center gap-3">
          <PlatformIcon platform={platform} size="md" />
          <span className="text-xs font-medium whitespace-nowrap">
            {selectedAccountData ? `@${selectedAccountData.username}` : ''}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="fixed z-[100] bg-white rounded-lg border border-gray-200 shadow-lg"
          style={{
            top: dropdownRef.current?.getBoundingClientRect().bottom ?? 0 + 8,
            left: dropdownRef.current?.getBoundingClientRect().left ?? 0,
            minWidth: dropdownRef.current?.offsetWidth ?? 0
          }}
        >
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => {
                onSelect(account.id!);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-xs whitespace-nowrap"
            >
              <PlatformIcon platform={platform} size="md" />
              <span className="font-medium">@{account.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface DestinationStepProps {
  selectedSource: string | null;
  selectedSourceAccount: string | null;
  selectedDestinations: string[];
  selectedDestinationAccounts: Record<string, string>;
  onDestinationsChange: (destinations: string[]) => void;
  onDestinationAccountsChange: (accounts: Record<string, string>) => void;
}

export function DestinationStep({
  selectedSource,
  selectedSourceAccount,
  selectedDestinations,
  selectedDestinationAccounts,
  onDestinationsChange,
  onDestinationAccountsChange
}: DestinationStepProps) {
  const { accounts, loading } = useSocialAccounts();

  // Auto-select first account when platform is selected
  useEffect(() => {
    selectedDestinations.forEach(platformId => {
      if (!selectedDestinationAccounts[platformId]) {
        const platformAccounts = accountsByPlatform[platformId] || [];
        const availableAccounts = platformAccounts.filter(account => account.id !== selectedSourceAccount);
        if (availableAccounts.length > 0) {
          handleAccountSelect(platformId, availableAccounts[0].id!);
        }
      }
    });
  }, [selectedDestinations]);

  // Filtrer les comptes disponibles en excluant uniquement le compte source spécifique
  const availableAccounts = accounts.filter(account => 
    account.id !== selectedSourceAccount
  );

  // Grouper les comptes par plateforme
  const accountsByPlatform = availableAccounts.reduce((acc, account) => {
    if (!acc[account.platform]) {
      acc[account.platform] = [];
    }
    acc[account.platform].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: '/icons/tiktok.svg' },
    { id: 'youtube', name: 'YouTube', icon: '/icons/youtube.svg' },
    { id: 'instagram', name: 'Instagram', icon: '/icons/instagram.svg' },
    { id: 'facebook', name: 'Facebook', icon: '/icons/facebook.svg' },
    { id: 'linkedin', name: 'LinkedIn', icon: '/icons/linkedin.svg' },
    { id: 'drive', name: 'Google Drive', icon: 'https://img.icons8.com/ios_filled/512/FFFFFF/google-drive--v2.png' },
    { id: 'dropbox', name: 'Dropbox', icon: 'https://companieslogo.com/img/orig/DBX.D-806154b5.png?t=1720244491' },
    { id: 'twitter', name: 'X / Twitter', icon: 'https://www.blog-fontainebleau.com/wp-content/uploads/2025/01/Twitter-X-White-Logo-PNG-copie-2.png' },
    { id: 'snapchat', name: 'Snapchat', icon: 'https://static.vecteezy.com/system/resources/previews/023/986/916/non_2x/snapchat-logo-snapchat-logo-transparent-snapchat-icon-transparent-free-free-png.png' },
    { id: 'empty', name: 'Empty', icon: '' }
  ];

  // Filtrer les plateformes disponibles
  const availablePlatforms = platforms.filter(platform =>
    // Récupérer les comptes disponibles pour cette plateforme
    accountsByPlatform[platform.id]?.length > 0 && (
      // Si c'est la plateforme source, elle doit avoir plus d'un compte
      platform.id === selectedSource 
        ? accountsByPlatform[platform.id].length > 1
        : true
    )
  );

  const handleDestinationToggle = (platformId: string) => {
    const newDestinations = selectedDestinations.includes(platformId)
      ? selectedDestinations.filter(id => id !== platformId)
      : [...selectedDestinations, platformId];
    
    // Si on désélectionne une plateforme, on supprime aussi son compte sélectionné
    if (!newDestinations.includes(platformId)) {
      const { [platformId]: _, ...rest } = selectedDestinationAccounts;
      onDestinationAccountsChange(rest);
    }
    
    onDestinationsChange(
      newDestinations
    );
  };

  const handleAccountSelect = (platformId: string, accountId: string) => {
    onDestinationAccountsChange({
      ...selectedDestinationAccounts,
      [platformId]: accountId
    });
  };

  const formatAccountName = (account: typeof accounts[0]) => {
    switch (account.platform) {
      case 'drive':
      case 'dropbox':
        return account.email || account.displayName || '';
      case 'facebook':
      case 'linkedin':
        return account.displayName || account.username;
      default:
        return `@${account.username}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (availablePlatforms.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune destination disponible
        </h3>
        <p className="text-gray-500 mb-6">
          Connectez d'abord vos comptes de réseaux sociaux dans la section "Comptes"
        </p>
        <a 
          href="/accounts" 
          className="text-primary hover:text-primary/90 font-medium"
        >
          Gérer mes comptes
        </a>
      </div>
    );
  }

  return (
    <div className="w-fit mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-sm font-medium mb-4">Sélectionnez les destinations</h3>
        <div className="flex gap-[10px] flex-wrap justify-center">
          {[...availablePlatforms, ...Array(Math.max(0, 10 - availablePlatforms.length))].map((platform, index) => {
            if (platform) {
              const platformAccounts = accountsByPlatform[platform.id] || [];
              // Désactiver si pas de comptes ou si c'est la source avec un seul compte
              const isDisabled = platformAccounts.length === 0 || 
                (platform.id === selectedSource && platformAccounts.length === 1);
              
              return (
              <button
                key={platform.id}
                onClick={() => handleDestinationToggle(platform.id)}
                disabled={isDisabled}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors relative ${
                  selectedDestinations.includes(platform.id)
                    ? 'bg-primary/5' 
                    : isDisabled
                    ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {platform.id && <PlatformIcon platform={platform.id} />}
                {platformAccounts.length > 1 && !isDisabled && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {platformAccounts.length}
                  </span>
                )}
              </button>
              );
            }
            
            return (
              <div
                key={`empty-${index}`}
                className="w-12 h-12 rounded-lg bg-[#F0F4F9]"
              />
            );
          })}
        </div>
      </div>

      {selectedDestinations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-4 text-center">Sélectionnez les comptes</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {selectedDestinations.map(platformId => {
              const platformAccounts = accountsByPlatform[platformId] || [];
              
              return (
                <AccountDropdown
                  key={platformId}
                  platform={platformId}
                  accounts={platformAccounts.filter(account => account.id !== selectedSourceAccount)}
                  selectedAccount={selectedDestinationAccounts[platformId]}
                  onSelect={(accountId) => handleAccountSelect(platformId, accountId)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}