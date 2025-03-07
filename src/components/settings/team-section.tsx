import { Section } from './section';
import { UserPlus, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InviteMemberDialog } from './invite-member-dialog';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
}

export function TeamSection() {
  const { userData } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (!userData) return;

    const invitesRef = collection(db, 'invitations');
    const q = query(invitesRef, where('status', '==', 'pending'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Invitation[];
      setPendingInvitations(invites);
    });

    return () => unsubscribe();
  }, [userData]);

  return (
    <>
      <Section title="Membres de l'équipe">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <img
                src={userData?.profilePicture}
                alt="Julie Lenoir"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">Julie Lenoir</div>
                <div className="text-sm text-gray-500">julie.lenoir@email.com</div>
              </div>
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              Admin
            </span>
          </div>

          <button 
            onClick={() => setIsInviteDialogOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            <UserPlus className="w-5 h-5" />
            <span>Inviter un membre</span>
          </button>
        </div>
      </Section>

      <Section title="Invitations en attente">
        {pendingInvitations.length === 0 ? (
          <div className="text-sm text-gray-500">
            Aucune invitation en attente
          </div>
        ) : (
          <div className="space-y-4">
            {pendingInvitations.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{invite.email}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Invité le {invite.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  En attente
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <InviteMemberDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
      />
    </>
  );
}