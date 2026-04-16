
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';

const updatePasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

const UpdatePassword = () => {
    const { updateUserPassword, user, loading } = useAuth();
    const navigate = useNavigate();
    const [redirecting, setRedirecting] = useState(false);
    const [authWait, setAuthWait] = useState(true);

    // Give Supabase a moment to process the hash if user is not immediately available
    useEffect(() => {
        // If we already have a user, no need to wait
        if (user) {
            setAuthWait(false);
            return;
        }

        // If there's no access token in the URL, don't wait either
        if (!window.location.hash.includes('access_token') || window.location.search.includes('code=') || window.location.search.includes('type=recovery')) {
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
                        if (role === 'admin') navigate('/admin', { replace: true });
                        else if (role === 'contractor') navigate('/dashboard/ber-assessor', { replace: true });
                        else if (role === 'business') navigate('/dashboard/business', { replace: true });
                        else navigate('/dashboard/user', { replace: true });
                    }
                });
        }
    }, [user, navigate]);

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
                <p className="text-gray-600 font-medium">Verifying your secure link...</p>
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

    // If no user and no hash after waiting, they probably accessed it directly/invalidly
    if (!user && !window.location.hash.includes('access_token') || window.location.search.includes('code=') || window.location.search.includes('type=recovery')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Invalid Session</h2>
                    <p className="text-gray-500 mb-8">This link is invalid or has expired. Please use the "Forgot Password" link on the login page or contact support.</p>
                    <Link to="/login" className="inline-flex items-center gap-2 text-white bg-[#007F00] px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition-all">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const onSubmit = async (data: UpdatePasswordFormData) => {
        try {
            // Force a session refresh to be absolutely sure we have one
            const { data: sessionData } = await supabase.auth.getSession();

            if (!sessionData.session) {
                // If it's a cold start with hash, Supabase might need an extra ms to parse it
                await new Promise(resolve => setTimeout(resolve, 500));
                const { data: secondCheck } = await supabase.auth.getSession();
                if (!secondCheck.session) {
                    throw new Error('Authentication session not found. Please try logging in or click the link again.');
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

            toast.success('Password updated! Completing your profile next.');

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
                if (role === 'admin') navigate('/admin', { replace: true });
                else if (role === 'contractor') navigate('/dashboard/ber-assessor', { replace: true });
                else if (role === 'business') navigate('/dashboard/business', { replace: true });
                else navigate('/dashboard/user', { replace: true });
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update password');
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
                            <img src="/logo.svg" alt="The Berman Logo" className="h-12 w-auto brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-white">The Berman</span>
                    </Link>

                    <div className="mt-20">
                        <h1 className="text-5xl font-serif font-bold text-white leading-tight mb-6">
                            New Password, <br />
                            <span className="text-[#9ACD32]">New Start.</span>
                        </h1>
                        <p className="text-green-100 text-lg max-w-md leading-relaxed">
                            Create a strong password to keep your account secure.
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
                <div className="max-w-md w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#007F00] transition-colors mb-8 font-medium">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>

                    <div className="mb-10">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Update Password</h2>
                        <p className="text-gray-500">Please enter your new password.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">New Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007F00] focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
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
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
