
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { Loader2, Send, Phone, Mail, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

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
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

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

            toast.success('Message sent successfully! We will be in touch shortly.');
            reset();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <title>Contact Us | The Berman</title>

            {/* 1. COMPACT HERO */}
            <section className="pt-16 pb-8 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-3 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase">
                        Get In Touch
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                        How can we <span className="text-[#007F00]">help?</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Have a question about BER assessments? Our team is here to provide the support you need.
                    </p>
                </div>
            </section>

            {/* 2. CONTACT CONTENT */}
            <section className="pb-12">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-8 items-stretch">

                        {/* UNIFIED CONTACT INFO CARD */}
                        <div className="lg:w-1/3 w-full bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm group hover:border-green-100 transition-all h-full">
                            <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Our details</h3>

                            <div className="space-y-6">
                                <InfoItem
                                    icon={<Phone size={20} />}
                                    title="Call Us"
                                    value="087 442 1653"
                                    href="tel:0874421653"
                                />
                                <InfoItem
                                    icon={<Mail size={20} />}
                                    title="Email Us"
                                    value="info@theberman.eu"
                                    href="mailto:info@theberman.eu"
                                />
                                <div className="space-y-3">
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
                                        className="ml-15 px-4 py-1.5 bg-green-50 text-[#007F00] text-[10px] font-black rounded-lg hover:bg-[#007F00] hover:text-white transition-all flex items-center gap-2 border border-green-100 cursor-pointer"
                                    >
                                        View in Map <MapPin size={10} />
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-gray-50">
                                    <InfoItem
                                        icon={<Clock size={20} />}
                                        title="Office Hours"
                                        value="Mon - Fri: 9:00 AM - 5:30 PM"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FORM COLUMN */}
                        <div className="lg:w-2/3 w-full bg-gray-50 rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <h3 className="text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-tight">Send us a detailed message</h3>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Full Name"
                                        register={register('name')}
                                        error={errors.name}
                                        placeholder="Enter your name"
                                    />
                                    <FormInput
                                        label="Phone Number"
                                        register={register('phone')}
                                        error={errors.phone}
                                        placeholder="087 123 4567"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        register={register('email')}
                                        error={errors.email}
                                        placeholder="your@email.com"
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">County</label>
                                        <select
                                            {...register('county')}
                                            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.county ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        >
                                            <option value="">Select County</option>
                                            <option value="Dublin">Dublin</option>
                                            <option value="Meath">Meath</option>
                                            <option value="Kildare">Kildare</option>
                                            <option value="Wicklow">Wicklow</option>
                                            <option value="Louth">Louth</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.county && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.county.message}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Town / City"
                                        register={register('town')}
                                        error={errors.town}
                                        placeholder="e.g. Rathgar"
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Property Type</label>
                                        <select
                                            {...register('property_type')}
                                            className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.property_type ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="Mid-Terrace">Mid-Terrace</option>
                                            <option value="End-Terrace">End-Terrace</option>
                                            <option value="Semi-Detached">Semi-Detached</option>
                                            <option value="Detached">Detached</option>
                                            <option value="Bungalow">Bungalow</option>
                                        </select>
                                        {errors.property_type && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.property_type.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Purpose of BER</label>
                                    <select
                                        {...register('purpose')}
                                        className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all appearance-none cursor-pointer ${errors.purpose ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                    >
                                        <option value="">Select Purpose</option>
                                        <option value="Mortgage/Bank">Mortgage/Bank</option>
                                        <option value="Selling">Selling</option>
                                        <option value="Renting">Renting</option>
                                        <option value="Govt Grant">Govt Grant</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.purpose && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.purpose.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                    <textarea
                                        {...register('message')}
                                        rows={3}
                                        className={`w-full bg-white border-2 rounded-2xl px-5 py-3 outline-none transition-all resize-none ${errors.message ? 'border-red-500' : 'border-gray-100 focus:border-[#007F00]'}`}
                                        placeholder="Tell us more about your request..."
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
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Send Message
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
