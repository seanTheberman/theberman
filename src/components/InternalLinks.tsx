import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, BookOpen, HelpCircle, Info, Mail, Search } from 'lucide-react';
import { getTenantFromDomain } from '../lib/tenant';

interface Props {
    page: 'about' | 'locations' | 'blog' | 'blogDetail' | 'faq' | 'contact' | 'home' | 'catalogue';
}

const InternalLinks = ({ page }: Props) => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isPortugal = tenant === 'portugal';
    const isFrance = tenant === 'france';

    const labels = isSpanish ? {
        heading: 'Enlaces Útiles',
        home: 'Inicio',
        about: 'Sobre Nosotros',
        locations: 'Ubicaciones',
        blog: 'Blog',
        faq: 'Preguntas Frecuentes',
        contact: 'Contacto',
        catalogue: 'Directorio',
        getQuote: 'Solicitar Presupuesto',
    } : isPortugal ? {
        heading: 'Links Úteis',
        home: 'Início',
        about: 'Sobre Nós',
        locations: 'Localizações',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contacto',
        catalogue: 'Catálogo',
        getQuote: 'Pedir Orçamento',
    } : isFrance ? {
        heading: 'Liens Utiles',
        home: 'Accueil',
        about: 'À Propos',
        locations: 'Localisation',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contact',
        catalogue: 'Annuaire',
        getQuote: 'Demander un Devis',
    } : isEngland ? {
        heading: 'Useful Links',
        home: 'Home',
        about: 'About Us',
        locations: 'Locations',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contact',
        catalogue: 'Find Assessors',
        getQuote: 'Get a Free Quote',
    } : {
        heading: 'Useful Links',
        home: 'Home',
        about: 'About Us',
        locations: 'Locations',
        blog: 'Blog',
        faq: 'FAQ',
        contact: 'Contact',
        catalogue: 'Find Assessors',
        getQuote: 'Get a Free Quote',
    };

    const faqPath = isEngland ? '/epc-faq' : '/ber-faqs/';
    const aboutPath = '/about-us';
    const contactPath = isSpanish ? '/contact-us' : '/contact-us';
    const cataloguePath = '/catalogue';

    const allLinks = [
        { label: labels.home, path: '/', icon: <Info size={16} /> },
        { label: labels.about, path: aboutPath, icon: <Info size={16} /> },
        { label: labels.catalogue, path: cataloguePath, icon: <Search size={16} /> },
        { label: labels.locations, path: '/locations', icon: <MapPin size={16} /> },
        { label: labels.blog, path: '/blog', icon: <BookOpen size={16} /> },
        { label: labels.faq, path: faqPath, icon: <HelpCircle size={16} /> },
        { label: labels.contact, path: contactPath, icon: <Mail size={16} /> },
        { label: labels.getQuote, path: '/get-quote', icon: <ArrowRight size={16} /> },
    ];

    const links = allLinks.filter(l => l.path !== page && !(page === 'home' && l.path === '/'));

    return (
        <nav className="border-t border-gray-100 bg-gray-50/50 py-8 mt-8" aria-label="Internal navigation">
            <div className="container mx-auto px-6 max-w-5xl">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">{labels.heading}</h2>
                <div className="flex flex-wrap justify-center gap-2">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:text-[#007F00] hover:border-[#007F00]/30 transition-all"
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default InternalLinks;
