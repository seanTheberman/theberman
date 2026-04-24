import { Shield, Lock, Eye, FileText, Scale } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain, getTenantEmail, getTenantDomain } from '../lib/tenant';

const PrivacyPolicy = () => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const tenantEmail = getTenantEmail(tenant);
    const tenantDomain = getTenantDomain(tenant);
    const brand = isSpanish ? 'Certificado Energético' : 'The Berman';
    const lastUpdated = isSpanish ? '2 de febrero de 2026' : 'February 2, 2026';

    const tr = isSpanish ? {
        seoTitle: 'Política de Privacidad',
        seoDesc: 'Política de Privacidad de Certificado Energético. Protegemos tus datos personales conforme a la legislación española y al RGPD.',
        badge: 'Legal',
        title1: 'Política de',
        title2: 'Privacidad.',
        lastUpdatedLabel: 'Última actualización',
        hero: "Tu privacidad es fundamental para nosotros. Hemos diseñado esta política para ser transparente y cumplir con el RGPD.",
        introH: 'Introducción',
        introP: `Bienvenido a ${brand} ("nosotros", "nuestro" o "nos"). Nos comprometemos a proteger tus datos personales y tu derecho a la privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos y compartimos información cuando utilizas nuestro sitio web (${tenantDomain}) y nuestros servicios en España.`,
        collectH: 'Información que Recopilamos',
        collectIntro: 'Cuando solicitas un presupuesto de Certificado Energético o utilizas nuestra plataforma, recopilamos información que te identifica, como:',
        collectItems: [
            'Datos de contacto (nombre, correo electrónico, número de teléfono).',
            'Datos de la propiedad (código postal, dirección, tipo de inmueble).',
            'Información de la cuenta (si te registras como usuario o certificador).',
            'Datos técnicos (dirección IP, tipo de navegador, patrones de uso).',
        ],
        useH: 'Cómo Usamos los Datos',
        useIntro: 'Tratamos tu información en base a intereses legítimos, al cumplimiento del contrato contigo y al cumplimiento de nuestras obligaciones legales.',
        useItems: [
            'Para facilitar la generación de presupuestos y la reserva con certificadores.',
            'Para comunicarnos contigo en relación con tu certificación energética.',
            'Para mejorar la funcionalidad del sitio y la experiencia de usuario.',
            'Para cumplir con la normativa española de eficiencia energética de edificios.',
        ],
        rightsH: 'Tus Derechos',
        rightsIntro: 'En virtud del RGPD y de la LOPDGDD española, dispones de los siguientes derechos:',
        rightsItems: [
            'Acceder a los datos personales que tratamos sobre ti.',
            'Solicitar la rectificación de datos inexactos.',
            'Solicitar la supresión de tus datos (derecho al olvido).',
            'Oponerte al tratamiento o solicitar su limitación.',
        ],
        contactH: 'Contáctanos',
        contactIntro: 'Si tienes alguna pregunta sobre esta Política de Privacidad o sobre nuestras prácticas de tratamiento de datos, contacta con nuestro Responsable de Protección de Datos:',
        emailLabel: 'Correo',
        addressLabel: 'Dirección',
        address: 'Madrid, España',
    } : {
        seoTitle: 'Privacy Policy',
        seoDesc: "Privacy Policy for The Berman. We are committed to protecting your personal data in accordance with Irish law and GDPR.",
        badge: 'Legal',
        title1: 'Privacy',
        title2: 'Policy.',
        lastUpdatedLabel: 'Last Updated',
        hero: "Your privacy is critical to us. We've designed our policy to be transparent and compliant with GDPR.",
        introH: 'Introduction',
        introP: `Welcome to ${brand} ("we," "our," or "us"). We are committed to protecting your personal data and your right to privacy. This Privacy Policy explains how we collect, use, and share information when you use our website (${tenantDomain}) and our services in Ireland.`,
        collectH: 'Information We Collect',
        collectIntro: 'When you request a BER quote or use our platform, we collect information that identifies you, such as:',
        collectItems: [
            'Contact details (Name, email address, phone number).',
            'Property details (Eircode, address, property type).',
            'Account information (if you register as a user or assessor).',
            'Technical data (IP address, browser type, usage patterns).',
        ],
        useH: 'How We Use Data',
        useIntro: 'We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, and compliance with our legal obligations.',
        useItems: [
            'To facilitate quote generation and booking with assessors.',
            'To communicate with you regarding your assessment.',
            'To improve our website functionality and user experience.',
            'To comply with SEAI regulations and Irish building laws.',
        ],
        rightsH: 'Your Rights',
        rightsIntro: 'Under GDPR and the Irish Data Protection Acts, you have rights including:',
        rightsItems: [
            'The right to access the personal data we hold about you.',
            'The right to request correction of inaccurate data.',
            'The right to request deletion of your data (right to be forgotten).',
            'The right to object to processing or request restriction of processing.',
        ],
        contactH: 'Contact Us',
        contactIntro: 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer at:',
        emailLabel: 'Email',
        addressLabel: 'Address',
        address: 'Dublin 4, Ireland',
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical="/privacy-policy"
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
                        {tr.lastUpdatedLabel}: {lastUpdated}. {tr.hero}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="space-y-16">

                        {/* 1. Introduction */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.introH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 leading-relaxed font-medium">
                                <p>{tr.introP}</p>
                            </div>
                        </div>

                        {/* 2. Data We Collect */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Eye className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.collectH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>{tr.collectIntro}</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    {tr.collectItems.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* 3. How We Use Data */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.useH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>{tr.useIntro}</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    {tr.useItems.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* 4. Your Rights (GDPR) */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Scale className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.rightsH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>{tr.rightsIntro}</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    {tr.rightsItems.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* 5. Contact Information */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.contactH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>{tr.contactIntro}</p>
                                <p className="font-black text-gray-900">
                                    {tr.emailLabel}: {tenantEmail}<br />
                                    {tr.addressLabel}: {tr.address}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
