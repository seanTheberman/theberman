import { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface EmailVerificationProps {
    email: string;
    assessmentId?: string | null;
    onVerified: () => void;
    onBack: () => void;
}

const EmailVerification = ({ email, assessmentId, onVerified, onBack }: EmailVerificationProps) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isSendingInitial, setIsSendingInitial] = useState(true);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const hasSentInitialOtp = useRef(false);

    // Send initial OTP on mount (with guard for React StrictMode double-execution)
    useEffect(() => {
        if (hasSentInitialOtp.current) return;
        hasSentInitialOtp.current = true;
        sendOtp();
    }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    const sendOtp = async () => {
        try {
            // Updated to use 'email' in the body
            const { data, error } = await supabase.functions.invoke('send-otp', {
                body: { email, assessmentId }
            });

            if (error) {
                console.error('Send OTP error:', error);
                toast.error('Failed to send verification code');
                return;
            }

            if (data?.success) {
                toast.success('Verification code sent to your email!');
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            toast.error('Failed to send verification code');
        } finally {
            setIsSendingInitial(false);
        }
    };

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace to go to previous input
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        setCode(newCode);
        // Focus the next empty input or last input
        const nextEmptyIndex = newCode.findIndex(c => !c);
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            toast.error('Please enter the complete 6-digit code');
            return;
        }

        setIsVerifying(true);
        try {
            // Updated to use 'email' in the body
            const { data, error } = await supabase.functions.invoke('verify-otp', {
                body: { email, code: fullCode, assessmentId }
            });

            if (error) {
                console.error('Verify OTP error:', error);
                toast.error('Failed to verify code. Please try again.');
                return;
            }

            if (data?.success) {
                toast.success('Email verified successfully!');
                onVerified();
            } else {
                toast.error(data?.error || 'Invalid verification code. Please try again.');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Failed to verify code. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsResending(true);
        try {
            await sendOtp();
            setCountdown(60);
            setCanResend(false);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            console.error('Resend error:', error);
            toast.error('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const maskEmail = (emailStr: string) => {
        const [name, domain] = emailStr.split('@');
        if (name.length <= 3) return emailStr;
        return `${name.slice(0, 3)}***@${domain}`;
    };

    if (isSendingInitial) {
        return (
            <div className="text-center py-12">
                <RefreshCw size={48} className="animate-spin text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Sending verification code...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                    <Mail size={36} className="text-green-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-3">
                    Verify Your Email
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    We've sent a 6-digit verification code to{' '}
                    <span className="font-semibold text-gray-700">{maskEmail(email)}</span>
                </p>
            </div>

            {/* Code Input */}
            <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            {/* Verify Button */}
            <div className="text-center">
                <button
                    onClick={handleVerify}
                    disabled={isVerifying || code.join('').length !== 6}
                    className={`inline-flex items-center gap-2 px-10 py-4 rounded-lg font-semibold text-lg transition-all ${code.join('').length === 6 && !isVerifying
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isVerifying ? (
                        <>
                            <RefreshCw size={20} className="animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify Email
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>

            {/* Resend Code */}
            <div className="text-center">
                <p className="text-gray-500 mb-2">Didn't receive the code?</p>
                {canResend ? (
                    <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-green-600 font-semibold hover:text-green-700 transition-colors inline-flex items-center gap-2"
                    >
                        {isResending ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={16} />
                                Resend Code
                            </>
                        )}
                    </button>
                ) : (
                    <span className="text-gray-400">
                        Resend available in <span className="font-semibold text-gray-600">{countdown}s</span>
                    </span>
                )}
            </div>

            {/* Back Link */}
            <div className="text-center pt-4">
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                    ← Go back and change details
                </button>
            </div>


        </div>
    );
};

export default EmailVerification;
