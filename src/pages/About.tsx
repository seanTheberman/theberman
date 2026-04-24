import { Globe, ArrowRight, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import FaqItem from '../components/FaqItem';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain } from '../lib/tenant';

const About = () => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const brand = isSpanish ? 'Certificado Energético' : 'The Berman';

    const tr = isSpanish ? {
        seoTitle: 'Sobre Nosotros - Certificadores Energéticos Expertos',
        seoDesc: 'Conoce Certificado Energético, la principal consultora energética de España. Certificaciones rápidas, precisas y profesionales.',
        missionTag: 'Nuestra Misión',
        title1: 'Precisión en cada',
        title2: 'Certificación.',
        heroP: 'Ayudamos a los propietarios de toda España a entender, mejorar y certificar la eficiencia energética de sus propiedades desde 2015.',
        storyH: 'Nuestra Historia',
        story: [
            `${brand} se fundó con un objetivo claro: aportar claridad profesional y rigor técnico al sector de la certificación energética en España. Detectamos que los propietarios y las empresas no solo buscaban un certificado; buscaban una hoja de ruta hacia un futuro más sostenible y rentable.`,
            'Lo que comenzó como un equipo especializado en Madrid se ha convertido en una red nacional de certificadores acreditados. Nuestro crecimiento se apoya en la precisión, la integridad y un profundo conocimiento del parque edificado español. No solo medimos el rendimiento energético: lo interpretamos y ofrecemos recomendaciones prácticas que generan ahorros reales.',
            `Hoy, ${brand} es una referencia en consultoría energética en España. Hemos realizado con éxito más de 10.000 certificaciones, ayudando a familias y empresas a gestionar la complejidad de los certificados energéticos y las subvenciones de rehabilitación. Nuestra misión sigue siendo la misma: dar a nuestros clientes el conocimiento necesario para tomar decisiones informadas sobre la eficiencia energética de su propiedad.`,
            `Mirando al futuro, nos centramos en la innovación y la excelencia. Mejoramos continuamente nuestros procesos y nos mantenemos a la vanguardia de la tecnología energética para ofrecer el máximo nivel de servicio. En ${brand} creemos que una vivienda eficiente es la base de una España moderna y sostenible.`,
        ],
        stats: [
            { n: '10k+', l1: 'Certificaciones', l2: 'Energéticas Emitidas' },
            { n: '100+', l1: 'Red Nacional de', l2: 'Certificadores' },
            { n: 'CEE', l1: 'Certificadores', l2: 'Acreditados' },
        ],
        howH: 'Cómo Trabajamos',
        howSub: `Principios de ${brand}`,
        values: [
            { icon: <Zap size={24} />, title: 'Rapidez y Precisión', desc: 'Sabemos que tu tiempo es valioso. Nuestros certificadores ofrecen calificaciones precisas con un enfoque en tiempos de respuesta rápidos.' },
            { icon: <Shield size={24} />, title: 'Integridad Profesional', desc: 'Todas las certificaciones las realizan profesionales acreditados y asegurados, comprometidos con un trabajo honesto y transparente.' },
            { icon: <Globe size={24} />, title: 'Futuro Verde', desc: 'Ofrecemos recomendaciones orientadas al ahorro energético a largo plazo y a la reducción del impacto ambiental.' },
        ],
        faqH: 'Preguntas Frecuentes',
        faqSub: 'Todo lo que necesitas saber',
        faqs: [
            { q: '¿Qué es un Certificado Energético?', a: 'El Certificado de Eficiencia Energética (CEE) indica el nivel de eficiencia energética de una propiedad. Califica los edificios de la A (más eficiente) a la G (menos eficiente), de forma similar al etiquetado energético de los electrodomésticos.' },
            { q: '¿Es obligatorio el Certificado Energético en España?', a: 'Sí. El certificado energético es obligatorio por ley para vender, alquilar o anunciar una propiedad en venta o en alquiler, con excepciones muy limitadas.' },
            { q: '¿Cuánto cuesta un Certificado Energético?', a: 'El precio depende del tamaño y el tipo de propiedad. Los precios varían, por lo que comparar presupuestos de varios certificadores te ayuda a conseguir el mejor precio.' },
            { q: '¿Cuánto dura la inspección?', a: 'La inspección en la propiedad suele durar entre 1 y 3 horas, según su tamaño.' },
            { q: '¿Cuánto tiempo es válido el Certificado Energético?', a: 'Tiene una validez de 10 años, salvo que se realicen cambios importantes en la propiedad que afecten a su rendimiento energético.' },
            { q: '¿Cómo obtengo un Certificado Energético?', a: 'Reservas con un certificador acreditado, visita y evalúa tu propiedad, y el certificado se emite y se registra en el organismo competente de tu comunidad autónoma.' },
            { q: '¿Puedo elegir la fecha y la hora de la inspección?', a: 'Sí. Puedes seleccionar la fecha y hora que prefieras al reservar a través de la plataforma.' },
            { q: '¿Los certificadores están acreditados y son de confianza?', a: 'Sí. Todas las certificaciones las realizan técnicos acreditados que siguen un código oficial de buenas prácticas.' },
            { q: '¿Qué pasa si obtengo una calificación baja?', a: 'Una calificación baja no impide vender tu propiedad; simplemente informa al comprador. Nuestro informe de recomendaciones te indicará cómo mejorarla.' },
        ],
        joinH: 'Únete a la familia',
        joinH2: `${brand}`,
        joinP: '¿Preparado para tu certificación energética profesional? Nuestro equipo nacional está listo para ayudarte hoy mismo.',
        cta: 'Pedir mi Presupuesto',
    } : {
        seoTitle: 'About Us - Expert BER Assessors',
        seoDesc: "Learn about The Berman, Ireland's leading energy consultancy. Fast, accurate, and professional energy ratings.",
        missionTag: 'Our Mission',
        title1: 'Precision in every',
        title2: 'Assessment.',
        heroP: "Helping homeowners across Ireland understand, improve, and certify their property's energy efficiency since 2015.",
        storyH: 'Our Story',
        story: [
            "The Berman was founded with a singular objective: to bring professional clarity and technical rigor to Ireland's energy rating industry. We recognized that homeowners and businesses weren't just looking for a certificate. They were looking for a roadmap to a more sustainable, cost-effective future.",
            "What began as a specialized team in Dublin has grown into a nationwide network of SEAI-registered experts. Our growth has been fueled by a commitment to accuracy, integrity, and a deep understanding of the Irish building stock. We don't just measure energy performance; we interpret it, providing actionable insights that lead to real-world savings.",
            "Today, The Berman stands as a benchmark for energy consultancy in Ireland. We have successfully completed over 10,000 assessments, helping families and enterprises navigate the complexities of BER ratings and SEAI grants. Our mission remains unchanged: to empower our clients with the knowledge they need to make informed decisions about their property's energy journey.",
            "As we look toward the future, our focus continues to be on innovation and excellence. We are constantly refining our processes and staying at the forefront of energy technology to ensure our clients receive the highest standard of service. At The Berman, we believe that an energy-efficient home is the foundation of a modern, sustainable Ireland.",
        ],
        stats: [
            { n: '1k+', l1: 'Completed', l2: 'BER Assessments' },
            { n: '100+', l1: 'Nationwide', l2: 'Network Assessors' },
            { n: 'SEAI', l1: 'Fully Registered', l2: 'Energy Experts' },
        ],
        howH: 'How We Work',
        howSub: 'The Berman Principles',
        values: [
            { icon: <Zap size={24} />, title: 'Speed & Accuracy', desc: 'We understand your time is valuable. Our assessors provide precise ratings with a focus on fast turnaround.' },
            { icon: <Shield size={24} />, title: 'Expert Integrity', desc: 'All assessments are handled by fully insured and registered professionals committed to honest reporting.' },
            { icon: <Globe size={24} />, title: 'Green Future', desc: 'We provide recommendations aimed at long-term energy savings and environmental impact reduction.' },
        ],
        faqH: 'Frequently Asked Questions',
        faqSub: 'Everything you need to know',
        faqs: [
            { q: 'What is a BER Certificate?', a: 'A BER (Building Energy Rating) Certificate shows how energy efficient a property is. It rates buildings from A (most efficient) to G (least efficient), similar to appliance energy labels.' },
            { q: 'Is a BER Certificate mandatory in Ireland?', a: 'Yes. A BER certificate is legally required when a property is sold, rented, or advertised for sale or rent, with limited exemptions.' },
            { q: 'How much does a BER Certificate cost?', a: 'The cost depends on the size and type of the property. Prices vary, which is why comparing quotes from multiple assessors helps you get the best price.' },
            { q: 'How long does a BER assessment take?', a: 'The on-site assessment usually takes 1–3 hours, depending on the property size.' },
            { q: 'How long is a BER Certificate valid for?', a: 'A BER certificate is valid for 10 years, unless major changes are made to the property that affect energy performance.' },
            { q: 'How do I get a BER Certificate?', a: 'You book a SEAI-registered BER assessor, they visit and assess your property, and your certificate is issued and registered with SEAI.' },
            { q: 'Can I choose my assessment date and time?', a: 'Yes. You can select a preferred date and time when booking through the platform.' },
            { q: 'Are BER assessors registered and trusted?', a: 'Yes. All BER assessments are carried out by SEAI-registered assessors who follow an official code of practice.' },
            { q: 'What happens if I get a bad rating?', a: 'A bad rating does not prevent you from selling. It simply informs the buyer. Our advisory report will suggest ways to improve it.' },
        ],
        joinH: 'Join the Berman',
        joinH2: 'Family',
        joinP: 'Ready for a professional BER assessment? Our nationwide team is here to help you today.',
        cta: 'Get My Quote',
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical="/about"
            />

            {/* 1. SIMPLE CENTERED HERO */}
            <section className="pt-32 pb-16 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {tr.missionTag}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        {tr.title1} <br className="hidden md:block" />
                        <span className="text-[#007F00]">{tr.title2}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {tr.heroP}
                    </p>
                </div>
            </section>

            {/* 2. STRUCTURED STORY SECTION */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-12 gap-16 items-start">
                        {/* Left Side: Story Text */}
                        <div className="lg:col-span-8 space-y-8 text-gray-600 leading-relaxed font-sans text-lg text-left">
                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{tr.storyH}</h2>
                            </div>
                            {tr.story.map((p, i) => <p key={i}>{p}</p>)}
                        </div>

                        {/* Right Side: Stats / Impact */}
                        <div className="lg:col-span-4 lg:pl-12 lg:border-l border-gray-200">
                            <div className="sticky top-12 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-8 lg:space-y-12">
                                {tr.stats.map((s, i) => (
                                    <div key={i}>
                                        <p className="text-4xl md:text-5xl font-black text-[#007F00] mb-2">{s.n}</p>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">{s.l1} <br className="hidden lg:block" />{s.l2}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE VALUES GRID */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{tr.howH}</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{tr.howSub}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {tr.values.map((v, i) => (
                            <ValueItem key={i} icon={v.icon} title={v.title} description={v.desc} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. FAQ SECTION */}
            <section id="faq" className="py-24 bg-[#007F00]">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">{tr.faqH}</h2>
                        <p className="text-green-50 text-xs font-black uppercase tracking-widest">{tr.faqSub}</p>
                    </div>
                    <div className="space-y-6">
                        {tr.faqs.map((f, i) => (
                            <FaqItem key={i} question={f.q} answer={f.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. FINISH CTA SECTION */}
            <section className="py-2">
                <div className="container max-w-full">
                    <div className="bg-gray-50 p-12 md:p-20 text-center relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">{tr.joinH} <br />{tr.joinH2}</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                                {tr.joinP}
                            </p>
                            <Link to="/contact-us">
                                <button className="bg-[#007F00] text-white font-black px-12 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0">
                                    {tr.cta} <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ValueItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-green-100 transition-all hover:shadow-lg group cursor-pointer">
        <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover:bg-[#007F00] group-hover:text-white transition-all transform group-hover:scale-110 mb-8 shadow-sm">
            {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-bold text-sm">
            {description}
        </p>
    </div>
);

export default About;
