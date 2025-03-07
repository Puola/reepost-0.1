import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Section } from './section';
import { Field } from './field';
import { useAuth } from '@/lib/auth';
import { uploadProfilePicture } from '@/lib/storage';
import { EditProfileDialog } from './edit-profile-dialog';
import { toast } from 'react-hot-toast';

export function ProfileSection() {
  const { user, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  if (!user || !userData) return null;

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingPicture(true);
    try {
      await uploadProfilePicture(user.uid, file);
      await refreshUserData();
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Erreur lors de la mise à jour de la photo');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 p-6 mb-6 bg-white rounded-xl">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-50 overflow-hidden">
              <img
                src={userData?.profilePicture || "https://images.unsplash.com/photo-1494790108377-be9c29b29330"}
                alt={`${userData.firstName} ${userData.lastName}`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-medium">{userData.firstName} {userData.lastName}</h3>
            <div className="text-sm text-gray-500 mt-1">6M abonnés</div>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/90"
        >
          Modifier
        </button>
      </div>

      <Section title="Informations personnelles">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <Field label="Prénom" value={userData.firstName} />
            <Field label="Date de naissance" value={userData.birthDate || '-'} />
          </div>
          <div>
            <Field label="Nom" value={userData.lastName} />
            <Field label="Téléphone" value={userData.phone || '-'} />
          </div>
        </div>
      </Section>

      <Section title="Adresse">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <Field label="Pays" value={userData.country || '-'} />
            <Field label="Code postal" value={userData.postalCode || '-'} />
          </div>
          <div>
            <Field label="Ville" value={userData.city || '-'} />
            <Field label="Numéro de TVA" value={userData.vatNumber || '-'} />
          </div>
        </div>
      </Section>

      <EditProfileDialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        userData={userData}
        userId={user.uid}
        onUpdate={refreshUserData}
      />
    </>
  );
}