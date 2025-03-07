// This file is intentionally left empty as OAuth functionality has been removed
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { SocialAccount } from '@/lib/social-accounts';

function formatDisplayName(account: SocialAccount): string {
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
}

interface SocialAccountProps {
  account: SocialAccount;
  onDisconnect: () => void;
}

export function SocialAccount({ account, onDisconnect }: SocialAccountProps) {
  const [showMenu, setShowMenu] = useState(false);
  const displayName = formatDisplayName(account);

  return (
    <div className="flex items-center justify-between py-2 px-4 rounded-full border border-gray-200">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 transition-all duration-300 hover:text-primary">
          <img
            src={account.platform === 'drive' 
              ? 'https://img.icons8.com/ios_filled/512/FFFFFF/google-drive--v2.png'
              : account.platform === 'dropbox'
              ? 'https://companieslogo.com/img/orig/DBX.D-806154b5.png?t=1720244491'
              : account.platform === 'twitter'
              ? 'https://www.blog-fontainebleau.com/wp-content/uploads/2025/01/Twitter-X-White-Logo-PNG-copie-2.png'
              : account.platform === 'snapchat'
              ? 'https://static.vecteezy.com/system/resources/previews/023/986/916/non_2x/snapchat-logo-snapchat-logo-transparent-snapchat-icon-transparent-free-free-png.png'
              : `/icons/${account.platform}.svg`}
            alt={account.platform}
            className="w-5 h-5"
          />
          <span className="text-sm">{displayName}</span>
        </div>
      </div>
      <div className="relative">
      </div>
    </div>
  );
}