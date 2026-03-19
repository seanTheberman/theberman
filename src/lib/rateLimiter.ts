// Simple rate limiting implementation for admin login
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

export const checkRateLimit = (email: string): { allowed: boolean; remainingAttempts?: number; lockoutRemaining?: number } => {
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

    // Reset if outside attempt window
    if (now - attempts.lastAttempt > ATTEMPT_WINDOW) {
        attempts.count = 0;
        attempts.lastAttempt = now;
    }

    // Check if max attempts reached
    if (attempts.count >= MAX_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_DURATION;
        loginAttempts.set(normalizedEmail, attempts);
        return {
            allowed: false,
            lockoutRemaining: LOCKOUT_DURATION / 1000 / 60 // 15 minutes
        };
    }

    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count };
};

export const recordFailedAttempt = (email: string): void => {
    const normalizedEmail = email.toLowerCase().trim();
    const attempts = loginAttempts.get(normalizedEmail);
    
    if (attempts) {
        attempts.count++;
        attempts.lastAttempt = Date.now();
        loginAttempts.set(normalizedEmail, attempts);
    }
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
