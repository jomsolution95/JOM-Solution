import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { ShoppingCart, Clock, Star, User, MessageSquare, Check, X, Loader } from 'lucide-react';
import { servicesApi, ordersApi, reviewsApi } from '../api/marketplace';
import { toast } from 'react-toastify';

export const ServiceDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [requirements, setRequirements] = useState('');

    // Fetch service
    const { data: serviceData, isLoading } = useQuery({
        queryKey: ['service', id],
        queryFn: () => servicesApi.getById(id!),
        enabled: !!id,
    });

    // Fetch reviews
    const { data: reviewsData } = useQuery({
        queryKey: ['reviews', id],
        queryFn: () => reviewsApi.getByService(id!),
        enabled: !!id,
    });

    const service = serviceData?.data;
    const reviews = reviewsData?.data || [];

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: (data: { serviceId: string; requirements?: string }) =>
            ordersApi.create(data),
        onSuccess: (data) => {
            toast.success('Order created successfully!');
            navigate(`/orders/${data.data._id}`);
        },
        onError: () => {
            toast.error('Failed to create order');
        },
    });

    const handleOrder = () => {
        if (!id) return;
        createOrderMutation.mutate({
            serviceId: id,
            requirements: requirements || undefined,
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600 dark:text-gray-400">Service not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Service Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Images */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                                src={service.images[0]}
                                alt={service.title}
                                className="w-full h-96 object-cover"
                            />
                            {service.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 p-4">
                                    {service.images.slice(1).map((img: string, idx: number) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`${service.title} ${idx + 2}`}
                                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {service.title}
                            </h1>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={service.providerAvatar || '/default-avatar.png'}
                                        alt={service.providerName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {service.providerName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {service.rating.toFixed(1)}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        ({service.reviewCount})
                                    </span>
                                </div>
                            </div>

                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {service.description}
                                </p>
                            </div>

                            {/* Tags */}
                            {service.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {service.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Reviews ({reviews.length})
                            </h2>

                            {reviews.length === 0 ? (
                                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                                    No reviews yet
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review: any) => (
                                        <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-start gap-4">
                                                <img
                                                    src={review.userAvatar || '/default-avatar.png'}
                                                    alt={review.userName}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {review.userName}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating
                                                                            ? 'text-yellow-500 fill-yellow-500'
                                                                            : 'text-gray-300 dark:text-gray-600'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                        {review.comment}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Order Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-8">
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {service.price.toLocaleString()}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">FCFA</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Clock className="w-5 h-5" />
                                    <span>{service.deliveryTime} days delivery</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Requirements (optional)
                                    </label>
                                    <textarea
                                        value={requirements}
                                        onChange={(e) => setRequirements(e.target.value)}
                                        rows={4}
                                        placeholder="Describe your requirements..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleOrder}
                                disabled={createOrderMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                            >
                                {createOrderMutation.isPending ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        Order Now
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => navigate(`/messages?user=${service.providerId}`)}
                                className="w-full mt-3 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-colors"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Contact Seller
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
