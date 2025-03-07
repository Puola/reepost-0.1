interface PlatformIconProps {
  platform: string;
  size?: 'md' | 'lg';
}

const shakeAnimation = `
  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-4deg); }
    75% { transform: rotate(4deg); }
  }
`;

export function PlatformIcon({ platform, size = 'md' }: PlatformIconProps) {
  const getIconClass = () => {
    const baseClass = 'rounded-lg flex items-center justify-center';
    const sizeClass = size === 'lg' ? 'w-12 h-12' : 'w-[48px] h-[48px]';
    
    switch (platform) {
      case 'tiktok':
        return `${baseClass} ${sizeClass} bg-black hover:animate-[shake_0.5s_ease-in-out]`;
      case 'youtube':
        return `${baseClass} ${sizeClass} bg-red-600 hover:animate-[shake_0.5s_ease-in-out]`;
      case 'instagram':
        return `${baseClass} ${sizeClass} bg-pink-500 hover:animate-[shake_0.5s_ease-in-out]`;
      case 'facebook':
        return `${baseClass} ${sizeClass} bg-blue-600 hover:animate-[shake_0.5s_ease-in-out]`;
      case 'linkedin':
        return `${baseClass} ${sizeClass} bg-blue-700 hover:animate-[shake_0.5s_ease-in-out]`;
      case 'drive':
        return `${baseClass} ${sizeClass} bg-yellow-500 hover:animate-[shake_0.5s_ease-in-out]`;
      default:
        return `${baseClass} ${sizeClass} bg-gray-200 hover:animate-[shake_0.5s_ease-in-out]`;
    }
  };

  return (
    <>
      <style>{shakeAnimation}</style>
      <div className={getIconClass()}>
      <img
        src={platform === 'drive' 
          ? 'https://img.icons8.com/ios_filled/512/FFFFFF/google-drive--v2.png'
          : platform === 'dropbox'
          ? 'https://companieslogo.com/img/orig/DBX.D-806154b5.png?t=1720244491'
          : platform === 'twitter'
          ? 'https://www.blog-fontainebleau.com/wp-content/uploads/2025/01/Twitter-X-White-Logo-PNG-copie-2.png'
          : platform === 'snapchat'
          ? 'https://pngimg.com/d/snapchat_PNG37.png'
          : `/icons/${platform}.svg`}
        alt={platform}
        className="w-6 h-6"
      />
      </div>
    </>
  );
}