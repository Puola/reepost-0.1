import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { TokenManager } from './token-manager';
import { toast } from 'react-hot-toast';

export interface SocialAccount {
  id?: string;
  userId: string;
  platform: string;
  username: string;
  displayName?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  profilePicture?: string;
  email?: string;
  stats?: {
    followers: number;
    posts: number;
  };
  createdAt: Date;
}

// Secure token handling
const encryptToken = (token: string) => token; // TODO: Implement encryption
const decryptToken = (token: string) => token; // TODO: Implement decryption

export async function connectSocialAccount(accountData: Omit<SocialAccount, 'id' | 'createdAt'>) {
  try {
    const encryptedAccessToken = encryptToken(accountData.accessToken);
    const encryptedRefreshToken = encryptToken(accountData.refreshToken);

    // Check for existing account with same platform and identifiers
    const accountsRef = collection(db, 'social_accounts');
    let existingAccountQuery;
    
    // Build query based on available identifiers
    if (accountData.email) {
      // If email is available, check for accounts with same email and platform
      existingAccountQuery = query(
        accountsRef,
        where('userId', '==', accountData.userId),
        where('platform', '==', accountData.platform),
        where('email', '==', accountData.email)
      );
    } else {
      // Otherwise check for accounts with same username and platform
      existingAccountQuery = query(
        accountsRef,
        where('userId', '==', accountData.userId),
        where('platform', '==', accountData.platform),
        where('username', '==', accountData.username)
      );
    }

    const existingAccounts = await getDocs(existingAccountQuery);
    if (!existingAccounts.empty) {
      const identifier = accountData.email || accountData.username;
      throw new Error(`Ce compte ${accountData.platform} (@${identifier}) est déjà connecté à votre profil. Pour des raisons de sécurité et éviter les conflits de publication, vous ne pouvez pas connecter plusieurs fois le même compte.`);
    }

    // Validate required fields
    const requiredFields = ['userId', 'platform', 'username', 'accessToken', 'refreshToken', 'expiresAt'];
    const missingFields = requiredFields.filter(field => !accountData[field as keyof typeof accountData]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Additional validation for Dropbox
    if (accountData.platform === 'dropbox' && !accountData.refreshToken) {
      throw new Error('Refresh token required for Dropbox');
    }

    // Prepare account data with ID
    const accountDoc = {
      ...accountData,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      createdAt: new Date(),
      displayName: accountData.displayName || accountData.username,
      email: accountData.email || '',
      profilePicture: accountData.profilePicture || ''
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'social_accounts'), accountDoc);
    
    return docRef.id;
  } catch (error) {
    console.error('Error connecting social account:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Une erreur est survenue lors de la connexion du compte. Veuillez réessayer.');
    }
  }
}

export async function disconnectSocialAccount(accountId: string) {
  try {
    await deleteDoc(doc(db, 'social_accounts', accountId));
  } catch (error) {
    console.error('Error disconnecting social account:', error);
    toast.error('Erreur lors de la déconnexion du compte');
    throw error;
  }
}

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const accountsRef = collection(db, 'social_accounts');
    const userAccountsQuery = query(accountsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(userAccountsQuery, (snapshot) => {
      const accounts = snapshot.docs.map(doc => {
        const data = doc.data();
        const account = {
          ...data,
          id: doc.id,
          accessToken: decryptToken(data.accessToken),
          refreshToken: decryptToken(data.refreshToken),
          expiresAt: data.expiresAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as SocialAccount;

        // Set up token refresh for Google services
        if (['youtube', 'drive'].includes(account.platform)) {
          const timeUntilExpiry = account.expiresAt.getTime() - Date.now();
          if (account.id && account.refreshToken) {
            TokenManager.scheduleRefresh(
              account.id,
              account.userId,
              account.platform as 'youtube' | 'drive',
              account.refreshToken,
              account.expiresAt
            );
          }
        }

        return account;
      });

      setAccounts(accounts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching social accounts:', error);
      setAccounts([]);
      setLoading(false);
    }, error => console.error('Error fetching social accounts:', error));

    return () => {
      unsubscribe();
      // Clear all refresh timers on unmount
      accounts.forEach(account => {
        if (account.id) {
          TokenManager.clearRefreshTimer(account.id);
        }
      });
    };
  }, [user]);

  return { accounts, loading };
}