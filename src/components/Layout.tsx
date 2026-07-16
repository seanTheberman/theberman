import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Mail, Facebook, Instagram, Linkedin, ChevronRight, Globe, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { getTenantDisplayName, getTenantWebsiteUrl, getTenantEmail, getTenantDomain } from '../lib/tenant';
import { supabase } from '../lib/supabase';
import QuoteModal from './QuoteModal';


const NAV_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about-us' },
    { label: 'Home Energy Upgrade Catalogue', path: '/catalogue' },
    { label: 'Speak to an Energy Advisor', path: '/hire-agent', hideForEngland: true },
    { label: 'Book Ber Assessors', path: '/contact-us', hideForEngland: true },
    { label: 'Our News', path: '/news' },
    { label: 'Blog', path: '/blog' },
    { label: 'FAQ', path: '/ber-faqs/', englandPath: '/epc-faq' },
    { label: 'Location', path: '/locations' },
    { label: 'Contact', path: '/contact-us' },
];

const PROVINCES_IRELAND: Record<string, string[]> = {
    Leinster: ['Carlow', 'Dublin', 'Kildare', 'Kilkenny', 'Laois', 'Longford', 'Louth', 'Meath', 'Offaly', 'Westmeath', 'Wexford', 'Wicklow'],
    Munster: ['Clare', 'Cork', 'Kerry', 'Limerick', 'Tipperary', 'Waterford'],
    Connacht: ['Galway', 'Leitrim', 'Mayo', 'Roscommon', 'Sligo'],
    Ulster: ['Cavan', 'Donegal', 'Monaghan', 'Antrim', 'Armagh', 'Down', 'Fermanagh', 'Londonderry', 'Tyrone'],
};

const PROVINCES_SPAIN: Record<string, string[]> = {
    'Andalucía': ['Sevilla', 'Málaga', 'Córdoba', 'Granada', 'Almería', 'Huelva', 'Jaén', 'Cádiz', 'Dos Hermanas', 'Marbella', 'Jerez de la Frontera', 'Fuengirola', 'Estepona', 'Motril', 'Lucena', 'Ronda', 'Torremolinos', 'Benalmádena'],
    'Aragón': ['Zaragoza', 'Huesca', 'Teruel', 'Calatayud', 'Ejea de los Caballeros', 'Utebo', 'Tarazona', 'Caspe', 'Barbastro', 'Monzón'],
    'Principado de Asturias': ['Oviedo', 'Gijón', 'Avilés', 'Siero', 'Langreo', 'Mieres', 'Castrillón', 'San Martín del Rey Aurelio', 'Corvera de Asturias', 'Llanera'],
    'Islas Baleares': ['Palma', 'Calvià', 'Inca', 'Llucmajor', 'Manacor', 'Marratxí', 'Ibiza', 'Santa Eulària des Riu', 'Mahón', 'Ciutadella'],
    'Canarias': ['Las Palmas de Gran Canaria', 'Santa Cruz de Tenerife', 'Telde', 'Arucas', 'San Cristóbal de La Laguna', 'Arrecife', 'Puerto del Rosario', 'Santa Lucía de Tirajana', 'Adeje', 'Arona'],
    'Cantabria': ['Santander', 'Torrelavega', 'Camargo', 'Piélagos', 'El Astillero', 'Castro-Urdiales', 'Laredo', 'Santa Cruz de Bezana', 'Los Corrales de Buelna', 'Santoña'],
    'Castilla-La Mancha': ['Albacete', 'Ciudad Real', 'Toledo', 'Guadalajara', 'Cuenca', 'Talavera de la Reina', 'Puertollano', 'Tomelloso', 'Alcázar de San Juan', 'Valdepeñas'],
    'Castilla y León': ['Valladolid', 'Burgos', 'Salamanca', 'León', 'Palencia', 'Segovia', 'Zamora', 'Ávila', 'Soria', 'Ponferrada'],
    'Cataluña': ['Barcelona', 'Hospitalet de Llobregat', 'Terrassa', 'Badalona', 'Sabadell', 'Tarragona', 'Lleida', 'Girona', 'Mataró', 'Reus', 'Santa Coloma de Gramenet', 'Cornellà de Llobregat', 'Sant Cugat del Vallès', 'Manresa', 'Rubí'],
    'Comunidad de Madrid': ['Madrid', 'Alcalá de Henares', 'Alcobendas', 'Alcorcón', 'Fuenlabrada', 'Getafe', 'Leganés', 'Móstoles', 'Parla', 'Torrejón de Ardoz', 'Majadahonda', 'Pozuelo de Alarcón', 'Tres Cantos', 'Coslada', 'Rivas-Vaciamadrid'],
    'Comunidad Foral de Navarra': ['Pamplona', 'Tudela', 'Barañáin', 'Burlada', 'Estella', 'Zizur Mayor', 'Ansoáin', 'Berriozar', 'Tafalla', 'Villava'],
    'Comunidad Valenciana': ['Valencia', 'Alicante', 'Elche', 'Castellón de la Plana', 'Torrevieja', 'Orihuela', 'Gandia', 'Benidorm', 'Paterna', 'Torrent', 'Sagunto', 'Alcoy', 'Dénia', 'San Vicente del Raspeig', 'Elda'],
    'Extremadura': ['Badajoz', 'Cáceres', 'Mérida', 'Plasencia', 'Don Benito', 'Almendralejo', 'Villanueva de la Serena', 'Navalmoral de la Mata', 'Zafra', 'Montijo'],
    'Galicia': ['Vigo', 'A Coruña', 'Ourense', 'Lugo', 'Santiago de Compostela', 'Pontevedra', 'Ferrol', 'Narón', 'Oleiros', 'Culleredo'],
    'La Rioja': ['Logroño', 'Calahorra', 'Arnedo', 'Haro', 'Alfaro', 'Lardero', 'Nájera', 'Santo Domingo de la Calzada', 'Villamediana de Iregua', 'Autol'],
    'País Vasco': ['Bilbao', 'Vitoria-Gasteiz', 'San Sebastián', 'Barakaldo', 'Getxo', 'Portugalete', 'Basauri', 'Leioa', 'Durango', 'Irún'],
    'Región de Murcia': ['Murcia', 'Cartagena', 'Lorca', 'Molina de Segura', 'Alcantarilla', 'Cieza', 'Torre-Pacheco', 'San Javier', 'Yecla', 'Jumilla'],
    'Ceuta': ['Ceuta'],
    'Melilla': ['Melilla'],
};

