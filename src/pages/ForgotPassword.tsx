
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTenantFromDomain } from '../lib/tenant';
import { supabase } from '../lib/supabase';

const tenant = getTenantFromDomain();
const IS_SPANISH_TENANT = tenant === 'spain';
const IS_PORTUGUESE_TENANT = tenant === 'portugal';

const forgotPasswordSchema = z.object({
    email: z.string().email(IS_SPANISH_TENANT ? 'Dirección de correo no válida' : IS_PORTUGUESE_TENANT ? 'Endereço de email inválido' : 'Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';
    const isSpanish = tenant === 'spain';
    const brandName = isEngland ? 'EPC Cert' : isSpanish ? 'Certificado Energético' : isPortuguese ? 'Certificado Energia' : 'The Berman';
    const logoUrl = isPortuguese ? '/certificado-energia-logo.svg' : '/logo.svg';
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const { data: result, error } = await supabase.functions.invoke('send-password-reset', {
                body: { email: data.email, tenant }
            });
            if (error) throw error;
            if (!result?.success) throw new Error(result?.error || (isSpanish ? 'No se pudo enviar el correo de restablecimiento' : isPortuguese ? 'Não foi possível enviar o email de redefinição' : 'Failed to send reset email'));
            toast.success(isSpanish ? '¡Correo de restablecimiento enviado! Revisa tu bandeja de entrada.' : isPortuguese ? 'Email de redefinição enviado! Verifique a sua caixa de entrada.' : 'Password reset email sent! Check your inbox.');
            setSent(true);
        } catch (err: any) {
            toast.error(err.message || (isSpanish ? 'No se pudo enviar el correo de restablecimiento' : isPortuguese ? 'Não foi possível enviar o email de redefinição' : 'Failed to send reset email'));
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
                            <img src={logoUrl} alt={`${brandName} Logo`} className="h-12 w-auto brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-white">{brandName}</span>
                    </Link>

                    <div className="mt-20">
                        <h1 className="text-5xl font-serif font-bold text-white leading-tight mb-6">
                            {isSpanish ? 'Protege tu' : isPortuguese ? 'Proteja a sua' : 'Secure your'} <br />
                            <span className="text-[#9ACD32]">{isSpanish ? 'Cuenta.' : isPortuguese ? 'Conta.' : 'Account.'}</span>
                        </h1>
                        <p className="text-green-100 text-lg max-w-md leading-relaxed">
                            {isSpanish ? 'Nos pasa a todos. Te ayudaremos a recuperar el acceso a tu cuenta en un momento.' : isPortuguese ? 'Acontece a todos. Vamos ajudá-lo a recuperar o acesso à sua conta num instante.' : "It happens to the best of us. We'll help you get back into your account in no time."}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-6 text-green-200 text-sm font-medium">
                    <span>{isSpanish ? 'Política de Privacidad' : isPortuguese ? 'Política de Privacidade' : 'Privacy Policy'}</span>
                    <span>{isSpanish ? 'Términos de Servicio' : isPortuguese ? 'Termos de Serviço' : 'Terms of Service'}</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
                {/* Mobile Logo (Visible only on mobile) */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logoUrl} alt="Logo" className="h-10" />
                    </Link>
                </div>

                <div className="max-w-md w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#007F00] transition-colors mb-4 font-medium">
                        <ArrowLeft size={16} /> {isSpanish ? 'Volver al inicio' : isPortuguese ? 'Voltar ao início' : 'Back to Home'}
                    </Link>

                    <div className="mb-10">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
                            <ArrowLeft size={16} /> {isSpanish ? 'Volver al inicio de sesión' : isPortuguese ? 'Voltar ao início de sessão' : 'Back to Login'}
                        </Link>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">{isSpanish ? '¿Olvidaste tu contraseña?' : isPortuguese ? 'Esqueceu-se da palavra-passe?' : 'Forgot Password?'}</h2>
                        <p className="text-gray-500">{isSpanish ? 'Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.' : isPortuguese ? 'Introduza o seu email e enviaremos um link para redefinir a sua palavra-passe.' : "Enter your email and we'll send you a link to reset your password."}</p>
                    </div>

                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-[#007F00]" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{isSpanish ? 'Revisa tu Correo' : isPortuguese ? 'Verifique o seu Email' : 'Check Your Email'}</h3>
                            <p className="text-gray-500 mb-6">
                                {isSpanish ? 'Si esta dirección de correo está asociada a una cuenta, hemos enviado un enlace de restablecimiento. Revisa tu bandeja de entrada y la carpeta de spam.' : isPortuguese ? 'Se este endereço de email estiver associado a uma conta, enviámos um link de redefinição. Verifique a sua caixa de entrada e pasta de spam.' : "If this email address is associated with an account, we've sent a password reset link. Please check your inbox and spam folder."}
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-[#007F00] font-bold hover:underline"
                            >
                                <ArrowLeft size={16} /> {isSpanish ? 'Volver al inicio de sesión' : isPortuguese ? 'Voltar ao início de sessão' : 'Back to Login'}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">{isSpanish ? 'Correo electrónico' : isPortuguese ? 'Email' : 'Email'}</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder={isPortuguese ? 'nome@empresa.com' : 'name@company.com'}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#007F00] text-white font-bold py-3.5 rounded-xl hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        {isSpanish ? 'Enviando enlace...' : isPortuguese ? 'A enviar link...' : 'Sending Link...'}
                                    </>
                                ) : (
                                    isSpanish ? 'Enviar Enlace de Restablecimiento' : isPortuguese ? 'Enviar Link de Redefinição' : 'Send Reset Link'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
