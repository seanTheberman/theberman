
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { signIn, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Default redirect to /admin if no previous path
    const from = location.state?.from?.pathname;

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && user && role) {
            if (from) {
                navigate(from, { replace: true });
            } else {
                if (role === 'admin') navigate('/admin', { replace: true });
                else if (role === 'contractor') navigate('/dashboard/contractor', { replace: true });
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
                // The profile fetch is handled by useAuth state update, 
                // but we can do a quick check here to speed up redirection
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .maybeSingle();

                const userRole = profile?.role || 'user';

                if (from) {
                    navigate(from, { replace: true });
                } else {
                    if (userRole === 'admin') navigate('/admin', { replace: true });
                    else if (userRole === 'contractor') {
                        // ProtectedRoute will handle onboarding check
                        navigate('/dashboard/contractor', { replace: true });
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
            <div className="container mx-auto px-6 max-w-lg">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden p-8 md:p-12">

                    <div className="mb-10">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome back</h2>
                        <p className="text-gray-500">Sign in to manage your sustainable projects.</p>
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

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-gray-700">Password</label>
                                <Link to="/forgot-password" className="text-xs font-bold text-[#007F00] hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#007F00] text-white font-black py-4 rounded-xl hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login
                                    <LogIn size={18} />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-8">
                            <p className="text-gray-500 font-medium">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-[#007F00] font-black hover:underline">
                                    Sign up for free
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
