import { useNavigate } from 'react-router-dom';
import { Mail, Clock, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getTenantFromDomain } from '../lib/tenant';

const RegistrationPending = () => {
    const tenant = getTenantFromDomain();
    const isEngland = tenant === 'england';
    const brandName = isEngland ? 'EPC Cert' : 'The Berman';
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl relative z-10">
                        <Clock className="text-[#007F00]" size={40} />
                    </div>
                    <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Registration <span className="text-[#007F00]">Pending</span>
                    </h1>
                    <p className="text-gray-600 font-medium leading-relaxed">
                        Thank you for your interest in joining {brandName} Home Energy Catalogue.
                        Your application for <strong>{user?.email}</strong> is currently being reviewed by our team.
                    </p>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-left space-y-4">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                            <Mail className="text-[#007F00]" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Steps</p>
                            <p className="text-sm text-gray-700 font-medium">
                                A member of our team will be in contact with you shortly to complete your registration and verify your business details.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 space-y-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#007F00] hover:bg-green-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2 group active:scale-95"
                    >
                        Return to Homepage
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 font-bold text-sm transition-colors py-2"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>

                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] pt-8">
                    {brandName} Home Energy Management
                </div>
            </div>
        </div>
    );
};

export default RegistrationPending;
