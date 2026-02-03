
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Home, Smartphone, Mail, User as UserIcon, LayoutDashboard, Shield, LogOut, ChevronDown, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import QuoteModal from './QuoteModal';

const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
    { label: 'Hire an Agent', path: '/catalogue' },
];

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, signOut } = useAuth();
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

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

    const getDashboardLabel = () => {
        if (role === 'admin') return 'Admin Panel';
        if (role === 'contractor') return 'Assessor Portal';
        return 'My Dashboard';
    };

    const getDashboardIcon = () => {
        if (role === 'admin') return <Shield size={16} />;
        if (role === 'contractor') return <LayoutDashboard size={16} />;
        return <LayoutDashboard size={16} />;
    };

    return (
        <div className="flex flex-col min-h-screen font-sans">
            {/* HEADER */}
            <header className="fixed w-full top-0 z-50 bg-[#0c121d] backdrop-blur-md border-b border-white/5 shadow-lg transition-all duration-300">
                <div className="absolute top-full left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group  " onClick={closeMenu}>
                        <div className="relative">
                            <img src="/logo.svg" alt="The Berman Logo" className="h-18 w-auto relative z-10" />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-bold tracking-wide transition-colors ${location.pathname === link.path
                                    ? 'text-white border-b-2 border-white'
                                    : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                {link.label.toUpperCase()}
                            </Link>
                        ))}

                        {/* Auth Buttons / Dropdown */}
                        {!user ? (
                            <div className="flex items-center gap-4 ml-4">
                                <Link to="/login" className="text-white/80 hover:text-white font-bold text-sm tracking-wide transition-colors">
                                    LOGIN
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-white hover:bg-green-50 text-[#007F00] text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition shadow-md flex items-center gap-2 cursor-pointer"
                                >
                                    Sign Up <ArrowRight size={14} />
                                </Link>
                            </div>
                        ) : (
                            <div className="relative group ml-4">
                                <button className="flex items-center gap-3 text-white hover:text-green-400 transition focus:outline-none">
                                    <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-green-400">
                                        <UserIcon size={18} />
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">{role}</p>
                                        <p className="text-sm font-bold leading-none">{user.user_metadata?.full_name?.split(' ')[0] || 'User'}</p>
                                    </div>
                                    <ChevronDown size={14} className="text-gray-500 group-hover:rotate-180 transition-transform duration-200" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right w-56">
                                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 ring-1 ring-black ring-opacity-5">
                                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                        </div>

                                        <div className="py-2">
                                            <Link
                                                to={getDashboardLink()}
                                                className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#007F00] transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-green-100 text-[#007F00] flex items-center justify-center">
                                                    {getDashboardIcon()}
                                                </div>
                                                Dashboard
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                                                    <LogOut size={16} />
                                                </div>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-white hover:text-green-200 transition" onClick={toggleMenu}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <nav className="md:hidden bg-[#0c121d] border-t border-white/5 flex flex-col p-6 shadow-lg absolute w-full min-h-screen animate-fade-in-up pb-32">
                        {user && (
                            <div className="flex items-center gap-4 mb-4 pb-8 border-b border-white/5">
                                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white">
                                    <UserIcon size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">{user.user_metadata?.full_name || 'User'}</p>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-6 text-center">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={closeMenu}
                                    className={`text-xl font-serif font-bold ${location.pathname === link.path
                                        ? 'text-white'
                                        : 'text-green-100'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {!user ? (
                                <div className="flex flex-col gap-4 mt-6">
                                    <Link to="/login" onClick={closeMenu}>
                                        <button className="w-full bg-slate-800 border border-slate-700 text-white font-bold py-4 rounded-xl">
                                            Log In
                                        </button>
                                    </Link>
                                    <Link to="/signup" onClick={closeMenu}>
                                        <button className="w-full bg-[#007F00] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/40">
                                            Sign Up Free
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-white/5">
                                    <Link to={getDashboardLink()} onClick={closeMenu}>
                                        <button className="w-full bg-[#007F00] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/40">
                                            {getDashboardIcon()} {getDashboardLabel()}
                                        </button>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full bg-slate-900 text-red-400 hover:bg-red-900/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5"
                                    >
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                )}

                <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
            </header>

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
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition cursor-pointer"><Facebook size={16} /></a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition cursor-pointer"><Instagram size={16} /></a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition cursor-pointer"><Linkedin size={16} /></a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#000000] hover:text-white transition cursor-pointer">
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
