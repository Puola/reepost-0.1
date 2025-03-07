import { CreditCard, Download, Plus, Trash2, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PLANS, createPortalSession, useSubscription, usePaymentMethods, useInvoices } from '@/lib/stripe';
import { AddCardDialog } from './add-card-dialog';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SubscriptionSection() {
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPlanChangeConfirm, setShowPlanChangeConfirm] = useState(false);
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { paymentMethods, loading: loadingPaymentMethods } = usePaymentMethods();
  const { invoices, loading: loadingInvoices } = useInvoices();
  const currentPlan = subscription?.status === 'active' || subscription?.status === 'past_due' 
    ? PLANS[subscription.plan] 
    : PLANS.free;

  const handleSubscribe = async (planId: string) => {
    try {
      const plan = Object.values(PLANS).find(p => p.id === planId);
      if (!plan) {
        toast.error('Plan non trouvé');
        return;
      }

      // Redirect to Stripe payment page
      if (plan.stripeUrl) {
        window.location.href = plan.stripeUrl;
      } else {
        toast.error('Lien de paiement non disponible');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la souscription');
    }
  };

  const handlePortalAccess = async () => {
    try {
      if (!user?.stripeCustomerId) {
        toast.error('Aucun compte client Stripe trouvé');
        return;
      }

      await createPortalSession(user.stripeCustomerId);
    } catch (error) {
      console.error('Error accessing portal:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'accès au portail client');
    }
  };
  const handleDeleteCard = (cardId: string) => {
    // Check if this is the only card and there's an active subscription
    if (paymentMethods.length === 1) {
      toast.error('Impossible de supprimer cette carte car c\'est la seule associée à votre abonnement en cours');
      return;
    }

    setCardToDelete(cardId);
  };

  const confirmDeleteCard = () => {
    if (!cardToDelete) return;

    try {
      // Call Stripe portal to manage payment methods
      handlePortalAccess();
    } catch (error) {
      console.error('Error accessing portal:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setCardToDelete(null);
    }
  };

  const setDefaultCard = async (cardId: string) => {
    try {
      // Call Stripe portal to manage payment methods
      handlePortalAccess();
    } catch (error) {
      console.error('Error accessing portal:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const handlePlanChange = (plan: Plan) => {
    if (plan.id === currentPlan?.id) return;
    setSelectedPlan(plan);
    setShowPlanChangeConfirm(true);
  };

  const confirmPlanChange = async () => {
    if (!selectedPlan) return;
    
    try {
      await handleSubscribe(selectedPlan.id);
      setShowPlanChangeConfirm(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error changing plan:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue lors du changement de plan';
      toast.error(message);
      setShowPlanChangeConfirm(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="bg-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold flex items-center gap-2 mb-1">
              Plan {currentPlan?.name || 'Free'}
              {subscription?.status === 'past_due' && (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  Paiement en retard
                </span>
              )}
            </h4>
            <p className="text-gray-500">
              {currentPlan?.price || 0}€/mois
              {subscription?.currentPeriodEnd && (
                <>
                  {' • '}
                  {subscription.status === 'canceled' 
                    ? `Expire le ${format(subscription.currentPeriodEnd, 'd MMMM yyyy', { locale: fr })}`
                    : `Prochain renouvellement le ${format(subscription.currentPeriodEnd, 'd MMMM yyyy', { locale: fr })}`
                  }
                </>
              )}
            </p>
          </div>
          <button 
            onClick={() => setShowPlanChangeConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            {subscription?.status === 'past_due' ? 'Mettre à jour le paiement' : 'Changer de plan'}
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-6">Moyens de paiement</h3>
        <div className="space-y-4">
          {paymentMethods.map((card) => (
            <div 
              key={card.id} 
              className={`p-4 border rounded-lg flex items-center justify-between ${
                card.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <CreditCard className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="font-semibold">{card.brand} •••• {card.last4}</p>
                  <p className="text-sm text-gray-500">
                    Expire {card.expMonth}/{card.expYear}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <button 
                    onClick={() => setDefaultCard(card)}
                    className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                  >
                    <Crown className="w-4 h-4" />
                    Par défaut
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteCard(card)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Card Button */}
          <button 
            onClick={() => setIsAddingCard(true)}
            className="w-full py-2 px-4 rounded-full border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:text-gray-500 hover:border-gray-300 transition-all duration-300 hover:bg-gray-50 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un moyen de paiement
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-6">Historique des paiements</h3>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">Plan {currentPlan?.name || 'Starter'} - {format(invoice.date, 'MMMM yyyy', { locale: fr })}</div>
                  <div className="text-sm text-gray-500">
                    Payé le {format(invoice.date, 'd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">{invoice.amount.toFixed(2)} €</span>
                <button className="text-primary hover:text-primary/90">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Plans */}

      <ConfirmDialog
        isOpen={cardToDelete !== null}
        title="Supprimer la carte"
        message={`Êtes-vous sûr de vouloir supprimer cette carte ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDeleteCard}
        onCancel={() => setCardToDelete(null)}
        isDangerous
      />

      <AddCardDialog
        isOpen={isAddingCard}
        onClose={() => setIsAddingCard(false)}
        onCardAdded={(newCard) => {
          handlePortalAccess();
        }}
      />
      
      <ConfirmDialog
        isOpen={showPlanChangeConfirm}
        title="Changer de plan"
        message={
          selectedPlan 
            ? `Êtes-vous sûr de vouloir passer au plan ${selectedPlan.name} à ${selectedPlan.price}€/mois ?`
            : 'Choisissez un nouveau plan pour votre abonnement'
        }
        confirmLabel={selectedPlan ? 'Confirmer' : 'Choisir'}
        cancelLabel="Annuler"
        onConfirm={confirmPlanChange}
        onCancel={() => {
          setShowPlanChangeConfirm(false);
          setSelectedPlan(null);
        }}
      >
        {!selectedPlan && (
          <div className="mt-4 space-y-4">
            {Object.values(PLANS).map((plan) => plan.id === 'free' ? (
              <div
                key={plan.id}
                className="w-full p-4 rounded-lg border-2 border-gray-200 text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{plan.name}</h3>
                    {!subscription?.status && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Plan actuel
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold">
                    {plan.price}€<span className="text-sm font-normal text-gray-500">/mois</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <button
                key={plan.id}
                onClick={() => handlePlanChange(plan)}
                disabled={plan.id === currentPlan?.id}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  plan.id === currentPlan?.id
                    ? 'border-primary bg-primary/5 cursor-not-allowed'
                    : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{plan.name}</h3>
                  <div className="text-lg font-bold">{plan.price}€<span className="text-sm font-normal text-gray-500">/mois</span></div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id === currentPlan?.id && (
                  <span className="mt-2 inline-block text-sm text-primary">Plan actuel</span>
                )}
              </button>
            ))}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}