import { Section } from './section';

import { Toggle } from '../ui/toggle';
import { useNotificationSettings } from '@/lib/notifications';

export function NotificationsSection() {
  const { settings, loading, updateSettings } = useNotificationSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Section title="Notifications par email">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications de publication</h4>
              <p className="text-sm text-gray-500 mt-1">Recevez un email lorsqu'une publication est effectuée</p>
            </div>
            <Toggle
              defaultChecked={settings?.emailNotifications}
              onChange={(checked) => updateSettings({ emailNotifications: checked })}
              label="Notifications de publication"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications d'erreur</h4>
              <p className="text-sm text-gray-500 mt-1">Recevez un email en cas d'erreur lors d'une publication</p>
            </div>
            <Toggle
              defaultChecked={settings?.errorNotifications}
              onChange={(checked) => updateSettings({ errorNotifications: checked })}
              label="Notifications d'erreur"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Newsletter</h4>
              <p className="text-sm text-gray-500 mt-1">Recevez nos actualités et nos conseils pour optimiser vos publications</p>
            </div>
            <Toggle
              defaultChecked={settings?.newsletter}
              onChange={(checked) => updateSettings({ newsletter: checked })}
              label="Newsletter"
            />
          </div>
        </div>
      </Section>

      <Section title="Notifications push">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications sur le bureau</h4>
              <p className="text-sm text-gray-500 mt-1">Recevez des notifications sur votre ordinateur</p>
            </div>
            <Toggle
              defaultChecked={settings?.desktopNotifications}
              onChange={(checked) => updateSettings({ desktopNotifications: checked })}
              label="Notifications sur le bureau"
            />
          </div>
        </div>
      </Section>
    </>
  );
}