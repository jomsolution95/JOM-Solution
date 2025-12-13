import React, { useState } from 'react';
import { Download, Eye, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPaymentHistory, downloadInvoice } from '../api/payments';
import { formatDistanceToNow } from 'date-fns';

type PaymentStatus = 'all' | 'success' | 'pending' | 'failed';

export const PaymentHistory: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');

    const { data, isLoading } = useQuery({
        queryKey: ['payments', statusFilter],
        queryFn: () => getPaymentHistory({
            status: statusFilter === 'all' ? undefined : statusFilter,
            limit: 50,
        }),
    });

    const payments = data?.data || [];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const handleDownloadInvoice = async (paymentId: string) => {
        try {
            await downloadInvoice(paymentId);
        } catch (error) {
            console.error('Failed to download invoice:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment History
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage your payment transactions
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>

                        {(['all', 'success', 'pending', 'failed'] as PaymentStatus[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payments List */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No payments found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Your payment history will appear here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payments.map((payment: any) => (
                            <div
                                key={payment._id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: Icon & Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            {getStatusIcon(payment.status)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {payment.description}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                <p>
                                                    Payment ID: <span className="font-mono text-xs">{payment._id}</span>
                                                </p>
                                                <p>
                                                    Method: <span className="font-medium">{payment.method.type}</span>
                                                    {payment.method.phone && ` - ${payment.method.phone}`}
                                                </p>
                                                <p>
                                                    {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Amount & Actions */}
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                            {payment.amount.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                                        </p>

                                        {payment.status === 'success' && payment.invoiceUrl && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => window.open(payment.invoiceUrl, '_blank')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadInvoice(payment._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Invoice
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
