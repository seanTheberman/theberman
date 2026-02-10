import { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, RefreshCw, Clock } from 'lucide-react';
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
        const fullCode = code.join('').trim();
        if (fullCode.length !== 6) {
            toast.error('Please enter the complete 6-digit code');
            return;
        }

        setIsVerifying(true);
        try {
            const { data, error } = await supabase.functions.invoke('verify-otp', {
                body: { email, code: fullCode, assessmentId }
            });

            if (error) {
                console.error('Verify OTP error:', error);
                let errorMessage = 'Failed to verify code. Please try again.';

                try {
                    // FunctionsHttpError has a context with a response body
                    if (error.context && typeof error.context.json === 'function') {
                        const errorDetails = await error.context.json();
                        if (errorDetails?.error) errorMessage = errorDetails.error;
                        else if (errorDetails?.message) errorMessage = errorDetails.message;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                } catch (e) {
                    console.error('Error parsing verify-otp error body:', e);
                }

                if (errorMessage === 'Incorrect password') {
                    errorMessage = 'Incorrect OTP';
                }

                toast.error(errorMessage, { duration: 4000 });
                return;
            }

            if (data?.success) {
                toast.success('Email verified successfully!');
                onVerified();
            } else {
                const errorMsg = data?.error || 'Invalid verification code. Please try again.';
                toast.error(errorMsg, { duration: 4000 });
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsResending(true);
        try {
            // Reset code state when resending
            setCode(['', '', '', '', '', '']);
            await sendOtp();
            setCountdown(60);
            setCanResend(false);
            if (inputRefs.current[0]) inputRefs.current[0].focus();
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Left Column: Branding & Info */}
            <div className="bg-gradient-to-br from-green-50 to-white p-6 md:p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100">
                <div className="relative mb-4 md:mb-8">
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                    <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-white border border-green-100 shadow-sm overflow-hidden group">
                        <Mail size={32} className="text-[#007F00] md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -right-1 -top-1 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-[3px] md:border-4 border-white animate-pulse"></div>
                    </div>
                </div>

                <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight leading-tight">
                    Verify Your <br className="hidden md:block" /> Email
                </h2>

                <div className="space-y-2 md:space-y-4">
                    <p className="text-gray-500 font-medium text-xs md:text-sm">We've sent a 6-digit code to</p>
                    <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-[#007F00]/5 rounded-xl border border-[#007F00]/10">
                        <p className="text-[#007F00] font-black text-xs md:text-sm tracking-wide">
                            {maskEmail(email)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: OTP & Actions */}
            <div className="p-6 md:p-12 flex flex-col justify-between items-center space-y-8 md:space-y-10">
                <div className="w-full space-y-8 md:space-y-10">
                    {/* Code Input */}
                    <div className="flex justify-center gap-1.5 md:gap-3">
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
                                className={`
                                    w-[2.2rem] h-12 md:w-12 md:h-16 text-center text-xl md:text-3xl font-black 
                                    rounded-lg md:rounded-xl border-2 transition-all duration-200 outline-none
                                    ${digit
                                        ? 'border-[#007F00] bg-green-50/20 text-[#007F00] shadow-[0_0_15px_rgba(0,127,0,0.05)]'
                                        : 'border-gray-100 bg-white text-gray-900 hover:border-green-100 focus:border-[#007F00] focus:ring-4 focus:ring-green-500/5'
                                    }
                                `}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || code.join('').length !== 6}
                        className={`
                            w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg transition-all duration-300 
                            flex items-center justify-center gap-3 relative overflow-hidden group
                            ${code.join('').length === 6 && !isVerifying
                                ? 'bg-[#007F00] hover:bg-[#006600] text-white shadow-xl shadow-green-100'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {isVerifying ? (
                            <>
                                <RefreshCw size={24} className="animate-spin" />
                                <span className="tracking-wide">Verifying...</span>
                            </>
                        ) : (
                            <>
                                <span className="tracking-wide text-xs md:text-sm uppercase">Accept Quote</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="w-full flex flex-col items-center gap-4 md:gap-6 pt-4 border-t border-gray-50 text-center">
                    <div className="flex flex-col items-center gap-2">
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="group flex items-center gap-2 text-[#007F00] font-black text-xs uppercase tracking-widest hover:bg-green-50 px-4 py-2 rounded-full transition-all"
                            >
                                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                <span>Resend Code</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-100 text-[10px] uppercase tracking-tighter">
                                <Clock size={12} className="text-gray-400" />
                                <span>Resend ready in <span className="text-[#007F00]">{countdown}s</span></span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onBack}
                        className="group flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-tighter hover:text-gray-600 transition-colors"
                    >
                        <div className="w-4 h-4 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-gray-400">
                            ←
                        </div>
                        <span>Go back and change details</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
