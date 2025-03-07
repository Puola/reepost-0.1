import { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, RefreshCcw, Link as LinkIcon, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NotificationType = 'success' | 'warning' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    case 'error':
      return <XCircle className="w-6 h-6 text-red-500" />;
    case 'info':
      return <Bell className="w-6 h-6 text-blue-500" />;
  }
}

function NotificationCard({ notification }: { notification: Notification }) {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  return (
    <div className={`p-4 rounded-xl border ${notification.read ? 'bg-white' : 'bg-primary/5 border-primary/10'}`}>
      <div className="flex items-start gap-4">
        <NotificationIcon type={notification.type} />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-gray-900">{notification.title}</h3>
              <p className="text-gray-600 mt-1">{notification.message}</p>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {formatTimestamp(notification.timestamp)}
            </span>
          </div>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-3 text-sm font-medium text-primary hover:text-primary/90"
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Publication réussie',
      message: 'Votre vidéo "Comment gagner du temps avec Reepost" a été publiée avec succès sur YouTube et Instagram.',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      action: {
        label: 'Voir les statistiques',
        onClick: () => console.log('View stats')
      }
    },
    {
      id: '2',
      type: 'error',
      title: 'Échec de la publication',
      message: 'La publication sur Facebook a échoué en raison d\'une erreur d\'authentification.',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
      action: {
        label: 'Réessayer',
        onClick: () => console.log('Retry')
      }
    },
    {
      id: '3',
      type: 'warning',
      title: 'Compte Instagram déconnecté',
      message: 'Votre compte Instagram n\'est plus connecté. Veuillez vous reconnecter pour continuer les publications automatiques.',
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: true,
      action: {
        label: 'Reconnecter',
        onClick: () => console.log('Reconnect')
      }
    },
    {
      id: '4',
      type: 'info',
      title: 'Nouvelle fonctionnalité disponible',
      message: 'Découvrez notre nouvelle fonctionnalité de planification avancée pour vos publications.',
      timestamp: new Date(Date.now() - 24 * 3600000),
      read: true,
      action: {
        label: 'En savoir plus',
        onClick: () => console.log('Learn more')
      }
    }
  ]);

  const filters = [
    { value: 'all', label: 'Toutes', icon: Bell },
    { value: 'success', label: 'Succès', icon: CheckCircle },
    { value: 'warning', label: 'Avertissements', icon: AlertTriangle },
    { value: 'error', label: 'Erreurs', icon: XCircle },
    { value: 'info', label: 'Informations', icon: Bell }
  ];

  const filteredNotifications = notifications.filter(
    notification => filter === 'all' || notification.type === filter
  );

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    success: notifications.filter(n => n.type === 'success').length,
    error: notifications.filter(n => n.type === 'error').length,
    warning: notifications.filter(n => n.type === 'warning').length
  };

  return (
    <div className="pl-[310px]">
      <div className="px-[75px] py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Notifications</h1>
          <p className="text-gray-500">{stats.unread} notifications non lues</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Succès</p>
                <p className="text-xl font-semibold">{stats.success}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avertissements</p>
                <p className="text-xl font-semibold">{stats.warning}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Erreurs</p>
                <p className="text-xl font-semibold">{stats.error}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {filters.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={filter === value ? 'default' : 'outline'}
                onClick={() => setFilter(value as NotificationType | 'all')}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Derniers 7 jours
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    </div>
  );
}