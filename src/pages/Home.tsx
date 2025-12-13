import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Globe, Shield, Users } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-secondary-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                L'écosystème digital qui <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">propulse</span> vos ambitions
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                JOM Solution connecte prestataires qualifiés, entreprises ambitieuses et clients exigeants sur une plateforme sécurisée et innovante.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/services"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all transform hover:scale-105"
                >
                  Explorer les Services
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-1 hover:gap-2 transition-all">
                  Devenir Prestataire <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Hero Image / Stats */}
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 dark:bg-white/5 dark:ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="relative rounded-xl bg-white/10 dark:bg-black/20 shadow-2xl ring-1 ring-gray-900/10 dark:ring-white/10 h-[300px] sm:h-[450px] overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                    alt="Collaboration"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                  <div className="relative z-10 text-center p-4">
                    <p className="text-white text-2xl sm:text-4xl font-bold mb-4">Déjà +10,000 membres</p>
                    <div className="flex justify-center space-x-4">
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                        <p className="text-3xl font-bold text-primary-400">98%</p>
                        <p className="text-xs text-gray-300">Satisfaction</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                        <p className="text-3xl font-bold text-secondary-400">24/7</p>
                        <p className="text-xs text-gray-300">Support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50 dark:bg-gray-800 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Solutions Complètes</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Tout ce dont vous avez besoin pour réussir
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              {[
                {
                  name: 'Paiements Sécurisés',
                  description: 'Intégration Wave, Orange Money et Stripe pour des transactions sans tracas.',
                  icon: Shield,
                },
                {
                  name: 'Réseau Qualifié',
                  description: 'Accédez à une base de données vérifiée de professionnels et d\'entreprises.',
                  icon: Users,
                },
                {
                  name: 'International',
                  description: 'Une plateforme bilingue (FR/EN) adaptée au marché africain et mondial.',
                  icon: Globe,
                },
              ].map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
