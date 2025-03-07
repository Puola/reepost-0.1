import { PlatformIcon } from '../platform-icon';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSocialAccounts, type SocialAccount } from '@/lib/social-accounts';

interface SourceStepProps {
  selectedSource: string | null;
  selectedAccount: string | null;
  onSourceSelect: (source: string) => void;
  onAccountSelect: (accountId: string) => void;
}

interface AccountDropdownProps {
  platform: string;
  accounts: any[];
  selectedAccount: string | null;
  onSelect: (accountId: string) => void;
}

function AccountDropdown({ platform, accounts, selectedAccount, onSelect }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedAccountData, setSelectedAccountData] = useState<SocialAccount | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select first account by default
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      onSelect(accounts[0].id!);
      setSelectedAccountData(accounts[0]);
    }
  }, [accounts, selectedAccount, onSelect]);

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

export function SourceStep({
  selectedSource,
  selectedAccount,
  onSourceSelect,
  onAccountSelect
}: SourceStepProps) {
  const { accounts, loading } = useSocialAccounts();

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

  // Filter platforms to only show those with connected accounts
  const availablePlatforms = platforms.filter(platform => 
    accounts.some(account => account.platform === platform.id)
  );

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
          Aucun compte connecté
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
      <div>
        <h3 className="text-sm font-medium mb-4 text-center">Sélectionnez la source</h3>
        <div className="flex gap-[10px] flex-wrap justify-center">
          {[...availablePlatforms, ...Array(Math.max(0, 10 - availablePlatforms.length))].map((platform, index) => (
            platform ? (
            <button
              key={platform.id || `empty-${index}`}
              onClick={() => {
                if (!platform.id) return;
                onSourceSelect(platform.id);
                onAccountSelect(null); // Reset selected account when changing platform
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                platform.id && selectedSource === platform.id
                  ? 'bg-primary/5'
                  : platform.id ? 'bg-gray-100 hover:bg-gray-200' : 'bg-[#F0F4F9]'
              }`}
            >
              {platform.id && <PlatformIcon platform={platform.id} />}
            </button>
            ) : (
              <div
                key={`empty-${index}`}
                className="w-12 h-12 rounded-lg bg-[#F0F4F9]"
              />
            )
          ))}
        </div>
      </div>

      {selectedSource && (
        <div className="mt-8">
          <h3 className="text-sm font-medium mb-4 text-left">
            Sélectionnez le compte {platforms.find(p => p.id === selectedSource)?.name || ''}
          </h3>
          <AccountDropdown
            platform={selectedSource}
            accounts={accounts.filter(account => account.platform === selectedSource)}
            selectedAccount={selectedAccount}
            onSelect={onAccountSelect}
          />
        </div>
      )}
    </div>
  );
}