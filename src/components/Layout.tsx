import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Smartphone, Mail, Facebook, Instagram, Linkedin, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import QuoteModal from './QuoteModal';


const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Locations', path: '/locations' },
    { label: 'Hire an Agent', path: '/catalogue' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
];



const Layout = () => {
    const [locations, setLocations] = useState<any[]>([]);
    const [isLocationsOpen, setIsLocationsOpen] = useState(false);
    const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, role, signOut } = useAuth();
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    // Dynamic Positioning Refs and State
    const locationsRef = useRef<HTMLButtonElement>(null);

    const provinceButtonsRef = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        const fetchLocations = async () => {
            const { data } = await supabase
                .from('catalogue_locations')
                .select('id, name, slug')
                .order('name');
            if (data) setLocations(data);
        };
        fetchLocations();
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsLocationsOpen(false);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
        closeMenu();
    };
    const getDashboardLink = () => {
        if (!user) return '/contact';
        if (role === 'admin') return '/admin';
        if (role === 'contractor') return '/dashboard/ber-assessor';
        return '/dashboard/user';
    };



    return (
        <div className="flex flex-col min-h-screen font-sans">
            <header className="fixed w-full top-0 z-[9999] bg-[#0c121d] backdrop-blur-md border-b border-white/5 shadow-lg transition-all duration-300">
                <div className="absolute top-full left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">

                    {/* Logo Section */}
                    <Link to="/" onClick={closeMenu}>
                        <div className="relative">
                            <img src="/logo.svg" alt="The Berman Logo" className="h-18 w-auto relative z-10" />
                        </div>
                    </Link>

                    {/* Menu Button - Visible on all screens */}
                    {/* Menu Button - Visible on all screens */}
                    <div className="flex items-center gap-4 relative">
                        <button
                            className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? (
                                <X size={28} className="text-green-600" />
                            ) : (
                                <Menu size={28} className="text-green-600" />
                            )}
                        </button>

                        {/* Mobile Navigation Dropdown */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 min-w-[250px] bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden flex flex-row-reverse items-start max-h-[65vh]">
                                {/* COLUMN 1: Main Navigation */}
                                <div className="w-64 flex flex-col bg-white">
                                    <div className="max-h-[65vh] overflow-y-auto py-2 flex flex-col items-start bg-white relative">
                                        {NAV_LINKS.map((link) => (
                                            link.label === 'Locations' ? (
                                                <button
                                                    key={link.path}
                                                    ref={locationsRef}
                                                    onClick={() => {
                                                        const newOpenState = !isLocationsOpen;
                                                        setIsLocationsOpen(newOpenState);
                                                        if (newOpenState) setExpandedProvince(null); // Close sub-menu if closing parent
                                                    }}
                                                    className={`w-full px-6 py-3.5 text-right text-[11px] font-black uppercase tracking-[0.1em] border-b border-gray-50 flex justify-between items-center transition-colors ${isLocationsOpen ? 'bg-gray-50 text-[#007EA7]' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <ChevronRight size={16} className={`transition-transform duration-200 rotate-180 ${isLocationsOpen ? '-rotate-90' : ''}`} />
                                                    Locations
                                                </button>
                                            ) : (
                                                <Link
                                                    key={link.path}
                                                    to={link.path}
                                                    onClick={closeMenu}
                                                    className="w-full px-6 py-3.5 text-right text-[11px] font-black text-gray-700 hover:bg-gray-50 uppercase tracking-[0.1em] border-b border-gray-50 last:border-0"
                                                >
                                                    {link.label}
                                                </Link>
                                            )
                                        ))}

                                        <div className="w-full border-t border-gray-100 mt-2">
                                            {!user ? (
                                                <>
                                                    <Link
                                                        to="/login"
                                                        onClick={closeMenu}
                                                        className="w-full block px-6 py-3 text-left text-sm font-bold text-[#5CB85C] hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100"
                                                    >
                                                        Login
                                                    </Link>
                                                    <Link
                                                        to="/signup?role=contractor"
                                                        onClick={closeMenu}
                                                        className="w-full block px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide"
                                                    >
                                                        Assessor Registration
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                                                        <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                                                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                                    </div>
                                                    <Link
                                                        to={getDashboardLink()}
                                                        onClick={closeMenu}
                                                        className="w-full block px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full px-6 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 uppercase tracking-wide"
                                                    >
                                                        Sign Out
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* COLUMN 2: Provinces (Visible if Locations is open) */}
                                {isLocationsOpen && (
                                    <div
                                        className="w-64 bg-gray-50 border-r border-gray-100 animate-in slide-in-from-right-2 duration-200 flex flex-col"
                                    >
                                        <div className="p-4 border-b border-gray-200/50">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Region</span>
                                        </div>
                                        {['Leinster', 'Munster', 'Connacht', 'Ulster'].map((province) => (
                                            <button
                                                key={province}
                                                ref={(el) => { provinceButtonsRef.current[province] = el; }}
                                                onClick={() => {
                                                    const isExpanding = expandedProvince !== province;
                                                    setExpandedProvince(isExpanding ? province : null);
                                                }}
                                                className={`w-full px-6 py-3 text-[11px] font-bold text-right uppercase tracking-wider flex justify-between items-center transition-colors border-b border-gray-100/50 ${expandedProvince === province ? 'bg-white text-[#007EA7] shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                            >
                                                <ChevronRight size={14} className={`transition-transform duration-200 rotate-180 ${expandedProvince === province ? 'text-[#007EA7]' : 'opacity-30'}`} />
                                                {province}
                                            </button>
                                        ))}
                                        <Link
                                            to="/locations"
                                            onClick={closeMenu}
                                            className="mt-auto block px-6 py-4 text-[10px] font-black text-[#007EA7] hover:bg-white uppercase tracking-wider border-t border-gray-200/50 text-center"
                                        >
                                            View All Locations
                                        </Link>
                                    </div>
                                )}

                                {/* COLUMN 3: Counties (Visible if Province is selected) */}
                                {isLocationsOpen && expandedProvince && (
                                    <div
                                        className="w-64 bg-white border-r border-gray-100 animate-in slide-in-from-right-2 duration-200 max-h-[50vh] overflow-y-auto"
                                    >
                                        <div className="p-4 border-b border-gray-100 sticky top-0 bg-white">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select County</span>
                                        </div>
                                        {locations
                                            .filter(loc => {
                                                const PROVINCES: Record<string, string[]> = {
                                                    Leinster: ['Carlow', 'Dublin', 'Kildare', 'Kilkenny', 'Laois', 'Longford', 'Louth', 'Meath', 'Offaly', 'Westmeath', 'Wexford', 'Wicklow'],
                                                    Munster: ['Clare', 'Cork', 'Kerry', 'Limerick', 'Tipperary', 'Waterford'],
                                                    Connacht: ['Galway', 'Leitrim', 'Mayo', 'Roscommon', 'Sligo'],
                                                    Ulster: ['Cavan', 'Donegal', 'Monaghan']
                                                };
                                                return PROVINCES[expandedProvince]?.includes(loc.name);
                                            })
                                            .map(location => (
                                                <Link
                                                    key={location.id}
                                                    to={`/region/${location.slug}`}
                                                    onClick={closeMenu}
                                                    className="block px-6 py-3 text-[11px] font-medium text-gray-500 hover:text-[#007EA7] hover:bg-gray-50 uppercase tracking-wider border-b border-gray-50 last:border-0"
                                                >
                                                    {location.name}
                                                </Link>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Removed Original Full-screen Mobile Navigation Dropdown */}{/* Original code block was here, now replaced by the dropdown inside the container above */}

                <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
            </header>
            {/* HEADER */}

            {/* MAIN CONTENT */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-white border-t border-green-900 pt-16 pb-8">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Column 1: Brand */}
                        <div className="col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="/logo.svg" alt="The Berman" className="h-16" />
                                <span className="text-xl font-serif font-bold">The Berman</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Ireland's trusted partner for BER assessments and energy consultancy.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Facebook size={16} /></a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Instagram size={16} /></a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Linkedin size={16} /></a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                {NAV_LINKS.slice(0, 4).map(link => (
                                    <li key={link.path}>
                                        <Link to={link.path} className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link to="/faq" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        FAQ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Resources & Account */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">Account</h4>
                            <ul className="space-y-3">
                                {NAV_LINKS.slice(4).map(link => (
                                    <li key={link.path}>
                                        <Link to={link.path} className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link to="/login" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/signup" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        Sign Up
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Contact */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">Get in Touch</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Smartphone className="text-[#9ACD32] mt-0.5" size={16} />
                                    <a href="tel:0874421653" className="hover:text-white transition">087 4421653</a>
                                </li>
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Mail className="text-[#9ACD32] mt-0.5" size={16} />
                                    <a href="mailto:hello@theberman.eu" className="hover:text-white transition">hello@theberman.eu</a>
                                </li>
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Home className="text-[#9ACD32] mt-0.5" size={16} />
                                    <span>Dublin 4, Ireland</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                        <p>&copy; {new Date().getFullYear()} The Berman. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="hover:text-white cursor-pointer transition">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white cursor-pointer transition">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
