
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import {
    Loader2, Send, Mail, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TOWNS_BY_COUNTY } from '../data/irishTowns';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain, getTenantEmail, getTenantDomain } from '../lib/tenant';

const contactSchema = z.object({
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

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const selectedCounty = watch('county');
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const tenantEmail = getTenantEmail(tenant);
    const tenantDomain = getTenantDomain(tenant);
    const tr = {
        seoTitle: isSpanish ? 'Contacto' : 'Contact Us',
        seoDesc: isSpanish ? 'Contacta con Certificado Energético para tus certificados energéticos, calificaciones y mejoras en toda España.' : 'Get in touch with The Berman for BER assessments, energy ratings, and home energy upgrades across Ireland.',
        badge: isSpanish ? 'Ponte en Contacto' : 'Get In Touch',
        title1: isSpanish ? '¿En qué podemos' : 'How can we',
        title2: isSpanish ? 'ayudarte?' : 'help?',
        subtitle: isSpanish ? '¿Tienes alguna pregunta sobre certificaciones energéticas? Nuestro equipo está aquí para ayudarte.' : 'Have a question about BER assessments? Our team is here to provide the support you need.',
        ourDetails: isSpanish ? 'Nuestros Datos' : 'Our details',
        emailUs: isSpanish ? 'Escríbenos' : 'Email Us',
        website: isSpanish ? 'Sitio Web' : 'Website',
        sendDetailed: isSpanish ? 'Envíanos un mensaje detallado' : 'Send us a detailed message',
        fullName: isSpanish ? 'Nombre Completo' : 'Full Name',
        fullNamePlaceholder: isSpanish ? 'Nombre completo' : 'Full name',
        phoneNumber: isSpanish ? 'Número de Teléfono' : 'Phone Number',
        phonePlaceholder: isSpanish ? 'número de teléfono' : 'phone number',
        emailAddress: isSpanish ? 'Correo Electrónico' : 'Email Address',
        emailPlaceholder: isSpanish ? 'correo electrónico' : 'email',
        county: isSpanish ? 'Provincia' : 'County',
        selectCounty: isSpanish ? 'Seleccionar Provincia' : 'Select County',
        town: isSpanish ? 'Ciudad / Localidad' : 'Town / City',
        selectTown: isSpanish ? 'Seleccionar Ciudad' : 'Select Town',
        selectCountyFirst: isSpanish ? 'Selecciona Provincia Primero' : 'Select County First',
        propertyType: isSpanish ? 'Tipo de Propiedad' : 'Property Type',
        selectType: isSpanish ? 'Seleccionar Tipo' : 'Select Type',
        apartment: isSpanish ? 'Apartamento' : 'Apartment',
        midTerrace: isSpanish ? 'Casa Adosada (Interior)' : 'Mid-Terrace',
        endTerrace: isSpanish ? 'Casa Adosada (Esquina)' : 'End-Terrace',
        semiDetached: isSpanish ? 'Casa Pareada' : 'Semi-Detached',
        detached: isSpanish ? 'Casa Independiente' : 'Detached',
        bungalow: isSpanish ? 'Chalet' : 'Bungalow',
        purposeLabel: isSpanish ? 'Propósito del Certificado' : 'Purpose of BER',
        selectPurpose: isSpanish ? 'Seleccionar Propósito' : 'Select Purpose',
        mortgage: isSpanish ? 'Hipoteca/Banco' : 'Mortgage/Bank',
        selling: isSpanish ? 'Venta' : 'Selling',
        renting: isSpanish ? 'Alquiler' : 'Renting',
        grant: isSpanish ? 'Subvención' : 'Govt Grant',
        other: isSpanish ? 'Otro' : 'Other',
        message: isSpanish ? 'Mensaje' : 'Message',
        messagePlaceholder: isSpanish ? 'Cuéntanos más sobre tu solicitud...' : 'Tell us more about your request...',
        sending: isSpanish ? 'Enviando...' : 'Sending...',
        sendMessage: isSpanish ? 'Enviar Mensaje' : 'Send Message',
        toastSuccess: isSpanish ? '¡Mensaje enviado correctamente! Nos pondremos en contacto en breve.' : 'Message sent successfully! We will be in touch shortly.',
        toastError: isSpanish ? 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.' : 'Failed to send message. Please try again.',
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
            />

            {/* 1. COMPACT HERO */}
            <section className="pt-32 pb-8 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        {tr.badge}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {tr.title1} <br className="md:hidden" /> <span className="text-[#007F00]">{tr.title2}</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {tr.subtitle}
                    </p>
                </div>
            </section>


            {/* 3. CONTACT CONTENT */}
            <section className="pb-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-8 items-stretch">

                        {/* UNIFIED CONTACT INFO CARD */}
                        <div className="lg:w-1/3 w-full bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm group hover:border-green-100 transition-all h-full">
                            <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">{tr.ourDetails}</h3>

                            <div className="space-y-6">

                                <InfoItem
                                    icon={<Mail size={20} />}
                                    title={tr.emailUs}
                                    value={tenantEmail}
                                    href={`mailto:${tenantEmail}`}
                                />
                                {/* <div className="space-y-3">
                                    <InfoItem
                                        icon={<MapPin size={20} />}
                                        title="Visit Us"
                                        value="Dublin, Ireland - D04 W7K5"
                                        onClick={() => {
                                            window.open('https://www.google.com/maps/search/?api=1&query=13+Upper+Baggot+Street,+Dublin+4+D04+W7K5', '_blank');
                                        }}
                                    />
                                    <button
                                        onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=13+Upper+Baggot+Street,+Dublin+4+D04+W7K5', '_blank')}
                                        className="ml-0 md:ml-15 px-4 py-1.5 bg-green-50 text-[#007F00] text-[10px] font-black rounded-lg hover:bg-[#007F00] hover:text-white transition-all flex items-center justify-center md:justify-start gap-2 border border-green-100 cursor-pointer w-full md:w-auto"
                                    >
                                        View in Map <MapPin size={10} />
                                    </button>
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

                        {/* FORM COLUMN */}
                        <div className="lg:w-2/3 w-full bg-gray-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-tight px-4">{tr.sendDetailed}</h3>

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
                                        placeholder={tr.messagePlaceholder}
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
                                            {tr.sendMessage}
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

export default Contact;
