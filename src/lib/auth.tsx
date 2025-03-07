import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { createSession } from './sessions';

export async function updateUserProfilePicture(userId: string) {
  const userRef = doc(db, 'users', userId);
  const newAvatar = generateRandomAnimalAvatar();
  await updateDoc(userRef, {
    profilePicture: newAvatar
  });
  return newAvatar;
}
const ANIMAL_TYPES = [
  'bear', 'cat', 'dog', 'fox', 'frog', 'koala', 'panda', 'rabbit', 'tiger', 'wolf'
];

function generateRandomAnimalAvatar(): string {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${Math.random().toString(36).substring(7)}&backgroundColor=ffdfbf,ffd5dc,c0aede,bde4f4,b7e4c7`;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  stripeCustomerId?: string;
  birthDate?: string;
  phone?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  vatNumber?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userData: UserData | null;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userData: null,
  refreshUserData: async () => {}
});

const protectedRoutes = ['/dashboard', '/workflows', '/templates', '/accounts', '/referral', '/notifications', '/help', '/settings'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Save current page when it changes
  useEffect(() => {
    if (protectedRoutes.includes(location.pathname)) {
      localStorage.setItem('lastPath', location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          // Create a new session
          await createSession(user.uid);

          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }

          // If on a public route (login/signup) and we have a last page saved
          if (['/login', '/signup', '/'].includes(location.pathname)) {
            const lastPath = localStorage.getItem('lastPath');
            if (lastPath) {
              navigate(lastPath, { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUserData(null);
        // Only redirect to login if on a protected route
        if (protectedRoutes.includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  // Restore last page on initial load
  useEffect(() => {
    if (!loading && user && protectedRoutes.includes(location.pathname)) {
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath && lastPath !== location.pathname) {
        navigate(lastPath, { replace: true });
      }
    }
  }, [loading, user, location.pathname, navigate]);

  const contextValue: AuthContextType = {
    user,
    loading,
    userData,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function createUserProfile(userId: string, data: UserData) {
  const profilePicture = generateRandomAnimalAvatar();

  // Initialize user data with empty stripeCustomerId
  const userData = {
    ...data,
    profilePicture,
    stripeCustomerId: null,
    subscription: {
      status: 'free',
      plan: 'free',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
    },
    subscriptionPlan: {
      currentPlan: 'free',
      startDate: new Date(),
      lastModified: new Date(),
      planHistory: [{
        plan: 'free',
        startDate: new Date(),
        endDate: null
      }]
    },
    createdAt: new Date()
  };

  // Initialize subscription plan data
  const subscriptionPlan = {
    currentPlan: 'free',
    startDate: new Date(),
    lastModified: new Date(),
    planHistory: [{
      plan: 'free',
      startDate: new Date(),
      endDate: null
    }]
  };

  // Create the user document
  await setDoc(doc(db, 'users', userId), userData);

  return profilePicture;
}