import { useState } from 'react';
import { Shield, Zap as ZapIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain } from '../lib/tenant';

const Subscribe = () => {
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tr = isSpanish ? {
        seoTitle: 'Suscríbete - Guía de Mejoras Energéticas',
        seoDesc: 'Únete a más de 5.000 propietarios que reciben nuestras novedades energéticas semanales, ofertas flash y promociones exclusivas.',
        badge: 'Recursos Premium',
        heading: 'Consigue nuestra guía completa de mejoras energéticas',
        description: 'Únete a más de 5.000 propietarios que reciben nuestras novedades energéticas semanales, ofertas flash y promociones exclusivas de rehabilitación energética.',
        placeholder: 'Introduce tu correo electrónico',
        buttonText: 'Suscribirse',
        sending: 'Enviando...',
        noSpam: 'Sin Spam Nunca',
        instantDownload: 'Descarga Instantánea',
    } : isEngland ? {
        seoTitle: 'Subscribe - Home Energy Upgrade Guide | EPC Cert',
        seoDesc: 'Join 5,000+ homeowners receiving our weekly energy updates, flash sales, and exclusive energy upgrade offers.',
        badge: 'Premium Resources',
        heading: 'Get Our Complete Home Energy Upgrade Guide',
        description: 'Join 5,000+ homeowners receiving our weekly energy updates, flash sales, and exclusive energy upgrade offers.',
        placeholder: 'Enter your email address',
        buttonText: 'Subscribe to news',
        sending: 'Sending...',
        noSpam: 'No Spam Ever',
        instantDownload: 'Instant Download',
    } : {
        seoTitle: 'Subscribe - Home Energy Upgrade Guide | The BER Man',
        seoDesc: 'Join 5,000+ homeowners receiving our weekly energy updates, flash sales, and exclusive energy upgrade offers.',
        badge: 'Premium Resources',
        heading: 'Get Our Complete Home Energy Upgrade Guide',
        description: 'Join 5,000+ homeowners receiving our weekly energy updates, flash sales, and exclusive energy upgrade offers.',
        placeholder: 'Enter your email address',
        buttonText: 'Subscribe to news',
        sending: 'Sending...',
        noSpam: 'No Spam Ever',
        instantDownload: 'Instant Download',
    };

    const baseUrl = isEngland ? 'https://epccert.com' : isSpanish ? 'https://certificadoenergético.eu' : 'https://www.theberman.eu';
    const brandName = isEngland ? 'EPC Cert' : isSpanish ? 'Certificado Energético' : 'The BER Man';

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical="/subscribe"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: isEngland
                            ? [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.epccert.com/' },
                                { '@type': 'ListItem', position: 2, name: 'Subscribe', item: 'https://www.epccert.com/subscribe' },
                            ]
                            : isSpanish
                                ? [
                                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://certificadoenergético.eu/' },
                                    { '@type': 'ListItem', position: 2, name: 'Subscribe', item: 'https://certificadoenergético.eu/subscribe' },
                                ]
                                : [
                                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.theberman.eu/' },
                                    { '@type': 'ListItem', position: 2, name: 'Subscribe', item: 'https://www.theberman.eu/subscribe' },
                                ],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: brandName,
                        url: baseUrl,
                        logo: `${baseUrl}/logo.svg`,
                        sameAs: isEngland
                            ? ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert']
                            : isSpanish
                                ? ['https://www.facebook.com/certificadoenergetico', 'https://www.instagram.com/certificadoenergetico']
                                : ['https://www.facebook.com/people/The-Berman/61578159843471/', 'https://www.instagram.com/thebermanireland'],
                    },
                ]}
            />

            <section className="pt-32 pb-24 bg-gray-50 min-h-screen flex items-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-6 block">{tr.badge}</span>
                        <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-gray-900">{tr.heading}</h1>
                        <p className="text-gray-600 mb-12 text-xl font-medium leading-relaxed">
                            {tr.description}
                        </p>

                        <form
                            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const emailInput = (e.target as HTMLFormElement).querySelector('input[type="email"]') as HTMLInputElement;
                                const email = emailInput?.value;

                                if (!email) return;

                                setIsSubmitting(true);
                                try {
                                    const { error } = await supabase
                                        .from('leads')
                                        .insert([{
                                            name: 'Guide Subscriber',
                                            email: email,
                                            message: 'Requested Complete Home Energy Upgrade Guide via Subscribe Page',
                                            status: 'new',
                                            purpose: 'Home Energy Guide'
                                        }]);

                                    if (error) throw error;

                                    toast.success('Subscribed! Check your email soon.', {
                                        icon: '✅',
                                        duration: 5000
                                    });
                                    (e.target as HTMLFormElement).reset();
                                } catch (err: any) {
                                    console.error('Newsletter error:', err);
                                    toast.error(err.message || 'Failed to subscribe');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                        >
                            <input
                                type="email"
                                placeholder={tr.placeholder}
                                className="flex-grow bg-white border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#007F00] transition-all font-bold text-lg"
                                required
                                disabled={isSubmitting}
                            />
                            <button
                                disabled={isSubmitting}
                                className="bg-[#007F00] text-white font-black px-10 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl shadow-green-100 whitespace-nowrap text-lg cursor-pointer disabled:opacity-70 flex items-center justify-center min-w-[200px]"
                            >
                                {isSubmitting ? tr.sending : tr.buttonText}
                            </button>
                        </form>

                        <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-[#007F00]" />
                                {tr.noSpam}
                            </div>
                            <div className="flex items-center gap-2">
                                <ZapIcon size={14} className="text-[#007F00]" />
                                {tr.instantDownload}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Subscribe;
