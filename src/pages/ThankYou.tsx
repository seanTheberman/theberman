import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { getTenantFromDomain, getTenantDisplayName } from '../lib/tenant';

const ThankYou = () => {
    const navigate = useNavigate();
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isEngland = tenant === 'england';
    const isFrench = tenant === 'france';
    const isPortuguese = tenant === 'portugal';
    const brandName = getTenantDisplayName(tenant);

    const tr = {
        seoTitle: isSpanish ? 'Gracias por Contactarnos' : isFrench ? 'Merci de Nous Contacter' : isPortuguese ? 'Obrigado por Contactar' : isEngland ? 'Thank You for Contacting Us' : 'Thank You for Contacting Us',
        seoDesc: isSpanish ? 'Hemos recibido tu mensaje. Nos pondremos en contacto contigo en breve.' : isFrench ? 'Nous avons bien reçu votre message. Nous vous contacterons sous peu.' : isPortuguese ? 'Recebemos a sua mensagem. Entraremos em contacto consigo em breve.' : isEngland ? 'We have received your message. We will be in touch shortly.' : 'We have received your message. We will be in touch shortly.',
        heading: isSpanish ? '¡Mensaje Enviado!' : isFrench ? 'Message Envoyé !' : isPortuguese ? 'Mensagem Enviada!' : 'Message Sent!',
        subheading: isSpanish
            ? `Gracias por contactar ${brandName}. Hemos recibido tu solicitud y nuestro equipo la revisará.`
            : isFrench
                ? `Merci de contacter ${brandName}. Nous avons bien reçu votre demande et notre équipe l'examinera.`
                : isPortuguese
                    ? `Obrigado por contactar ${brandName}. Recebemos o seu pedido e a nossa equipa irá analisá-lo.`
                    : `Thank you for contacting ${brandName}. We have received your request and our team will review it.`,
        whatNext: isSpanish ? 'Qué Sigue' : isFrench ? 'Et Après ?' : isPortuguese ? 'O Que Segue' : 'What Happens Next',
        step1: isSpanish
            ? 'Nuestro equipo revisará tu solicitud en las próximas 24 horas.'
            : isFrench
                ? "Notre équipe examinera votre demande dans les prochaines 24 heures."
                : isPortuguese
                    ? 'A nossa equipa irá analisar o seu pedido nas próximas 24 horas.'
                    : 'Our team will review your request within the next 24 hours.',
        step2: isSpanish
            ? 'Te contactaremos por correo electrónico o teléfono para discutir tus necesidades.'
            : isFrench
                ? "Nous vous contacterons par e-mail ou par téléphone pour discuter de vos besoins."
                : isPortuguese
                    ? 'Entraremos em contacto consigo por e-mail ou telefone para discutir as suas necessidades.'
                    : 'We will contact you by email or phone to discuss your needs.',
        step3: isSpanish
            ? 'Te proporcionaremos una cotización gratuita y sin compromiso.'
            : isFrench
                ? "Nous vous fournirons un devis gratuit et sans engagement."
                : isPortuguese
                    ? 'Forneceremos um orçamento gratuito e sem compromisso.'
                    : 'We will provide you with a free, no-obligation quote.',
        emailCopy: isSpanish
            ? `También hemos enviado una copia de confirmación a tu correo electrónico.`
            : isFrench
                ? "Nous avons également envoyé une copie de confirmation à votre adresse e-mail."
                : isPortuguese
                    ? 'Também enviámos uma cópia de confirmação para o seu e-mail.'
                    : 'We have also sent a confirmation copy to your email.',
        returnHome: isSpanish ? 'Volver al Inicio' : isFrench ? "Retour à l'Accueil" : isPortuguese ? 'Voltar ao Início' : 'Return to Homepage',
        contactSupport: isSpanish ? 'Contactar Soporte' : isFrench ? 'Contacter le Support' : isPortuguese ? 'Contactar Suporte' : 'Contact Support',
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <SEOHead
                title={tr.seoTitle}
                description={tr.seoDesc}
                canonical="/thank-you"
            />
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl relative z-10">
                        <CheckCircle className="text-[#007F00]" size={40} />
                    </div>
                    <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        {tr.heading}
                    </h1>
                    <p className="text-gray-600 font-medium leading-relaxed">
                        {tr.subheading}
                    </p>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-left space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tr.whatNext}</p>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="w-6 h-6 bg-[#007F00] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-white text-xs font-black">1</span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{tr.step1}</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 bg-[#007F00] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-white text-xs font-black">2</span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{tr.step2}</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 bg-[#007F00] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-white text-xs font-black">3</span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{tr.step3}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-start text-left bg-green-50 border border-green-100 rounded-2xl p-5">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-green-100 flex items-center justify-center shrink-0">
                        <Mail className="text-[#007F00]" size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-700 font-medium">
                            {tr.emailCopy}
                        </p>
                    </div>
                </div>

                <div className="pt-4 space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#007F00] hover:bg-green-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2 group active:scale-95"
                    >
                        {tr.returnHome}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/contact-us')}
                        className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-[#007F00] font-bold text-sm transition-colors py-2"
                    >
                        {tr.contactSupport}
                    </button>
                </div>

                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] pt-4">
                    {brandName}
                </div>
            </div>
        </div>
    );
};

export default ThankYou;