const PROVINCES_ENGLAND: Record<string, string[]> = {
    'Greater London': ['London'],
    'South East': ['Brighton', 'Southampton'],
    'West Midlands': ['Birmingham', 'Coventry'],
    'East Midlands': ['Nottingham', 'Leicester'],
    'North West': ['Manchester', 'Liverpool', 'Leeds'],
    'North East': ['Newcastle', 'York'],
    'South West': ['Bristol', 'Exeter'],
    Scotland: ['Glasgow', 'Edinburgh'],
};

const PROVINCES_FRANCE: Record<string, string[]> = {
    'Île-de-France': ['Paris'],
    'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice'],
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble'],
    'Occitanie': ['Toulouse', 'Montpellier'],
    'Nouvelle-Aquitaine': ['Bordeaux', 'La Rochelle'],
    'Grand Est': ['Strasbourg', 'Reims'],
    'Hauts-de-France': ['Lille', 'Amiens'],
    'Pays de la Loire': ['Nantes', 'Angers'],
    'Bretagne': ['Rennes', 'Brest'],
    'Normandie': ['Rouen', 'Caen'],
    'Centre-Val de Loire': ['Tours', 'Orléans'],
    'Bourgogne-Franche-Comté': ['Dijon', 'Besançon'],
    'Corse': ['Ajaccio', 'Bastia'],
};

const PROVINCES_PORTUGAL: Record<string, string[]> = {
    'Lisboa': ['Lisboa', 'Sintra', 'Cascais'],
    'Norte': ['Porto', 'Braga', 'Guimarães'],
    'Centro': ['Coimbra', 'Aveiro', 'Leiria'],
    'Algarve': ['Faro', 'Portimão', 'Albufeira'],
    'Alentejo': ['Évora', 'Beja'],
    'Açores': ['Ponta Delgada', 'Angra do Heroísmo'],
    'Madeira': ['Funchal'],
};

