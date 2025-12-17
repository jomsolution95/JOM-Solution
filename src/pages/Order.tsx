
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Service } from '../types';
import { Calendar, CheckCircle2, ShieldAlert, Send, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import api from '../api/client';
import { toast } from 'react-toastify';

export const Order: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1); // 1: Details, 2: Success
  const [date, setDate] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/services/${serviceId}`);
      setService(response.data);
    } catch (error) {
      console.error("Failed to load service", error);
      toast.error("Impossible de charger les détails du service.");
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!user) {
      toast.info("Veuillez vous connecter pour commander un service.");
      navigate('/login', { state: { from: `/order/${serviceId}` } });
      return;
    }

    setIsProcessing(true);
    try {
      // Here we would effectively call the backend to create an Order
      // await api.post('/orders', { serviceId, date, requirements });

      // Simulating API latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStep(2);
      toast.success("Demande envoyée avec succès !");
    } catch (error) {
      console.error("Order error", error);
      toast.error("Erreur lors de l'envoi de la demande.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Service non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux services
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-6">

            {step === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contacter le prestataire</h2>

                {/* Disclaimer Box */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg mb-6 flex gap-3">
                  <ShieldAlert className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-300">
                    <p className="font-bold mb-1">Information Importante</p>
                    <p>
                      JOM Solution est une plateforme de mise en relation. <strong>Aucun paiement pour ce service ne se fait sur le site.</strong>
                      Les modalités de paiement et la réalisation de la prestation sont à convenir directement avec le prestataire.
                      JOM Solution décline toute responsabilité en cas de litige.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date et Heure souhaitées pour le service
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Détails de votre demande
                    </label>
                    <textarea
                      rows={4}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Décrivez vos besoins, le lieu exact, etc..."
                      className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleRequest}
                      disabled={!date || isProcessing}
                      className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                      {isProcessing ? 'Envoi...' : 'Envoyer la demande'} <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Demande envoyée avec succès !</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                  Le prestataire <strong>{service.providerName || 'le prestataire'}</strong> a reçu votre demande. Il vous contactera sous peu via la messagerie JOM ou par téléphone pour confirmer le rendez-vous et les modalités de paiement.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300 max-w-md mx-auto mb-8">
                  Rappel : Ne versez jamais d'acompte avant d'avoir rencontré le prestataire ou vérifié son identité.
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Retour au Dashboard
                  </button>
                  <button onClick={() => navigate('/messages')} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Voir mes messages
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Récapitulatif</h3>

              <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <img
                  src={service.image || service.images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80'}
                  alt={service.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{service.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Par {service.providerName || 'Prestataire'}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Tarif indicatif</span>
                  <span className="font-bold">{(service.price || 0).toLocaleString()} FCFA</span>
                </div>
                <div className="text-xs text-gray-400 italic mt-2">
                  * Le prix final peut varier selon l'évaluation du prestataire sur place.
                </div>

                {date && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-300 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span>Date souhaitée</span>
                    <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-4 text-center">
              <p className="text-xs text-gray-400">
                En envoyant cette demande, vous acceptez que vos coordonnées soient transmises au prestataire pour la bonne exécution du service.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Order;
