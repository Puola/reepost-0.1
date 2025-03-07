import { db } from './firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useAuth } from './auth';

export interface NotificationSettings {
  emailNotifications: boolean;
  errorNotifications: boolean;
  newsletter: boolean;
  desktopNotifications: boolean;
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSettings({
            emailNotifications: data.emailNotifications ?? true,
            errorNotifications: data.errorNotifications ?? true,
            newsletter: data.newsletter ?? false,
            desktopNotifications: data.desktopNotifications ?? true
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notification settings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  };

  return { settings, loading, updateSettings };
}