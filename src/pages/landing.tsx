import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Hero Section
function HeroSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-[44px] font-bold mb-6">
          Créez une fois,{' '}
          <span className="relative">
            publiez partout
            <div className="absolute -bottom-2 left-0 w-full h-[6px] bg-primary/30" />
          </span>
        </h1>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Reepost automatise la publication de vos vidéos sur l'ensemble de vos réseaux sociaux.
        </p>
        <Link to="/signup" className="inline-block">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium px-6">
            Publier partout gratuitement
          </Button>
        </Link>
        <p className="text-sm text-gray-400 mt-2">Sans carte de crédit</p>

        {/* Phone mockup */}
        <div className="relative mt-16 mb-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[500px] h-[500px] bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-full blur-3xl" />
          </div>
          <img
            src="/images/phone-mockup.png"
            alt="Phone mockup"
            className="relative w-[300px] mx-auto"
          />
          
          {/* Social media icons */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
            <div className="relative w-[600px] h-[600px] mx-auto">
              {/* TikTok */}
              <img src="/icons/tiktok.svg" alt="TikTok" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8" />
              {/* YouTube */}
              <img src="/icons/youtube.svg" alt="YouTube" className="absolute top-1/4 left-0 w-8 h-8" />
              {/* Instagram */}
              <img src="/icons/instagram.svg" alt="Instagram" className="absolute bottom-1/4 left-0 w-8 h-8" />
              {/* Facebook */}
              <img src="/icons/facebook.svg" alt="Facebook" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8" />
              {/* Drive */}
              <img src="https://img.icons8.com/ios_filled/512/FFFFFF/google-drive--v2.png" alt="Google Drive" className="absolute top-1/4 right-0 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="flex flex-col items-center">
          <div className="flex -space-x-2 mb-4">
            {[...Array(8)].map((_, i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/40?img=${i + 1}`}
                alt={`User ${i + 1}`}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            12 500+ créateurs, marques, et agences de marketing numérique utilisent Reepost
          </p>
        </div>
      </div>
    </section>
  );
}

// Features Section
const features = [
  {
    title: 'Publiez partout',
    description: 'Permettez à vos vidéos d\'être publiées automatiquement sur toutes les plateformes sans filigranes et avec une résolution 1080p.',
    icon: '/icons/share.svg'
  },
  {
    title: 'Durée adaptée automatiquement',
    description: 'Vos clips sont ajustés ou rallongés automatiquement pour les adapter à n\'importe quelle plateforme.',
    icon: '/icons/clock.svg'
  },
  {
    title: 'Publiez au meilleur moment',
    description: 'Vos vidéos sont automatiquement publiées à la meilleure heure sur chaque réseau pour maximiser votre viralité.',
    icon: '/icons/chart.svg',
    soon: true
  },
  {
    title: 'Générez des sous-titres',
    description: 'Rendez vos vidéos accessibles à tous avec des sous-titres générés automatiquement.',
    icon: '/icons/subtitles.svg',
    soon: true
  },
  {
    title: 'Générez des descriptions et hashtags',
    description: 'Ajouter automatiquement des descriptions optimisées pour le SEO et des hashtags tendance en fonction de chaque plateforme.',
    icon: '/icons/hashtag.svg',
    soon: true
  },
  {
    title: 'Ajouter des calls-to-action',
    description: 'Paramétrez des Call-To-Action ajoutés automatiquement à la fin de vos vidéos ou au premier commentaire.',
    icon: '/icons/cta.svg',
    soon: true
  }
];

function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Découvrez les fonctionnalités Reepost
          </h2>
          <p className="text-gray-600">
            De nombreuses nouvelles fonctionnalités à venir pour augmenter votre audience et vos revenus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl">
              <img src={feature.icon} alt={feature.title} className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              {feature.soon && (
                <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  Bientôt disponible
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How it works section
function HowItWorksSection() {
  const steps = [
    {
      title: 'Connectez vos comptes',
      description: 'En quelques clics, connectez tous vos comptes de réseaux sociaux de façon 100% sécurisée.'
    },
    {
      title: 'Créez votre workflow',
      description: 'Choisissez vos plateformes sources et destinations, et paramétrez vos automatisations.'
    },
    {
      title: 'Publiez automatiquement',
      description: 'Laissez Reepost s\'occuper de tout ! Vos vidéos sont automatiquement publiées sur tous vos réseaux.'
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Comment fonctionne Reepost
          </h2>
          <p className="text-gray-600">
            En quelques clics, connectez vos réseaux sociaux et paramétrez vos automatisations de repost.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <img
            src="/images/workflow-preview.png"
            alt="Workflow preview"
            className="max-w-3xl mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary to-orange-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Prêt à multiplier votre audience ?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Rejoignez plus de 12 500 créateurs qui utilisent Reepost
        </p>
        <Link to="/signup">
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-medium px-8">
            Commencer gratuitement
          </Button>
        </Link>
        <p className="text-sm mt-4 opacity-75">
          Aucune carte bancaire requise • Annulez à tout moment
        </p>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const links = {
    product: ['Fonctionnalités', 'Prix', 'Cas d\'utilisation', 'Témoignages'],
    company: ['À propos', 'Blog', 'Carrières', 'Contact'],
    legal: ['Conditions', 'Confidentialité', 'Cookies'],
    social: ['Twitter', 'LinkedIn', 'Instagram', 'YouTube']
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <img 
                src="https://res.cloudinary.com/ddamgg8us/image/upload/v1740517648/Logo_Repost_xtlhqi.png"
                alt="Reepost"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold">Reepost</span>
            </Link>
            <p className="text-gray-400">
              Créez une fois, publiez partout.
            </p>
          </div>
          
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Reepost. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select className="bg-gray-800 text-white px-3 py-1 rounded">
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}