import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, XCircle, Loader, ArrowLeft } from 'lucide-react';
import { initializeWavePayment, initializeOrangeMoneyPayment, checkPaymentStatus } from '../api/payments';
import { toast } from 'react-toastify';

type PaymentMethod = 'wave' | 'orange_money';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const amount = parseFloat(searchParams.get('amount') || '0');
    const description = searchParams.get('description') || 'Payment';
    const returnUrl = searchParams.get('returnUrl') || '/billing';

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [paymentId, setPaymentId] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('processing');
        setError('');

        try {
            let response;

            if (paymentMethod === 'wave') {
                response = await initializeWavePayment(amount, phone, description);
            } else {
                response = await initializeOrangeMoneyPayment(amount, phone, description);
            }

            setPaymentId(response.paymentId);

            // Poll for payment status
            const pollInterval = setInterval(async () => {
                try {
                    const statusResponse = await checkPaymentStatus(response.paymentId);

                    if (statusResponse.status === 'success') {
                        clearInterval(pollInterval);
                        setStatus('success');
                        toast.success('Payment successful!');

                        setTimeout(() => {
                            navigate(returnUrl);
                        }, 2000);
                    } else if (statusResponse.status === 'failed') {
                        clearInterval(pollInterval);
                        setStatus('failed');
                        setError(statusResponse.error || 'Payment failed');
                        toast.error('Payment failed');
                    }
                } catch (error) {
                    console.error('Status check error:', error);
                }
            }, 3000);

            // Stop polling after 5 minutes
            setTimeout(() => {
                clearInterval(pollInterval);
                if (status === 'processing') {
                    setStatus('failed');
                    setError('Payment timeout. Please try again.');
                }
            }, 300000);

        } catch (error: any) {
            setStatus('failed');
            setError(error.response?.data?.message || 'Payment initialization failed');
            toast.error('Payment failed');
        }
    };

    const formatPhone = (value: string) => {
        // Remove non-digits
        const digits = value.replace(/\D/g, '');
        // Format as +221 XX XXX XX XX for Senegal
        if (digits.startsWith('221')) {
            return `+${digits}`;
        }
        return digits;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                </div>

                {/* Amount */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount to pay</p>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">
                            {amount.toLocaleString()} <span className="text-2xl">FCFA</span>
                        </p>
                    </div>
                </div>

                {/* Payment Status */}
                {status !== 'idle' && (
                    <div className={`rounded-xl p-6 mb-6 ${status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                            status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                                'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        }`}>
                        <div className="flex items-center gap-3">
                            {status === 'processing' && <Loader className="w-6 h-6 text-blue-600 animate-spin" />}
                            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
                            {status === 'failed' && <XCircle className="w-6 h-6 text-red-600" />}

                            <div className="flex-1">
                                <p className={`font-semibold ${status === 'success' ? 'text-green-900 dark:text-green-100' :
                                        status === 'failed' ? 'text-red-900 dark:text-red-100' :
                                            'text-blue-900 dark:text-blue-100'
                                    }`}>
                                    {status === 'processing' && 'Processing payment...'}
                                    {status === 'success' && 'Payment successful!'}
                                    {status === 'failed' && 'Payment failed'}
                                </p>
                                {status === 'processing' && (
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        Please complete the payment on your phone
                                    </p>
                                )}
                                {status === 'failed' && error && (
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Form */}
                {status === 'idle' && (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        {/* Payment Method Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('wave')}
                                    className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'wave'
                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Wave</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('orange_money')}
                                    className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'orange_money'
                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Orange Money</p>
                                </button>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                placeholder="+221 XX XXX XX XX"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Enter your {paymentMethod === 'wave' ? 'Wave' : 'Orange Money'} number
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!phone || status === 'processing'}
                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                        >
                            Pay {amount.toLocaleString()} FCFA
                        </button>
                    </form>
                )}

                {/* Retry Button */}
                {status === 'failed' && (
                    <button
                        onClick={() => {
                            setStatus('idle');
                            setError('');
                        }}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};
