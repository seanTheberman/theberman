import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertTriangle, ArrowLeft, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkRateLimit, recordFailedAttempt, recordSuccessfulLogin, verifySecurityCode, resendVerificationCode, isAccountLocked, validateEmail, validatePassword } from '../lib/rateLimiter';

const adminLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
    const { signIn, signOut, user, role, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Security verification state
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [lockoutMessage, setLockoutMessage] = useState('');
    const [lastEmail, setLastEmail] = useState('');
    
    // Prevents useEffect from redirecting mid-submission
    const signingIn = React.useRef(false);

    // Default redirect to /admin if no previous path
    const from = location.state?.from?.pathname;

    // Redirect if already authenticated
    useEffect(() => {
        if (signingIn.current) return;

        if (!loading && user && role === 'admin') {
            if (from) {
                navigate(from, { replace: true });
            } else {
                navigate('/admin', { replace: true });
            }
        } else if (!loading && user && role !== 'admin') {
            // Non-admin users shouldn't be here
            signOut();
            navigate('/login/admin', { replace: true });
        }
    }, [user, role, loading, navigate, from, signOut]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminLoginFormData>({
        resolver: zodResolver(adminLoginSchema),
    });

    const onSubmit = async (data: AdminLoginFormData) => {
        signingIn.current = true;
        setIsSubmitting(true);
        
        try {
            const email = data.email.trim();
            const password = data.password;
            
            // Store email for verification flow
            setLastEmail(email);
            
            // SQL Injection Protection - Validate inputs
            if (!validateEmail(email)) {
                throw new Error('Invalid email format. Please check your email address.');
            }
            
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.message || 'Invalid password format.');
            }
            
            // Check if account is locked or requires verification
            const accountStatus = isAccountLocked(email);
            if (accountStatus.locked && accountStatus.requiresVerification) {
                setRequiresVerification(true);
                setLockoutMessage('Account locked after 3 failed attempts. Please enter the verification code sent to your email.');
                setIsSubmitting(false);
                signingIn.current = false;
                return;
            }
            
            if (accountStatus.locked && accountStatus.lockoutRemaining) {
                throw new Error(`Account locked. Please try again in ${accountStatus.lockoutRemaining} minutes.`);
            }
            
            // Check rate limiting
            const rateLimitResult = checkRateLimit(email);
            if (!rateLimitResult.allowed) {
                if (rateLimitResult.requiresVerification) {
                    setRequiresVerification(true);
                    setLockoutMessage('Account locked after 3 failed attempts. Please enter the verification code sent to your email.');
                    setIsSubmitting(false);
                    signingIn.current = false;
                    return;
                }
                if (rateLimitResult.lockoutRemaining) {
                    throw new Error(`Too many failed attempts. Account locked for ${rateLimitResult.lockoutRemaining} minutes.`);
                }
                throw new Error('Login temporarily blocked. Please try again later.');
            }
            
            const { data: authData, error } = await signIn(email, password);

            if (error) {
                // Record failed attempt for rate limiting (now async)
                const failedResult = await recordFailedAttempt(email);
                
                if (failedResult.requiresVerification) {
                    setRequiresVerification(true);
                    setLockoutMessage(failedResult.message || 'Account locked after 3 failed attempts. Please enter the verification code sent to your email.');
                    setIsSubmitting(false);
                    signingIn.current = false;
                    return;
                }
                
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('email not confirmed')) {
                    throw new Error('Please confirm your email address before logging in.');
                }
                if (error.status === 400 || errorMessage.includes('invalid credentials')) {
                    throw new Error(`Invalid admin credentials. ${failedResult.message || 'Please try again.'}`);
                }
                throw error;
            }

            if (authData.user) {
                // Verify this is actually an admin
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .maybeSingle();

                if (profile?.role !== 'admin') {
                    await signOut();
                    throw new Error('Access denied. This account does not have admin privileges.');
                }

                // Record successful login (clears rate limit)
                recordSuccessfulLogin(email);
                
                // Reset verification state
                setRequiresVerification(false);
                setVerificationCode('');
                setLockoutMessage('');
                
                toast.success('Admin login successful!');
                
                // Redirect will happen in useEffect
                if (from) {
                    navigate(from, { replace: true });
                } else {
                    navigate('/admin', { replace: true });
                }
            }
        } catch (error: any) {
            console.error('Admin login error:', error);
            toast.error(error.message || 'Admin login failed');
        } finally {
            setIsSubmitting(false);
            signingIn.current = false;
        }
    };
    
    // Handle verification code submission
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationCode.trim() || !lastEmail) return;
        
        setIsSubmitting(true);
        
        try {
            const isValid = verifySecurityCode(lastEmail, verificationCode);
            
            if (isValid) {
                toast.success('Verification successful! You can now log in.');
                setRequiresVerification(false);
                setVerificationCode('');
                setLockoutMessage('');
            } else {
                toast.error('Invalid or expired verification code. Please try again or request a new code.');
            }
        } catch (error: any) {
            toast.error('Verification failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handle resend verification code
    const handleResendCode = async () => {
        if (!lastEmail) return;
        
        setIsSubmitting(true);
        
        try {
            const sent = await resendVerificationCode(lastEmail);
            if (sent) {
                toast.success('New verification code sent! Please check your email.');
            } else {
                toast.error('Failed to send verification code. Please try again later.');
            }
        } catch (error: any) {
            toast.error('Failed to resend code. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            
            {/* Main Container */}
            <div className="relative w-full max-w-md">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Login Options
                    </Link>
                </div>

                {/* Admin Login Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
                        <p className="text-gray-400 text-sm">Enter your administrator credentials</p>
                    </div>

                    {/* Alert */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-yellow-400 text-xs">
                            This area is restricted to authorized administrators only. All access attempts are logged.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="email"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder=""
                                    className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <LogOut size={16} />
                                    Sign In to Admin Panel
                                </>
                            )}
                        </button>
                    </form>

                    {/* Verification Code Form - Shows after 3 failed attempts */}
                    {requiresVerification && (
                        <form onSubmit={handleVerifyCode} className="mt-6 space-y-4 border-t border-gray-700 pt-6">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                <h3 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                                    <Lock size={16} />
                                    Security Verification Required
                                </h3>
                                <p className="text-amber-300/80 text-sm mb-4">
                                    {lockoutMessage || 'Account locked after 3 failed attempts. Please enter the verification code sent to your email.'}
                                </p>
                                
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                                        disabled={isSubmitting}
                                    />
                                    
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || verificationCode.length !== 6}
                                            className="flex-1 bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Verifying...' : 'Verify Code'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all disabled:opacity-50"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="text-center">
                            <p className="text-gray-500 text-xs">
                                Need help? Contact system administrator
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
