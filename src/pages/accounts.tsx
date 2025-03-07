import { MoreHorizontal } from 'lucide-react';
import { SearchNotificationBar } from '@/components/layout/search-notification-bar';
import { ConnectAccountDialog } from '@/components/accounts/connect-account-dialog';
import { DisconnectAccountDialog } from '@/components/accounts/disconnect-account-dialog';
import { useState } from 'react';
import { useSocialAccounts } from '@/lib/social-accounts';
import type { SocialAccount } from '@/lib/social-accounts';
import { toast } from 'react-hot-toast';

interface SocialAccountProps {
  account: SocialAccount;
  onDisconnect: () => void;
}

function SocialAccount({ account, onDisconnect }: SocialAccountProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between py-2 px-4 rounded-full border border-gray-200">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 transition-all duration-300 hover:text-primary">
          <img
            src={`/icons/${account.platform}.svg`}
            alt={account.platform}
            className="w-5 h-5"
          />
          <span className="text-sm">@{account.username}</span>
        </div>
      </div>
      <div className="relative">
        <button 
          className="p-1 hover:bg-gray-100 rounded-full transition-all duration-300"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            <button
              onClick={() => {
                onDisconnect();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface PlatformCardProps {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'drive' | 'dropbox' | 'twitter' | 'snapchat';
  accounts: SocialAccount[];
  onConnect: (platform: PlatformCardProps['platform']) => void;
  onDisconnect: (accountId: string, platform: string, username: string) => void;
}

function PlatformCard({ platform, accounts, onConnect, onDisconnect }: PlatformCardProps) {
  const getPlatformConfig = (platform: string) => {
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

  const config = getPlatformConfig(platform);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border hover:border-primary/20">
      <div className={`${config.bgColor} ${config.textColor} p-4 flex justify-center items-center`}>
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
          className={`w-6 h-6 ${platform === 'snapchat' ? 'invert' : ''}`}
        />
      </div>
      <div className="p-4">
        <h3 className="text-center font-medium mb-4">{config.name}</h3>
        <div className="space-y-2">
          {accounts.map((account) => (
            <SocialAccount
              key={account.id}
              account={account}
              onDisconnect={() => onDisconnect(account.id!, platform, account.username)}
            />
          ))}
          <button
            onClick={() => onConnect(platform)}
            className="w-full py-2 px-4 rounded-full border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:text-gray-500 hover:border-gray-300 transition-all duration-300 hover:bg-gray-50 flex items-center justify-center"
          >
            <span className="text-xl mr-1">+</span> Ajouter un compte
          </button>
        </div>
      </div>
    </div>
  );
}

export function AccountsPage() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformCardProps['platform'] | null>(null);
  const [accountToDisconnect, setAccountToDisconnect] = useState<{
    id: string;
    platform: string;
    username: string;
  } | null>(null);
  const { accounts, loading } = useSocialAccounts();

  const handleConnect = (platform: PlatformCardProps['platform']) => {
    setSelectedPlatform(platform);
    setConnectDialogOpen(true);
  };

  const handleDisconnect = (accountId: string, platform: string, username: string) => {
    setAccountToDisconnect({ id: accountId, platform, username });
    setDisconnectDialogOpen(true);
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    const platform = account.platform as PlatformCardProps['platform'];
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(account);
    return acc;
  }, {} as Record<PlatformCardProps['platform'], SocialAccount[]>);

  if (loading) {
    return (
      <div className="pl-[310px] flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalAccounts = accounts.length;

  return (
    <div className="pl-[310px]">
      <div className="px-[75px] py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Comptes</h1>
            <p className="text-gray-500">{totalAccounts} comptes enregistrés</p>
          </div>
          <SearchNotificationBar />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {(['tiktok', 'youtube', 'instagram', 'facebook', 'linkedin', 'drive', 'dropbox', 'twitter', 'snapchat'] as const).map((platform) => (
            <PlatformCard
              key={platform}
              platform={platform}
              accounts={groupedAccounts[platform] || []}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </div>

      {selectedPlatform && (
        <ConnectAccountDialog
          isOpen={connectDialogOpen}
          platform={selectedPlatform}
          onClose={() => {
            setConnectDialogOpen(false);
            setSelectedPlatform(null);
          }}
        />
      )}

      {accountToDisconnect && (
        <DisconnectAccountDialog
          isOpen={disconnectDialogOpen}
          accountId={accountToDisconnect.id}
          platform={accountToDisconnect.platform}
          username={accountToDisconnect.username}
          onClose={() => {
            setDisconnectDialogOpen(false);
            setAccountToDisconnect(null);
          }}
          onDisconnected={() => {
            setDisconnectDialogOpen(false);
            setAccountToDisconnect(null);
          }}
        />
      )}
    </div>
  );
}