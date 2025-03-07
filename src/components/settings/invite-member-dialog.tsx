import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { doc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  { id: 'admin', name: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
  { id: 'editor', name: 'Éditeur', description: 'Peut créer et gérer du contenu' },
  { id: 'viewer', name: 'Lecteur', description: 'Peut uniquement consulter' }
];

export function InviteMemberDialog({ isOpen, onClose }: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if invitation already exists
      const invitesRef = collection(db, 'invitations');
      const existingInvite = await getDocs(
        query(invitesRef, where('email', '==', email))
      );

      if (!existingInvite.empty) {
        toast.error('Une invitation a déjà été envoyée à cette adresse');
        return;
      }

      // Create invitation
      await addDoc(collection(db, 'invitations'), {
        email,
        role,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      toast.success('Invitation envoyée avec succès');
      onClose();
      setEmail('');
      setRole('editor');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Une erreur est survenue lors de l\'envoi de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Inviter un membre</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start p-3 rounded-lg border-2 cursor-pointer ${
                    role === r.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.id}
                    checked={role === r.id}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-gray-500">{r.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
                  Envoi...
                </>
              ) : (
                'Envoyer l\'invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}