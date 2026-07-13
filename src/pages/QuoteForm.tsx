import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import QuoteFormModule from '../components/QuoteFormModule';
import { useTranslation } from '../hooks/useTranslation';

const QuoteForm = () => {
    const navigate = useNavigate();
    const { t, isSpanish, tenant } = useTranslation();
    const ratingName = isSpanish ? 'Certificado Energético' : tenant === 'england' ? 'EPC' : tenant === 'france' ? 'DPE' : tenant === 'portugal' ? 'Certificado Energético' : 'BER';
    const assessorDesc = isSpanish ? 'certificadores acreditados' : tenant === 'england' ? 'accredited EPC assessors' : tenant === 'france' ? 'diagnostiqueurs certifiés' : tenant === 'portugal' ? 'peritos certificados' : 'SEAI registered BER assessors';

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-gray-500 hover:text-[#007F00] transition-all mb-8 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 group-hover:text-[#007F00] transition-all border border-gray-100 group-hover:border-green-100">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">{t('back')}</span>
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                        {isSpanish ? 'Solicita tu Presupuesto' : tenant === 'portugal' ? `Peça o seu Orçamento para ${ratingName}` : `Get Your ${ratingName} Quote`}
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        {isSpanish ? 'Rellena el formulario para recibir presupuestos competitivos de certificadores acreditados en tu zona.' : tenant === 'portugal' ? `Preencha o formulário abaixo para receber orçamentos competitivos de ${assessorDesc} na sua zona.` : `Complete the form below to receive competitive quotes from ${assessorDesc} in your area.`}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <QuoteFormModule />
                </div>
            </div>
        </div>
    );
};

export default QuoteForm;
