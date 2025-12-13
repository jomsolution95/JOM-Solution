
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle2, MoreVertical, Plus, Edit2, Trash2, Eye, MessageSquare, X, Save, AlertCircle } from 'lucide-react';
import { BackButton } from '../components/BackButton';

// Mock data for Orders (Individual)
const mockOrders = [
  { id: 'REQ-24901', service: 'Plomberie & Réparations', provider: 'Jean Michel', date: '24 Oct 2024', status: 'contacted' },
  { id: 'REQ-24902', service: 'Cours Anglais Intensif', provider: 'Language Pro', date: '26 Oct 2024', status: 'pending' },
  { id: 'REQ-24903', service: 'Design Logo', provider: 'Creative Studio', date: '28 Oct 2024', status: 'contacted' },
];

interface ProviderService {
  id: string;
  title: string;
  category: string;
  price: number;
  status: 'active' | 'paused';
  views: number;
  orders: number;
}

// Initial Mock data for Services (Company/Provider)
const initialServices: ProviderService[] = [
  { id: '1', title: 'Développement Site Web', category: 'Informatique', price: 150000, status: 'active', views: 120, orders: 5 },
  { id: '2', title: 'Maintenance Informatique', category: 'Informatique', price: 50000, status: 'active', views: 45, orders: 2 },
  { id: '3', title: 'Audit SEO', category: 'Marketing', price: 80000, status: 'paused', views: 12, orders: 0 },
];

const CATEGORIES = ['Informatique', 'Marketing', 'Design', 'Maison', 'Formation', 'Business', 'Agriculture', 'Autre'];

export const MyItems: React.FC = () => {
  const { user } = useAuth();

  // State for Services
  const [myServices, setMyServices] = useState<ProviderService[]>(initialServices);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Informatique',
    price: '' as string | number,
    status: 'active' as 'active' | 'paused'
  });

  if (!user) return null;

  const isProvider = user.role === 'company' || user.role === 'etablissement';

  // Handlers
  const handleOpenModal = (service?: ProviderService) => {
    if (service) {
      setEditingServiceId(service.id);
      setFormData({
        title: service.title,
        category: service.category,
        price: service.price,
        status: service.status
      });
    } else {
      setEditingServiceId(null);
      setFormData({
        title: '',
        category: 'Informatique',
        price: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingServiceId(null);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      setMyServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();

    const price = typeof formData.price === 'string' ? parseInt(formData.price) || 0 : formData.price;

    if (editingServiceId) {
      // Edit existing
      setMyServices(prev => prev.map(s => s.id === editingServiceId ? {
        ...s,
        title: formData.title,
        category: formData.category,
        price: price,
        status: formData.status
      } : s));
    } else {
      // Create new
      const newService: ProviderService = {
        id: Date.now().toString(),
        title: formData.title,
        category: formData.category,
        price: price,
        status: formData.status,
        views: 0,
        orders: 0
      };
      setMyServices([newService, ...myServices]);
    }
    handleCloseModal();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isProvider ? 'Mes Services & Offres' : 'Mes Demandes'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isProvider ? 'Gérez vos prestations et suivez vos contacts.' : 'Suivez l\'état de vos prises de contact avec les prestataires.'}
            </p>
          </div>

          {isProvider && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Nouveau Service
            </button>
          )}
        </div>

        {/* Content based on Role */}
        {isProvider ? (
          // PROVIDER VIEW
          <div className="grid grid-cols-1 gap-6">
            {myServices.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore ajouté de services.</p>
                <button onClick={() => handleOpenModal()} className="text-primary-600 font-medium mt-2 hover:underline">Créer mon premier service</button>
              </div>
            )}

            {myServices.map((service) => (
              <div key={service.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{service.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{service.category} • {service.price.toLocaleString()} FCFA (Indicatif)</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${service.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {service.status === 'active' ? 'Actif' : 'En pause'}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {service.views} vues</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {service.orders} contacts</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0">
                  <button
                    onClick={() => handleOpenModal(service)}
                    className="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600"
                  >
                    <Edit2 className="w-4 h-4" /> Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // INDIVIDUAL VIEW (Read Only List)
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Réf.</th>
                    <th className="px-6 py-4 font-medium">Service</th>
                    <th className="px-6 py-4 font-medium">Prestataire</th>
                    <th className="px-6 py-4 font-medium">Date demande</th>
                    <th className="px-6 py-4 font-medium">Statut</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {order.service}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                          {order.provider}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'contacted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                          {order.status === 'contacted' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {order.status === 'contacted' ? 'Contacté' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FOR SERVICE EDIT/CREATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingServiceId ? 'Modifier le service' : 'Créer un nouveau service'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre du service</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Développement Web, Plomberie..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white outline-none transition-all"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white outline-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix Indicatif (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 50000"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white outline-none"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Actif (Visible)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="paused"
                      checked={formData.status === 'paused'}
                      onChange={() => setFormData({ ...formData, status: 'paused' })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">En pause (Masqué)</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Les modifications seront immédiatement visibles sur votre profil public. Assurez-vous que les informations sont exactes.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-5 h-5" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyItems;
