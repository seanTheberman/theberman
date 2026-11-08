
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

const tenant = getTenantFromDomain();
const IS_SPANISH_TENANT = tenant === 'spain';
const IS_PORTUGUESE_TENANT = tenant === 'portugal';
const IS_FRENCH_TENANT = tenant === 'france';

const loginSchema = z.object({
    email: z.string().email(IS_SPANISH_TENANT ? 'Dirección de correo no válida' : IS_PORTUGUESE_TENANT ? 'Endereço de email inválido' : IS_FRENCH_TENANT ? 'Adresse e-mail invalide' : 'Invalid email address'),
    password: z.string().min(6, IS_SPANISH_TENANT ? 'La contraseña debe tener al menos 6 caracteres' : IS_PORTUGUESE_TENANT ? 'A palavra-passe deve ter pelo menos 6 caracteres' : IS_FRENCH_TENANT ? 'Le mot de passe doit comporter au moins 6 caractères' : 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const { t, isSpanish } = useTranslation();
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';
    const isFrench = tenant === 'france';
    const assessorLabel = isEngland ? 'EPC Assessor' : isSpanish ? 'Certificador Energético' : isPortuguese ? 'Perito Certificador' : isFrench ? 'Diagnostiqueur DPE' : 'BER Assessor';
    const { signIn, user, role, profile, loading, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'homeowner' | 'assessor' | 'business'>(isSpanish ? 'assessor' : 'homeowner');
    const [showPassword, setShowPassword] = useState(false);
    // Passwordless (OTP) login for homeowners — opened directly via /login?otp=1 from quote SMS links
    const [otpMode, setOtpMode] = useState(() => new URLSearchParams(location.search).get('otp') === '1');
    const [otpIdentifier, setOtpIdentifier] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpStep, setOtpStep] = useState<'identify' | 'code'>('identify');
    const [otpBusy, setOtpBusy] = useState(false);
    const [otpHint, setOtpHint] = useState<string | null>(null);
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
    const [resending, setResending] = useState(false);
    // Prevents useEffect from redirecting mid-submission while role check is running
    const signingIn = React.useRef(false);

    // Default redirect to /admin if no previous path
    const from = location.state?.from?.pathname;
    
    // Check for redirect parameter from URL
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    const isConfirmed = params.get('confirmed') === 'true';

    // Parse the confirmation-link access_token in the URL hash.
    // Supabase normally does this automatically, but a race with our listeners
    // can leave the page blank until a manual refresh.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token=')) return;

        let cancelled = false;
        const params = new URLSearchParams(hash.replace(/^#/, ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) return;

        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ data, error }) => {
            if (cancelled) return;
            if (error) {
                console.error('Login: setSession error:', error);
                toast.error(t('confirmation_failed', 'Email confirmation failed. Please try logging in or request a new link.'));
            } else if (data?.session) {
                // Remove the hash fragment after the session is extracted so
                // the URL is clean and the auth listeners can redirect cleanly.
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        // Skip auto-redirect while onSubmit is running — let it handle role check first
        if (signingIn.current) return;

        // Session exists (e.g. arrived via email confirmation link) but role not loaded yet — fetch it
        if (!loading && user && !role) {
            refreshProfile();
            return;
        }

        if (!loading && user && role) {
            // If the flag is still set but user has an active session (they already
            // proved their identity), clear it silently. This prevents infinite redirect loops
            // when the original invite link expired and user reset via Forgot Password.
            if (user.user_metadata?.requires_password_change) {
                supabase.auth.updateUser({ data: { requires_password_change: false } });
            }

            // Handle pending registration users (Exclude admins)
            if (role === 'contractor' || role === 'business') {
                if (profile?.registration_status === 'pending') {
                    const path = role === 'contractor' ? '/assessor-onboarding' : '/business-onboarding';
                    navigate(path, { replace: true });
                    return;
                }
            }

            if (redirectParam === 'quote' && role === 'contractor') {
                // Check if there's a pending quote to show
                const pendingQuote = sessionStorage.getItem('pendingQuote');
                if (pendingQuote) {
                    toast.success(isSpanish ? '¡Sesión iniciada! Tu presupuesto ha sido enviado.' : isPortuguese ? 'Sessão iniciada! O seu orçamento foi enviado.' : isFrench ? 'Connexion réussie ! Votre devis a été envoyé.' : 'Login successful! Your quote has been submitted.');
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
                    throw new Error(isSpanish ? `Demasiados intentos fallidos. Cuenta bloqueada durante ${rateLimitResult.lockoutRemaining} minutos.` : isFrench ? `Trop de tentatives échouées. Compte verrouillé pendant ${rateLimitResult.lockoutRemaining} minutes.` : `Too many failed attempts. Account locked for ${rateLimitResult.lockoutRemaining} minutes.`);
                }
                throw new Error(isSpanish ? 'Inicio de sesión bloqueado temporalmente. Inténtalo más tarde.' : isFrench ? 'Connexion temporairement bloquée. Veuillez réessayer plus tard.' : 'Login temporarily blocked. Please try again later.');
            }
            
            const { data: authData, error } = await signIn(email, data.password);

            if (error) {
                // Record failed attempt for rate limiting
                recordFailedAttempt(email);
                
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('email not confirmed')) {
                    setUnconfirmedEmail(email);
                    return;
                }
                if (error.status === 400 || errorMessage.includes('invalid credentials')) {
                    throw new Error(isSpanish ? 'Debido a una actualización técnica reciente, puede que necesites restablecer tu contraseña. Haz clic en "¿Olvidaste tu Contraseña?" para crear una nueva e inténtalo de nuevo.' : isPortuguese ? 'Devido a uma atualização técnica recente, poderá ser necessário redefinir a sua palavra-passe. Clique em "Esqueceu-se da palavra-passe?" para criar uma nova e tente novamente.' : isFrench ? 'En raison d\'une mise à jour technique récente, vous devrez peut-être réinitialiser votre mot de passe. Cliquez sur "Mot de passe oublié ?" pour créer un nouveau mot de passe et réessayer.' : 'Due to a recent technical update, your password may need to be reset. Please click "Forgot Password" to create a new password and try again.');
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
            toast.error(err.message || (isSpanish ? 'No se pudo iniciar sesión' : isPortuguese ? 'Não foi possível iniciar sessão' : isFrench ? 'Échec de la connexion' : 'Failed to login'));
        } finally {
            signingIn.current = false;
        }
    };

    const otpT = (en: string, es: string, pt: string, fr: string) => isSpanish ? es : isPortuguese ? pt : isFrench ? fr : en;

    const handleOtpSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const identifier = otpIdentifier.trim();
        if (!identifier) return;
        setOtpBusy(true);
        try {
            const { data, error } = await supabase.functions.invoke('otp-login', {
                body: { action: 'send', identifier, tenant },
            });
            if (error) throw error;
            if (!data?.success) {
                if (data?.error === 'too_many_requests') throw new Error(otpT('Too many codes requested. Please wait 15 minutes.', 'Demasiados códigos solicitados. Espera 15 minutos.', 'Demasiados códigos pedidos. Aguarde 15 minutos.', 'Trop de codes demandés. Veuillez patienter 15 minutes.'));
                throw new Error(data?.error || 'Failed to send code');
            }
            // Always advance (no account enumeration); show where it went when we know
            setOtpHint(data.channel === 'sms' && data.phoneHint
                ? otpT(`Code sent by SMS to ···${data.phoneHint}`, `Código enviado por SMS a ···${data.phoneHint}`, `Código enviado por SMS para ···${data.phoneHint}`, `Code envoyé par SMS au ···${data.phoneHint}`)
                : data.channel === 'email' && data.emailHint
                    ? otpT(`Code sent by email to ${data.emailHint}`, `Código enviado por email a ${data.emailHint}`, `Código enviado por email para ${data.emailHint}`, `Code envoyé par e-mail à ${data.emailHint}`)
                    : otpT('If an account matches, a code has been sent.', 'Si existe una cuenta, se ha enviado un código.', 'Se existir uma conta, foi enviado um código.', 'Si un compte correspond, un code a été envoyé.'));
            setOtpStep('code');
        } catch (err: any) {
            toast.error(err.message || otpT('Could not send code', 'No se pudo enviar el código', 'Não foi possível enviar o código', 'Impossible d\'envoyer le code'));
        } finally {
            setOtpBusy(false);
        }
    };

    const handleOtpVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const code = otpCode.trim();
        if (code.length !== 6) return;
        setOtpBusy(true);
        signingIn.current = true;
        try {
            const { data, error } = await supabase.functions.invoke('otp-login', {
                body: { action: 'verify', identifier: otpIdentifier.trim(), code, tenant },
            });
            if (error) throw error;
            if (!data?.success || !data.token_hash) {
                const msg = data?.error === 'code_expired'
                    ? otpT('Code expired. Please request a new one.', 'El código ha caducado. Solicita uno nuevo.', 'O código expirou. Peça um novo.', 'Code expiré. Veuillez en demander un nouveau.')
                    : otpT('Incorrect code. Please try again.', 'Código incorrecto. Inténtalo de nuevo.', 'Código incorreto. Tente novamente.', 'Code incorrect. Veuillez réessayer.');
                throw new Error(msg);
            }
            const { error: sessionError } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: 'magiclink' });
            if (sessionError) throw sessionError;
            recordSuccessfulLogin(data.email || otpIdentifier);
            toast.success(otpT('Signed in!', '¡Sesión iniciada!', 'Sessão iniciada!', 'Connecté !'));
            // The auth effect above handles the role-based redirect once the session lands
        } catch (err: any) {
            toast.error(err.message || otpT('Login failed', 'Error al iniciar sesión', 'Falha no início de sessão', 'Échec de la connexion'));
        } finally {
            setOtpBusy(false);
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
                options: { emailRedirectTo: `${websiteUrl}/login?confirmed=true` }
            });
            if (error) throw error;
            toast.success(isSpanish ? '¡Correo de confirmación reenviado! Revisa tu bandeja de entrada y la carpeta de spam.' : isPortuguese ? 'Email de confirmação reenviado! Verifique a sua caixa de entrada e pasta de spam.' : isFrench ? 'E-mail de confirmation renvoyé ! Vérifiez votre boîte de réception et le dossier spam.' : 'Confirmation email resent! Please check your inbox and spam folder.');
            setUnconfirmedEmail(null);
        } catch (err: any) {
            toast.error(err.message || (isSpanish ? 'No se pudo reenviar el correo de confirmación' : isPortuguese ? 'Não foi possível reenviar o email de confirmação' : isFrench ? 'Échec du renvoi de l\'e-mail de confirmation' : 'Failed to resend confirmation email'));
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
            <div className="w-full max-w-md px-6">
                {/* Email confirmed banner */}
                {isConfirmed && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="font-bold text-green-800">
                                {isSpanish ? '¡Cuenta confirmada!' : isPortuguese ? 'Conta confirmada!' : isFrench ? 'Compte confirmé !' : 'Account confirmed!'}
                            </p>
                        </div>
                        <p className="text-sm text-green-700">
                            {isSpanish ? 'Gracias por confirmar tu correo. Ahora puedes iniciar sesión con tus credenciales.' : isPortuguese ? 'Obrigado por confirmar o seu email. Agora pode iniciar sessão com as suas credenciais.' : isFrench ? 'Merci d\u2019avoir confirm\u00e9 votre e-mail. Vous pouvez maintenant vous connecter avec vos identifiants.' : 'Thank you for confirming your email. You can now sign in with your credentials.'}
                        </p>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSpanish ? 'Bienvenido de Nuevo' : isPortuguese ? 'Bem-vindo de Volta' : isFrench ? 'Bon Retour' : 'Welcome Back'}</h1>
                    <p className="text-gray-500">{isSpanish ? 'Inicia sesión para continuar.' : isPortuguese ? 'Inicie sessão para continuar.' : isFrench ? 'Connectez-vous pour continuer.' : 'Sign in to continue.'}</p>
                </div>

                {/* Simple Tab Switcher */}
                <div className="flex border-b border-gray-200 mb-8">
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
                        onClick={() => setActiveTab('homeowner')}
                        className={`py-3 px-6 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'homeowner'
                            ? 'border-gray-400 text-gray-700'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {isSpanish ? 'Zona Cliente' : isPortuguese ? 'Área Cliente' : isFrench ? 'Propriétaire' : 'Homeowner'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('business')}
                        className={`py-3 px-4 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'business'
                            ? 'border-gray-400 text-gray-700'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {isSpanish ? 'Negocio' : isPortuguese ? 'Negócio' : isFrench ? 'Entreprise' : 'Business'}
                    </button>
                </div>

                {/* Passwordless OTP login (homeowners only) */}
                {activeTab === 'homeowner' && otpMode ? (
                    <form onSubmit={otpStep === 'identify' ? handleOtpSend : handleOtpVerify} className="space-y-5">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                            {otpT('Sign in without a password — enter the email or mobile number you used when requesting your quote and we\'ll text you a 6-digit code.',
                                'Inicia sesión sin contraseña: introduce el email o móvil que usaste al pedir tu presupuesto y te enviaremos un código de 6 dígitos por SMS.',
                                'Inicie sessão sem palavra-passe — introduza o email ou telemóvel que usou ao pedir o orçamento e enviamos-lhe um código de 6 dígitos por SMS.',
                                'Connectez-vous sans mot de passe : saisissez l\'e-mail ou le mobile utilisé pour votre demande de devis et nous vous enverrons un code à 6 chiffres par SMS.')}
                        </div>

                        {otpStep === 'identify' ? (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {otpT('Email or mobile number', 'Email o número de móvil', 'Email ou telemóvel', 'E-mail ou numéro de mobile')}
                                </label>
                                <input
                                    value={otpIdentifier}
                                    onChange={(e) => setOtpIdentifier(e.target.value)}
                                    type="text"
                                    inputMode="email"
                                    autoComplete="username"
                                    placeholder={otpT('name@email.com or 087 123 4567', 'nombre@email.com o 612 345 678', 'nome@email.com ou 912 345 678', 'nom@email.com ou 06 12 34 56 78')}
                                    className="w-full px-4 py-3 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div>
                                {otpHint && <p className="text-sm text-gray-600 mb-3">{otpHint}</p>}
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {otpT('6-digit code', 'Código de 6 dígitos', 'Código de 6 dígitos', 'Code à 6 chiffres')}
                                </label>
                                <input
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="123456"
                                    className="w-full px-4 py-3 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none text-center text-2xl tracking-[0.5em] font-bold"
                                    autoFocus
                                />
                                <div className="flex justify-between mt-2 text-sm">
                                    <button type="button" onClick={() => { setOtpStep('identify'); setOtpCode(''); }} className="text-gray-500 hover:underline">
                                        {otpT('Change email/number', 'Cambiar email/número', 'Alterar email/número', 'Changer e-mail/numéro')}
                                    </button>
                                    <button type="button" onClick={() => handleOtpSend()} disabled={otpBusy} className="text-[#007F00] font-bold hover:underline">
                                        {otpT('Resend code', 'Reenviar código', 'Reenviar código', 'Renvoyer le code')}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={otpBusy || (otpStep === 'identify' ? !otpIdentifier.trim() : otpCode.length !== 6)}
                            className="w-full py-4 bg-[#007F00] text-white rounded-full font-bold text-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {otpBusy ? <Loader2 className="animate-spin" size={20} /> : otpStep === 'identify'
                                ? otpT('Send me a code', 'Enviarme un código', 'Enviar-me um código', 'M\'envoyer un code')
                                : t('sign_in')}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            <button type="button" onClick={() => setOtpMode(false)} className="text-[#007F00] font-bold hover:underline">
                                {otpT('Sign in with password instead', 'Iniciar sesión con contraseña', 'Iniciar sessão com palavra-passe', 'Se connecter avec un mot de passe')}
                            </button>
                        </p>
                    </form>
                ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('email_address')}</label>
                        <input
                            {...register('email')}
                            type="email"
                            autoComplete="email"
                            placeholder={isSpanish ? 'nombre@empresa.com' : isPortuguese ? 'nome@empresa.com' : isFrench ? 'nom@entreprise.com' : 'name@company.com'}
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
                                    {isSpanish ? 'Reenviar confirmación' : isPortuguese ? 'Reenviar confirmação' : isFrench ? 'Renvoyer la confirmation' : 'Resend confirmation email'}
                                </button>
                            )}
                        </div>
                        <Link to="/forgot-password" className="text-sm font-bold text-[#007F00] hover:underline">
                            {isSpanish ? '¿Olvidaste tu Contraseña?' : isPortuguese ? 'Esqueceu-se da palavra-passe?' : isFrench ? 'Mot de passe oublié ?' : 'Forgot Password?'}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#007F00] text-white rounded-full font-bold text-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('sign_in')}
                    </button>

                    {activeTab === 'homeowner' && (
                        <p className="text-center text-sm">
                            <button type="button" onClick={() => setOtpMode(true)} className="text-[#007F00] font-bold hover:underline">
                                {otpT('Forgot your password? Sign in with a one-time code', '¿Sin contraseña? Entra con un código de un solo uso', 'Sem palavra-passe? Entre com um código único', 'Sans mot de passe ? Connectez-vous avec un code unique')}
                            </button>
                        </p>
                    )}

                    <p className="text-center text-gray-500 mt-6">
                        {isSpanish ? '¿No tienes una cuenta?' : isPortuguese ? 'Ainda não tem conta?' : isFrench ? 'Pas encore de compte ?' : "Don't have an account?"}{' '}
                        <Link to="/signup" className="text-[#007F00] font-bold hover:underline">
                            {t('sign_up')}
                        </Link>
                    </p>
                </form>
                )}
            </div>
        </div>
    );
};

export default Login;
