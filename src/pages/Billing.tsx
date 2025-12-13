
import React from 'react';
import { Download, History, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';

export const Billing: React.FC = () => {
  const { user } = useAuth();

  // Mock Premium transactions only
  const transactions = [
    { id: 1, type: 'subscription', label: 'Abonnement JOM Premium', date: '20 Oct 2024', amount: 4900, method: 'Orange Money' },
    { id: 2, type: 'subscription', label: 'Abonnement JOM Premium', date: '20 Sept 2024', amount: 4900, method: 'Wave' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturation & Abonnement</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Retrouvez ici l'historique de vos abonnements Premium.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
            
            {/* Current Plan Info */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-lg font-bold text-yellow-400 uppercase tracking-wider">Statut Actuel</h2>
                        </div>
                        <p className="text-3xl font-bold mb-1">Membre Gratuit</p>
                        <p className="text-gray-400 text-sm">Passez à la vitesse supérieure avec nos offres Premium.</p>
                    </div>
                    <button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg">
                        Voir les offres Premium
                    </button>
                </div>
            </div>

            {/* Invoices History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" /> Historique des paiements
                    </h3>
                </div>
                
                {transactions.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
                                        <Crown className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{tx.label}</p>
                                        <p className="text-xs text-gray-500">Payé via {tx.method} • {tx.date}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <span className="font-bold text-gray-900 dark:text-white">{tx.amount.toLocaleString()} FCFA</span>
                                    <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Télécharger la facture">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        Aucun historique de paiement pour le moment.
                    </div>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 text-center">
                <p>
                    <strong>Note :</strong> Seuls les paiements relatifs aux abonnements JOM Premium apparaissent ici. 
                    Les transactions pour les services ou produits entre utilisateurs se font hors plateforme et ne sont pas répertoriées.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Billing;
