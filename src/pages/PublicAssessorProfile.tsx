import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    ShieldCheck,
    MapPin,
    Globe,
    Building2,
    Star,
    Check,
    ChevronRight,
    Loader2,
    ArrowLeft,
    Shield,
    Award,
    MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const PublicAssessorProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        eircode: '',
        message: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (error: any) {
                console.error('Error fetching profile:', error.message);
                toast.error('Assessor profile not found');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProfile();
    }, [id]);

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('leads')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    eircode: formData.eircode,
                    message: formData.message || `Direct quote request from profile for ${profile?.full_name}`,
                    status: 'new',
                    county: profile?.home_county || '',
                    purpose: 'Profile Direct'
                }]);

            if (error) throw error;

            toast.success('Your request has been sent! ' + profile?.full_name + ' will contact you shortly.', {
                duration: 5000,
                icon: '🚀'
            });
            setFormData({ name: '', email: '', phone: '', eircode: '', message: '' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#007EA7] animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
                    <Shield size={40} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Profile Not Found</h1>
                <p className="text-gray-500 mb-8 max-w-sm">The assessor profile you are looking for does not exist or has been moved.</p>
                <Link to="/" className="text-[#007EA7] font-bold hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} />
                    Back to Homepage
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header / Navigation */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#007EA7] rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100">
                            B
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">Theberman</span>
                    </Link>
                    <Link
                        to="/catalogue"
                        className="text-xs font-black text-gray-400 hover:text-[#007EA7] uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={14} />
                        Back to Catalogue
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Profile Details */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Hero Section */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                    <div className="w-24 h-24 md:w-40 md:h-40 bg-gradient-to-br from-[#007EA7] to-blue-400 rounded-3xl flex items-center justify-center text-white text-3xl md:text-5xl font-black shadow-2xl shadow-blue-100 shrink-0">
                                        {profile.full_name?.charAt(0)}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                                {profile.full_name}
                                            </h1>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 self-center md:self-auto">
                                                <ShieldCheck size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Verified Assessor</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Building2 size={18} className="text-[#007EA7]" />
                                                <span className="text-sm font-bold">{profile.company_name || 'Independent Assessor'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <MapPin size={18} className="text-[#007EA7]" />
                                                <span className="text-sm font-bold uppercase tracking-widest">{profile.home_county || 'Dublin'}, IE</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-black text-gray-900">4.9</span>
                                                <span className="text-xs text-gray-400 font-bold">(12 Reviews)</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            {profile.seai_number && (
                                                <div className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl border border-gray-100 text-xs font-bold flex items-center gap-2">
                                                    <Award size={14} className="text-[#007EA7]" />
                                                    SEAI #{profile.seai_number}
                                                </div>
                                            )}
                                            {profile.website_url && (
                                                <a
                                                    href={profile.website_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-gray-50 text-gray-600 hover:text-[#007EA7] hover:bg-white hover:border-[#007EA7] transition-all rounded-xl border border-gray-100 text-xs font-bold flex items-center gap-2"
                                                >
                                                    <Globe size={14} />
                                                    Visit Website
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-50 text-[#007EA7] rounded-lg flex items-center justify-center">
                                    <MessageCircle size={18} />
                                </span>
                                About the Assessor
                            </h2>
                            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-50 shadow-sm leading-relaxed text-gray-600 font-medium text-lg">
                                {profile.about_me || "This assessor has not provided a detailed biography yet, but they are a licensed and verified professional on Theberman platform."}
                            </div>
                        </div>

                        {/* Experience and Service Areas */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                                        <Shield size={18} />
                                    </span>
                                    Qualifications
                                </h3>
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm space-y-4">
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Licensed BER Assessor
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        SEAI Registered Partner
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Verified Insurance Coverage
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                        <MapPin size={18} />
                                    </span>
                                    Service Areas
                                </h3>
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
                                    <div className="flex flex-wrap gap-2">
                                        {[profile.home_county, 'Meath', 'Kildare', 'Wicklow'].filter(Boolean).map((area: any) => (
                                            <span key={area} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">
                                                Co. {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Lead Capture Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 sticky top-32">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">Get A Quote</h3>
                                <p className="text-gray-500 text-sm mt-2 font-medium">Request a quote directly from this assessor.</p>
                            </div>

                            <form onSubmit={handleLeadSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007EA7] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007EA7] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="Mobile"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007EA7] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Eircode</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="A65 F123"
                                            value={formData.eircode}
                                            onChange={e => setFormData({ ...formData, eircode: e.target.value.toUpperCase() })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007EA7] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message (Optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Any specific details about your property?"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-[#007EA7] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all resize-none"
                                    />
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className="w-full bg-[#007EA7] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#006687] transition-all shadow-xl shadow-blue-50 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>Request Quote <ChevronRight size={16} /></>
                                    )}
                                </button>

                                <div className="flex items-center gap-2 justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <Check size={12} className="text-green-500" />
                                    No upfront payment required
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Trust Footer */}
            <footer className="bg-white border-t border-gray-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">The Berman Licensed Professional Network</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale">
                        <span className="font-black text-lg italic tracking-tight">SEAI REGISTERED</span>
                        <span className="font-black text-lg italic tracking-tight">NSAI CERTIFIED</span>
                        <span className="font-black text-lg italic tracking-tight">BIA MEMBER</span>
                        <span className="font-black text-lg italic tracking-tight">IEA PARTNER</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicAssessorProfile;
