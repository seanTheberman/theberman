import { Gavel, FileCheck, AlertCircle, Info, Bookmark } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain, getTenantDomain } from '../lib/tenant';

const TermsOfService = () => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const tenantDomain = getTenantDomain(tenant);
    const brand = isSpanish ? 'Certificado Energético' : 'The Berman';
    const lastUpdated = isSpanish ? '2 de febrero de 2026' : 'February 2, 2026';

    const tr = isSpanish ? {
        seoTitle: 'Términos del Servicio',
        seoDesc: 'Términos y Condiciones de Servicio de Certificado Energético. Nuestro acuerdo para la emisión de certificados energéticos en España.',
        badge: 'Legal',
        title1: 'Términos del',
        title2: 'Servicio.',
        lastUpdatedLabel: 'Última actualización',
        hero: 'Por favor, lee estos términos detenidamente antes de utilizar nuestra plataforma o reservar una certificación energética.',
        agreementH: 'El Acuerdo',
        agreementP: `Al acceder o utilizar el sitio web ${tenantDomain}, aceptas quedar vinculado por estos Términos del Servicio y por todas las leyes y normativas aplicables en España. Si no estás de acuerdo con alguno de estos términos, no debes utilizar ni acceder a este sitio.`,
        servicesH: 'Nuestros Servicios',
        servicesP1: `${brand} actúa como plataforma que conecta a propietarios y administradores de fincas con certificadores energéticos acreditados. Facilitamos la comparación de presupuestos y la gestión de reservas.`,
        servicesP2: 'Nota: aunque verificamos la acreditación de todos los certificadores, el contrato real por la emisión del certificado se celebra directamente entre el usuario y el certificador elegido.',
        bookingH: 'Reservas',
        bookingItems: [
            'Los presupuestos mostrados en la plataforma se basan en la información facilitada por el usuario.',
            'Los certificadores se reservan el derecho de ajustar el precio si los datos de la propiedad resultan significativamente inexactos.',
            'Las cancelaciones deben realizarse con al menos 24 horas de antelación respecto a la cita programada.',
        ],
        liabilityH: 'Responsabilidad',
        liabilityP: `${brand} no es responsable de la exactitud de los certificados energéticos individuales. Los certificados se emiten bajo la acreditación del propio certificador. No responderemos de pérdidas directas, indirectas o derivadas del uso de la plataforma o de nuestros servicios.`,
        lawH: 'Legislación Aplicable',
        lawP: 'Estos términos y condiciones se rigen e interpretan conforme a las leyes de España. Te sometes de forma irrevocable a la jurisdicción exclusiva de los tribunales españoles para cualquier disputa derivada de estos términos.',
    } : {
        seoTitle: 'Terms of Service',
        seoDesc: 'Terms and Conditions of Service for The Berman. Our agreement for building energy rating assessments in Ireland.',
        badge: 'Legal',
        title1: 'Terms of',
        title2: 'Service.',
        lastUpdatedLabel: 'Last Updated',
        hero: 'Please read these terms carefully before using our platform or booking an assessment.',
        agreementH: 'The Agreement',
        agreementP: `By accessing or using the ${tenantDomain} website, you agree to be bound by these Terms of Service and all applicable laws and regulations in Ireland. If you do not agree with any of these terms, you are prohibited from using or accessing this site.`,
        servicesH: 'Our Services',
        servicesP1: `${brand} acts as a platform connecting homeowners and property managers with SEAI-registered BER assessors. We facilitate quote comparisons and booking management.`,
        servicesP2: 'Note: While we vet all assessors for SEAI registration, the actual assessment contract is between the user and the chosen assessor.',
        bookingH: 'Bookings',
        bookingItems: [
            'Quotes provided on the platform are based on the information supplied by the user.',
            'Assessors reserve the right to adjust pricing if the property details provided are significantly inaccurate.',
            'Cancellations should be made at least 24 hours prior to the scheduled assessment time.',
        ],
        liabilityH: 'Liability',
        liabilityP: `${brand} is not responsible for the accuracy of individual BER certificates. BER certificates are issued under the assessor's SEAI registration. We shall not be liable for any direct, indirect, or consequential loss arising from the use of our platform or services.`,
        lawH: 'Governing Law',
        lawP: 'These terms and conditions are governed by and construed in accordance with the laws of Ireland. You irrevocably submit to the exclusive jurisdiction of the courts in Ireland for any dispute related to these terms.',
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical="/terms-of-service"
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

                        {/* 1. Agreement */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Gavel className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.agreementH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 leading-relaxed font-medium">
                                <p>{tr.agreementP}</p>
                            </div>
                        </div>

                        {/* 2. Service Description */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Info className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.servicesH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>{tr.servicesP1}</p>
                                <p>{tr.servicesP2}</p>
                            </div>
                        </div>

                        {/* 3. Booking and Payments */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileCheck className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.bookingH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <ul className="list-disc pl-5 space-y-2">
                                    {tr.bookingItems.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* 4. Limitations of Liability */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.liabilityH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>{tr.liabilityP}</p>
                            </div>
                        </div>

                        {/* 5. Governing Law */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Bookmark className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">{tr.lawH}</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>{tr.lawP}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsOfService;
