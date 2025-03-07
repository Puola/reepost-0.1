import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { SearchNotificationBar } from '@/components/layout/search-notification-bar';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { ProfileSection } from '@/components/settings/profile-section';
import { SecuritySection } from '@/components/settings/security-section';
import { TeamSection } from '@/components/settings/team-section';
import { NotificationsSection } from '@/components/settings/notifications-section';
import { SubscriptionSection } from '@/components/settings/subscription-section';

interface TabProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

function Tab({ label, isActive, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-black text-white' 
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

export function SettingsPage() {
  const { userData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'profile';
  const navigate = useNavigate();

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Mon profil' },
    { id: 'security', label: 'Sécurité' },
    { id: 'team', label: 'Équipe' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'subscription', label: 'Abonnement' },
  ];

  return (
    <div className="pl-[310px]">
      <div className="px-[75px] py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Paramètres</h1>
            <p className="text-gray-500">Détails de votre compte</p>
          </div>
          <SearchNotificationBar showSearch={false} />
        </div>

        <div className="flex space-x-2 mb-8">
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}
        </div>

        {activeTab === 'profile' && (
          <>
            <ProfileSection />
            <button
              onClick={handleLogout}
              className="mt-8 flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </>
        )}

        {activeTab === 'security' && <SecuritySection />}
        {activeTab === 'team' && <TeamSection />}
        {activeTab === 'notifications' && <NotificationsSection />}
        {activeTab === 'subscription' && <SubscriptionSection />}
      </div>
    </div>
  );
}