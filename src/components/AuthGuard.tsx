
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <>{children}</>;
  }

  // Mapping paths to specific messages for better UX
  const getMessage = () => {
    if (location.pathname.includes('reseaux')) return "Rejoignez le réseau professionnel n°1 en Afrique.";
    if (location.pathname.includes('services')) return "Trouvez ou proposez des services qualifiés.";
    if (location.pathname.includes('jobs')) return "Accédez aux meilleures offres d'emploi.";
    if (location.pathname.includes('formations')) return "Développez vos compétences dès aujourd'hui.";
    if (location.pathname.includes('premium')) return "Débloquez le plein potentiel de votre carrière.";
    return "Connectez-vous pour accéder à tout le contenu.";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 text-center relative z-10 transform transition-all">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-6">
          <Lock className="h-10 w-10 text-primary-600 dark:text-primary-400" />
        </div>
        
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Accès Réservé
          </h2>
          <p className="text-lg text-primary-600 dark:text-primary-400 font-medium mb-4">
            {getMessage()}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Pour consulter cette page et profiter de toutes les fonctionnalités de JOM Solution, vous devez être connecté.
          </p>
        </div>

        <div className="space-y-4 mt-8">
          <Link
            to="/login"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30 transition-all"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <LogIn className="h-5 w-5 text-primary-500 group-hover:text-primary-400" aria-hidden="true" />
            </span>
            Se connecter
          </Link>

          <Link
            to="/register"
            className="group relative w-full flex justify-center py-3 px-4 border-2 border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <UserPlus className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
            </span>
            Créer un compte gratuit
          </Link>
        </div>
        
        <div className="mt-6 text-xs text-gray-400">
           Rejoignez plus de 10,000 professionnels en Afrique.
        </div>
      </div>
    </div>
  );
};
