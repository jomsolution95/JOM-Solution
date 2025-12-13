
import React, { useState } from 'react';
import { BackButton } from '../components/BackButton';

export const Legal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies'>('terms');

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('terms')}
                    className={`flex-1 py-4 px-6 text-sm font-bold text-center whitespace-nowrap transition-colors ${activeTab === 'terms' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Conditions Générales
                </button>
                <button 
                    onClick={() => setActiveTab('privacy')}
                    className={`flex-1 py-4 px-6 text-sm font-bold text-center whitespace-nowrap transition-colors ${activeTab === 'privacy' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Politique de Confidentialité
                </button>
                <button 
                    onClick={() => setActiveTab('cookies')}
                    className={`flex-1 py-4 px-6 text-sm font-bold text-center whitespace-nowrap transition-colors ${activeTab === 'cookies' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Cookies
                </button>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 text-gray-700 dark:text-gray-300 leading-relaxed">
                {activeTab === 'terms' && (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Conditions Générales d'Utilisation</h1>
                        <p>Dernière mise à jour : 26 Octobre 2024</p>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. Objet de la plateforme</h3>
                        <p>JOM Solution est une plateforme de <strong>mise en relation</strong> (réseautage) entre prestataires de services, entreprises et particuliers. Nous agissons en tant qu'intermédiaire technique pour faciliter la prise de contact.</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. Rôle de JOM Solution</h3>
                        <p>JOM Solution n'est ni vendeur, ni prestataire des services proposés par les utilisateurs. Notre rôle se limite à héberger les profils et les annonces.</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Transactions et Responsabilité</h3>
                        <p className="font-medium text-red-600 dark:text-red-400">
                            Toutes les transactions financières relatives aux services, emplois ou formations (paiement, facturation, remboursement) se déroulent exclusivement "hors plateforme", directement entre le client et le prestataire.
                        </p>
                        <p>
                            En conséquence, <strong>JOM Solution décline toute responsabilité</strong> concernant :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>La non-exécution ou la mauvaise exécution des prestations.</li>
                            <li>Le non-paiement ou les litiges financiers entre utilisateurs.</li>
                            <li>La qualité, la sécurité ou la légalité des services proposés.</li>
                        </ul>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">4. Abonnement Premium</h3>
                        <p>La seule transaction financière gérée directement par JOM Solution concerne la souscription aux abonnements "Premium" (JOM+, JOM Business, etc.). Ces paiements sont sécurisés et servent à débloquer des fonctionnalités de visibilité sur la plateforme.</p>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Politique de Confidentialité</h1>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">1. Collecte des données</h3>
                        <p>Nous collectons les informations nécessaires à la création de votre profil public : nom, contact, localisation et informations professionnelles.</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. Utilisation des données</h3>
                        <p>Vos données publiques sont affichées pour permettre la mise en relation. Vos données de contact privées ne sont partagées que lorsque vous initiez une demande de service.</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Sécurité</h3>
                        <p>Nous mettons en œuvre des mesures de sécurité pour protéger vos informations personnelles contre l'accès non autorisé.</p>
                    </div>
                )}

                {activeTab === 'cookies' && (
                    <div className="space-y-6">
                         <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Utilisation des Cookies</h1>
                         <p>JOM Solution utilise des cookies essentiels pour le fonctionnement du site (maintien de la connexion).</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
