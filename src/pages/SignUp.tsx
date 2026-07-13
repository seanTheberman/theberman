import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { trackReferral } from '../lib/referralTracking';
import { supabase } from '../lib/supabase';
import { getTenantFromDomain } from '../lib/tenant';
import { getCountryCode, getPhoneExample } from '../lib/phoneFormats';

// Tenant-specific registration number labels
const REGISTRATION_NUMBER_LABELS: Record<string, { label: string; placeholder: string; validationError: string }> = {
    ireland: { label: 'SEAI Registration #', placeholder: 'e.g. 10XXX', validationError: 'SEAI registration number is required' },
    spain: { label: 'CEE CAT Registration #', placeholder: 'ej. 123456', validationError: 'Número de registro CEE CAT es obligatorio' },
    england: { label: 'Assessor ID', placeholder: 'e.g. ELH123456', validationError: 'Assessor ID is required' },
    france: { label: 'DPE Diagnostiqueur #', placeholder: 'e.g. 12345', validationError: 'DPE number is required' },
    portugal: { label: 'N.º de Registo ADENE', placeholder: 'ex. 12345', validationError: 'O número de registo ADENE é obrigatório' }
};

const tenant = getTenantFromDomain();
const IS_SPANISH_TENANT = tenant === 'spain';
const IS_PORTUGUESE_TENANT = tenant === 'portugal';
const regLabels = REGISTRATION_NUMBER_LABELS[tenant] || REGISTRATION_NUMBER_LABELS.ireland;

