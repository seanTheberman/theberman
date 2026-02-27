import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const signupSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['user', 'contractor', 'business']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).refine((data) => {
    if (data.role === 'user' && (!data.phone || data.phone.length < 7)) {
        return false;
    }
    return true;
}, {
    message: "Phone number is required for homeowners",
    path: ["phone"],
});

type SignUpFormData = z.infer<typeof signupSchema>;

const SignUp = () => {
    const { signUp, signOut, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const defaultRole = 'user';
    const [showThankYou, setShowThankYou] = useState(false);
    const [isRoleFixed, setIsRoleFixed] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && user && role) {
            if (role === 'admin') navigate('/admin', { replace: true });
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
        switch (activeRole) {
            case 'contractor':
                return {
                    title: 'Assessor Registration',
                    subtitle: 'Join our network of professional BER assessors.',
                    nameLabel: 'Full Name',
                    namePlaceholder: 'John Doe'
                };
            case 'business':
                return {
                    title: 'Business Registration',
                    subtitle: 'Register your company in our Home Energy Catalogue.',
                    nameLabel: 'Full Business Name',
                    namePlaceholder: 'Acme Energy Solutions'
                };
            default:
                return {
                    title: 'Create Account',
                    subtitle: 'Sign up to get started.',
                    nameLabel: 'Full Name',
                    namePlaceholder: 'John Doe'
                };
        }
    };

    const { title, subtitle, nameLabel, namePlaceholder } = getHeaderContent();






    const onSubmit = async (data: SignUpFormData) => {
        try {
            const { error, data: authData } = await signUp(
                data.email.trim(),
                data.password,
                data.fullName,
                data.role,
                data.phone // Pass phone number
            );
            if (error) throw error;

            if (authData?.user) {
                // Handle business registration — just capture interest, don't start session
                if (data.role === 'business') {
                    await signOut(); // Sign out immediately so no session starts
                    setShowThankYou(true);
                    return;
                }

                const isConfirmationRequired = !authData.session;

                if (isConfirmationRequired) {
                    toast.success('Account created! Please check your email to confirm your account before logging in.', {
                        duration: 6000
                    });
                    navigate('/login');
                } else {
                    toast.success('Account created successfully!');
                    // Redirect to appropriate destination
                    if (data.role === 'contractor') {
                        navigate('/assessor-onboarding');
                    } else {
                        navigate('/dashboard/user');
                    }
                }
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create account');
        }
    };

    // Thank You screen for business registrations
    if (showThankYou) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
                <div className="container mx-auto px-6 max-w-lg">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-8 md:p-12 text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle2 className="text-[#007F00]" size={40} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Thank You!</h2>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                Thank you for showing your interest in joining our Home Energy Catalogue.
                            </p>
                            <p className="text-gray-500 mt-2 leading-relaxed">
                                Our team will review your details and <strong className="text-gray-700">contact you shortly</strong> with the registration form to complete your setup.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-[#007F00] font-bold hover:underline transition-all"
                            >
                                <ArrowLeft size={16} />
                                Back to Homepage
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                HOMEOWNER
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('role', 'contractor')}
                                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px ${activeRole === 'contractor'
                                    ? 'border-[#007F00] text-[#007F00]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                ASSESSOR
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('role', 'business')}
                                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px ${activeRole === 'business'
                                    ? 'border-[#007F00] text-[#007F00]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                BUSINESS CATALOGUE
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
                            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="name@email.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.email.message}</p>}
                        </div>

                        {activeRole === 'user' && (
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder="087 123 4567"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.phone.message}</p>}
                            </div>
                        )}


                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-bold text-gray-700 ml-1">Confirm</label>
                                <input
                                    {...register('confirmPassword')}
                                    type="password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
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
                                    Creating Account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-gray-500 font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#007F00] font-black hover:underline">
                                    Log in
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
