
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTenantFromDomain } from '../lib/tenant';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const tenant = getTenantFromDomain();
    const isEngland = tenant === 'england';
    const brandName = isEngland ? 'EPC Cert' : 'The Berman';
    const { resetPassword } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const { error } = await resetPassword(data.email);
            if (error) throw error;
            toast.success('Password reset email sent! Check your inbox.');
        } catch (err: any) {
            toast.error(err.message || 'Failed to send reset email');
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
                            Secure your <br />
                            <span className="text-[#9ACD32]">Account.</span>
                        </h1>
                        <p className="text-green-100 text-lg max-w-md leading-relaxed">
                            It happens to the best of us. We'll help you get back into your account in no time.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-6 text-green-200 text-sm font-medium">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
                {/* Mobile Logo (Visible only on mobile) */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="Logo" className="h-10" />
                    </Link>
                </div>

                <div className="max-w-md w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#007F00] transition-colors mb-4 font-medium">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    <div className="mb-10">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Forgot Password?</h2>
                        <p className="text-gray-500">Enter your email and we'll send you a link to reset your password.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="name@company.com"
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
                                    Sending Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
