import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { toast } from 'react-hot-toast';

export interface Session {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  location: {
    city: string;
    country: string;
  };
  lastActive: Date;
  createdAt: Date;
  isCurrentDevice: boolean;
}

// Get browser and device info
function getDeviceInfo() {
  const ua = navigator.userAgent;
  const browser = ua.match(/(chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)?.[1] || '';
  const device = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'Mobile' : 'Desktop';
  const os = /Windows|Mac|Linux|Android|iOS/i.exec(ua)?.[0] || '';
  
  return {
    browser,
    deviceName: `${os} - ${device}`
  };
}

// Create a new session
export async function createSession(userId: string) {
  const { browser, deviceName } = getDeviceInfo();
  
  // Check for existing sessions with same device info
  const sessionsRef = collection(db, 'sessions');
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    where('deviceName', '==', deviceName)
  );
  
  const snapshot = await getDocs(q);
  
  // If session exists, update it instead of creating new one
  if (!snapshot.empty) {
    const existingSession = snapshot.docs[0];
    await updateDoc(existingSession.ref, {
      lastActive: new Date(),
      isCurrentDevice: true
    });
    return existingSession.id;
  }

  // Create new session if none exists
  const sessionData = {
    userId,
    deviceName,
    browser,
    location: {
      city: 'Paris',
      country: 'France'
    },
    lastActive: new Date(),
    createdAt: new Date(),
    isCurrentDevice: true
  };

  const docRef = await addDoc(collection(db, 'sessions'), sessionData);
  return docRef.id;
}

// Update session's last active timestamp
export async function updateSessionActivity(sessionId: string) {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    lastActive: new Date()
  });
}

// Revoke a specific session
export async function revokeSession(sessionId: string) {
  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
    toast.success('Session révoquée avec succès');
  } catch (error) {
    console.error('Error revoking session:', error);
    toast.error('Erreur lors de la révocation de la session');
  }
}

// Revoke all sessions except current
export async function revokeAllSessions(userId: string, currentSessionId: string) {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef, 
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs
      .filter(doc => doc.id !== currentSessionId)
      .map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
    toast.success('Toutes les autres sessions ont été révoquées');
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    toast.error('Erreur lors de la révocation des sessions');
  }
}

// Hook to manage sessions
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Map and sort sessions by lastActive date (most recent first)
      const sessionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActive: doc.data().lastActive?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime()) as Session[];

      // Group sessions by device name and location
      const sessionGroups = sessionsList.reduce((groups, session) => {
        const key = `${session.deviceName}-${session.location.city}-${session.location.country}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(session);
        return groups;
      }, {} as Record<string, Session[]>);

      // Keep only the most recent session from each group
      const uniqueSessions = Object.values(sessionGroups).map(group => {
        const [mostRecent, ...duplicates] = group;
        
        // Delete duplicate sessions in background
        duplicates.forEach(async (session) => {
          try {
            await deleteDoc(doc(db, 'sessions', session.id));
          } catch (error) {
            console.error('Error deleting duplicate session:', error);
          }
        });

        return mostRecent;
      });

      setSessions(uniqueSessions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { sessions, loading };
}