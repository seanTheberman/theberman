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
        seoTitle: 'Aviso Legal y Términos de Uso',
        seoDesc: 'Aviso Legal y Términos de Uso de Certificado Energético. Nuestro acuerdo para la emisión de certificados energéticos en España.',
        badge: 'Legal',
        title1: 'Aviso Legal y',
        title2: 'Términos de Uso.',
        lastUpdatedLabel: 'Última actualización',
        hero: 'Por favor, lee estos términos detenidamente antes de utilizar nuestra plataforma o reservar una certificación energética.',
        agreementH: '1. TITULAR DEL SITIO WEB',
        agreementP: `El presente sitio web, ${tenantDomain}, es operado por: [NOMBRE DE TU EMPRESA] Domicilio social: [Dirección] Correo electrónico: [Email] En adelante, "la Plataforma".`,
        servicesH: '2. OBJETO DEL SITIO WEB',
        servicesP1: 'La Plataforma tiene como finalidad: Poner en contacto a usuarios que necesitan un certificado energético u otros servicios relacionados Con profesionales cualificados que ofrecen dichos servicios La Plataforma actúa exclusivamente como intermediario digital.',
        servicesP2: '3. NATURALEZA DEL SERVICIO certificadoenergético.eu: No presta servicios técnicos ni realiza certificados energéticos No interviene en acuerdos entre usuarios y profesionales No es parte contractual en ningún caso 👉 Cualquier acuerdo se realiza directamente entre: Usuario (cliente) Profesional',
        bookingH: '4. EXCLUSIÓN DE RESPONSABILIDAD',
        bookingItems: [
            'La Plataforma: No garantiza la calidad, legalidad o resultado de los servicios',
            'No se responsabiliza de errores en la información proporcionada por profesionales',
            'No responde de conflictos entre usuarios y profesionales',
            'El usuario acepta que utiliza la Plataforma bajo su propia responsabilidad.',
        ],
        liabilityH: '5. USO DEL SERVICIO',
        liabilityP: 'Usuarios: Se comprometen a: Facilitar información veraz No usar la plataforma para fines ilícitos No contactar profesionales con fines distintos a los servicios ofrecidos Profesionales: Se comprometen a: Proporcionar información veraz y actualizada Respetar los presupuestos enviados Cumplir con la normativa aplicable La Plataforma podrá suspender o eliminar cuentas que incumplan estas condiciones.',
        lawH: '6. SERVICIOS PARA PROFESIONALES Y PAGOS',
        lawP: 'El registro básico puede ser gratuito Algunos servicios (destacados, leads, visibilidad) pueden ser de pago Los servicios se pueden facturar mediante suscripción o pago por lead Las suscripciones: Se renuevan automáticamente Deben cancelarse antes de la renovación No son reembolsables salvo obligación legal',
        dataH: '7. PROTECCIÓN DE DATOS',
        dataP: 'El tratamiento de datos se realiza conforme al: General Data Protection Regulation Datos recogidos: Nombre, teléfono, email Datos de solicitud de servicio Datos de navegación Finalidad: Conectar usuarios con profesionales Gestionar solicitudes Mejorar el servicio Base legal: Consentimiento Ejecución de contrato Interés legítimo Derechos del usuario: Acceso Rectificación Supresión Oposición Portabilidad Ejercicio de derechos: [EMAIL]',
        dataSharingH: '8. CESIÓN DE DATOS',
        dataSharingP: 'Los datos podrán ser compartidos con: Profesionales que respondan a la solicitud Proveedores tecnológicos (hosting, CRM, etc.) Las transferencias fuera de la UE se realizan con garantías adecuadas (SCCs).',
        cookiesH: '9. POLÍTICA DE COOKIES',
        cookiesP: 'Este sitio utiliza cookies para: Mejorar la experiencia del usuario Analizar tráfico Mostrar publicidad relevante El usuario puede: Aceptar o rechazar cookies Configurarlas en su navegador',
        ipH: '10. PROPIEDAD INTELECTUAL',
        ipP: 'Todos los contenidos de la web son propiedad de la Plataforma o sus licenciantes. Queda prohibida su reproducción sin autorización.',
        linksH: '11. ENLACES A TERCEROS',
        linksP: 'La Plataforma no se responsabiliza de: Contenidos externos Políticas de privacidad de terceros',
        userContentH: '12. CONTENIDO DE USUARIOS',
        userContentP: 'Los profesionales son responsables del contenido que publiquen. No se permite contenido: Falso o engañoso Ilegal Ofensivo o discriminatorio La Plataforma podrá eliminar contenido sin previo aviso.',
        availabilityH: '13. DISPONIBILIDAD DEL SERVICIO',
        availabilityP: 'No se garantiza: Funcionamiento continuo Ausencia de errores La Plataforma podrá modificar o suspender el servicio en cualquier momento.',
        governingLawH: '14. LEGISLACIÓN APLICABLE',
        governingLawP: 'Estas condiciones se rigen por: Legislación de la Unión Europea Legislación española.',
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

                        {/* Additional sections for Spanish */}
                        {isSpanish && (
                            <>
                                {/* 6. Data Protection */}
                                <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                                    <div className="md:w-1/3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertCircle className="text-[#007F00]" size={24} />
                                            <h2 className="text-xl font-black uppercase tracking-tight">{tr.dataH}</h2>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                        <p>{tr.dataP}</p>
                                    </div>
                                </div>

                                {/* 7. Data Sharing */}
                                <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                                    <div className="md:w-1/3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Info className="text-[#007F00]" size={24} />
                                            <h2 className="text-xl font-black uppercase tracking-tight">{tr.dataSharingH}</h2>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                        <p>{tr.dataSharingP}</p>
                                    </div>
                                </div>

                                {/* 8. Cookies */}
                                <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                                    <div className="md:w-1/3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Bookmark className="text-[#007F00]" size={24} />
                                            <h2 className="text-xl font-black uppercase tracking-tight">{tr.cookiesH}</h2>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                        <p>{tr.cookiesP}</p>
                                    </div>
                                </div>

                                {/* 9. Intellectual Property */}
                                <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                                    <div className="md:w-1/3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Gavel className="text-[#007F00]" size={24} />
                                            <h2 className="text-xl font-black uppercase tracking-tight">{tr.ipH}</h2>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                        <p>{tr.ipP}</p>
                                    </div>
                                </div>

                                {/* 10. Third-party Links */}
                                <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                                    <div className="md:w-1/3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Info className="text-[#007F00]" size={24} />
                                            <h2 className="text-xl font-black uppercase tracking-tight">{tr.linksH}</h2>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                        <p>{tr.linksP}</p>
                                    </div>
                                </div>

                                {/* 11. User Content */}
                                <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                                    <div className="md:w-1/3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <FileCheck className="text-[#007F00]" size={24} />
                                            <h2 className="text-xl font-black uppercase tracking-tight">{tr.userContentH}</h2>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                        <p>{tr.userContentP}</p>
                                    </div>
                                </div>

                                {/* 12. Service Availability */}
                                <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                                    <div className="md:w-1/3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertCircle className="text-[#007F00]" size={24} />
                                            <h2 className="text-xl font-black uppercase tracking-tight">{tr.availabilityH}</h2>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                        <p>{tr.availabilityP}</p>
                                    </div>
                                </div>

                                {/* 13. Governing Law */}
                                <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                                    <div className="md:w-1/3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Bookmark className="text-[#007F00]" size={24} />
                                            <h2 className="text-xl font-black uppercase tracking-tight">{tr.governingLawH}</h2>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                        <p>{tr.governingLawP}</p>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsOfService;
