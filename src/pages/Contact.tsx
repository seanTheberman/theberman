
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import {
    Loader2, Send, Mail, Globe, Phone, MapPin, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getTownsForTenant } from '../lib/tenantData';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain, getTenantEmail, getTenantDomain } from '../lib/tenant';
import { getPhonePlaceholder } from '../lib/phoneFormats';
import { usePageContent, cmsValue } from '../hooks/usePageContent';

const getContactSchema = (isSpanish: boolean, isPortuguese: boolean) => z.object({
    name: z.string().min(2, isSpanish ? 'El nombre debe tener al menos 2 caracteres' : isPortuguese ? 'O nome deve ter pelo menos 2 caracteres' : 'Name must be at least 2 characters'),
    email: z.string().email(isSpanish ? 'Por favor, introduce una dirección de correo válida' : isPortuguese ? 'Por favor, introduza um email válido' : 'Please enter a valid email address'),
    phone: z.string().regex(/^\+?[0-9\s-]{9,15}$/, isSpanish ? 'Por favor, introduce un número de teléfono válido' : isPortuguese ? 'Por favor, introduza um número de telefone válido' : 'Please enter a valid phone number'),
    county: z.string().min(1, isSpanish ? 'Por favor, selecciona una comunidad autónoma' : isPortuguese ? 'Por favor, selecione uma região' : 'Please select a county'),
    town: z.string().min(2, isSpanish ? 'La ciudad es obligatoria' : isPortuguese ? 'A cidade é obrigatória' : 'Town/City is required'),
    property_type: z.string().min(1, isSpanish ? 'Por favor, selecciona un tipo de propiedad' : isPortuguese ? 'Por favor, selecione um tipo de imóvel' : 'Please select a property type'),
    purpose: z.string().min(1, isSpanish ? 'Por favor, selecciona un propósito' : isPortuguese ? 'Por favor, selecione uma finalidade' : 'Please select a purpose'),
    message: z.string().min(10, isSpanish ? 'El mensaje es demasiado corto (mínimo 10 caracteres)' : isPortuguese ? 'A mensagem é demasiado curta (mínimo 10 caracteres)' : 'Message is too short (min 10 chars)'),
    bot_check: z.string().optional(), // Honeypot field
});

type ContactFormData = z.infer<ReturnType<typeof getContactSchema>>;

