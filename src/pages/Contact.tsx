
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSent(true);
      setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contactez-nous</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Une question ? Une suggestion ? Notre équipe est là pour vous.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full text-primary-600">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Téléphone</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">+221 33 800 00 00</p>
                        <p className="text-sm text-gray-500">Lun-Ven, 8h-18h</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full text-primary-600">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">support@jom-solution.com</p>
                        <p className="text-sm text-gray-500">Réponse sous 24h</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full text-primary-600">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Siège Social</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Point E, Dakar, Sénégal</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                {sent ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Message envoyé !</h3>
                        <p className="text-gray-500 mt-2">Merci de nous avoir contactés. Nous reviendrons vers vous très vite.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                                <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet</label>
                            <select className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                                <option>Support Technique</option>
                                <option>Partenariat</option>
                                <option>Commercial</option>
                                <option>Autre</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                            <textarea required rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-primary-600 text-white font-bold py-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                            Envoyer le message <Send className="w-4 h-4" />
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
