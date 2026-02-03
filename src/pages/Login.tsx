
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const { signIn, signOut, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'homeowner' | 'assessor'>('homeowner');

    // Default redirect to /admin if no previous path
    const from = location.state?.from?.pathname;

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && user && role) {
            if (from) {
                navigate(from, { replace: true });
            } else {
                if (role === 'admin') navigate('/admin', { replace: true });
                else if (role === 'contractor') navigate('/dashboard/ber-assessor', { replace: true });
                else navigate('/dashboard/user', { replace: true });
            }
        }
    }, [user, role, loading, navigate, from]);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const email = data.email.trim();
            const { data: authData, error } = await signIn(email, data.password);

            if (error) {
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('email not confirmed')) {
                    throw new Error('Please confirm your email address before logging in.');
                }
                if (error.status === 400 || errorMessage.includes('invalid credentials')) {
                    throw new Error('Invalid email or password. Please try again or use "Forgot password".');
                }
                throw error;
            }

            // Redirection logic
            if (authData.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .maybeSingle();

                const userRole = profile?.role || 'user';

                // Role validation based on active tab
                if (activeTab === 'homeowner') {
                    if (userRole === 'contractor') {
                        await signOut();
                        throw new Error('This account is registered as a BER Assessor. Please use the "BER Assessor" tab to log in.');
                    }
                } else if (activeTab === 'assessor') {
                    if (userRole === 'user' || userRole === 'homeowner') {
                        await signOut();
                        throw new Error('This account is registered as a Homeowner. Please use the "Homeowner" tab to log in.');
                    }
                }

                if (from) {
                    navigate(from, { replace: true });
                } else {
                    if (userRole === 'admin') navigate('/admin', { replace: true });
                    else if (userRole === 'contractor') {
                        navigate('/dashboard/ber-assessor', { replace: true });
                    } else {
                        navigate('/dashboard/user', { replace: true });
                    }
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            toast.error(err.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
            <div className="w-full max-w-md px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Sign in to continue.</p>
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
                        Homeowner
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('assessor')}
                        className={`py-3 px-6 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'assessor'
                            ? 'border-gray-400 text-gray-700'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        BER Assessor
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="name@company.com"
                            className="w-full px-4 py-3 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm font-bold text-[#007F00] hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#007F00] text-white rounded-full font-bold text-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
                    </button>

                    <p className="text-center text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#007F00] font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