const Contact = () => {
    const navigate = useNavigate();
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(getContactSchema(isSpanish, isPortuguese)),
    });
    const selectedCounty = watch('county');
    const townsByCounty = getTownsForTenant(tenant);
    const tenantEmail = getTenantEmail(tenant);
    const tenantDomain = getTenantDomain(tenant);
    const { content: cms, loading: cmsLoading } = usePageContent('contact');
    const c = (section: string, key: string, fallback: string) => cmsValue(cms, section, key, fallback);
    const tr = {
        seoTitle: isSpanish ? 'Contacto' : isEngland ? 'Book EPC Assessment England | Contact EPC Cert' : isPortuguese ? 'Contacto | Certificado Energia Portugal' : 'Book a BER Assessment in Ireland | Contact The BER Man',
        seoDesc: isSpanish
            ? 'Contacta con Certificado Energético para tus certificados energéticos, calificaciones y mejoras en toda España.'
            : isEngland
                ? 'Book an EPC assessment in England with accredited assessors. Contact EPC Cert to compare quotes and arrange your EPC today'
                : isPortuguese
                    ? 'Contacte a Certificado Energia para certificação energética em Portugal. Peritos certificados e orçamentos competitivos.'
                    : 'Book a BER Assessment in Ireland or Contact the BER Man for Support. Connect with Qualified BER Assessors and Get Assistance with Your Enquiry',
        badge: isSpanish ? 'Ponte en Contacto' : isPortuguese ? 'Contacto' : 'Get In Touch',
        title1: isSpanish ? '¿En qué podemos' : isEngland ? 'Book an EPC Assessment' : isPortuguese ? 'Como podemos' : 'Book a BER',
        title2: isSpanish ? 'ayudarte?' : isEngland ? 'in England' : isPortuguese ? 'ajudar?' : 'Assessment in Ireland',
        subtitle: isSpanish
            ? '¿Tienes alguna pregunta sobre certificaciones energéticas? Nuestro equipo está aquí para ayudarte.'
            : isEngland
                ? 'Compare quotes from accredited EPC assessors across England and arrange your EPC assessment with confidence.'
                : isPortuguese
                    ? 'Tem alguma dúvida sobre certificados energéticos? A nossa equipa está aqui para o ajudar.'
                    : 'Contact The BER Man to book a BER assessment, connect with qualified BER assessors, or get support with your enquiry.',
        trustStrip: isEngland ? '' : isPortuguese ? '1.000+ Avaliações Concluídas • 100+ Peritos Certificados • Cobertura Nacional' : '1,000+ Assessments Completed • 100+ Qualified Assessors • Nationwide Coverage',
        ourDetails: isSpanish ? 'Nuestros Datos' : isEngland ? 'Our details' : isPortuguese ? 'Os Nossos Detalhes' : 'Contact Information',
        emailUs: isSpanish ? 'Escríbenos' : isPortuguese ? 'Email' : 'Email Us',
        website: isSpanish ? 'Sitio Web' : isPortuguese ? 'Website' : 'Website',
        sendDetailed: isSpanish ? 'Envíanos un mensaje detallado' : isEngland ? 'Request an EPC Assessment' : isPortuguese ? 'Pedir uma Avaliação Energética' : 'Request a BER Assessment',
        fullName: isSpanish ? 'Nombre Completo' : isPortuguese ? 'Nome Completo' : 'Full Name',
        fullNamePlaceholder: isSpanish ? 'Nombre completo' : isPortuguese ? 'Nome completo' : 'Full name',
        phoneNumber: isSpanish ? 'Número de Teléfono' : isPortuguese ? 'Telefone' : 'Phone Number',
        phonePlaceholder: isSpanish ? 'número de teléfono' : getPhonePlaceholder(tenant),
        emailAddress: isSpanish ? 'Correo Electrónico' : isPortuguese ? 'Email' : 'Email Address',
        emailPlaceholder: isSpanish ? 'correo electrónico' : isPortuguese ? 'email' : 'email',
        county: isSpanish ? 'Comunidad Autónoma' : isPortuguese ? 'Região' : 'County',
        selectCounty: isSpanish ? 'Seleccionar Comunidad Autónoma' : isPortuguese ? 'Selecionar Região' : 'Select County',
        town: isSpanish ? 'Ciudad / Localidad' : isPortuguese ? 'Cidade / Localidade' : 'Town / City',
        selectTown: isSpanish ? 'Seleccionar Ciudad' : isPortuguese ? 'Selecionar Cidade' : 'Select Town',
        selectCountyFirst: isSpanish ? 'Selecciona Comunidad Autónoma Primero' : isPortuguese ? 'Selecione a Região Primeiro' : 'Select County First',
        propertyType: isSpanish ? 'Tipo de Propiedad' : isPortuguese ? 'Tipo de Imóvel' : 'Property Type',
        selectType: isSpanish ? 'Seleccionar Tipo' : isPortuguese ? 'Selecionar Tipo' : 'Select Type',
        apartment: isSpanish ? 'Apartamento' : isPortuguese ? 'Apartamento' : 'Apartment',
        midTerrace: isSpanish ? 'Casa Adosada (Interior)' : isPortuguese ? 'Moradia em Banda (Meio)' : 'Mid-Terrace',
        endTerrace: isSpanish ? 'Casa Adosada (Esquina)' : isPortuguese ? 'Moradia em Banda (Extremo)' : 'End-Terrace',
        semiDetached: isSpanish ? 'Casa Pareada' : isPortuguese ? 'Moradia Geminada' : 'Semi-Detached',
        detached: isSpanish ? 'Casa Independiente' : isPortuguese ? 'Moradia Isolada' : 'Detached',
        bungalow: isSpanish ? 'Chalet' : isPortuguese ? 'Bungalow' : 'Bungalow',
        purposeLabel: isSpanish ? 'Propósito del Certificado' : isEngland ? 'Purpose of EPC' : isPortuguese ? 'Finalidade do Certificado' : 'Purpose of BER',
        selectPurpose: isSpanish ? 'Seleccionar Propósito' : isPortuguese ? 'Selecionar Finalidade' : 'Select Purpose',
        mortgage: isSpanish ? 'Hipoteca/Banco' : isPortuguese ? 'Crédito Habitação/Banco' : 'Mortgage/Bank',
        selling: isSpanish ? 'Venta' : isPortuguese ? 'Venda' : 'Selling',
        renting: isSpanish ? 'Alquiler' : isPortuguese ? 'Arrendamento' : 'Renting',
        grant: isSpanish ? 'Subvención' : isPortuguese ? 'Subvenção' : 'Govt Grant',
        other: isSpanish ? 'Otro' : isPortuguese ? 'Outro' : 'Other',
        message: isSpanish ? 'Mensaje' : isEngland ? 'Message' : isPortuguese ? 'Mensagem' : 'Message',
        messagePlaceholder: isSpanish ? 'Cuéntanos más sobre tu solicitud...' : isEngland ? 'Tell us about your property or EPC assessment requirements.' : isPortuguese ? 'Fale-nos sobre o seu imóvel ou necessidade de certificação energética.' : 'Tell us about your property or BER assessment requirements.',
        sending: isSpanish ? 'Enviando...' : isEngland ? 'Sending...' : isPortuguese ? 'A enviar...' : 'Submitting...',
        sendMessage: isSpanish ? 'Enviar Mensaje' : isEngland ? 'Submit Enquiry' : isPortuguese ? 'Enviar Mensagem' : 'Submit Enquiry',
        toastSuccess: isSpanish ? '¡Mensaje enviado correctamente! Nos pondremos en contacto en breve.' : isPortuguese ? 'Mensagem enviada com sucesso! Entraremos em contacto em breve.' : 'Message sent successfully! We will be in touch shortly.',
        toastError: isSpanish ? 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.' : isPortuguese ? 'Erro ao enviar a mensagem. Por favor, tente novamente.' : 'Failed to send message. Please try again.',
    };

    const onSubmit = async (data: ContactFormData) => {
        if (data.bot_check) {
            toast.success('Message sent successfully!');
            reset();
            return;
        }

        try {
            const { error } = await supabase
                .from('leads')
                .insert([{
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    county: data.county,
                    town: data.town,
                    property_type: data.property_type,
                    purpose: data.purpose,
                    message: data.message,
                }]);

            if (error) throw error;

            // Trigger Supabase Edge Function for Email Notification
            await supabase.functions.invoke('send-email', {
                body: { record: data }
            });

            toast.success(tr.toastSuccess);
            reset();
            navigate('/thank-you');
        } catch (error) {
            console.error('Error:', error);
            toast.error(tr.toastError);
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical="/contact-us"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: isPortuguese ? 'Início' : 'Home', item: `${tenantDomain}/` },
                            { '@type': 'ListItem', position: 2, name: isPortuguese ? 'Contacto' : 'Contact Us', item: `${tenantDomain}/contact-us` },
                        ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: tenant === 'england' ? 'EPC Cert' : isSpanish ? 'Certificado Energético' : tenant === 'france' ? 'DPE France' : isPortuguese ? 'Certificado Energia' : 'The BER Man',
                        url: tenantDomain,
                        logo: tenant === 'england' ? 'https://www.epccert.com/logo.png' : isSpanish ? `https://${tenantDomain}/logo.png` : tenant === 'france' ? `https://${tenantDomain}/logo.png` : isPortuguese ? `https://${tenantDomain}/certificado-energia-logo.svg` : 'https://www.theberman.eu/logo.svg',
                        sameAs: tenant === 'england'
                            ? ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert']
                            : isSpanish
                                ? ['https://www.facebook.com/certificadoenergetico', 'https://www.instagram.com/certificadoenergetico']
                                : tenant === 'france'
                                    ? ['https://www.facebook.com/dpefrance', 'https://www.instagram.com/dpefrance']
                                    : isPortuguese
                                        ? []
                                        : ['https://www.facebook.com/people/The-Berman/61578159843471/', 'https://www.instagram.com/thebermanireland'],
                    },
                ]}
            />

            {cmsLoading ? (
                <div className="min-h-screen bg-white" />
            ) : (
            <>
            {/* 1. COMPACT HERO */}
            <section className="pt-32 pb-8 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {c('hero', 'badge', tr.badge)}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {isEngland ? tr.title1 : c('hero', 'heading_line1', tr.title1)} <br className="md:hidden" /> <span className="text-[#007F00]">{isEngland ? tr.title2 : c('hero', 'heading_line2', tr.title2)}</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {isEngland ? tr.subtitle : c('hero', 'subtitle', tr.subtitle)}
                    </p>
                    {!isSpanish && !isEngland && tr.trustStrip && (
                        <p className="mt-4 text-sm font-bold text-[#007F00] uppercase tracking-widest">
                            {tr.trustStrip}
                        </p>
                    )}
                </div>
            </section>


            {/* 3. CONTACT CONTENT */}
            <section className="pb-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-8 items-stretch">

                        {/* UNIFIED CONTACT INFO CARD */}
                        <div className="lg:w-1/3 w-full bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm group hover:border-green-100 transition-all h-full">
                            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{tr.ourDetails}</h3>
                            {!isSpanish && !isEngland && (
                                <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                                    Supporting property owners across all 26 counties in Ireland.<br />
                                    Typical response within 1 business day.
                                </p>
                            )}

                            <div className="space-y-6">
                                {c('contact_details', 'phone', '') && (
                                    <InfoItem
                                        icon={<Phone size={20} />}
                                        title={isSpanish ? 'Teléfono' : isEngland ? 'Phone' : 'Phone'}
                                        value={c('contact_details', 'phone', '')}
                                        href={`tel:${c('contact_details', 'phone', '')}`}
                                    />
                                )}

                                <InfoItem
                                    icon={<Mail size={20} />}
                                    title={tr.emailUs}
                                    value={c('contact_details', 'email', tenantEmail)}
                                    href={`mailto:${c('contact_details', 'email', tenantEmail)}`}
                                />

                                {c('contact_details', 'address', '') && (
                                    <div className="space-y-3">
                                        <InfoItem
                                            icon={<MapPin size={20} />}
                                            title={isSpanish ? 'Dirección' : isEngland ? 'Address' : 'Address'}
                                            value={c('contact_details', 'address', '')}
                                        />
                                        {c('contact_details', 'map_url', '') && (
                                            <button
                                                onClick={() => window.open(c('contact_details', 'map_url', ''), '_blank')}
                                                className="ml-0 md:ml-15 px-4 py-1.5 bg-green-50 text-[#007F00] text-[10px] font-black rounded-lg hover:bg-[#007F00] hover:text-white transition-all flex items-center justify-center md:justify-start gap-2 border border-green-100 cursor-pointer w-full md:w-auto"
                                            >
                                                {isSpanish ? 'Ver en Mapa' : isEngland ? 'View on Map' : 'View on Map'} <MapPin size={10} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {c('contact_details', 'business_hours', '') && (
                                    <InfoItem
                                        icon={<Clock size={20} />}
                                        title={isSpanish ? 'Horario' : isEngland ? 'Opening Hours' : 'Opening Hours'}
                                        value={c('contact_details', 'business_hours', '')}
                                    />
                                )}

                                <div className="pt-6 border-t border-gray-50">
                                    <InfoItem
                                        icon={<Globe size={20} />}
                                        title={tr.website}
                                        value={tenantDomain}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FORM COLUMN */}
                        <div className="lg:w-2/3 w-full bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            {isEngland && (
                                <h2 className="text-lg md:text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-tight px-4">Get in Touch with EPC Cert</h2>
                            )}
                            {!isEngland && (
                                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-tight px-4">{tr.sendDetailed}</h3>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label={tr.fullName}
                                        register={register('name')}
                                        error={errors.name}
                                        placeholder={tr.fullNamePlaceholder}
                                    />
                                    <FormInput
                                        label={tr.phoneNumber}
                                        register={register('phone')}
                                        error={errors.phone}
                                        placeholder={tr.phonePlaceholder}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label={tr.emailAddress}
                                        type="email"
                                        register={register('email')}
                                        error={errors.email}
                                        placeholder={tr.emailPlaceholder}
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.county}</label>
                                        <select
                                            {...register('county', {
                                                onChange: () => setValue('town', '') // Reset town when county changes
                                            })}
                                            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.county ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        >
                                            <option value="">{tr.selectCounty}</option>
                                            {Object.keys(townsByCounty).sort().map((county) => (
                                                <option key={county} value={county}>{county}</option>
                                            ))}
                                        </select>
                                        {errors.county && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.county.message}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.town}</label>
                                        <select
                                            {...register('town')}
                                            disabled={!selectedCounty}
                                            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.town ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'} ${!selectedCounty ? 'bg-gray-50 opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">{selectedCounty ? tr.selectTown : tr.selectCountyFirst}</option>
                                            {selectedCounty && townsByCounty[selectedCounty]?.map((town) => (
                                                <option key={town} value={town}>{town}</option>
                                            ))}
                                        </select>
                                        {errors.town && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.town.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.propertyType}</label>
                                        <select
                                            {...register('property_type')}
                                            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.property_type ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        >
                                            <option value="">{tr.selectType}</option>
                                            <option value="Apartment">{tr.apartment}</option>
                                            <option value="Mid-Terrace">{tr.midTerrace}</option>
                                            <option value="End-Terrace">{tr.endTerrace}</option>
                                            <option value="Semi-Detached">{tr.semiDetached}</option>
                                            <option value="Detached">{tr.detached}</option>
                                            <option value="Bungalow">{tr.bungalow}</option>
                                        </select>
                                        {errors.property_type && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.property_type.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.purposeLabel}</label>
                                    <select
                                        {...register('purpose')}
                                        className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.purpose ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                    >
                                        <option value="">{tr.selectPurpose}</option>
                                        <option value="Mortgage/Bank">{tr.mortgage}</option>
                                        <option value="Selling">{tr.selling}</option>
                                        <option value="Renting">{tr.renting}</option>
                                        <option value="Govt Grant">{tr.grant}</option>
                                        <option value="Other">{tr.other}</option>
                                    </select>
                                    {errors.purpose && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.purpose.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{tr.message}</label>
                                    <textarea
                                        {...register('message')}
                                        rows={3}
                                        className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all resize-none ${errors.message ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        placeholder={tr.messagePlaceholder}
                                    ></textarea>
                                    {errors.message && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.message.message}</p>}
                                </div>

                                {/* Honeypot */}
                                <div className="hidden">
                                    <input type="text" tabIndex={-1} autoComplete="off" {...register('bot_check')} />
                                </div>

                                {!isSpanish && !isEngland && (
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">
                                        1,000+ Assessments Completed • 100+ Qualified Assessors • Nationwide Coverage
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#007F00] hover:bg-[#006400] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-70 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            {tr.sending}
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            {tr.sendMessage}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            </>
            )}
        </div>
    );
};

const FormInput = ({ label, register, error, placeholder, type = "text" }: { label: string, register: any, error: any, placeholder: string, type?: string }) => (
    <div className="space-y-1 text-left">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            {...register}
            type={type}
            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all ${error ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
            placeholder={placeholder}
        />
        {error && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{error.message}</p>}
    </div>
);

const InfoItem = ({ icon, title, value, href, onClick }: { icon: React.ReactNode, title: string, value: string, href?: string, onClick?: () => void }) => {
    const content = (
        <div className="flex items-center gap-4 group/item cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover/item:bg-[#007F00] group-hover/item:text-white transition-all transform group-hover/item:scale-110">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
                <p className="text-base font-black text-gray-900 group-hover/item:text-[#007F00] transition-colors">{value}</p>
            </div>
        </div>
    );

    if (href) return <a href={href} className="block">{content}</a>;
    if (onClick) return <div onClick={onClick} className="block">{content}</div>;
    return content;
};

export default Contact;
