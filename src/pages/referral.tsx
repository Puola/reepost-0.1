import { SearchNotificationBar } from '@/components/layout/search-notification-bar';
import { Copy, Share, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ReferralTableProps {
  referrals: {
    name: string;
    status: string;
    date: string;
    earnings: string;
  }[];
}

function ReferralTable({ referrals }: ReferralTableProps) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="grid grid-cols-4 border-b">
        <div className="p-4 font-medium text-gray-500">Nom complet</div>
        <div className="p-4 font-medium text-gray-500">Statut du compte</div>
        <div className="p-4 font-medium text-gray-500">Date d'inscription</div>
        <div className="p-4 font-medium text-gray-500">Revenus d'affiliation</div>
      </div>
      {referrals.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Aucun parrainage pour le moment
        </div>
      ) : (
        referrals.map((referral, index) => (
          <div key={index} className="grid grid-cols-4 border-b last:border-0">
            <div className="p-4">{referral.name}</div>
            <div className="p-4">{referral.status}</div>
            <div className="p-4">{referral.date}</div>
            <div className="p-4">{referral.earnings}</div>
          </div>
        ))
      )}
    </div>
  );
}

export function ReferralPage() {
  const [referralLink] = useState('https://reepost.co/invite/GdHfqWc');
  const referrals: ReferralTableProps['referrals'] = [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Lien copié dans le presse-papier');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Rejoignez-moi sur Reepost et gagnez 10€ ! ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    try {
      const subject = '10€ offerts pour rejoindre Reepost';
      const body = `Bonjour,

Je viens de découvrir Reepost, un outil qui permet de publier automatiquement ses contenus sur tous les réseaux sociaux en même temps. Je pense que ça pourrait t'intéresser !

En utilisant mon lien d'invitation, tu recevras 10€ de crédit pour tester le service :
${referralLink}

Reepost te permet de :
• Publier une fois, partager partout automatiquement
• Adapter tes vidéos au format de chaque plateforme
• Gagner un temps précieux sur ta stratégie sociale

N'hésite pas si tu as des questions !

À bientôt !`;

      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      toast.success('Client mail ouvert');
    } catch (error) {
      console.error('Error opening email client:', error);
      toast.error('Erreur lors de l\'ouverture du client mail');
    }
  };

  return (
    <div className="pl-[310px]">
      <div className="px-[75px] py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Parrainage</h1>
            <p className="text-gray-500">Invitez vos amis</p>
          </div>
          <SearchNotificationBar />
        </div>

        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Gagnez 10€ en invitant vos amis
            </h2>
            <p className="text-gray-600">
              Partagez votre lien d'invitation personnel et recevez 10 euros lorsque vos amis s'inscrivent.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-2 mb-6">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-600 text-center"
            />
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Copy className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleCopyLink}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copier le lien
            </button>
            <button
              onClick={handleWhatsAppShare}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <Share className="w-4 h-4" />
              Partager sur WhatsApp
            </button>
            <button
              onClick={handleEmailShare}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Partager par email
            </button>
          </div>
        </div>

        <ReferralTable referrals={referrals} />
      </div>
    </div>
  );
}