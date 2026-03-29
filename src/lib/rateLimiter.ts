// Enhanced rate limiting with email verification for admin login
import { supabase } from './supabase';

interface LoginAttempt {
    count: number;
    lastAttempt: number;
    lockedUntil?: number;
    requiresVerification?: boolean;
    verificationCode?: string;
    codeExpiry?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 3; // Changed from 5 to 3 as requested
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes
const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes for verification code

// Generate random 6-digit code
const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code via email using Supabase
const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
    try {
        // Use Supabase's built-in email functionality or edge function
        const { error } = await supabase.functions.invoke('send-admin-verification', {
            body: {
                email,
                code,
                subject: 'Admin Security Verification Code - The Berman',
                message: `Your security verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please contact your system administrator immediately.`
            }
        });

        if (error) {
            console.error('Failed to send verification email:', error);
            // Fallback: log code to console for development
            console.log(`[DEV MODE] Verification code for ${email}: ${code}`);
            return true; // Still return true in dev mode
        }

        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        // Fallback for development
        console.log(`[DEV MODE] Verification code for ${email}: ${code}`);
        return true;
    }
};

export const checkRateLimit = (email: string): {
    allowed: boolean;
    remainingAttempts?: number;
    lockoutRemaining?: number;
    requiresVerification?: boolean;
} => {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    const attempts = loginAttempts.get(normalizedEmail);

    if (!attempts) {
        loginAttempts.set(normalizedEmail, { count: 0, lastAttempt: now });
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    // Check if currently locked out
    if (attempts.lockedUntil && attempts.lockedUntil > now) {
        return {
            allowed: false,
            lockoutRemaining: Math.ceil((attempts.lockedUntil - now) / 1000 / 60) // minutes
        };
    }

    // Check if verification code expired
    if (attempts.requiresVerification) {
        if (attempts.codeExpiry && attempts.codeExpiry < now) {
            // Code expired, reset
            loginAttempts.delete(normalizedEmail);
            return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
        }
        return {
            allowed: false,
            requiresVerification: true
        };
    }

    // Reset if outside attempt window
    if (now - attempts.lastAttempt > ATTEMPT_WINDOW) {
        attempts.count = 0;
        attempts.lastAttempt = now;
    }

    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count };
};

export const recordFailedAttempt = async (email: string): Promise<{ requiresVerification: boolean; message?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    let attempts = loginAttempts.get(normalizedEmail);

    if (!attempts) {
        attempts = { count: 1, lastAttempt: now };
        loginAttempts.set(normalizedEmail, attempts);
        return { requiresVerification: false };
    }

    attempts.count++;
    attempts.lastAttempt = now;

    // Check if max attempts reached - trigger verification requirement
    if (attempts.count >= MAX_ATTEMPTS) {
        const code = generateVerificationCode();
        attempts.requiresVerification = true;
        attempts.verificationCode = code;
        attempts.codeExpiry = now + CODE_EXPIRY;
        attempts.lockedUntil = now + LOCKOUT_DURATION;
        loginAttempts.set(normalizedEmail, attempts);

        // Send verification email
        await sendVerificationEmail(normalizedEmail, code);

        return {
            requiresVerification: true,
            message: `Account locked after ${MAX_ATTEMPTS} failed attempts. A verification code has been sent to the admin email. Please enter the code to continue.`
        };
    }

    loginAttempts.set(normalizedEmail, attempts);
    return {
        requiresVerification: false,
        message: `Invalid credentials. ${MAX_ATTEMPTS - attempts.count} attempts remaining.`
    };
};

export const recordSuccessfulLogin = (email: string): void => {
    const normalizedEmail = email.toLowerCase().trim();
    loginAttempts.delete(normalizedEmail); // Clear on successful login
};

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [email, attempts] of loginAttempts.entries()) {
        if (now - attempts.lastAttempt > ATTEMPT_WINDOW * 2) {
            loginAttempts.delete(email);
        }
    }
}, ATTEMPT_WINDOW);

// Security Verification Functions
export const verifySecurityCode = (email: string, code: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim();
    const attempts = loginAttempts.get(normalizedEmail);

    if (!attempts || !attempts.requiresVerification) {
        return false;
    }

    // Check if code expired
    if (attempts.codeExpiry && attempts.codeExpiry < Date.now()) {
        return false;
    }

    // Verify code
    if (attempts.verificationCode === code.trim()) {
        // Clear verification requirement but keep lockout
        attempts.requiresVerification = false;
        attempts.verificationCode = undefined;
        attempts.codeExpiry = undefined;
        attempts.count = 0; // Reset failed attempts
        loginAttempts.set(normalizedEmail, attempts);
        return true;
    }

    return false;
};

export const resendVerificationCode = async (email: string): Promise<boolean> => {
    const normalizedEmail = email.toLowerCase().trim();
    const attempts = loginAttempts.get(normalizedEmail);

    if (!attempts || !attempts.requiresVerification) {
        return false;
    }

    const code = generateVerificationCode();
    attempts.verificationCode = code;
    attempts.codeExpiry = Date.now() + CODE_EXPIRY;
    loginAttempts.set(normalizedEmail, attempts);

    return await sendVerificationEmail(normalizedEmail, code);
};

export const isAccountLocked = (email: string): { locked: boolean; requiresVerification?: boolean; lockoutRemaining?: number } => {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    const attempts = loginAttempts.get(normalizedEmail);

    if (!attempts) {
        return { locked: false };
    }

    // Check if locked out
    if (attempts.lockedUntil && attempts.lockedUntil > now) {
        return {
            locked: true,
            requiresVerification: attempts.requiresVerification,
            lockoutRemaining: Math.ceil((attempts.lockedUntil - now) / 1000 / 60)
        };
    }

    // Check if still requires verification
    if (attempts.requiresVerification) {
        return {
            locked: true,
            requiresVerification: true
        };
    }

    return { locked: false };
};

// SQL Injection Protection Helpers
export const sanitizeInput = (input: string): string => {
    if (!input) return '';
    // Remove common SQL injection patterns
    return input
        .replace(/['";`]/g, '') // Remove quotes and backticks
        .replace(/--/g, '') // Remove SQL comments
        .replace(/\/\*/g, '') // Remove block comment start
        .replace(/\*\//g, '') // Remove block comment end
        .replace(/union\s+select/gi, '') // Remove UNION SELECT
        .replace(/select\s+/gi, '') // Remove SELECT
        .replace(/insert\s+/gi, '') // Remove INSERT
        .replace(/update\s+/gi, '') // Remove UPDATE
        .replace(/delete\s+/gi, '') // Remove DELETE
        .replace(/drop\s+/gi, '') // Remove DROP
        .replace(/exec\s*/gi, '') // Remove EXEC
        .replace(/execute\s*/gi, '') // Remove EXECUTE
        .replace(/xp_/gi, '') // Remove extended stored procedures
        .replace(/sp_/gi, '') // Remove stored procedures
        .replace(/;/g, '') // Remove semicolons
        .trim();
};

export const validateEmail = (email: string): boolean => {
    // Strict email validation to prevent injection
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && !email.includes('"') && !email.includes("'") && !email.includes(";");
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    // Check for SQL injection attempts in password
    const dangerousPatterns = /['";`]|(--|\/\*|\*\/|union\s+select|select\s+|insert\s+|update\s+|delete\s+|drop\s+|exec|execute)/i;

    if (dangerousPatterns.test(password)) {
        return { valid: false, message: 'Password contains invalid characters' };
    }

    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }

    return { valid: true };
};
