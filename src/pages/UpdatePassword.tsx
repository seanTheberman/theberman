
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowLeft, X, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTenantFromDomain } from '../lib/tenant';

const getUpdatePasswordSchema = (isSpanish: boolean) => z.object({
    password: z.string().min(6, isSpanish ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: isSpanish ? 'Las contraseñas no coinciden' : "Passwords don't match",
    path: ["confirmPassword"],
});

type UpdatePasswordFormData = z.infer<ReturnType<typeof getUpdatePasswordSchema>>;

const UpdatePassword = () => {
    const { updateUserPassword, user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [redirecting, setRedirecting] = useState(false);
    const [authWait, setAuthWait] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [customToken, setCustomToken] = useState<string | null>(null);
    const [customEmail, setCustomEmail] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState(false);
    const isSpanish = getTenantFromDomain() === 'spain';
    const isEngland = getTenantFromDomain() === 'england';
    const brandName = isEngland ? 'EPC Cert' : isSpanish ? 'Certificado Energético' : 'The Berman';

    // Detect custom token from email link (/update-password?token=xyz&email=abc)
    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        if (token && email) {
            setCustomToken(token);
            setCustomEmail(email);
            setAuthWait(false);
        }
    }, [searchParams]);

    // Give Supabase a moment to process the hash if user is not immediately available
    useEffect(() => {
        // If we already have a user, no need to wait
        if (user) {
            setAuthWait(false);
            return;
        }

        // If custom token from email link is present, don't wait for auth
        if (customToken && customEmail) {
            setAuthWait(false);
            return;
        }

        // If there's no access token in the URL, don't wait either
        if (!(window.location.hash.includes('access_token') || window.location.search.includes('code=') || window.location.search.includes('type=recovery'))) {
            setAuthWait(false);
            return;
        }

        // We have a hash but no user yet — wait for onAuthStateChange to fire
        const timer = setTimeout(() => {
            setAuthWait(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [user]);

    // Only redirect when requires_password_change is explicitly set to FALSE
    // AND the user did NOT just arrive via a password-recovery link.
    useEffect(() => {
        if (!user) return;
        // If the URL contains an access_token hash, the user clicked a reset link
        // — always show the form so they can set a new password.
        if (window.location.hash.includes('access_token') || window.location.search.includes('code=') || window.location.search.includes('type=recovery')) return;
        const needsChange = user.user_metadata?.requires_password_change;
        if (needsChange === false) {
            // Password was just changed — redirect to onboarding or dashboard
            setRedirecting(true);
            supabase
                .from('profiles')
                .select('role, registration_status')
                .eq('id', user.id)
                .maybeSingle()
                .then(({ data: profile }) => {
                    const role = profile?.role;
                    const regStatus = profile?.registration_status;
                    if (regStatus === 'pending') {
                        if (role === 'contractor') navigate('/assessor-onboarding', { replace: true });
                        else if (role === 'business') navigate('/business-onboarding', { replace: true });
                        else navigate('/dashboard/user', { replace: true });
                    } else {
                        if (role === 'admin') navigate('/secure-admin-portal', { replace: true });
                        else if (role === 'contractor') navigate('/dashboard/ber-assessor', { replace: true });
                        else if (role === 'business') navigate('/dashboard/business', { replace: true });
                        else navigate('/dashboard/user', { replace: true });
                    }
                });
        }
    }, [user, navigate]);

    const updatePasswordSchema = getUpdatePasswordSchema(isSpanish);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<UpdatePasswordFormData>({
        resolver: zodResolver(updatePasswordSchema),
    });

    // Show loading while either global auth or local wait is active
    if (loading || authWait) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#007F00] mb-4" size={40} />
                <p className="text-gray-600 font-medium">{isSpanish ? 'Verificando tu enlace seguro...' : 'Verifying your secure link...'}</p>
            </div>
        );
    }

    // Show nothing while auto-redirecting to avoid flash of update form
    if (redirecting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#007F00]" size={40} />
            </div>
        );
    }

    // If no user and no hash and no custom token after waiting, they probably accessed it directly/invalidly
    const hasSupabaseReset = window.location.hash.includes('access_token') || window.location.search.includes('code=') || window.location.search.includes('type=recovery');
    const hasCustomToken = !!customToken && !!customEmail;

    if (!user && !hasSupabaseReset && !hasCustomToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">{isSpanish ? 'Sesión no válida' : 'Invalid Session'}</h2>
                    <p className="text-gray-500 mb-8">{isSpanish ? 'Este enlace no es válido o ha caducado. Por favor, utiliza el enlace "Olvidaste tu contraseña" en la página de inicio de sesión o contacta con soporte.' : 'This link is invalid or has expired. Please use the "Forgot Password" link on the login page or contact support.'}</p>
                    <Link to="/login" className="inline-flex items-center gap-2 text-white bg-[#007F00] px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition-all">
                        {isSpanish ? 'Ir al inicio de sesión' : 'Go to Login'}
                    </Link>
                </div>
            </div>
        );
    }

    const onSubmit = async (data: UpdatePasswordFormData) => {
        try {
            // CUSTOM TOKEN FLOW (from SMTP email)
            if (customToken && customEmail) {
                const { data: result, error } = await supabase.functions.invoke('verify-password-reset', {
                    body: { token: customToken, email: customEmail, password: data.password }
                });
                if (error) throw error;
                if (!result?.success) throw new Error(result?.error || (isSpanish ? 'No se pudo restablecer la contraseña' : 'Failed to reset password'));

                toast.success(isSpanish ? '¡Contraseña actualizada!' : 'Password updated successfully!');
                setResetSuccess(true);
                return;
            }

            // SUPABASE MAGIC LINK FLOW (existing behavior)
            // Force a session refresh to be absolutely sure we have one
            const { data: sessionData } = await supabase.auth.getSession();

            if (!sessionData.session) {
                // If it's a cold start with hash, Supabase might need an extra ms to parse it
                await new Promise(resolve => setTimeout(resolve, 500));
                const { data: secondCheck } = await supabase.auth.getSession();
                if (!secondCheck.session) {
                    throw new Error(isSpanish ? 'No se encontró la sesión de autenticación. Intenta iniciar sesión o haz clic en el enlace de nuevo.' : 'Authentication session not found. Please try logging in or click the link again.');
                }
            }

            // updateUserPassword returns the updated user — use it directly
            const { data: updateData, error } = await updateUserPassword(data.password);
            if (error) throw error;

            // Get user ID from response or fall back to current session
            const userId = updateData?.user?.id ?? user?.id;
            if (!userId) {
                navigate('/login', { replace: true });
                return;
            }

            // Fetch profile to determine next step
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, registration_status')
                .eq('id', userId)
                .maybeSingle();

            const role = profile?.role;
            const regStatus = profile?.registration_status;

            toast.success(isSpanish ? '¡Contraseña actualizada! Completando tu perfil a continuación.' : 'Password updated! Completing your profile next.');

            // If onboarding not done yet → go to onboarding page (pre-filled)
            if (regStatus === 'pending') {
                if (role === 'contractor') {
                    navigate('/assessor-onboarding', { replace: true });
                } else if (role === 'business') {
                    navigate('/business-onboarding', { replace: true });
                } else {
                    // user/homeowner with pending — shouldn't normally happen
                    navigate('/dashboard/user', { replace: true });
                }
            } else {
                // Already onboarded — go to their dashboard
                if (role === 'admin') navigate('/secure-admin-portal', { replace: true });
                else if (role === 'contractor') navigate('/dashboard/ber-assessor', { replace: true });
                else if (role === 'business') navigate('/dashboard/business', { replace: true });
                else navigate('/dashboard/user', { replace: true });
            }
        } catch (err: any) {
            toast.error(err.message || (isSpanish ? 'No se pudo actualizar la contraseña' : 'Failed to update password'));
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-white">
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-[#007F00] flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 group w-fit">
                        <div className="relative">
                            <img src="/logo.svg" alt={`${brandName} Logo`} className="h-12 w-auto brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-white">{brandName}</span>
                    </Link>

                    <div className="mt-20">
                        <h1 className="text-5xl font-serif font-bold text-white leading-tight mb-6">
                            {isSpanish ? 'Nueva Contraseña,' : 'New Password,'} <br />
                            <span className="text-[#9ACD32]">{isSpanish ? 'Nuevo Comienzo.' : 'New Start.'}</span>
                        </h1>
                        <p className="text-green-100 text-lg max-w-md leading-relaxed">
                            {isSpanish ? 'Crea una contraseña segura para proteger tu cuenta.' : 'Create a strong password to keep your account secure.'}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-6 text-green-200 text-sm font-medium">
                    <span>{isSpanish ? 'Política de Privacidad' : 'Privacy Policy'}</span>
                    <span>{isSpanish ? 'Términos de Servicio' : 'Terms of Service'}</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
                <div className="max-w-md w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#007F00] transition-colors mb-8 font-medium">
                        <ArrowLeft size={16} /> {isSpanish ? 'Volver al inicio' : 'Back to Home'}
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">{isSpanish ? 'Actualizar Contraseña' : 'Update Password'}</h2>
                        <p className="text-gray-500">{isSpanish ? 'Por favor, introduce tu nueva contraseña.' : 'Please enter your new password.'}</p>
                    </div>

                    {resetSuccess ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-[#007F00]" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{isSpanish ? '¡Contraseña Actualizada!' : 'Password Updated!'}</h3>
                            <p className="text-gray-500 mb-6">
                                {isSpanish ? 'Tu contraseña ha sido actualizada. Por favor, inicia sesión con tu nueva contraseña.' : 'Your password has been updated. Please log in with your new password.'}
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center w-full bg-[#007F00] text-white font-bold py-3.5 rounded-xl hover:bg-green-800 transition-all shadow-lg"
                            >
                                {isSpanish ? 'Ir al inicio de sesión' : 'Go to Login'}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">{isSpanish ? 'Nueva Contraseña' : 'New Password'}</label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">{isSpanish ? 'Confirmar Contraseña' : 'Confirm Password'}</label>
                            <div className="relative">
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#007F00] text-white font-bold py-3.5 rounded-xl hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {isSpanish ? 'Actualizando...' : 'Updating...'}
                                </>
                            ) : (
                                isSpanish ? 'Actualizar Contraseña' : 'Update Password'
                            )}
                        </button>
                    </form>
                )}
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
