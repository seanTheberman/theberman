import { useState, useEffect } from 'react';
import { Lock, ArrowRight, RefreshCw, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';

interface IdentityAuthProps {
    email: string;
    fullName: string;
    phone?: string;
    isExternalSubmitting?: boolean;
    onAuthenticated: () => void;
    onBack: () => void;
}

const IdentityAuth = ({ email, fullName, phone, isExternalSubmitting = false, onAuthenticated, onBack }: IdentityAuthProps) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn, signUp } = useAuth();
    const { isSpanish } = useTranslation();

    useEffect(() => {
        const checkUserExists = async () => {
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                setIsExistingUser(!!data);
            } catch (error) {
                console.error('Error checking user:', error);
                setIsExistingUser(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkUserExists();
    }, [email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            toast.error('Please enter a password');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isExistingUser) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                toast.success('Signed in successfully!');
            } else {
                const { error } = await signUp(email, password, fullName, 'user', phone, undefined);
                if (error) throw error;
                toast.success('Account created successfully!');
            }
            onAuthenticated();
        } catch (error: any) {
            console.error('Auth error:', error);
            toast.error(error.message || 'Authentication failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <RefreshCw size={48} className="animate-spin text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Verifying account status...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {/* Full-screen loader overlay when submitting */}
            {(isSubmitting || isExternalSubmitting) && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-green-100 rounded-full"></div>
                        <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="mt-6 text-xl font-semibold text-gray-800">
                        {isExternalSubmitting
                            ? (isSpanish ? 'Enviando tu presupuesto...' : 'Submitting your quote...')
                            : (isExistingUser
                                ? (isSpanish ? 'Iniciando sesión...' : 'Signing you in...')
                                : (isSpanish ? 'Creando tu cuenta...' : 'Creating your account...'))}
                    </p>
                    <p className="mt-2 text-gray-500">{isSpanish ? 'Por favor, espera un momento' : 'Please wait a moment'}</p>
                </div>
            )}

            <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isExistingUser ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {isExistingUser ? <LogIn size={36} /> : <UserPlus size={36} />}
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">
                    {isExistingUser
                        ? (isSpanish ? '¡Bienvenido otra vez!' : 'Welcome Back!')
                        : (isSpanish ? 'Crea tu Cuenta' : 'Create Your Account')}
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    {isExistingUser
                        ? (isSpanish ? 'Hemos encontrado una cuenta existente. Introduce tu contraseña para continuar.' : 'We found an existing account. Please enter your password to continue.')
                        : (isSpanish ? '¡Ya casi! Crea una contraseña para guardar tu progreso y acceder a tu panel.' : 'Almost there! Create a password to save your progress and access your dashboard.')}
                </p>
                <div className="mt-2 inline-block px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
                    {email}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 ml-1">
                        {isExistingUser
                            ? (isSpanish ? 'Contraseña' : 'Password')
                            : (isSpanish ? 'Elige una Contraseña' : 'Choose a Password')}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-all text-lg"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="text-center pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || isExternalSubmitting || !password}
                        className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${isSubmitting || isExternalSubmitting || !password
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isExistingUser
                                ? 'bg-[#007EA7] hover:bg-[#005F7E] text-white'
                                : 'bg-[#007F00] hover:bg-[#006600] text-white'
                            }`}
                    >
                        {isSubmitting || isExternalSubmitting ? (
                            <>
                                <RefreshCw size={20} className="animate-spin" />
                                {isExternalSubmitting
                                    ? (isSpanish ? 'Enviando Presupuesto...' : 'Submitting Quote...')
                                    : (isExistingUser
                                        ? (isSpanish ? 'Iniciando sesión...' : 'Signing in...')
                                        : (isSpanish ? 'Creando Cuenta...' : 'Creating Account...'))}
                            </>
                        ) : (
                            <>
                                {isExistingUser
                                    ? (isSpanish ? 'Iniciar Sesión y Enviar' : 'Sign In & Submit Quote')
                                    : (isSpanish ? 'Crear Cuenta y Enviar' : 'Create Account & Submit')}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center pt-2">
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                    {isSpanish ? '← ¿No es tu correo? Cámbialo' : '← Not your email? Change it'}
                </button>
            </div>
        </div>
    );
};

export default IdentityAuth;
