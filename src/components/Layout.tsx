import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Mail, Facebook, Instagram, Linkedin, ChevronRight, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import QuoteModal from './QuoteModal';


const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Home Energy Upgrade Catalogue', path: '/catalogue' },
    { label: 'Speak to an Energy Advisor', path: '/hire-agent' },
    { label: 'Book Ber Assessors', path: '/contact' },
    { label: 'Our News', path: '/news' },
    // { label: 'Location', path: '/locations' },
    { label: 'Contact', path: '/contact' },
];



const Layout = () => {
    const [locations, setLocations] = useState<any[]>([]);
    const [isLocationsOpen, setIsLocationsOpen] = useState(false);
    const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, role, profile, signOut } = useAuth();
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [hasBusinessListing, setHasBusinessListing] = useState(false);

    // Dynamic Positioning Refs and State
    const locationsRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);



    useEffect(() => {
        const fetchLocations = async () => {
            const { data } = await supabase
                .from('catalogue_locations')
                .select('id, name, slug')
                .order('name');
            if (data) setLocations(data);
        };
        fetchLocations();

        const checkBusinessListing = async () => {
            if (user && role === 'contractor') {
                const { data } = await supabase
                    .from('catalogue_listings')
                    .select('id')
                    .eq('owner_id', user.id)
                    .maybeSingle();
                setHasBusinessListing(!!data);
            } else {
                setHasBusinessListing(false);
            }
        };
        checkBusinessListing();
    }, [user, role]);

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
        if (role === 'business') return '/dashboard/business';
        return '/dashboard/user';
    };



    return (
        <div className="flex flex-col min-h-screen font-sans">
            <header className="fixed w-full top-0 z-[9999] bg-[#0c121d] backdrop-blur-md border-b border-white/5 shadow-lg transition-all duration-300">
                <div className="absolute top-full left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">

                    {/* Logo Section */}
                    <div className="flex items-center gap-8">
                        <Link to="/" onClick={closeMenu}>
                            <div className="relative">
                                <img src="/logo.svg" alt="The Berman Logo" className="h-18 w-auto relative z-10" />
                            </div>
                        </Link>
                    </div>

                    {/* Menu Button - Visible on all screens */}
                    <div ref={menuRef} className="flex items-center gap-4 relative">

                        {/* Catalogue Hub Link - Desktop */}
                        <Link
                            to="/catalogue"
                            className="hidden md:flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
                        >
                            <div className="w-2 h-2 rounded-full bg-[#9ACD32] group-hover:animate-pulse"></div>
                            <span className="text-sm font-black text-white uppercase tracking-wider">
                                Home Energy <span className="text-[#9ACD32]">Upgrade Catalogue</span>
                            </span>
                        </Link>
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
                            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden max-h-[80vh] overflow-y-auto">
                                <div className="py-2">
                                    {NAV_LINKS.map((link) => (
                                        link.label === 'Location' ? (
                                            <div key={link.label}>
                                                {/* Locations Button */}
                                                <button
                                                    ref={locationsRef}
                                                    onClick={() => {
                                                        setIsLocationsOpen(!isLocationsOpen);
                                                        if (!isLocationsOpen) setExpandedProvince(null);
                                                    }}
                                                    className={`w-full px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide border-b border-gray-100 flex justify-between items-center transition-colors ${isLocationsOpen ? 'bg-gray-50 text-[#007F00]' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    Location
                                                    <ChevronRight size={16} className={`transition-transform duration-200 ${isLocationsOpen ? 'rotate-90' : ''}`} />
                                                </button>

                                                {/* Locations Submenu (Accordion Style) */}
                                                {isLocationsOpen && (
                                                    <div className="bg-gray-50 border-b border-gray-100">
                                                        {/* Provinces */}
                                                        {['Leinster', 'Munster', 'Connacht', 'Ulster'].map((province) => (
                                                            <div key={province}>
                                                                <button
                                                                    onClick={() => setExpandedProvince(expandedProvince === province ? null : province)}
                                                                    className={`w-full pl-8 pr-5 py-2.5 text-left text-xs font-bold uppercase tracking-wide flex justify-between items-center transition-colors ${expandedProvince === province ? 'bg-white text-[#007EA7]' : 'text-gray-600 hover:bg-gray-100'}`}
                                                                >
                                                                    {province}
                                                                    <ChevronRight size={14} className={`transition-transform duration-200 ${expandedProvince === province ? 'rotate-90' : ''}`} />
                                                                </button>

                                                                {/* Counties for this Province */}
                                                                {expandedProvince === province && (
                                                                    <div className="bg-white border-t border-gray-100">
                                                                        {locations
                                                                            .filter(loc => {
                                                                                const PROVINCES: Record<string, string[]> = {
                                                                                    Leinster: ['Carlow', 'Dublin', 'Kildare', 'Kilkenny', 'Laois', 'Longford', 'Louth', 'Meath', 'Offaly', 'Westmeath', 'Wexford', 'Wicklow'],
                                                                                    Munster: ['Clare', 'Cork', 'Kerry', 'Limerick', 'Tipperary', 'Waterford'],
                                                                                    Connacht: ['Galway', 'Leitrim', 'Mayo', 'Roscommon', 'Sligo'],
                                                                                    Ulster: ['Cavan', 'Donegal', 'Monaghan']
                                                                                };
                                                                                return PROVINCES[province]?.includes(loc.name);
                                                                            })
                                                                            .map(location => (
                                                                                <Link
                                                                                    key={location.id}
                                                                                    to={`/region/${location.slug}`}
                                                                                    onClick={closeMenu}
                                                                                    className="block pl-12 pr-5 py-2 text-xs text-gray-500 hover:text-[#007EA7] hover:bg-gray-50 transition-colors"
                                                                                >
                                                                                    {location.name}
                                                                                </Link>
                                                                            ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}

                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Link
                                                key={link.label}
                                                to={link.path}
                                                onClick={closeMenu}
                                                className="block px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100"
                                            >
                                                {link.label}
                                            </Link>
                                        )
                                    ))}

                                    {/* Subscribe to News */}
                                    <button
                                        onClick={() => {
                                            closeMenu();
                                            if (window.location.pathname === '/') {
                                                document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
                                            } else {
                                                navigate('/#newsletter');
                                                setTimeout(() => {
                                                    document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
                                                }, 100);
                                            }
                                        }}
                                        className="w-full px-5 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100"
                                    >
                                        Subscribe to News
                                    </button>

                                    {/* Auth Section */}
                                    <div className="border-t border-gray-200 mt-2 pt-2">
                                        {!user ? (
                                            <>
                                                <Link
                                                    to="/login"
                                                    onClick={closeMenu}
                                                    className="block px-5 py-3 text-sm font-bold text-[#5CB85C] hover:bg-gray-50 uppercase tracking-wide"
                                                >
                                                    Login
                                                </Link>
                                                <Link
                                                    to="/signup?role=contractor"
                                                    onClick={closeMenu}
                                                    className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide"
                                                >
                                                    ASSESSOR REGISTRATION
                                                </Link>
                                                <Link
                                                    to="/signup?role=business"
                                                    onClick={closeMenu}
                                                    className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide"
                                                >
                                                    BUSINESS CATALOGUE REGISTRATION
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <div className="px-5 py-3 bg-gray-50">
                                                    <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                                </div>
                                                {role && (role !== 'business' || profile?.registration_status === 'active' || profile?.registration_status === 'pending') && (
                                                    <Link
                                                        to={getDashboardLink()}
                                                        onClick={closeMenu}
                                                        className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100/50"
                                                    >
                                                        {role === 'business' ? 'Business Portal' : role === 'contractor' ? 'Assessor Dashboard' : 'Dashboard'}
                                                    </Link>
                                                )}
                                                {role === 'contractor' && hasBusinessListing && (
                                                    <Link
                                                        to="/dashboard/business"
                                                        onClick={closeMenu}
                                                        className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100/50"
                                                    >
                                                        Business Portal
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full px-5 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 uppercase tracking-wide"
                                                >
                                                    Sign Out
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* FOOTER */}
            <footer className="bg-gray-900 text-white border-t border-green-900 pt-16 pb-8">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-5 gap-12 mb-12">
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
                                <a href="https://www.facebook.com/share/1aN1GPgqKh/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Facebook size={16} /></a>
                                <a href="https://www.instagram.com/thebermanireland?igsh=amtidXdjNmZrMWJz&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Instagram size={16} /></a>
                                <a href="https://www.linkedin.com/company/the-ber-man/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Linkedin size={16} /></a>
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
                                {/* <li>
                                    <Link to="/assessor-membership" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        Assessor Membership
                                    </Link>
                                </li> */}

                                <li>
                                    <Link to="/signup?role=business" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        BUSINESS CATALOGUE REGISTRATION
                                    </Link>
                                </li>

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
                                    <li key={link.label}>
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
                                <li>
                                    <button
                                        onClick={() => {
                                            if (window.location.pathname === '/') {
                                                document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
                                            } else {
                                                navigate('/#newsletter');
                                                setTimeout(() => {
                                                    document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
                                                }, 100);
                                            }
                                        }}
                                        className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 cursor-pointer"
                                    >
                                        Subscribe to News
                                    </button>
                                </li>
                            </ul>
                        </div>



                        {/* Column 5: Legal */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">Legal</h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/privacy" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        Terms & Conditions
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/cookie-policy" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        Cookie Policy
                                    </Link>
                                </li>
                                <li>
                                    <a href="https://www.seai.ie" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">
                                        SEAI.ie
                                    </a>
                                </li>
                            </ul>
                        </div>


                        {/* Column 4: Contact */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">Get in Touch</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Mail className="text-[#9ACD32] mt-0.5" size={16} />
                                    <a href="mailto:hello@theberman.eu" className="hover:text-white transition">hello@theberman.eu</a>
                                </li>
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Globe className="text-[#9ACD32] mt-0.5" size={16} />
                                    <a href="https://theberman.eu" target='_blank' className="hover:text-white transition">theberman.eu</a>
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
        </div >
    );
};

export default Layout;
