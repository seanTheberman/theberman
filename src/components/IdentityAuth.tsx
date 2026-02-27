import { useState, useEffect } from 'react';
import { Lock, ArrowRight, RefreshCw, UserPlus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface IdentityAuthProps {
    email: string;
    fullName: string;
    phone?: string;
    isExternalSubmitting?: boolean;
    onAuthenticated: () => void;
    onBack: () => void;
}

const IdentityAuth = ({ email, fullName, phone, isExternalSubmitting = false, onAuthenticated, onBack }: IdentityAuthProps) => {
    const [password, setPassword] = useState('');
    const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn, signUp } = useAuth();

    useEffect(() => {
        const checkUserExists = async () => {
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                setIsExistingUser(!!data);
            } catch (error) {
                console.error('Error checking user:', error);
                setIsExistingUser(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkUserExists();
    }, [email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            toast.error('Please enter a password');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isExistingUser) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                toast.success('Signed in successfully!');
            } else {
                const { error } = await signUp(email, password, fullName, 'user', phone);
                if (error) throw error;
                toast.success('Account created successfully!');
            }
            onAuthenticated();
        } catch (error: any) {
            console.error('Auth error:', error);
            toast.error(error.message || 'Authentication failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <RefreshCw size={48} className="animate-spin text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Verifying account status...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {/* Full-screen loader overlay when submitting */}
            {(isSubmitting || isExternalSubmitting) && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-green-100 rounded-full"></div>
                        <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="mt-6 text-xl font-semibold text-gray-800">
                        {isExternalSubmitting ? 'Submitting your quote...' : (isExistingUser ? 'Signing you in...' : 'Creating your account...')}
                    </p>
                    <p className="mt-2 text-gray-500">Please wait a moment</p>
                </div>
            )}

            <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isExistingUser ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {isExistingUser ? <LogIn size={36} /> : <UserPlus size={36} />}
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">
                    {isExistingUser ? 'Welcome Back!' : 'Create Your Account'}
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    {isExistingUser
                        ? 'We found an existing account. Please enter your password to continue.'
                        : 'Almost there! Create a password to save your progress and access your dashboard.'}
                </p>
                <div className="mt-2 inline-block px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
                    {email}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 ml-1">
                        {isExistingUser ? 'Password' : 'Choose a Password'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-all text-lg"
                            required
                        />
                    </div>
                </div>

                <div className="text-center pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || isExternalSubmitting || !password}
                        className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${isSubmitting || isExternalSubmitting || !password
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isExistingUser
                                ? 'bg-[#007EA7] hover:bg-[#005F7E] text-white'
                                : 'bg-[#007F00] hover:bg-[#006600] text-white'
                            }`}
                    >
                        {isSubmitting || isExternalSubmitting ? (
                            <>
                                <RefreshCw size={20} className="animate-spin" />
                                {isExternalSubmitting ? 'Submitting Quote...' : (isExistingUser ? 'Signing in...' : 'Creating Account...')}
                            </>
                        ) : (
                            <>
                                {isExistingUser ? 'Sign In & Submit Quote' : 'Create Account & Submit'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center pt-2">
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                    ← Not your email? Change it
                </button>
            </div>
        </div>
    );
};

export default IdentityAuth;
