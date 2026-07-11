
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkRateLimit, recordFailedAttempt, recordSuccessfulLogin } from '../lib/rateLimiter';
import { getTenantFromDomain } from '../lib/tenant';

const IS_SPANISH_TENANT = getTenantFromDomain() === 'spain';

const loginSchema = z.object({
    email: z.string().email(IS_SPANISH_TENANT ? 'Dirección de correo no válida' : 'Invalid email address'),
    password: z.string().min(6, IS_SPANISH_TENANT ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const { t, isSpanish } = useTranslation();
    const tenant = getTenantFromDomain();
    const isEngland = tenant === 'england';
    const assessorLabel = isEngland ? 'EPC Assessor' : isSpanish ? 'Certificador Energético' : 'BER Assessor';
    const { signIn, user, role, profile, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'homeowner' | 'assessor' | 'business'>('homeowner');
    const [showPassword, setShowPassword] = useState(false);
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
    const [resending, setResending] = useState(false);
    // Prevents useEffect from redirecting mid-submission while role check is running
    const signingIn = React.useRef(false);

    // Default redirect to /admin if no previous path
    const from = location.state?.from?.pathname;
    
    // Check for redirect parameter from URL
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');

    // Redirect if already authenticated
    useEffect(() => {
        // Skip auto-redirect while onSubmit is running — let it handle role check first
        if (signingIn.current) return;

        if (!loading && user && role && profile) {
            // If the flag is still set but user has an active session (they already
            // proved their identity), clear it silently. This prevents infinite redirect loops
            // when the original invite link expired and user reset via Forgot Password.
            if (user.user_metadata?.requires_password_change) {
                supabase.auth.updateUser({ data: { requires_password_change: false } });
            }

            // Handle pending registration users (Exclude admins)
            if (role === 'contractor' || role === 'business') {
                if (profile.registration_status === 'pending') {
                    const path = role === 'contractor' ? '/assessor-onboarding' : '/business-onboarding';
                    navigate(path, { replace: true });
                    return;
                }
            }

            if (redirectParam === 'quote' && role === 'contractor') {
                // Check if there's a pending quote to show
                const pendingQuote = sessionStorage.getItem('pendingQuote');
                if (pendingQuote) {
                    toast.success(isSpanish ? '¡Sesión iniciada! Tu presupuesto ha sido enviado.' : 'Login successful! Your quote has been submitted.');
                    sessionStorage.removeItem('pendingQuote');
                    navigate('/dashboard/ber-assessor', { replace: true });
                } else {
                    navigate('/dashboard/ber-assessor', { replace: true });
                }
            } else if (from) {
                navigate(from, { replace: true });
            } else {
                if (role === 'admin') navigate('/secure-admin-portal', { replace: true });
                else if (role === 'contractor') navigate('/dashboard/ber-assessor', { replace: true });
                else if (role === 'business') navigate('/dashboard/business', { replace: true });
                else navigate('/dashboard/user', { replace: true });
            }
        }
    }, [user, role, profile, loading, navigate, from]);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        signingIn.current = true;
        try {
            const email = data.email.trim();
            
            // Check rate limiting (more lenient for regular users)
            const rateLimitResult = checkRateLimit(email);
            if (!rateLimitResult.allowed) {
                if (rateLimitResult.lockoutRemaining) {
                    throw new Error(isSpanish ? `Demasiados intentos fallidos. Cuenta bloqueada durante ${rateLimitResult.lockoutRemaining} minutos.` : `Too many failed attempts. Account locked for ${rateLimitResult.lockoutRemaining} minutes.`);
                }
                throw new Error(isSpanish ? 'Inicio de sesión bloqueado temporalmente. Inténtalo más tarde.' : 'Login temporarily blocked. Please try again later.');
            }
            
            const { data: authData, error } = await signIn(email, data.password);

            if (error) {
                // Record failed attempt for rate limiting
                recordFailedAttempt(email);
                
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('email not confirmed')) {
                    setUnconfirmedEmail(email);
                    throw new Error(isSpanish ? 'Por favor, confirma tu dirección de correo antes de iniciar sesión. Revisa tu bandeja de entrada y la carpeta de spam.' : 'Please confirm your email address before logging in. Check your inbox and spam folder.');
                }
                if (error.status === 400 || errorMessage.includes('invalid credentials')) {
                    throw new Error(isSpanish ? 'Debido a una actualización técnica reciente, puede que necesites restablecer tu contraseña. Haz clic en "¿Olvidaste tu Contraseña?" para crear una nueva e inténtalo de nuevo.' : 'Due to a recent technical update, your password may need to be reset. Please click "Forgot Password" to create a new password and try again.');
                }
                throw error;
            }

            // Redirection logic
            if (authData.user) {
                // Record successful login (clears rate limit)
                recordSuccessfulLogin(email);
                
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, registration_status, subscription_status, is_active')
                    .eq('id', authData.user.id)
                    .maybeSingle();

                const userRole = profile?.role || 'user';
                const regStatus = profile?.registration_status;

                // If requires_password_change is still set but the user just logged in
                // successfully (proving they know their password), clear the flag.
                // This handles the case where the original invite link expired and
                // the user reset their password via Forgot Password instead.
                if (authData.user.user_metadata?.requires_password_change) {
                    await supabase.auth.updateUser({ data: { requires_password_change: false } });
                }

                // Handle pending registration users
                if (userRole === 'contractor' || userRole === 'business') {
                    if (regStatus === 'pending') {
                        // Redirect to onboarding to complete registration
                        const path = userRole === 'contractor' ? '/assessor-onboarding' : '/business-onboarding';
                        navigate(path, { replace: true });
                        return;
                    }
                }

                if (from) {
                    navigate(from, { replace: true });
                } else {
                    if (userRole === 'admin') navigate('/secure-admin-portal', { replace: true });
                    else if (userRole === 'contractor') {
                        navigate('/dashboard/ber-assessor', { replace: true });
                    } else if (userRole === 'business') {
                        navigate('/dashboard/business', { replace: true });
                    } else {
                        navigate('/dashboard/user', { replace: true });
                    }
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            toast.error(err.message || (isSpanish ? 'No se pudo iniciar sesión' : 'Failed to login'));
        } finally {
            signingIn.current = false;
        }
    };

    const handleResendConfirmation = async () => {
        if (!unconfirmedEmail) return;
        setResending(true);
        try {
            const websiteUrl = window.location.origin;
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: unconfirmedEmail,
                options: { emailRedirectTo: websiteUrl }
            });
            if (error) throw error;
            toast.success(isSpanish ? '¡Correo de confirmación reenviado! Revisa tu bandeja de entrada y la carpeta de spam.' : 'Confirmation email resent! Please check your inbox and spam folder.');
            setUnconfirmedEmail(null);
        } catch (err: any) {
            toast.error(err.message || (isSpanish ? 'No se pudo reenviar el correo de confirmación' : 'Failed to resend confirmation email'));
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
            <div className="w-full max-w-md px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSpanish ? 'Bienvenido de Nuevo' : 'Welcome Back'}</h1>
                    <p className="text-gray-500">{isSpanish ? 'Inicia sesión para continuar.' : 'Sign in to continue.'}</p>
                </div>

                {/* Simple Tab Switcher */}
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        type="button"
                        onClick={() => setActiveTab('homeowner')}
                        className={`py-3 px-6 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'homeowner'
                            ? 'border-gray-400 text-gray-700'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {isSpanish ? 'Zona Cliente' : 'Homeowner'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('assessor')}
                        className={`py-3 px-4 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'assessor'
                            ? 'border-gray-400 text-gray-700'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {assessorLabel}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('business')}
                        className={`py-3 px-4 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'business'
                            ? 'border-gray-400 text-gray-700'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {isSpanish ? 'Negocio' : 'Business'}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('email_address')}</label>
                        <input
                            {...register('email')}
                            type="email"
                            autoComplete="email"
                            placeholder={isSpanish ? 'nombre@empresa.com' : 'name@company.com'}
                            className="w-full px-4 py-3 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('password')}</label>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            {unconfirmedEmail && (
                                <button
                                    type="button"
                                    onClick={handleResendConfirmation}
                                    disabled={resending}
                                    className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    {resending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                    {isSpanish ? 'Reenviar confirmación' : 'Resend confirmation email'}
                                </button>
                            )}
                        </div>
                        <Link to="/forgot-password" className="text-sm font-bold text-[#007F00] hover:underline">
                            {isSpanish ? '¿Olvidaste tu Contraseña?' : 'Forgot Password?'}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#007F00] text-white rounded-full font-bold text-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('sign_in')}
                    </button>

                    <p className="text-center text-gray-500 mt-6">
                        {isSpanish ? '¿No tienes una cuenta?' : "Don't have an account?"}{' '}
                        <Link to="/signup" className="text-[#007F00] font-bold hover:underline">
                            {t('sign_up')}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