const Layout = () => {
    const { t, isSpanish, tenant } = useTranslation();
    const tenantDisplayName = getTenantDisplayName(tenant);
    const tenantWebsiteUrl = getTenantWebsiteUrl(tenant);
    const tenantEmail = getTenantEmail(tenant);
    const tenantDomain = getTenantDomain(tenant);
    const getNavLabel = (label: string) => {
        if (isSpanish) {
            const map: Record<string, string> = {
                'Home': 'Inicio',
                'About': 'Sobre Nosotros',
                'Home Energy Upgrade Catalogue': 'Catálogo de Eficiencia Energética',
                'Speak to an Energy Advisor': 'Habla con un Asesor Energético',
                'Book Ber Assessors': 'Reservar Certificadores',
                'Our News': 'Nuestras Noticias',
                'Blog': 'Blog',
                'FAQ': 'FAQ',
                'Location': 'Ubicaciones',
                'Contact': 'Contacto',
            };
            return map[label] || label;
        }
        if (tenant === 'france') {
            const map: Record<string, string> = {
                'Home': 'Accueil',
                'About': 'À Propos',
                'Home Energy Upgrade Catalogue': 'Catalogue de Rénovation Énergétique',
                'Speak to an Energy Advisor': 'Parlez à un Conseiller Énergétique',
                'Book Ber Assessors': 'Réserver un Diagnostiqueur DPE',
                'Our News': 'Actualités',
                'Blog': 'Blog',
                'FAQ': 'FAQ',
                'Location': 'Localisations',
                'Contact': 'Contact',
            };
            return map[label] || label;
        }
        if (tenant === 'portugal') {
            const map: Record<string, string> = {
                'Home': 'Início',
                'About': 'Sobre Nós',
                'Home Energy Upgrade Catalogue': 'Catálogo de Melhoria Energética',
                'Speak to an Energy Advisor': 'Fale com um Consultor Energético',
                'Book Ber Assessors': 'Agendar Perito Certificador',
                'Our News': 'Notícias',
                'Blog': 'Blog',
                'FAQ': 'FAQ',
                'Location': 'Localizações',
                'Contact': 'Contacto',
            };
            return map[label] || label;
        }
        if (tenant === 'england') {
            const map: Record<string, string> = {
                'About': 'About Us',
                'Book Ber Assessors': 'Book EPC Assessors',
                'Our News': 'News',
                'FAQ': 'FAQs',
                'Location': 'Locations',
            };
            return map[label] || label;
        }
        return label;
    };
    const PROVINCES =
        tenant === 'england' ? PROVINCES_ENGLAND :
        tenant === 'spain' ? PROVINCES_SPAIN :
        tenant === 'france' ? PROVINCES_FRANCE :
        tenant === 'portugal' ? PROVINCES_PORTUGAL :
        PROVINCES_IRELAND;
    // Filter out tenant-hidden links, then apply tenant-specific ordering.
    const visibleNavLinks = NAV_LINKS.filter(link => !(tenant === 'england' && link.hideForEngland));
    const orderedNavLinks = tenant === 'england'
        ? (['Home', 'About', 'Location', 'Home Energy Upgrade Catalogue', 'Our News', 'Blog', 'FAQ', 'Contact']
            .map(label => visibleNavLinks.find(l => l.label === label))
            .filter((l): l is typeof NAV_LINKS[number] => Boolean(l)))
        : visibleNavLinks;
    const [locations, setLocations] = useState<any[]>([]);
    const [isLocationsOpen, setIsLocationsOpen] = useState(false);
    const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isCatalogueNav = pathname === '/catalogue' || /^\/catalogue\/[^/]+/.test(pathname);
    const { user, role, profile, signOut } = useAuth();
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [hasBusinessListing, setHasBusinessListing] = useState(false);

    const [isLocationsHover, setIsLocationsHover] = useState(false);
    const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
    const locationsHoverRef = useRef<HTMLDivElement>(null);
    const locationsRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsLocationsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
        closeMenu();
    };

    useEffect(() => {
        const fetchLocations = async () => {
            const { data } = await supabase
                .from('catalogue_locations')
                .select('id, name, slug')
                .order('name');
            let locs = data || [];
            // If DB has no entries for this tenant, build fallback from PROVINCES mapping
            const provinceNames = Object.values(PROVINCES).flat();
            const hasTenantLocs = locs.some(loc => provinceNames.includes(loc.name));
            if (!hasTenantLocs) {
                locs = provinceNames.map((name, idx) => ({
                    id: `fallback-${idx}`,
                    name,
                    slug: name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                }));
            }
            setLocations(locs);
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

    const getDashboardLink = () => {
        if (!user) return '/contact-us';
        if (role === 'admin') return '/admin';
        if (role === 'contractor') return '/dashboard/ber-assessor';
        if (role === 'business') return '/dashboard/business';
        return '/dashboard/user';
    };

    return (
        <div className="flex flex-col min-h-screen font-sans">
            <header className="fixed w-full top-0 z-[9999] bg-[#0c121d] border-b border-white/5 shadow-lg transition-colors duration-300">
                <div className="absolute top-full left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        {isSpanish ? (
                            <img src="/certificado-logo-trimmed.png" alt="Certificado Energético Logo" style={{ height: '4rem', width: 'auto' }} className="relative z-10" />
                        ) : tenant === 'england' ? (
                            <img src="/epc-logo-trimmed.png" alt="EPC Certificate England which provides a rating from A to G" style={{ height: '4rem', width: 'auto' }} className="relative z-10" />
                        ) : tenant === 'portugal' ? (
                            <img src="/certificado-energia-logo.svg" alt="Certificado Energia Logo" style={{ height: '4rem', width: 'auto' }} className="relative z-10" />
                        ) : (
                            <img src="/logo.svg" alt={tenant === 'ireland' ? 'The BER Man - BER Cert Ireland Specialists' : `${tenantDisplayName} Logo`} style={{ height: '4.5rem', width: 'auto' }} className="relative z-10" />
                        )}
                    </Link>

                    {/* Catalogue-only inline nav (desktop only) */}
                    {isCatalogueNav && (
                        <nav className="hidden md:flex items-center gap-1">
                            <Link to="/" className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-white/70 hover:text-white uppercase tracking-wide transition-colors whitespace-nowrap">{isSpanish ? 'Início' : tenant === 'portugal' ? 'Início' : 'Home'}</Link>
                            <Link to="/catalogue" className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-white/70 hover:text-white uppercase tracking-wide transition-colors whitespace-nowrap">{isSpanish ? 'Catálogo' : tenant === 'portugal' ? 'Catálogo' : 'Catalogue'}</Link>

                            {/* Mobile: simple Locations link */}
                            <Link to="/locations" className="flex md:hidden px-2 py-1.5 text-[10px] font-bold text-white/70 hover:text-white uppercase tracking-wide transition-colors whitespace-nowrap">{isSpanish ? 'Ubicaciones' : tenant === 'portugal' ? 'Localizações' : 'Locations'}</Link>

                            {/* Desktop: Locations hover dropdown */}
                            <div
                                ref={locationsHoverRef}
                                className="relative hidden md:block"
                                onMouseEnter={() => setIsLocationsHover(true)}
                                onMouseLeave={() => { setIsLocationsHover(false); setHoveredProvince(null); }}
                            >
                                <button className="px-3 py-2 text-xs font-bold text-white/70 hover:text-white uppercase tracking-wide transition-colors whitespace-nowrap flex items-center gap-1">
                                    {isSpanish ? 'Ubicaciones' : tenant === 'portugal' ? 'Localizações' : 'Locations'}
                                    <ChevronRight size={12} className={`transition-transform duration-200 ${isLocationsHover ? 'rotate-90' : ''}`} />
                                </button>
                                {isLocationsHover && (
                                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-visible min-w-[180px]">
                                        {Object.keys(PROVINCES).map((province) => (
                                            <div
                                                key={province}
                                                className="relative group/province"
                                                onMouseEnter={() => setHoveredProvince(province)}
                                                onMouseLeave={() => setHoveredProvince(null)}
                                            >
                                                <div className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#007EA7] cursor-default border-b border-gray-100 last:border-0 transition-colors">
                                                    <span className="uppercase tracking-wide">{province}</span>
                                                    <ChevronRight size={12} className="text-gray-400" />
                                                </div>
                                                {hoveredProvince === province && (
                                                    <div className="absolute left-full top-0 ml-0.5 bg-white rounded-lg shadow-xl border border-gray-100 z-50 min-w-[160px] overflow-hidden">
                                                        {locations.filter(loc => PROVINCES[province]?.includes(loc.name)).map(location => (
                                                            <Link
                                                                key={location.id}
                                                                to={`/${location.slug}`}
                                                                className="block px-4 py-2 text-xs text-gray-600 hover:text-[#007EA7] hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
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

                            <Link to="/news" className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-white/70 hover:text-white uppercase tracking-wide transition-colors whitespace-nowrap">{tenant === 'portugal' ? 'Notícias' : 'News'}</Link>
                        </nav>
                    )}

                    {/* Right: Catalogue pill + Hamburger */}
                    <div ref={menuRef} className="flex items-center gap-4 relative">

                        {/* Catalogue pill (hidden on catalogue pages since nav already shows it) */}
                        {!isCatalogueNav && (
                            <Link
                                to="/catalogue"
                                className="hidden md:flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
                            >
                                <div className="w-2 h-2 rounded-full bg-[#9ACD32] group-hover:animate-pulse"></div>
                                <span className="text-sm font-black text-white uppercase tracking-wider">
                                    {isSpanish ? 'Catálogo de Eficiencia Energética' : tenant === 'portugal' ? <>Catálogo de <span className="text-[#9ACD32]">Melhoria Energética</span></> : <>Home Energy <span className="text-[#9ACD32]">Upgrade Catalogue</span></>}
                                </span>
                            </Link>
                        )}

                        {/* Mobile catalogue pill — hidden on catalogue pages (sub-nav handles it) */}
                        {!isCatalogueNav && <Link
                            to="/catalogue"
                            className="flex md:hidden items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#9ACD32]"></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">
                                {isSpanish ? 'Catálogo Energético' : tenant === 'portugal' ? <>Catálogo <span className="text-[#9ACD32]">Energético</span></> : <>Energy <span className="text-[#9ACD32]">Catalogue</span></>}
                            </span>
                        </Link>}

                        {/* Talk to Us — clickable phone number */}
                        {(() => {
                            const phoneConfig: Record<string, { number: string; display: string; label: string }> = {
                                spain: { number: '+34613907509', display: '+34 613 90 75 09', label: 'Llámanos' },
                                portugal: { number: '+351920123456', display: '+351 920 123 456', label: 'Fale Connosco' },
                            };
                            const cfg = phoneConfig[tenant] || { number: '0818213131', display: '0818213131', label: 'Talk to Us' };
                            return (
                                <a
                                    href={`tel:${cfg.number}`}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#007F00] hover:bg-[#006600] rounded-full text-white font-bold text-xs uppercase tracking-wide transition-colors whitespace-nowrap"
                                >
                                    <Phone size={14} />
                                    <span>{cfg.label}</span>
                                    <span className="text-[#9ACD32]">{cfg.display}</span>
                                </a>
                            );
                        })()}

                        {/* Mobile: icon-only phone button */}
                        <a
                            href={`tel:${tenant === 'portugal' ? '+351920123456' : isSpanish ? '+34613907509' : '0818213131'}`}
                            className="flex sm:hidden items-center justify-center w-10 h-10 bg-[#007F00] hover:bg-[#006600] rounded-full text-white transition-colors"
                        >
                            <Phone size={16} />
                        </a>

                        {/* Hamburger */}
                        <button
                            className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <X size={28} className="text-green-600" /> : <Menu size={28} className="text-green-600" />}
                        </button>

                        {/* Dropdown menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden max-h-[80vh] overflow-y-auto">
                                <div className="py-2">
                                    {orderedNavLinks.map((link) => (
                                        link.label === 'Location' ? (
                                            <div key={link.label}>
                                                <button
                                                    ref={locationsRef}
                                                    onClick={() => { setIsLocationsOpen(!isLocationsOpen); if (!isLocationsOpen) setExpandedProvince(null); }}
                                                    className={`w-full px-5 py-3 text-left text-sm font-semibold uppercase tracking-wide border-b border-gray-100 flex justify-between items-center transition-colors ${isLocationsOpen ? 'bg-gray-50 text-[#007F00]' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {getNavLabel('Location')}
                                                    <ChevronRight size={16} className={`transition-transform duration-200 ${isLocationsOpen ? 'rotate-90' : ''}`} />
                                                </button>
                                                {isLocationsOpen && (
                                                    <div className="bg-gray-50 border-b border-gray-100">
                                                        {tenant === 'england' ? (
                                                            <>
                                                                {[
                                                                    { name: 'London', slug: 'epc-assessment-london' },
                                                                    { name: 'Manchester', slug: 'epc-assessment-manchester' },
                                                                    { name: 'Birmingham', slug: 'epc-assessment-birmingham' },
                                                                ].map(city => (
                                                                    <Link
                                                                        key={city.slug}
                                                                        to={`/${city.slug}/`}
                                                                        onClick={closeMenu}
                                                                        className="block pl-8 pr-5 py-2.5 text-xs text-gray-600 hover:text-[#007EA7] hover:bg-gray-100 font-bold uppercase tracking-wide transition-colors"
                                                                    >
                                                                        {city.name}
                                                                    </Link>
                                                                ))}
                                                                <Link
                                                                    to="/locations/"
                                                                    onClick={closeMenu}
                                                                    className="block pl-8 pr-5 py-2.5 text-xs text-[#007F00] hover:text-[#006400] hover:bg-gray-100 font-bold uppercase tracking-wide transition-colors border-t border-gray-200"
                                                                >
                                                                    View All Locations We Cover
                                                                </Link>
                                                            </>
                                                        ) : Object.keys(PROVINCES).map((province) => (
                                                            <div key={province}>
                                                                <button
                                                                    onClick={() => setExpandedProvince(expandedProvince === province ? null : province)}
                                                                    className={`w-full pl-8 pr-5 py-2.5 text-left text-xs font-bold uppercase tracking-wide flex justify-between items-center transition-colors ${expandedProvince === province ? 'bg-white text-[#007EA7]' : 'text-gray-600 hover:bg-gray-100'}`}
                                                                >
                                                                    {province}
                                                                    <ChevronRight size={14} className={`transition-transform duration-200 ${expandedProvince === province ? 'rotate-90' : ''}`} />
                                                                </button>
                                                                {expandedProvince === province && (
                                                                    <div className="bg-white border-t border-gray-100">
                                                                        {locations.filter(loc => PROVINCES[province]?.includes(loc.name)).map(location => (
                                                                            <Link
                                                                                key={location.id}
                                                                                to={`/${location.slug}`}
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
                                                to={tenant === 'england' && link.englandPath ? link.englandPath : link.path}
                                                onClick={closeMenu}
                                                className="block px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100"
                                            >
                                                {getNavLabel(link.label)}
                                            </Link>
                                        )
                                    ))}

                                    {tenant !== 'england' && <button
                                        onClick={() => {
                                            closeMenu();
                                            if (window.location.pathname === '/') {
                                                document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
                                            } else {
                                                navigate('/#newsletter');
                                                setTimeout(() => { document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
                                            }
                                        }}
                                        className="w-full px-5 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100"
                                    >
                                        {isSpanish ? 'Suscribirse a Noticias' : tenant === 'portugal' ? 'Subscrever Notícias' : 'Subscribe to News'}
                                    </button>}

                                    <div className="border-t border-gray-200 mt-2 pt-2">
                                        {!user ? (
                                            <>
                                                <Link to="/login" onClick={closeMenu} className="block px-5 py-3 text-sm font-bold text-[#5CB85C] hover:bg-gray-50 uppercase tracking-wide">{t('sign_in')}</Link>
                                                <Link to="/signup?role=contractor" onClick={closeMenu} className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide">{isSpanish ? 'Registro de Certificador' : tenant === 'portugal' ? 'Registo de Perito' : 'Assessor Registration'}</Link>
                                                <Link to="/signup?role=business" onClick={closeMenu} className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide">{isSpanish ? 'Registro de Negocio' : tenant === 'portugal' ? 'Registo de Negócio' : 'Business Catalogue Registration'}</Link>
                                            </>
                                        ) : (
                                            <>
                                                <div className="px-5 py-3 bg-gray-50">
                                                    <p className="text-xs text-gray-500 font-medium">{isSpanish ? 'Sesión iniciada como' : tenant === 'portugal' ? 'Sessão iniciada como' : 'Signed in as'}</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                                </div>
                                                {role && (role !== 'business' || profile?.registration_status === 'active' || profile?.registration_status === 'pending') && (
                                                    <Link to={getDashboardLink()} onClick={closeMenu} className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100/50">
                                                        {role === 'business' ? (isSpanish ? 'Portal de Negocio' : tenant === 'portugal' ? 'Portal de Negócio' : 'Business Portal') : role === 'contractor' ? (isSpanish ? 'Panel del Certificador' : tenant === 'portugal' ? 'Painel do Perito' : 'Assessor Dashboard') : t('dashboard')}
                                                    </Link>
                                                )}
                                                {role === 'contractor' && hasBusinessListing && (
                                                    <Link to="/dashboard/business" onClick={closeMenu} className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide border-b border-gray-100/50">
                                                        {isSpanish ? 'Portal de Negocio' : tenant === 'portugal' ? 'Portal de Negócio' : 'Business Portal'}
                                                    </Link>
                                                )}
                                                <button onClick={handleLogout} className="w-full px-5 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 uppercase tracking-wide">
                                                    {t('sign_out')}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile catalogue sub-nav bar */}
                {isCatalogueNav && (
                    <nav className="md:hidden border-t border-white/10 flex items-center justify-center gap-0 py-2">
                        <Link to="/" className="px-3 py-1 text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors whitespace-nowrap">{isSpanish ? 'Inicio' : tenant === 'portugal' ? 'Início' : 'Home'}</Link>
                        <span className="text-white/20 text-[8px]">|</span>
                        <Link to="/catalogue" className="px-3 py-1 text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors whitespace-nowrap">{isSpanish ? 'Catálogo' : tenant === 'portugal' ? 'Catálogo' : 'Catalogue'}</Link>
                        <span className="text-white/20 text-[8px]">|</span>
                        <Link to="/locations" className="px-3 py-1 text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors whitespace-nowrap">{isSpanish ? 'Ubicaciones' : tenant === 'portugal' ? 'Localizações' : 'Locations'}</Link>
                        <span className="text-white/20 text-[8px]">|</span>
                        <Link to="/news" className="px-3 py-1 text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors whitespace-nowrap">{isSpanish ? 'Noticias' : tenant === 'portugal' ? 'Notícias' : 'News'}</Link>
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
                    <div className="grid md:grid-cols-5 gap-12 mb-12">
                        <div className="col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                {isSpanish ? (
                                    <span className="flex items-center text-white text-base md:text-[1.6rem] italic font-bold" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '0.5px', lineHeight: 1.2 }}>
                                        Certificado Energético.EU
                                    </span>
                                ) : tenant === 'england' ? (
                                    <span style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", fontSize: '1.6rem', color: 'white', letterSpacing: '1px', lineHeight: 1.2, fontWeight: 900 }}>
                                        EPC Cert
                                    </span>
                                ) : tenant === 'portugal' ? (
                                    <>
                                        <img src="/certificado-energia-logo.svg" alt={tenantDisplayName} className="h-16" />
                                        <span className="text-xl font-serif font-bold">{tenantDisplayName}</span>
                                    </>
                                ) : (
                                    <>
                                        <img src="/logo.svg" alt={tenantDisplayName} className="h-16" />
                                        <span className="text-xl font-serif font-bold">{tenantDisplayName}</span>
                                    </>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                {isSpanish ? 'Su socio de confianza para certificados energéticos y consultoría energética.' : tenant === 'england' ? "England's trusted partner for EPC assessments and energy performance certification." : tenant === 'portugal' ? "O seu parceiro de confiança para certificação energética e consultoria em eficiência energética em Portugal." : "Ireland's trusted partner for BER assessments and energy consultancy."}
                            </p>
                            <div className="flex gap-4">
                                {tenant === 'england' ? (
                                    <>
                                        <a href="https://www.facebook.com/epccert" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Facebook size={16} /></a>
                                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
                                            </svg>
                                        </a>
                                    </>
                                ) : tenant === 'portugal' ? (
                                    <>
                                        <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Facebook size={16} /></a>
                                        <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Instagram size={16} /></a>
                                        <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Linkedin size={16} /></a>
                                        <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
                                            </svg>
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a href="https://www.facebook.com/profile.php?id=61578159843471" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Facebook size={16} /></a>
                                        <a href="https://www.instagram.com/thebermanireland?igsh=amtidXdjNmZrMWJz&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Instagram size={16} /></a>
                                        <a href="https://www.linkedin.com/company/the-berman/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer"><Linkedin size={16} /></a>
                                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#007F00] hover:text-white transition cursor-pointer">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
                                            </svg>
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">{isSpanish ? 'Enlaces Rápidos' : tenant === 'portugal' ? 'Links Rápidos' : 'Quick Links'}</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: isSpanish ? 'Inicio' : tenant === 'portugal' ? 'Início' : 'Home', path: '/' },
                                    { label: isSpanish ? 'Sobre Nosotros' : tenant === 'portugal' ? 'Sobre Nós' : 'About Us', path: '/about-us' },
                                    { label: isSpanish ? 'Catálogo de Eficiencia Energética' : tenant === 'portugal' ? 'Catálogo de Melhoria Energética' : 'Energy Upgrade Catalogue', path: '/catalogue' },
                                    { label: isSpanish ? 'Habla con un Asesor Energético' : tenant === 'portugal' ? 'Fale com um Consultor Energético' : 'Speak to an Energy Advisor', path: '/hire-agent' },
                                    { label: isSpanish ? 'Registro de Negocio' : tenant === 'portugal' ? 'Registo de Negócio' : 'Business Registration', path: '/signup?role=business' },
                                    { label: 'FAQ', path: tenant === 'portugal' ? '/faq' : '/ber-faqs/' }
                                ].map(link => (
                                    <li key={link.path}>
                                        <Link to={link.path} className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">{isSpanish ? 'Cuenta' : tenant === 'portugal' ? 'Conta' : 'Account'}</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: isSpanish ? 'Reservar Certificadores' : tenant === 'portugal' ? 'Agendar Perito Certificador' : (tenant === 'england' ? 'Book EPC Assessors' : 'Book BER Assessors'), path: '/' },
                                    { label: isSpanish ? 'Ubicaciones' : tenant === 'portugal' ? 'Localizações' : 'Locations', path: '/locations' },
                                    { label: isSpanish ? 'Nuestras Noticias' : tenant === 'portugal' ? 'Notícias' : 'Our News', path: '/news' },
                                    { label: 'Blog', path: '/blog' },
                                    { label: isSpanish ? 'Contacto' : tenant === 'portugal' ? 'Contacto' : 'Contact Us', path: '/contact-us' },
                                    { label: isSpanish ? 'Iniciar Sesión' : tenant === 'portugal' ? 'Iniciar Sessão' : 'Login to Portal', path: '/login' },
                                    { label: isSpanish ? 'Registrarse' : tenant === 'portugal' ? 'Registar-se' : 'Sign Up', path: '/signup' }
                                ].map(link => (
                                    <li key={link.label}>
                                        <Link to={link.path} className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">{link.label}</Link>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => {
                                            if (window.location.pathname === '/') {
                                                document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
                                            } else {
                                                navigate('/#newsletter');
                                                setTimeout(() => { document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
                                            }
                                        }}
                                        className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2 cursor-pointer"
                                    >
                                        {isSpanish ? 'Suscribirse a Noticias' : tenant === 'portugal' ? 'Subscrever Notícias' : 'Subscribe to News'}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">{isSpanish ? 'Legal' : 'Legal'}</h4>
                            <ul className="space-y-3">
                                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">{isSpanish ? 'Política de Privacidad' : tenant === 'portugal' ? 'Política de Privacidade' : 'Privacy Policy'}</Link></li>
                                <li><Link to="/terms" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">{isSpanish ? 'Términos y Condiciones' : tenant === 'portugal' ? 'Termos e Condições' : 'Terms & Conditions'}</Link></li>
                                <li><Link to="/cookie-policy" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">{isSpanish ? 'Política de Cookies' : tenant === 'portugal' ? 'Política de Cookies' : 'Cookie Policy'}</Link></li>
                                {isSpanish && (
                                    <>
                                        <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2013-4394" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">RD 235/2013 (CEE)</a></li>
                                        <li><a href="https://www.boe.es/buscar/act.php?id=BOE-A-2021-7357" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">Ley 7/2021 Cambio Climático</a></li>
                                        <li><a href="https://www.miteco.gob.es/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">MITECO</a></li>
                                    </>
                                )}
                                {!isSpanish && tenant !== 'portugal' && (
                                    tenant === 'england' ? (
                                        <li><a href="https://www.gov.uk/government/collections/domestic-energy-performance-certificates" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">GOV.UK EPCs</a></li>
                                    ) : (
                                        <li><a href="https://www.seai.ie" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">SEAI.ie</a></li>
                                    )
                                )}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-[#9ACD32] mb-6">{isSpanish ? 'Contacto' : tenant === 'portugal' ? 'Contacto' : 'Get in Touch'}</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Mail className="text-[#9ACD32] mt-0.5" size={16} />
                                    <a href={`mailto:${tenantEmail}`} className="hover:text-white transition">{tenantEmail}</a>
                                </li>
                                <li className="flex items-start gap-3 text-gray-400 text-sm">
                                    <Globe className="text-[#9ACD32] mt-0.5" size={16} />
                                    <a href={tenantWebsiteUrl} target="_blank" className="hover:text-white transition">{tenantDomain}</a>
                                </li>
                                {isSpanish && (
                                    <li className="flex items-start gap-3 text-gray-400 text-sm">
                                        <MapPin className="text-[#9ACD32] mt-0.5" size={16} />
                                        <span>Madrid, España</span>
                                    </li>
                                )}
                                {tenant === 'portugal' && (
                                    <li className="flex items-start gap-3 text-gray-400 text-sm">
                                        <MapPin className="text-[#9ACD32] mt-0.5" size={16} />
                                        <span>Lisboa, Portugal</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                        <p>&copy; {new Date().getFullYear()} {tenantDisplayName}. {isSpanish ? 'Todos los derechos reservados.' : tenant === 'portugal' ? 'Todos os direitos reservados.' : 'All rights reserved.'}</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="hover:text-white cursor-pointer transition">{isSpanish ? 'Política de Privacidad' : tenant === 'portugal' ? 'Política de Privacidade' : 'Privacy Policy'}</Link>
                            <Link to="/terms" className="hover:text-white cursor-pointer transition">{isSpanish ? 'Términos de Servicio' : tenant === 'portugal' ? 'Termos de Serviço' : 'Terms of Service'}</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp CTA */}
            <a
                href={`https://wa.me/34613907509?text=${encodeURIComponent(isSpanish ? 'Hola, me gustaría más información sobre certificados energéticos.' : tenant === 'portugal' ? 'Olá, gostaria de mais informações sobre certificados energéticos.' : 'Hi, I would like more information about energy certificates.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-lg transition-all hover:scale-105 group"
                aria-label="WhatsApp"
            >
                <span className="flex items-center justify-center w-12 h-12 shrink-0">
                    <MessageCircle size={24} className="fill-white text-white" />
                </span>
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-[200px] group-hover:pr-4">
                    {isSpanish ? 'Escríbenos' : tenant === 'portugal' ? 'Escreve-nos' : 'Chat with us'}
                </span>
            </a>
        </div>
    );
};

export default Layout;
