import { useState } from 'react';
import { getTenantFromDomain } from '../lib/tenant';
import { Lock, Unlock, ArrowRight } from 'lucide-react';

const CORRECT_PASSWORD = 'Anup228';
const STORAGE_KEY = 'england_coming_soon_unlocked';

export function ComingSoonGate({ children }: { children: React.ReactNode }) {
    const tenant = getTenantFromDomain();
    const isEngland = tenant === 'england';

    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [unlocked, setUnlocked] = useState(() => {
        if (typeof sessionStorage !== 'undefined') {
            return sessionStorage.getItem(STORAGE_KEY) === 'true';
        }
        return false;
    });

    if (!isEngland || unlocked) {
        return <>{children}</>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            sessionStorage.setItem(STORAGE_KEY, 'true');
            setUnlocked(true);
        } else {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-[#0c121d] flex items-center justify-center px-4 font-sans">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-[#007F00]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#007F00]/20">
                        <Lock size={36} className="text-[#9ACD32]" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-3">Coming Soon</h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        EPC Cert is launching soon in England.
                        <br />
                        <span className="text-[#9ACD32]">Stay tuned for updates.</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            placeholder="Enter early access password"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#007F00] focus:border-transparent transition-all text-center text-lg tracking-widest"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-400 text-sm mt-2 font-medium">Incorrect password. Please try again.</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#007F00] text-white font-bold py-4 rounded-xl hover:bg-[#006600] transition-all shadow-lg hover:shadow-green-900/20 flex items-center justify-center gap-2 text-lg"
                    >
                        <Unlock size={20} />
                        Enter Platform
                        <ArrowRight size={20} />
                    </button>
                </form>

                <p className="mt-8 text-gray-600 text-sm">
                    Contact us at <a href="mailto:hello@epccert.com" className="text-[#9ACD32] hover:text-white transition">hello@epccert.com</a> for early access.
                </p>
            </div>
        </div>
    );
}
