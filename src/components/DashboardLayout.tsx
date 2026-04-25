import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Menu, X, LogOut, ChevronLeft, ChevronRight,
    RefreshCw, Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

export interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
}

interface DashboardLayoutProps {
    title: string;
    subtitle: string;
    navItems: NavItem[];
    activeView: string;
    onViewChange: (id: string) => void;
    onRefresh?: () => void;
    loading?: boolean;
    children: React.ReactNode;
    extraSidebarItems?: React.ReactNode;
    roleLabel: string;
}

const DashboardLayout = ({
    title,
    subtitle,
    navItems,
    activeView,
    onViewChange,
    onRefresh,
    loading,
    children,
    extraSidebarItems,
    roleLabel
}: DashboardLayoutProps) => {
    const { user, signOut } = useAuth();
    const { isSpanish } = useTranslation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopExpanded, setDesktopExpanded] = useState(true);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex">
            {/* Mobile overlay backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full bg-[#0c121d] flex flex-col z-50 shadow-2xl
                transition-all duration-300 ease-in-out
                w-56
                md:translate-x-0 lg:w-56
                ${desktopExpanded ? 'md:w-56' : 'md:w-14'}
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
                    <Link to="/" className={`block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>
                        {isSpanish ? (
                            <span style={{ fontFamily: "'Brush Script MT', 'Lucida Calligraphy', 'Snell Roundhand', cursive", fontSize: '1.2rem', color: 'white', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                                Certificado Energético
                            </span>
                        ) : (
                            <img src="/logo.svg" alt="The Berman" className="h-7 w-auto" />
                        )}
                    </Link>
                    <div className={`flex items-center justify-center ${desktopExpanded ? 'md:hidden' : 'md:flex'} lg:hidden`}>
                        {isSpanish ? (
                            <span style={{ fontFamily: "'Brush Script MT', 'Lucida Calligraphy', 'Snell Roundhand', cursive", fontSize: '1rem', color: 'white', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                                Certificado Energético
                            </span>
                        ) : (
                            <img src="/logo.svg" alt="The Berman" className="h-7 w-auto" />
                        )}
                    </div>
                    {/* Close on mobile */}
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white p-1">
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                    {/* Expand/collapse toggle — only on md (laptop icon-only mode) */}
                    <div className={`hidden md:flex lg:hidden mb-1 ${desktopExpanded ? 'px-4 justify-end' : 'justify-center'}`}>
                        <button
                            onClick={() => setDesktopExpanded(!desktopExpanded)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            title={desktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                        >
                            {desktopExpanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                        </button>
                    </div>
                    <p className={`text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-4 mb-2 block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>Navigation</p>
                    {navItems.map(({ id, label, icon: Icon, badge }) => {
                        const isActive = activeView === id;
                        return (
                            <button
                                key={id}
                                onClick={() => { onViewChange(id); setSidebarOpen(false); }}
                                title={label}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-[12px] font-semibold transition-all duration-150 relative group ${isActive ? 'bg-[#007F00] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                                    <span className={`truncate block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>{label}</span>
                                </div>
                                {badge !== undefined && badge > 0 && (
                                    <span className={`flex-shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full flex ${desktopExpanded ? 'md:flex' : 'md:hidden'} lg:flex ${isActive ? 'bg-white text-[#007F00]' : 'bg-amber-500 text-white'}`}>
                                        {badge}
                                    </span>
                                )}
                                {/* Badge dot on tablet icon-only mode */}
                                {badge !== undefined && badge > 0 && !desktopExpanded && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 hidden md:block lg:hidden" />
                                )}
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-l-full" />}
                            </button>
                        );
                    })}

                    {extraSidebarItems && (
                        <>
                            <div className="mx-4 my-3 border-t border-white/10" />
                            {extraSidebarItems}
                        </>
                    )}
                </nav>

                <div className="p-3 border-t border-white/10 flex-shrink-0">
                    <div className={`flex items-center gap-2.5 mb-2 px-1 ${desktopExpanded ? 'md:flex' : 'md:hidden'} lg:flex`}>
                        <div className="w-7 h-7 rounded-full bg-[#007F00]/80 flex items-center justify-center flex-shrink-0">
                            <Users size={13} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-white/80 truncate uppercase tracking-widest">{roleLabel}</p>
                            <p className="text-[9px] text-white/40 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        title="Sign Out"
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all justify-center ${desktopExpanded ? 'md:justify-start' : 'md:justify-center'} lg:justify-start`}
                    >
                        <LogOut size={14} className="flex-shrink-0" />
                        <span className={`block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main area */}
            <div className={`${desktopExpanded ? 'md:ml-56' : 'md:ml-14'} lg:ml-56 flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300`}>
                {/* Page Header */}
                <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                                <span className="truncate">{title}</span>
                            </h1>
                            <p className="text-xs text-gray-400 truncate tracking-tight">{subtitle}</p>
                        </div>
                    </div>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-[#007F00] hover:border-[#007F00] transition-all"
                        >
                            <RefreshCw className={loading ? 'animate-spin text-[#007F00]' : ''} size={13} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    )}
                </div>

                {/* Content */}
                <main className="flex-1 p-3 md:p-5 min-w-0 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
