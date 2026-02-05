import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Initialize Stripe outside component to avoid reloading
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number; // In standard units (e.g. 150.00)
    currency?: string;
    onSuccess: (paymentIntentId: string) => void;
    metadata?: any;
    title?: string;
    description?: string;
}

const CheckoutForm = ({ onSuccess, amount }: { onSuccess: (id: string) => void, amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Ensure this URL is correct for your app
                return_url: window.location.origin + '/payment-complete',
            },
            redirect: 'if_required', // Avoid redirect if possible
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        } else {
            setMessage("Payment status: " + (paymentIntent?.status || 'unknown'));
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle size={16} />
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full bg-[#007F00] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#006600] transition-all shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        Pay €{amount.toFixed(2)}
                    </>
                )}
            </button>
        </form>
    );
};

const PaymentModal = ({ isOpen, onClose, amount, currency = 'eur', onSuccess, metadata, title = "Secure Payment", description }: PaymentModalProps) => {
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Create PaymentIntent as soon as the modal opens
            const createIntent = async () => {
                try {
                    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
                        body: { amount, currency, metadata }
                    });

                    if (error) throw error;
                    if (data?.error) throw new Error(data.error);

                    setClientSecret(data.clientSecret);
                } catch (err: any) {
                    console.error('Error creating payment intent:', err);
                    setError(err.message || 'Failed to initialize payment');
                    toast.error('Could not initialize payment system');
                }
            };

            createIntent();
        } else {
            setClientSecret('');
            setError('');
        }
    }, [isOpen, amount, currency]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {title}
                        </h3>
                        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
                        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200">
                            <strong>Configuration Missing:</strong> Stripe Publishable Key is not set in environment variables.
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle />
                            </div>
                            <p className="text-gray-900 font-bold mb-2">Initialization Failed</p>
                            <p className="text-gray-500 text-sm">{error}</p>
                            <button onClick={onClose} className="mt-4 text-gray-500 underline font-medium">Close</button>
                        </div>
                    ) : clientSecret ? (
                        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                            <CheckoutForm
                                onSuccess={onSuccess}
                                amount={amount}
                            />
                        </Elements>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-10 h-10 border-4 border-gray-100 border-t-green-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Securing connection...</p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <Lock size={10} />
                        Payments processed securely by Stripe. We do not store your card details.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
