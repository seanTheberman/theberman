
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const signupSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['user', 'contractor', 'business']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signupSchema>;

const SignUp = () => {
    const { signUp, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');
    const defaultRole = (roleParam === 'contractor' || roleParam === 'user' || roleParam === 'business') ? roleParam : 'user';

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

    const selectedRole = watch('role');

    // Sync role from query param if it changes
    useEffect(() => {
        if (roleParam && (roleParam === 'contractor' || roleParam === 'user' || roleParam === 'business')) {
            setValue('role', roleParam as any);
        }
    }, [roleParam, setValue]);

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const { error, data: authData } = await signUp(data.email.trim(), data.password, data.fullName, data.role);
            if (error) throw error;

            if (authData?.user) {
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
                    } else if (data.role === 'business') {
                        navigate('/business-onboarding');
                    } else {
                        navigate('/dashboard/user');
                    }
                }
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create account');
        }
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
            <div className="container mx-auto px-6 max-w-lg">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-8 md:p-12 text-center">

                    <div className="mb-8">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                            {selectedRole === 'business' ? 'Business Registration' :
                                selectedRole === 'contractor' ? 'Assessor Registration' :
                                    'Create Account'}
                        </h2>
                        <p className="text-gray-500">
                            {selectedRole === 'business' ? 'Register your company in our Home Energy Catalogue.' :
                                selectedRole === 'contractor' ? 'Join our network of professional BER assessors.' :
                                    'Sign up to get started.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Role Selection Tabs */}
                        {!roleParam && (
                            <div className="flex border-b border-gray-200 mb-8">
                                <button
                                    type="button"
                                    onClick={() => setValue('role', 'user')}
                                    className={`py-3 px-4 text-sm font-medium transition-all border-b-2 -mb-px ${selectedRole === 'user'
                                        ? 'border-gray-400 text-gray-700'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Homeowner
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue('role', 'contractor')}
                                    className={`py-3 px-4 text-sm font-medium transition-all border-b-2 -mb-px ${selectedRole === 'contractor'
                                        ? 'border-gray-400 text-gray-700'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    BER Assessor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue('role', 'business')}
                                    className={`py-3 px-4 text-sm font-medium transition-all border-b-2 -mb-px ${selectedRole === 'business'
                                        ? 'border-gray-400 text-gray-700'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Business
                                </button>
                            </div>
                        )}


                        <div className="space-y-1 text-left">
                            <label className="text-sm font-bold text-gray-700 ml-1">
                                {selectedRole === 'business' ? 'Full Business Name' : 'Full Name'}
                            </label>
                            <input
                                {...register('fullName')}
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder={selectedRole === 'business' ? 'Acme Energy Solutions' : 'John Doe'}
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.fullName.message}</p>}
                        </div>

                        <div className="space-y-1 text-left">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="name@company.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.email.message}</p>}
                        </div>

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