const signupSchema = z.object({
    fullName: z.string().min(2, IS_SPANISH_TENANT ? 'El nombre completo debe tener al menos 2 caracteres' : IS_PORTUGUESE_TENANT ? 'O nome completo deve ter pelo menos 2 caracteres' : 'Full name must be at least 2 characters'),
    email: z.string().email(IS_SPANISH_TENANT ? 'Dirección de correo no válida' : IS_PORTUGUESE_TENANT ? 'Endereço de email inválido' : 'Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, IS_SPANISH_TENANT ? 'La contraseña debe tener al menos 6 caracteres' : IS_PORTUGUESE_TENANT ? 'A palavra-passe deve ter pelo menos 6 caracteres' : 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['user', 'contractor', 'business']),
    seaiNumber: z.string().min(1, regLabels.validationError),
}).refine((data) => data.password === data.confirmPassword, {
    message: IS_SPANISH_TENANT ? 'Las contraseñas no coinciden' : IS_PORTUGUESE_TENANT ? 'As palavras-passe não coincidem' : "Passwords don't match",
    path: ["confirmPassword"],
}).refine((data) => {
    if (data.role === 'contractor' && (!data.seaiNumber || data.seaiNumber.trim().length < 1)) {
        return false;
    }
    return true;
}, {
    message: regLabels.validationError,
    path: ["seaiNumber"],
}).refine((data) => {
    if (data.role === 'user' && (!data.phone || data.phone.length < 7)) {
        return false;
    }
    return true;
}, {
    message: IS_SPANISH_TENANT ? 'El número de teléfono es obligatorio para propietarios' : IS_PORTUGUESE_TENANT ? 'O número de telefone é obrigatório para proprietários' : "Phone number is required for homeowners",
    path: ["phone"],
});

type SignUpFormData = z.infer<typeof signupSchema>;

const SignUp = () => {
    const { t, isSpanish } = useTranslation();
    const { signUp, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const defaultRole = 'user';
    const [isRoleFixed, setIsRoleFixed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && user && role) {
            if (role === 'admin') navigate('/secure-admin-portal', { replace: true });
            else if (role === 'contractor') navigate('/dashboard/ber-assessor', { replace: true });
            else if (role === 'business') navigate('/dashboard/business', { replace: true });
            else navigate('/dashboard/user', { replace: true });
        }
    }, [user, role, loading, navigate]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting, errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: defaultRole,
        }
    });

    const activeRole = watch('role');

    // Handle role from query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const roleParam = params.get('role');
        if (roleParam === 'contractor' || roleParam === 'business' || roleParam === 'user') {
            setValue('role', roleParam as any);
            setIsRoleFixed(true);
        }
    }, [location.search, setValue]);


    const getHeaderContent = () => {
        if (isSpanish) {
            switch (activeRole) {
                case 'contractor':
                    return { title: 'Registro de Certificador', subtitle: 'Únete a nuestra red de certificadores energéticos profesionales.', nameLabel: 'Nombre Completo', namePlaceholder: 'Nombre completo' };
                case 'business':
                    return { title: 'Registro de Negocio', subtitle: 'Registra tu empresa en nuestro Catálogo de Eficiencia Energética.', nameLabel: 'Nombre Completo del Negocio', namePlaceholder: 'Nombre completo del negocio' };
                default:
                    return { title: 'Registro de Propietario', subtitle: 'Regístrate para empezar.', nameLabel: 'Nombre Completo', namePlaceholder: 'Nombre completo' };
            }
        }
        if (tenant === 'portugal') {
            switch (activeRole) {
                case 'contractor':
                    return { title: 'Registo de Perito Certificador', subtitle: 'Junte-se à nossa rede de peritos certificadores energéticos.', nameLabel: 'Nome Completo', namePlaceholder: 'Nome completo' };
                case 'business':
                    return { title: 'Registo de Negócio', subtitle: 'Registe a sua empresa no nosso Catálogo de Melhoria Energética.', nameLabel: 'Nome Completo do Negócio', namePlaceholder: 'Nome completo do negócio' };
                default:
                    return { title: 'Registo de Proprietário', subtitle: 'Registe-se para começar.', nameLabel: 'Nome Completo', namePlaceholder: 'Nome completo' };
            }
        }
        switch (activeRole) {
            case 'contractor':
                return { title: 'Assessor Registration', subtitle: 'Join our network of professional BER assessors.', nameLabel: 'Full Name', namePlaceholder: 'Full name' };
            case 'business':
                return { title: 'Business Registration', subtitle: 'Register your company in our Home Energy Catalogue.', nameLabel: 'Full Business Name', namePlaceholder: 'Full business name' };
            default:
                return { title: 'Homeowner Registration', subtitle: 'Sign up to get started.', nameLabel: 'Full Name', namePlaceholder: 'Full name' };
        }
    };

    const { title, subtitle, nameLabel, namePlaceholder } = getHeaderContent();






    const onSubmit = async (data: SignUpFormData) => {
        try {
            // Get referral code from URL
            const params = new URLSearchParams(location.search);
            const referralCode = params.get('ref');
            const redirectParam = params.get('redirect');

            // Check if email is already registered via secure RPC
            const { data: emailExists, error: checkError } = await supabase
                .rpc('check_email_exists', { p_email: data.email.trim().toLowerCase() });

            if (checkError) throw checkError;

            if (emailExists) {
                toast.error(isSpanish
                    ? 'Este correo electrónico ya está registrado. Por favor, inicia sesión.'
                    : tenant === 'portugal'
                        ? 'Este email já está registado. Por favor, inicie sessão.'
                        : 'This email is already registered. Please log in.');
                navigate('/login', { replace: true });
                return;
            }

            // Check for duplicate phone number (if provided)
            if (data.phone && data.phone.trim().length >= 7) {
                const { data: existingPhone } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .eq('phone', data.phone.trim())
                    .maybeSingle();
                if (existingPhone) {
                    toast.error(isSpanish ? 'Este número de teléfono ya está asociado a otra cuenta. Por favor, usa un número diferente.' : tenant === 'portugal' ? 'Este número de telefone já está associado a outra conta. Por favor, utilize um número diferente.' : 'This phone number is already associated with another account. Please use a different number.');
                    return;
                }
            }

            const { error, data: authData } = await signUp(
                data.email.trim(),
                data.password,
                data.fullName,
                data.role,
                data.phone,
                data.seaiNumber // Pass registration number
            );
            if (error) throw error;

            if (authData?.user) {
                // Update profiles table with seai_number for contractors
                if (data.role === 'contractor' && data.seaiNumber) {
                    await supabase
                        .from('profiles')
                        .update({ seai_number: data.seaiNumber })
                        .eq('id', authData.user.id);
                }

                // Track referral if this is a business signup with referral code
                if (data.role === 'business' && referralCode) {
                    await trackReferral(authData.user.id, referralCode);
                }

                // Handle pending quote if coming from quick quote flow
                if (redirectParam === 'quote' && data.role === 'contractor') {
                    const pendingQuote = sessionStorage.getItem('pendingQuote');
                    if (pendingQuote) {
                        const { assessmentId, quoteData } = JSON.parse(pendingQuote);
                        
                        // Submit the quote with the new contractor ID
                        const { error: quoteError } = await supabase
                            .from('quotes')
                            .insert({
                                assessment_id: assessmentId,
                                created_by: authData.user.id,
                                price: parseFloat(quoteData.price),
                                notes: quoteData.notes,
                                status: 'pending'
                            });
                        
                        if (!quoteError) {
                            toast.success(isSpanish ? '¡Cuenta creada y presupuesto enviado con éxito!' : tenant === 'portugal' ? 'Conta criada e orçamento enviado com sucesso!' : 'Account created and quote submitted successfully!');
                            sessionStorage.removeItem('pendingQuote');
                        } else {
                            toast.error(isSpanish ? 'Cuenta creada, pero no se pudo enviar el presupuesto. Inténtalo de nuevo desde tu panel.' : tenant === 'portugal' ? 'Conta criada, mas não foi possível enviar o orçamento. Tente novamente a partir do painel.' : 'Account created but failed to submit quote. Please try again from your dashboard.');
                        }
                    }
                }

                const isConfirmationRequired = !authData.session;

                if (isConfirmationRequired) {
                    toast.success(isSpanish ? '¡Cuenta creada! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.' : tenant === 'portugal' ? 'Conta criada! Verifique o seu email para confirmar a sua conta antes de iniciar sessão.' : 'Account created! Please check your email to confirm your account before logging in.', {
                        duration: 6000
                    });
                    navigate('/login');
                } else {
                    toast.success(isSpanish ? '¡Cuenta creada con éxito!' : tenant === 'portugal' ? 'Conta criada com sucesso!' : 'Account created successfully!');
                    if (data.role === 'business') {
                        navigate('/business-onboarding');
                    } else if (data.role === 'contractor') {
                        navigate('/assessor-onboarding');
                    } else {
                        navigate('/dashboard/user');
                    }
                }
            }
        } catch (err: any) {
            toast.error(err.message || (isSpanish ? 'No se pudo crear la cuenta' : tenant === 'portugal' ? 'Não foi possível criar a conta' : 'Failed to create account'));
        }
    };


    return (
        <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
            <div className="container mx-auto px-6 max-w-lg">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-8 md:p-12 text-center">

                    <div className="mb-8">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                            {title}
                        </h2>
                        <p className="text-gray-500">
                            {subtitle}
                        </p>
                    </div>

                    {/* Role Tabs - only show if not arriving from a direct role-specific link */}
                    {!isRoleFixed && (
                        <div className="flex border-b border-gray-200 mb-8">
                            <button
                                type="button"
                                onClick={() => setValue('role', 'user')}
                                className={`py-3 px-6 text-sm font-bold transition-all border-b-2 -mb-px ${activeRole === 'user'
                                    ? 'border-[#007F00] text-[#007F00]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {isSpanish ? 'PROPIETARIO' : tenant === 'portugal' ? 'PROPRIETÁRIO' : 'HOMEOWNER'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('role', 'contractor')}
                                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px ${activeRole === 'contractor'
                                    ? 'border-[#007F00] text-[#007F00]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {isSpanish ? 'CERTIFICADOR' : tenant === 'portugal' ? 'PERITO' : 'ASSESSOR'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('role', 'business')}
                                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px ${activeRole === 'business'
                                    ? 'border-[#007F00] text-[#007F00]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {isSpanish ? 'CATÁLOGO NEGOCIOS' : tenant === 'portugal' ? 'CATÁLOGO NEGÓCIOS' : 'BUSINESS CATALOGUE'}
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-1 text-left">
                            <label className="text-sm font-bold text-gray-700 ml-1">{nameLabel}</label>
                            <input
                                {...register('fullName')}
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder={namePlaceholder}
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.fullName.message}</p>}
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-bold text-gray-700 ml-1">{t('email_address')}</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder={isSpanish ? 'correo@empresa.com' : tenant === 'portugal' ? 'nome@exemplo.com' : 'email'}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.email.message}</p>}
                        </div>

                        {activeRole === 'user' && (
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">{t('phone_number')}</label>
                                <div className="flex">
                                    <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm font-bold text-gray-500 whitespace-nowrap">
                                        {getCountryCode(tenant)}
                                    </span>
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                        placeholder={getPhoneExample(tenant)}
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.phone.message}</p>}
                            </div>
                        )}

                        {activeRole === 'contractor' && (
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">{regLabels.label} <span className="text-red-500">*</span></label>
                                <input
                                    {...register('seaiNumber')}
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder={regLabels.placeholder}
                                />
                                {errors.seaiNumber && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.seaiNumber.message}</p>}
                            </div>
                        )}


                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">{t('password')}</label>
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
                                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">{isSpanish ? 'Confirmar' : tenant === 'portugal' ? 'Confirmar' : 'Confirm'}</label>
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
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#007F00] text-white font-black py-4 rounded-xl hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {isSpanish ? 'Creando Cuenta...' : tenant === 'portugal' ? 'A Criar Conta...' : 'Creating Account...'}
                                </>
                            ) : (
                                t('sign_up')
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-gray-500 font-medium">
                                {isSpanish ? '¿Ya tienes una cuenta?' : tenant === 'portugal' ? 'Já tem conta?' : 'Already have an account?'}{' '}
                                <Link to="/login" className="text-[#007F00] font-black hover:underline">
                                    {isSpanish ? 'Inicia sesión' : tenant === 'portugal' ? 'Iniciar sessão' : 'Log in'}
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
