import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getTenantFromDomain } from '../lib/tenant';

// Initialize Stripe outside component to avoid reloading
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number; // In standard units (e.g. 150.00)
    currency?: string;
    onSuccess: (paymentIntentId: string, terms?: { termsAcceptedAt: string | null; expressExecutionRequested: boolean }) => void;
    metadata?: any;
    title?: string;
    description?: string;
}

const CheckoutForm = ({ onSuccess, amount, isSpanish, isFrance, currency }: { onSuccess: (id: string, terms?: { termsAcceptedAt: string | null; expressExecutionRequested: boolean }) => void, amount: number, isSpanish: boolean, isFrance: boolean, currency: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // France: mandatory CGU acceptance + optional express execution request (CGU Annexe 2)
    const [termsChecked, setTermsChecked] = useState(false);
    const [expressRequest, setExpressRequest] = useState(false);

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
                setMessage(error.message || (isSpanish ? 'Ha ocurrido un error inesperado.' : 'An unexpected error occurred.'));
            } else {
                setMessage(isSpanish ? 'Ha ocurrido un error inesperado.' : 'An unexpected error occurred.');
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id, isFrance
                ? { termsAcceptedAt: termsChecked ? new Date().toISOString() : null, expressExecutionRequested: expressRequest }
                : undefined);
        } else {
            setMessage((isSpanish ? 'Estado del pago: ' : 'Payment status: ') + (paymentIntent?.status || (isSpanish ? 'desconocido' : 'unknown')));
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs", wallets: { applePay: 'never', googlePay: 'never' } }} />

            {message && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle size={16} />
                    {message}
                </div>
            )}

            {isFrance && (
                <div className="space-y-3 text-left bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={termsChecked}
                            onChange={(e) => setTermsChecked(e.target.checked)}
                            className="mt-1 w-4 h-4 accent-[#007F00] shrink-0"
                            required
                        />
                        <span className="text-xs text-gray-700 font-medium leading-relaxed">
                            J'ai lu et j'accepte les{' '}
                            <a href="/terms" target="_blank" rel="noreferrer" className="text-[#007F00] font-bold hover:underline">Conditions générales de DPECERT</a>
                            {' '}et les conditions du Diagnostiqueur sélectionné.{' '}
                            <a href="/terms-english" target="_blank" rel="noreferrer" className="text-gray-400 underline">English version</a>
                        </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={expressRequest}
                            onChange={(e) => setExpressRequest(e.target.checked)}
                            className="mt-1 w-4 h-4 accent-[#007F00] shrink-0"
                        />
                        <span className="text-xs text-gray-500 font-medium leading-relaxed">
                            Je demande expressément que le Diagnostic et le service de DPECERT soient exécutés avant la fin du délai de rétractation de 14 jours. Je reconnais perdre mon droit de rétractation une fois le Diagnostic entièrement réalisé.
                        </span>
                    </label>
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements || (isFrance && !termsChecked)}
                className="w-full bg-[#007F00] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#006600] transition-all shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isSpanish ? 'Procesando...' : 'Processing...'}
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        {isFrance
                            ? `Commande avec obligation de paiement — €${amount.toFixed(2)}`
                            : isSpanish ? `Pagar Depósito de Reserva: ${currency === 'gbp' ? '£' : '€'}${amount.toFixed(2)}` : `Pay Booking Deposit: ${currency === 'gbp' ? '£' : '€'}${amount.toFixed(2)}`}
                    </>
                )}
            </button>
        </form>
    );
};

const PaymentModal = ({ isOpen, onClose, amount, currency = 'eur', onSuccess, metadata, title, description }: PaymentModalProps) => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
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
                    setError(err.message || (isSpanish ? 'No se pudo inicializar el pago' : 'Failed to initialize payment'));
                    toast.error(isSpanish ? 'No se pudo inicializar el sistema de pagos' : 'Could not initialize payment system');
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[92dvh] flex flex-col">
                <div className="bg-white border-b border-gray-100 p-5 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {title || (isSpanish ? 'Pago Seguro' : 'Secure Payment')}
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

                <div className="p-6 overflow-y-auto flex-1 min-h-0">
                    {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
                        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200">
                            <strong>{isSpanish ? 'Configuración Faltante:' : 'Configuration Missing:'}</strong> {isSpanish ? 'La clave publicable de Stripe no está configurada en las variables de entorno.' : 'Stripe Publishable Key is not set in environment variables.'}
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle />
                            </div>
                            <p className="text-gray-900 font-bold mb-2">{isSpanish ? 'Error de Inicialización' : 'Initialization Failed'}</p>
                            <p className="text-gray-500 text-sm">{error}</p>
                            <button onClick={onClose} className="mt-4 text-gray-500 underline font-medium">{isSpanish ? 'Cerrar' : 'Close'}</button>
                        </div>
                    ) : clientSecret ? (
                        <Elements key={clientSecret} options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                            <CheckoutForm
                                onSuccess={onSuccess}
                                amount={amount}
                                isSpanish={isSpanish}
                                isFrance={tenant === 'france'}
                                currency={currency}
                            />
                        </Elements>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-10 h-10 border-4 border-gray-100 border-t-green-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">{isSpanish ? 'Asegurando conexión...' : 'Securing connection...'}</p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 text-center border-t border-gray-100 shrink-0">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <Lock size={10} />
                        {isSpanish ? 'Pagos procesados de forma segura por Stripe. No almacenamos los datos de tu tarjeta.' : 'Payments processed securely by Stripe. We do not store your card details.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
