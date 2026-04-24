
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import {
    Loader2, Send,
    CheckCircle2, Shield, Zap as ZapIcon,
    Mail, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TOWNS_BY_COUNTY } from '../data/irishTowns';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain, getTenantEmail, getTenantDomain } from '../lib/tenant';

const hireAgentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^\+?[0-9\s-]{9,15}$/, 'Please enter a valid phone number'),
    county: z.string().min(1, 'Please select a county'),
    town: z.string().min(2, 'Town/City is required'),
    property_type: z.string().min(1, 'Please select a property type'),
    purpose: z.string().min(1, 'Please select a purpose'),
    message: z.string().min(10, 'Message is too short (min 10 chars)'),
    bot_check: z.string().optional(), // Honeypot field
});

type HireAgentFormData = z.infer<typeof hireAgentSchema>;

const HireAgent = () => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<HireAgentFormData>({
        resolver: zodResolver(hireAgentSchema),
    });

    const selectedCounty = watch('county');
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const tenantEmail = getTenantEmail(tenant);
    const tenantDomain = getTenantDomain(tenant);
    const tr = isSpanish ? {
        seoTitle: 'Contratar un Asesor Energético',
        seoDesc: 'Obtén orientación gratuita e imparcial de un Asesor Energético acreditado. Análisis técnico verificado y precios competitivos para mejorar la eficiencia de tu hogar.',
        badge: 'Asesoramiento Experto',
        title1: 'Contrata un',
        titleHighlight: 'Asesor Energético',
        title2: ' Gratis',
        subtitle: 'Obtén orientación imparcial, análisis técnico verificado y acceso a precios competitivos para mejorar la eficiencia energética de tu hogar.',
        speakH1: 'Habla con un',
        speakH2: 'Asesor Energético',
        speakP: 'Tu asesor energético coordinará y trabajará directamente con un certificador para que las recomendaciones sean técnicamente precisas y se basen en tu certificado energético actual y su informe de recomendaciones.',
        agentWillLabel: 'El asesor se encargará de:',
        benefits: [
            'Identificar opciones de mejora coste-eficaces',
            'Aconsejar las mejoras de eficiencia idóneas',
            'Buscar y comparar presupuestos de profesionales',
            'Negociar las mejores opciones calidad/precio',
            'Ayudarte con la documentación de subvenciones',
            'Evitar obras innecesarias o sobrevaloradas',
        ],
        speakClose: 'El objetivo es ofrecer una guía clara e imparcial, un criterio técnico verificado y acceso a precios competitivos, para que las mejoras se realicen de la forma más inteligente y económica posible.',
        badge1: 'Independiente de las empresas',
        badge2: 'Aporte técnico y certificación',
        ourDetails: 'Nuestros Datos',
        emailUs: 'Escríbenos',
        website: 'Sitio Web',
        requestH: 'Solicita tu Asesor Energético',
        fullName: 'Nombre Completo',
        fullNamePh: 'Nombre completo',
        phoneNumber: 'Número de Teléfono',
        phonePh: 'número de teléfono',
        email: 'Correo Electrónico',
        emailPh: 'correo electrónico',
        county: 'Provincia',
        selectCounty: 'Seleccionar Provincia',
        town: 'Ciudad / Localidad',
        selectTown: 'Seleccionar Ciudad',
        selectCountyFirst: 'Selecciona Provincia Primero',
        propertyType: 'Tipo de Propiedad',
        selectType: 'Seleccionar Tipo',
        apartment: 'Apartamento',
        midTerrace: 'Casa Adosada (Interior)',
        endTerrace: 'Casa Adosada (Esquina)',
        semiDetached: 'Casa Pareada',
        detached: 'Casa Independiente',
        bungalow: 'Chalet',
        purposeLabel: 'Propósito del Certificado',
        selectPurpose: 'Seleccionar Propósito',
        mortgage: 'Hipoteca/Banco',
        selling: 'Venta',
        renting: 'Alquiler',
        grant: 'Subvención',
        other: 'Otro',
        message: 'Mensaje',
        messagePh: 'Cuéntanos tus objetivos de eficiencia energética...',
        sending: 'Enviando...',
        hireBtn: 'Contratar Asesor Energético',
        toastSuccess: '¡Tu consulta ha sido enviada! Un Asesor Energético se pondrá en contacto contigo en breve.',
        toastError: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
    } : {
        seoTitle: 'Hire an Energy Agent',
        seoDesc: 'Get free impartial guidance from a certified Energy Agent. Verified technical input and competitive pricing for your home energy upgrades.',
        badge: 'Expert Guidance',
        title1: 'Hire An',
        titleHighlight: 'Energy Agent',
        title2: ' For Free',
        subtitle: 'Get impartial guidance, verified technical input, and access to competitive pricing for your home energy upgrades.',
        speakH1: 'Speak to an',
        speakH2: 'Energy Advisor',
        speakP: 'Your energy agent will organise and work directly with a BER assessor to ensure all advice and upgrade recommendations are technically accurate and based on your existing BER certificate and advisory report.',
        agentWillLabel: 'The agent will then:',
        benefits: [
            'Identify cost-effective upgrade options',
            'Advise on best BER improvements',
            'Source and compare contractor quotes',
            'Negotiate best-value options',
            'Assist with SEAI grant paperwork',
            'Avoid unnecessary or overpriced works',
        ],
        speakClose: 'The goal is to provide clear, impartial guidance, verified technical input, and access to competitive pricing, ensuring upgrades are completed in the smartest and most economical way possible.',
        badge1: 'Independent from contractors',
        badge2: 'Technical input & certification',
        ourDetails: 'Our details',
        emailUs: 'Email Us',
        website: 'Website',
        requestH: 'Request Your Energy Agent',
        fullName: 'Full Name',
        fullNamePh: 'Full name',
        phoneNumber: 'Phone Number',
        phonePh: 'phone number',
        email: 'Email Address',
        emailPh: 'email',
        county: 'County',
        selectCounty: 'Select County',
        town: 'Town / City',
        selectTown: 'Select Town',
        selectCountyFirst: 'Select County First',
        propertyType: 'Property Type',
        selectType: 'Select Type',
        apartment: 'Apartment',
        midTerrace: 'Mid-Terrace',
        endTerrace: 'End-Terrace',
        semiDetached: 'Semi-Detached',
        detached: 'Detached',
        bungalow: 'Bungalow',
        purposeLabel: 'Purpose of BER',
        selectPurpose: 'Select Purpose',
        mortgage: 'Mortgage/Bank',
        selling: 'Selling',
        renting: 'Renting',
        grant: 'Govt Grant',
        other: 'Other',
        message: 'Message',
        messagePh: 'Tell us about your home energy goals...',
        sending: 'Sending...',
        hireBtn: 'Hire Energy Agent',
        toastSuccess: 'Your inquiry has been sent! An Energy Advisor will contact you shortly.',
        toastError: 'Failed to send message. Please try again.',
    };

    const onSubmit = async (data: HireAgentFormData) => {
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
                    message: `[HIRE AGENT INQUIRY]: ${data.message}`,
                }]);

            if (error) throw error;

            // Trigger Supabase Edge Function for Email Notification
            await supabase.functions.invoke('send-email', {
                body: { record: { ...data, message: `[HIRE AGENT INQUIRY]: ${data.message}` } }
            });

            toast.success(tr.toastSuccess);
            reset();
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
                canonical="/hire-agent"
            />

            {/* 1. COMPACT HERO */}
            <section className="pt-32 pb-8 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {tr.badge}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {tr.title1} <span className="text-[#007F00]">{tr.titleHighlight}</span>{tr.title2}
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {tr.subtitle}
                    </p>
                </div>
            </section>

            {/* 2. ENERGY AGENT INFO BLOCK */}
            <section className="pb-12">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bg-green-50/50 border-2 border-green-100 rounded-[2rem] p-8 md:p-12 text-left shadow-sm">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">{tr.speakH1} <span className="text-[#007F00]">{tr.speakH2}</span></h2>
                        <div className="space-y-6 text-gray-700 leading-relaxed font-medium">
                            <p>
                                {tr.speakP}
                            </p>

                            <div className="space-y-4">
                                <p className="font-black text-gray-900 uppercase tracking-widest text-xs">{tr.agentWillLabel}</p>
                                <ul className="grid md:grid-cols-2 gap-4">
                                    {tr.benefits.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="text-[#007F00] mt-1 shrink-0" size={18} />
                                            <span className="text-sm font-bold">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="text-gray-600 italic text-sm">
                                {tr.speakClose}
                            </p>

                            <div className="pt-6 border-t border-green-100 flex flex-col md:flex-row gap-6 items-center text-xs font-black uppercase tracking-widest text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Shield className="text-[#007F00]" size={16} />
                                    <span>{tr.badge1}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ZapIcon className="text-[#007F00]" size={16} />
                                    <span>{tr.badge2}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FORM SECTION */}
            <section className="pb-24">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-8 items-stretch">

                        {/* LEFT COLUMN: CONTACT INFO */}
                        <div className="lg:w-1/3 w-full bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm group hover:border-green-100 transition-all h-full">
                            <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">{tr.ourDetails}</h3>

                            <div className="space-y-6">
                                <InfoItem
                                    icon={<Mail size={20} />}
                                    title={tr.emailUs}
                                    value={tenantEmail}
                                    href={`mailto:${tenantEmail}`}
                                />
                                {/* <div className="pt-6 border-t border-gray-50">
                                    <InfoItem
                                        icon={<Clock size={20} />}
                                        title="Office Hours"
                                        value="Mon - Fri: 9:00 AM - 5:30 PM"
                                    />
                                </div> */}


                                <div className="pt-6 border-t border-gray-50">
                                    <InfoItem
                                        icon={<Globe size={20} />}
                                        title={tr.website}
                                        value={tenantDomain}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: FORM */}
                        <div className="lg:w-2/3 w-full bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-tight px-4">{tr.requestH}</h3>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label={tr.fullName}
                                        register={register('name')}
                                        error={errors.name}
                                        placeholder={tr.fullNamePh}
                                    />
                                    <FormInput
                                        label={tr.phoneNumber}
                                        register={register('phone')}
                                        error={errors.phone}
                                        placeholder={tr.phonePh}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label={tr.email}
                                        type="email"
                                        register={register('email')}
                                        error={errors.email}
                                        placeholder={tr.emailPh}
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
                                            {Object.keys(TOWNS_BY_COUNTY).sort().map((county) => (
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
                                            {selectedCounty && TOWNS_BY_COUNTY[selectedCounty]?.map((town) => (
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
                                        placeholder={tr.messagePh}
                                    ></textarea>
                                    {errors.message && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.message.message}</p>}
                                </div>

                                {/* Honeypot */}
                                <div className="hidden">
                                    <input type="text" tabIndex={-1} autoComplete="off" {...register('bot_check')} />
                                </div>

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
                                            {tr.hireBtn}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
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

export default HireAgent;
