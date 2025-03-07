import { Section } from './section';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { updateEmail, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { Loader2, Chrome, Variable as Safari, Clock } from 'lucide-react';
import { useSessions, revokeSession, revokeAllSessions } from '@/lib/sessions';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SecurityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

function SecurityDialog({ isOpen, onClose, children, title }: SecurityDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function SecuritySection() {
  const { user, userData } = useAuth();
  const { sessions, loading: loadingSessions } = useSessions();
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newEmail: userData?.email || '',
    newPassword: '',
    confirmPassword: '',
    deleteConfirmation: ''
  });

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        formData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, formData.newEmail);
      
      toast.success('Email mis à jour avec succès');
      setIsEmailDialogOpen(false);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Mot de passe incorrect');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('Cet email est déjà utilisé');
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        formData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, formData.newPassword);
      
      toast.success('Mot de passe mis à jour avec succès');
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Mot de passe actuel incorrect');
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.deleteConfirmation !== 'SUPPRIMER') {
      toast.error('Veuillez saisir SUPPRIMER pour confirmer');
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        formData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      
      toast.success('Compte supprimé avec succès');
      setIsConfirmDeleteDialogOpen(false);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Mot de passe incorrect');
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Section title="Email">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{userData?.email}</h4>
            </div>
            <p className="text-sm text-gray-500 mt-1">L'adresse email associée à votre compte</p>
          </div>
          <button 
            onClick={() => setIsEmailDialogOpen(true)}
            className="text-primary hover:text-primary/90 text-sm font-medium"
          >
            Modifier
          </button>
        </div>
      </Section>

      <Section title="Mot de passe">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">••••••••••••</h4>
            <p className="text-sm text-gray-500 mt-1">Définissez un mot de passe unique pour protéger votre compte</p>
          </div>
          <button 
            onClick={() => setIsPasswordDialogOpen(true)}
            className="text-primary hover:text-primary/90 text-sm font-medium"
          >
            Changer le mot de passe
          </button>
        </div>
      </Section>

      <Section title="Double authentification">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Authentification à deux facteurs</h4>
            <p className="text-sm text-gray-500 mt-1">Sécurisez davantage votre compte. En plus de votre mot de passe, vous devrez saisir un code.</p>
          </div>
          <button
            className="flex items-center rounded-full transition-all duration-500 ease-in-out w-[60px] h-[25px] relative bg-white border border-gray-200"
          >
            <div
              className="absolute w-[19px] h-[19px] rounded-full transition-all duration-500 ease-in-out left-[3px] bg-gray-400"
            />
          </button>
        </div>
      </Section>

      <Section title="Sessions actives">
        <div className="space-y-4">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  {session.browser.toLowerCase().includes('chrome') ? (
                    <Chrome className="w-6 h-6 text-gray-600" />
                  ) : (
                    <Safari className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{session.deviceName}</div>
                  <div className="text-sm text-gray-500">
                    Dernière activité {formatDistanceToNow(session.lastActive, { addSuffix: true, locale: fr })} • 
                    {session.location.city}, {session.location.country}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.isCurrentDevice ? (
                  <>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Actif
                    </span>
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      Cet appareil
                    </span>
                  </>
                ) : (
                  <button 
                    onClick={() => revokeSession(session.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Déconnecter
                  </button>
                )}
              </div>
            </div>
          ))}

          {sessions.length > 1 && (
            <button
              onClick={() => {
                const currentSession = sessions.find(s => s.isCurrentDevice);
                if (currentSession) {
                  revokeAllSessions(user!.uid, currentSession.id);
                }
              }}
              className="w-full text-center text-red-600 hover:text-red-700 text-sm font-medium mt-4"
            >
              Déconnecter toutes les autres sessions
            </button>
          )}
        </div>
      </Section>

      <Section title="Supprimer le compte">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-red-600">Supprimer définitivement votre compte</h4>
            <p className="text-sm text-gray-500 mt-1">Cette action est irréversible. Votre compte sera définitivement supprimé de Reepost.</p>
          </div>
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Supprimer
          </button>
        </div>
      </Section>

      {/* Email Dialog */}
      <SecurityDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        title="Modifier l'adresse email"
      >
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouvelle adresse email
            </label>
            <input
              type="email"
              value={formData.newEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, newEmail: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEmailDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Modifier'
              )}
            </button>
          </div>
        </form>
      </SecurityDialog>

      {/* Password Dialog */}
      <SecurityDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        title="Changer le mot de passe"
      >
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsPasswordDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Modifier'
              )}
            </button>
          </div>
        </form>
      </SecurityDialog>

      {/* Delete Account Dialog */}
      <SecurityDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Supprimer le compte"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et entraînera :
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              La suppression de toutes vos données
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              La perte de vos workflows et automatisations
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              La déconnexion de tous vos comptes sociaux
            </li>
          </ul>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setIsConfirmDeleteDialogOpen(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </SecurityDialog>

      {/* Confirm Delete Dialog */}
      <SecurityDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        title="Confirmer la suppression"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tapez "SUPPRIMER" pour confirmer
            </label>
            <input
              type="text"
              value={formData.deleteConfirmation}
              onChange={(e) => setFormData(prev => ({ ...prev, deleteConfirmation: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsConfirmDeleteDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || formData.deleteConfirmation !== 'SUPPRIMER'}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </button>
          </div>
        </form>
      </SecurityDialog>
    </>
  );
}