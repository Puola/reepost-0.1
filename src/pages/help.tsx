import { useState } from 'react';
import { Search, ChevronDown, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchNotificationBar } from '@/components/layout/search-notification-bar';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    category: "Premiers pas",
    question: "Comment créer mon premier workflow ?",
    answer: "Pour créer votre premier workflow, rendez-vous dans la section 'Workflows' et cliquez sur le bouton '+ Créer un nouveau workflow'. Suivez ensuite les étapes guidées pour configurer votre automatisation."
  },
  {
    category: "Premiers pas",
    question: "Comment connecter mes réseaux sociaux ?",
    answer: "Allez dans la section 'Comptes', cliquez sur le réseau social que vous souhaitez ajouter et suivez le processus d'authentification. Vous pourrez ensuite utiliser ce compte dans vos workflows."
  },
  {
    category: "Workflows",
    question: "Qu'est-ce qu'un workflow ?",
    answer: "Un workflow est une automatisation qui permet de republier automatiquement du contenu d'une plateforme vers d'autres. Par exemple, publier automatiquement vos vidéos TikTok sur YouTube et Instagram."
  },
  {
    category: "Workflows",
    question: "Comment modifier un workflow existant ?",
    answer: "Dans la section 'Workflows', cliquez sur les trois points à droite du workflow que vous souhaitez modifier. Vous pourrez alors ajuster les paramètres selon vos besoins."
  },
  {
    category: "Facturation",
    question: "Comment changer mon forfait ?",
    answer: "Rendez-vous dans les paramètres de votre compte, section 'Abonnement'. Vous pourrez y voir les différentes options disponibles et effectuer le changement en quelques clics."
  }
];

interface DocSectionProps {
  title: string;
  children: React.ReactNode;
}

function DocSection({ title, children }: DocSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-medium">{title}</h3>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="pl-[310px]">
      <div className="px-[75px] py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Aide & Ressources</h1>
            <p className="text-gray-500">Trouvez de l'aide ou contactez-nous</p>
          </div>
          <SearchNotificationBar showSearch={false} />
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Documentation Section */}
          <div className="col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher dans la documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-6">
              {categories.map(category => {
                const categoryFaqs = filteredFaqs.filter(faq => faq.category === category);
                if (categoryFaqs.length === 0) return null;

                return (
                  <DocSection key={category} title={category}>
                    <div className="space-y-4">
                      {categoryFaqs.map((faq, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">{faq.question}</h4>
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </DocSection>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 h-fit sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium">Contactez-nous</h2>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet
                </label>
                <input
                  type="text"
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Décrivez votre problème en détail..."
                />
              </div>

              <Button className="w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Envoyer
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Temps de réponse moyen : <span className="font-medium text-gray-900">2-3 heures</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}