import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Layout,
  Users,
  UserPlus,
  HelpCircle,
  Settings,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth'; 
import { useSubscription } from '@/lib/stripe';
import './subscription-button.css';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  soon?: boolean;
}

const mainNavigation: NavigationItem[] = [
  { name: 'Tableau de bord', href: '/dashboard', icon: Home },
  { name: 'Workflows', href: '/workflows', icon: Layout, badge: 2 },
  { name: 'Templates', href: '/templates', icon: Layout, soon: true },
  { name: 'Comptes', href: '/accounts', icon: Users, badge: 1 },
  { name: 'Parrainage', href: '/referral', icon: UserPlus },
];

const bottomNavigation: NavigationItem[] = [
  { name: 'Aide & Ressources', href: '/help', icon: HelpCircle },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { userData } = useAuth();
  const { subscription } = useSubscription();
  const hasPaidPlan = subscription?.status === 'active';
  
  const renderNavItem = (item: NavigationItem) => {
    const Component = item.soon ? 'div' : Link;
    return (
      <Component
        key={item.name}
        to={item.href}
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-lg relative',
          location.pathname === item.href
            ? 'bg-primary text-white'
            : item.soon
            ? 'text-gray-400 cursor-default'
            : 'text-gray-700 hover:bg-gray-50',
        )}
      >
        <item.icon className="mr-3 h-5 w-5" />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className={cn(
            'ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            location.pathname === item.href
              ? 'bg-white text-primary'
              : 'bg-primary text-white'
          )}>
            {item.badge}
          </span>
        )}
        {item.soon && (
          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-200 text-gray-600">
            Soon
          </span>
        )}
      </Component>
    );
  };

  return (
    <div className="w-[310px] bg-white border-r h-screen fixed left-0 top-0">
      <div className="p-4 h-full flex flex-col">
        <Link to="/" className="flex items-center space-x-2 mb-8">
          <img 
            src="https://res.cloudinary.com/ddamgg8us/image/upload/v1740517648/Logo_Repost_xtlhqi.png"
            alt="Reepost"
            className="h-6 w-6"
          />
          <span className="text-xl font-bold">Reepost</span>
        </Link>

        <div className="mb-8">
          <Link 
            to="/settings?tab=profile" 
            className="flex items-center space-x-3 px-2 py-3 rounded-lg hover:bg-gray-50"
          >
            <div className="h-10 w-10 rounded-full bg-gray-50 overflow-hidden">
              <img
                src={userData?.profilePicture}
                alt="Profile"
                className="h-full w-full"
              />
            </div>
            <div>
              <div className="font-medium">
                {userData ? `${userData.firstName} ${userData.lastName}` : 'Chargement...'}
              </div>
              <div className="text-sm text-gray-500">
                {userData?.email || ''}
              </div>
            </div>
          </Link>
        </div>

        <nav className="space-y-1 flex-1">
          {mainNavigation.map(renderNavItem)}
        </nav>

        <div className="space-y-1">
          <div className="h-px bg-gray-200 my-4" />
          {bottomNavigation.map(renderNavItem)}
          <Link
            to="/settings?tab=subscription"
            className={cn(
              "subscription-button flex items-center px-3 py-2 text-sm font-medium rounded-lg mt-4 relative",
              hasPaidPlan 
                ? "bg-primary text-white" 
                : "bg-gray-50 text-gray-700"
            )}
          >
            <Crown className="mr-3 h-5 w-5 text-primary" />
            <span>{hasPaidPlan ? 'Abonnement premium' : 'Activer abonnement'}</span>
            {!hasPaidPlan && <div className="neon-border" />}
          </Link>
        </div>
      </div>
    </div>
  );
}