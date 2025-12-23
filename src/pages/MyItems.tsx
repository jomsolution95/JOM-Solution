import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle2, MoreVertical, Plus, Edit2, Trash2, Eye, MessageSquare, X, Save, AlertCircle, Briefcase, ShoppingCart } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import api from '../api/client';
import { toast } from 'react-toastify';

interface Order {
  _id: string;
  service: {
    title: string;
    category?: string;
  };
  provider: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  status: string;
}

interface ProviderService {
  id: string;
  title: string;
  category: string;
  price: number;
  status: 'active' | 'paused';
  views: number;
  orders: number;
}

const CATEGORIES = ['Informatique', 'Marketing', 'Design', 'Maison', 'Formation', 'Business', 'Agriculture', 'Autre'];

export const MyItems: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Tabs: 'services' (selling) | 'orders' (buying)
  // Default to 'orders' for individuals unless they have services, 'services' for companies
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('orders');

  // State for Services (Provider)
  const [myServices, setMyServices] = useState<ProviderService[]>([]);

  // State for Orders (Individual)
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Informatique',
    price: '' as string | number,
    status: 'active' as 'active' | 'paused'
  });

  useEffect(() => {
    if (user?.role === 'company' || user?.role === 'etablissement') {
      setActiveTab('services');
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch Services (Sold)
      const servicesRes = await api.get('/services');
      const allServices = servicesRes.data.data || [];
      const myServicesList = allServices
        .filter((s: any) => s.provider?._id === user._id || s.provider === user._id) // Filter strictly by provider ID
        .map((s: any) => ({
          id: s._id,
          title: s.title,
          category: s.category,
          price: s.price,
          status: s.isActive ? 'active' : 'paused',
          views: s.stats?.views || 0,
          orders: s.stats?.orders || 0
        }));
      setMyServices(myServicesList);

      // Fetch Orders (Bought)
      // Ideally backend should filter by "buyer=userId"
      const ordersRes = await api.get('/orders');
      const myOrdersList = ordersRes.data.data || [];
      // Assuming backend returns orders where user is involved (as buyer or seller?)
      // Usually /orders returns all for admin, or filtered for user. 
      // We will assume it returns "my orders as buyer" mostly.
      setMyOrders(myOrdersList);

    } catch (error) {
      console.error("Failed to fetch items", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user) return null;

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

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await api.delete(`/services/${id}`);
        setMyServices(prev => prev.filter(s => s.id !== id));
        toast.success("Service supprimé.");
      } catch (e) {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = typeof formData.price === 'string' ? parseInt(formData.price) || 0 : formData.price;

    try {
      if (editingServiceId) {
        // Edit existing
        await api.patch(`/services/${editingServiceId}`, {
          title: formData.title,
          category: formData.category,
          price,
          isActive: formData.status === 'active'
        });
        toast.success("Service modifié !");
      } else {
        // Create new
        await api.post('/services', {
          title: formData.title,
          category: formData.category,
          price,
          isActive: formData.status === 'active',
          description: 'Service créé depuis le dashboard' // Default description
        });
        toast.success("Service créé avec succès !");
      }
      handleCloseModal();
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue.");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mes Activités
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gérez vos services et suivez vos commandes.
            </p>
          </div>

          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'orders' ? 'bg-primary-50 text-primary-700 font-bold dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              <ShoppingCart className="w-4 h-4" /> Achats
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'services' ? 'bg-primary-50 text-primary-700 font-bold dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              <Briefcase className="w-4 h-4" /> Ventes (Freelance)
            </button>
          </div>

          {activeTab === 'services' && (
            <button
              onClick={() => handleOpenModal()}
              className="hidden md:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Nouveau Service
            </button>
          )}
        </div>

        {/* Mobile FAB */}
        {activeTab === 'services' && (
          <button
            onClick={() => handleOpenModal()}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg z-30"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 gap-6">
                {myServices.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Aucun service proposé pour le moment.</p>
                    <p className="text-sm text-gray-400 mb-4">Lancez-vous en freelance dès maintenant !</p>
                    <button onClick={() => handleOpenModal()} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Créer mon premier service</button>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{service.category} • {service.price.toLocaleString()} FCFA</p>
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
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {myOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune commande récente.</p>
                    <p className="text-xs text-gray-400">Vos demandes de services et achats apparaîtront ici.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-4 font-medium">Réf.</th>
                          <th className="px-6 py-4 font-medium">Service</th>
                          <th className="px-6 py-4 font-medium">Prestataire</th>
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 font-medium">Statut</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {myOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {order._id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {order.service?.title || 'Service inconnu'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                                  {order.provider?.firstName?.charAt(0) || '?'}
                                </div>
                                {order.provider?.firstName} {order.provider?.lastName}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.status}
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
                )}
              </div>
            )}
          </>
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

