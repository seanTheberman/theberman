import { HelpCircle, List, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain } from '../lib/tenant';

const CookiePolicy = () => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';

    const tr = isSpanish ? {
        seoTitle: 'Política de Cookies',
        seoDesc: 'Política de Cookies de Certificado Energético. Infórmate sobre el uso de cookies en nuestro sitio web.',
        badge: 'Legal',
        title1: 'Política de',
        title2: 'Cookies.',
        hero: 'Usamos cookies para mejorar este sitio web. Si continúas utilizándolo, entendemos que aceptas su uso.',
        whatH: '¿Qué es una Cookie?',
        whatP: 'Una cookie es un pequeño fragmento de datos que un sitio web envía y que se almacena en tu ordenador a través de tu navegador mientras navegas por nuestro sitio. Las cookies fueron diseñadas como un mecanismo fiable para que los sitios recuerden información (como los artículos añadidos al carrito en una tienda online) o registren la actividad del usuario (pulsar botones, iniciar sesión, o registrar qué páginas se han visitado). También pueden recordar información introducida previamente en formularios, como nombres, direcciones, contraseñas o datos de pago.',
        useH: 'Cookies que Usamos',
        useIntro: 'Podemos usar, entre otras, las siguientes cookies en nuestro sitio web:',
        useItems: [
            { b: 'tawkuuid', t: 'aplicación de chat de soporte' },
            { b: 'utma / utmz', t: 'Google Analytics' },
            { b: 'cookies cfclient', t: 'cookies de cliente/sesión/servidor de ColdFusion' },
            { b: 'adNetwork', t: 'seguimiento de redes publicitarias' },
            { b: 'Cookies de publicidad y remarketing', t: '' },
        ],
        optH: 'Rechazar',
        optP1: 'Si no aceptas nuestro uso de cookies, por favor abandona este sitio web',
        optP2: 'haciendo clic aquí',
        optP3: '.',
    } : {
        seoTitle: 'Cookie Policy',
        seoDesc: 'Cookie Policy for The Berman. Learn about how we use cookies on our website.',
        badge: 'Legal',
        title1: 'Cookie',
        title2: 'Policy.',
        hero: 'We use cookies to make this website better for you and your continued use of this website implies that you agree to our use of cookies.',
        whatH: 'What is a Cookie?',
        whatP: "A cookie is a small piece of data sent from a website and stored on your computer via your web browser, while you are browsing our website. Cookies were designed to be a reliable mechanism for websites to remember stateful information (such as items added in the shopping cart in an online store) or to record the user's browsing activity (including clicking particular buttons, logging in, or recording which pages were visited in the past). They can also be used to remember arbitrary pieces of information that the user previously entered into form fields such as names, addresses, passwords, and credit card numbers.",
        useH: 'Cookies We Use',
        useIntro: 'We may use the following cookies among others from time to time on our website:',
        useItems: [
            { b: 'tawkuuid', t: 'for support chat app' },
            { b: 'utma / utmz', t: 'for Google Analytics' },
            { b: 'cfclient cookies', t: 'for ColdFusion client/session/server cookies' },
            { b: 'adNetwork', t: 'adNetwork tracking' },
            { b: 'Cookies for advertising and remarketing', t: '' },
        ],
        optH: 'Opt Out',
        optP1: "If you don't agree to our use of cookies, please leave this website by",
        optP2: 'clicking here',
        optP3: '.',
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical="/cookie-policy"
            />

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {tr.badge}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        {tr.title1} <span className="text-[#007F00]">{tr.title2}</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {tr.hero}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="space-y-16">

                        {/* 1. What is a cookie? */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <HelpCircle className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.whatH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 leading-relaxed font-medium">
                                <p>{tr.whatP}</p>
                            </div>
                        </div>

                        {/* 2. Cookies We Use */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <List className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.useH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>{tr.useIntro}</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    {tr.useItems.map((item, i) => (
                                        <li key={i}>
                                            <strong>{item.b}</strong>{item.t ? ` — ${item.t}` : ''}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* 3. Opt Out */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <LogOut className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.optH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>
                                    {tr.optP1}{' '}
                                    <Link to="/" className="text-[#007F00] font-bold hover:underline">
                                        {tr.optP2}
                                    </Link>{tr.optP3}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default CookiePolicy;
