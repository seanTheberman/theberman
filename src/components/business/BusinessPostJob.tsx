import { useState } from 'react';
import { Home, Building2, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { getTenantFromDomain } from '../../lib/tenant';
import { getCountiesForTenant, getTownsForTenant } from '../../lib/tenantData';
import { getPhonePlaceholder } from '../../lib/phoneFormats';

const PROPERTY_TYPES = ['Semi-Detached', 'Mid-Terrace', 'End-Terrace', 'Apartment', 'Duplex', 'Detached', 'Bungalow', 'Multi-Unit', 'Other'];
const PROPERTY_SIZES = [
    'Under 70 m²', '70 - 90 m²', '90 - 110 m²', '110 - 140 m²', '140 - 160 m²',
    '160 - 185 m²', '185 - 230 m²', '230 - 280 m²', '280 - 370 m²', 'Over 370 m²'
];
const TIME_SLOTS = ['Any time', '8am - 10am', '10am - 2pm', '2pm - 6pm', '6pm - 8pm'];
const BER_PURPOSES = ['Selling', 'Letting', 'Govt Grant', 'Mortgage', 'New Build', 'Personal Interest', 'Other'];

const getDisplayLabel = (value: string, lang: 'es' | 'pt' | 'en') => {
    if (lang === 'en') return value;
    const maps: Record<string, Record<string, string>> = {
        es: {
            'Semi-Detached': 'Pareada',
            'Mid-Terrace': 'Adosada (Medio)',
            'End-Terrace': 'Adosada (Extremo)',
            'Apartment': 'Apartamento',
            'Duplex': 'Dúplex',
            'Detached': 'Independiente',
            'Bungalow': 'Chalet',
            'Multi-Unit': 'Multi-Vivienda',
            'Other': 'Otro',
            'Under 70 m²': 'Menos de 70 m²',
            '70 - 90 m²': '70 - 90 m²',
            '90 - 110 m²': '90 - 110 m²',
            '110 - 140 m²': '110 - 140 m²',
            '140 - 160 m²': '140 - 160 m²',
            '160 - 185 m²': '160 - 185 m²',
            '185 - 230 m²': '185 - 230 m²',
            '230 - 280 m²': '230 - 280 m²',
            '280 - 370 m²': '280 - 370 m²',
            'Over 370 m²': 'Más de 370 m²',
            'Any time': 'Cualquier hora',
            '8am - 10am': '8:00 - 10:00',
            '10am - 2pm': '10:00 - 14:00',
            '2pm - 6pm': '14:00 - 18:00',
            '6pm - 8pm': '18:00 - 20:00',
            'Selling': 'Venta',
            'Letting': 'Alquiler',
            'Govt Grant': 'Subvención',
            'Mortgage': 'Hipoteca',
            'New Build': 'Obra Nueva',
            'Personal Interest': 'Interés Personal',
            'Select': 'Seleccionar',
            'Select town': 'Seleccionar ciudad',
            'Select county first': 'Seleccione comunidad primero',
        },
        pt: {
            'Semi-Detached': 'Geminada',
            'Mid-Terrace': 'Moradia em Banda (Meio)',
            'End-Terrace': 'Moradia em Banda (Extremo)',
            'Apartment': 'Apartamento',
            'Duplex': 'Duplex',
            'Detached': 'Moradia Isolada',
            'Bungalow': 'Vivenda',
            'Multi-Unit': 'Multi-Familiar',
            'Other': 'Outro',
            'Under 70 m²': 'Menos de 70 m²',
            '70 - 90 m²': '70 - 90 m²',
            '90 - 110 m²': '90 - 110 m²',
            '110 - 140 m²': '110 - 140 m²',
            '140 - 160 m²': '140 - 160 m²',
            '160 - 185 m²': '160 - 185 m²',
            '185 - 230 m²': '185 - 230 m²',
            '230 - 280 m²': '230 - 280 m²',
            '280 - 370 m²': '280 - 370 m²',
            'Over 370 m²': 'Mais de 370 m²',
            'Any time': 'Qualquer hora',
            '8am - 10am': '8:00 - 10:00',
            '10am - 2pm': '10:00 - 14:00',
            '2pm - 6pm': '14:00 - 18:00',
            '6pm - 8pm': '18:00 - 20:00',
            'Selling': 'Venda',
            'Letting': 'Arrendamento',
            'Govt Grant': 'Subvenção',
            'Mortgage': 'Crédito Habitação',
            'New Build': 'Obra Nova',
            'Personal Interest': 'Interesse Pessoal',
            'Select': 'Selecionar',
            'Select town': 'Selecionar cidade',
            'Select county first': 'Selecione a região primeiro',
        }
    };
    return maps[lang]?.[value] || value;
};

interface Props {
    businessUserId: string;
    listingId: string | null;
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    isSpanish: boolean;
}

export const BusinessPostJob = ({ businessUserId, listingId, businessName, businessEmail, businessPhone, isSpanish }: Props) => {
    const tenant = getTenantFromDomain();
    const isPortuguese = tenant === 'portugal';
    const lang = isSpanish ? 'es' : isPortuguese ? 'pt' : 'en';
    const COUNTIES = getCountiesForTenant(tenant);
    const TOWNS = getTownsForTenant(tenant);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [payerType, setPayerType] = useState<'business' | 'homeowner'>('homeowner');
    const [jobType, setJobType] = useState<'domestic' | 'commercial'>('domestic');

    // Homeowner details (when homeowner pays)
    const [homeownerName, setHomeownerName] = useState('');
    const [homeownerEmail, setHomeownerEmail] = useState('');
    const [homeownerPhone, setHomeownerPhone] = useState('');

    // Property
    const [county, setCounty] = useState('');
    const [town, setTown] = useState('');
    const [eircode, setEircode] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [propertySize, setPropertySize] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [berPurpose, setBerPurpose] = useState('');

    // Schedule
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [notes, setNotes] = useState('');

    const resetForm = () => {
        setPayerType('homeowner');
        setJobType('domestic');
        setHomeownerName(''); setHomeownerEmail(''); setHomeownerPhone('');
        setCounty(''); setTown(''); setEircode('');
        setPropertyType(''); setPropertySize(''); setBedrooms(''); setBerPurpose('');
        setPreferredDate(''); setPreferredTime(''); setNotes('');
    };

    const handleSubmit = async () => {
        if (isSubmitting) return; // Prevent double submission
        if (!county || !town || !propertyType || !berPurpose) {
            toast.error(isSpanish ? 'Por favor complete todos los campos obligatorios' : isPortuguese ? 'Por favor, preencha todos os campos obrigatórios' : 'Please fill in all required fields');
            return;
        }
        if (payerType === 'homeowner' && (!homeownerName || !homeownerEmail || !homeownerPhone)) {
            toast.error(isSpanish ? 'Proporcione los datos del propietario' : isPortuguese ? 'Forneça os dados do proprietário' : 'Please provide homeowner details');
            return;
        }

        setIsSubmitting(true);
        try {
            const contactName = payerType === 'business' ? businessName : homeownerName;
            const contactEmail = payerType === 'business' ? businessEmail : homeownerEmail;
            const contactPhone = payerType === 'business' ? businessPhone : homeownerPhone;

            const payload: any = {
                property_address: `${town}, ${county}`,
                town,
                county,
                preferred_date: preferredDate || null,
                preferred_time: preferredTime || null,
                status: 'live',
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                eircode: eircode || null,
                user_id: businessUserId,
                referred_by_listing_id: listingId,
                job_type: jobType,
                tenant,
                posted_by: 'business',
                payer_type: payerType,
                platform_fee: 0,
                hidden_fee: 0,
                notes: notes || null,
                property_type: propertyType || null,
                property_size: propertySize || null,
                bedrooms: bedrooms ? parseInt(bedrooms) : null,
                ber_purpose: berPurpose || null,
            };

            const { data, error } = await supabase
                .from('assessments')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            // Notify assessors
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: contactEmail,
                        customerName: contactName,
                        county,
                        town,
                        assessmentId: data.id,
                        jobType,
                        customerPhone: contactPhone,
                        tenant,
                    }
                });
            } catch (emailErr) {
                console.error('Failed to send notification:', emailErr);
            }

            toast.success(isSpanish ? '¡Trabajo publicado y notificado a los evaluadores!' : isPortuguese ? 'Trabalho publicado e peritos notificados!' : 'Job posted and assessors notified!');
            resetForm();
        } catch (error: any) {
            console.error('Error posting job:', error);
            toast.error(error.message || (isSpanish ? 'Error al publicar el trabajo' : isPortuguese ? 'Erro ao publicar o trabalho' : 'Failed to post job'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Payer Selection */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h4 className="font-bold text-gray-800 mb-4">
                    {isSpanish ? '¿Quién pagará la evaluación BER?' : isPortuguese ? 'Quem pagará a avaliação energética?' : 'Who will be paying for the BER assessment?'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => setPayerType('business')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${payerType === 'business' ? 'border-[#007F00] bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                    >
                        <div className="font-bold text-gray-900">{isSpanish ? 'Mi empresa paga' : isPortuguese ? 'A minha empresa paga' : 'My business pays'}</div>
                        <div className="text-xs text-gray-500">{isSpanish ? 'Usted cubre el costo de la evaluación' : isPortuguese ? 'A sua empresa cobre o custo da avaliação' : 'You cover the assessment cost'}</div>
                    </button>
                    <button
                        onClick={() => setPayerType('homeowner')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${payerType === 'homeowner' ? 'border-[#007F00] bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                    >
                        <div className="font-bold text-gray-900">{isSpanish ? 'El propietario paga' : isPortuguese ? 'O proprietário paga' : 'The homeowner pays'}</div>
                        <div className="text-xs text-gray-500">{isSpanish ? 'El propietario cubre el costo' : isPortuguese ? 'O proprietário cobre o custo' : 'The homeowner covers the cost'}</div>
                    </button>
                </div>
            </div>

            {/* Homeowner Details (when homeowner pays) */}
            {payerType === 'homeowner' && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="font-bold text-gray-800 mb-4">{isSpanish ? 'Datos del Propietario' : isPortuguese ? 'Dados do Proprietário' : 'Homeowner Details'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Nombre completo' : isPortuguese ? 'Nome completo' : 'Full Name'} *</label>
                            <input value={homeownerName} onChange={e => setHomeownerName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="John Smith" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Correo' : isPortuguese ? 'Email' : 'Email'} *</label>
                            <input type="email" value={homeownerEmail} onChange={e => setHomeownerEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Teléfono' : isPortuguese ? 'Telefone' : 'Phone'} *</label>
                            <input value={homeownerPhone} onChange={e => setHomeownerPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder={getPhonePlaceholder(tenant)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Job Type */}
            <div>
                <h4 className="font-bold text-gray-800 mb-4">{isSpanish ? 'Tipo de Trabajo' : isPortuguese ? 'Tipo de Trabalho' : 'Job Type'}</h4>
                <div className="flex gap-3">
                    <button onClick={() => setJobType('domestic')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${jobType === 'domestic' ? 'border-[#007F00] bg-green-50 font-bold text-[#007F00]' : 'border-gray-200 text-gray-600'}`}>
                        <Home size={18} /> {isSpanish ? 'Doméstico' : isPortuguese ? 'Doméstico' : 'Domestic'}
                    </button>
                    <button onClick={() => setJobType('commercial')} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${jobType === 'commercial' ? 'border-[#007F00] bg-green-50 font-bold text-[#007F00]' : 'border-gray-200 text-gray-600'}`}>
                        <Building2 size={18} /> {isSpanish ? 'Comercial' : isPortuguese ? 'Comercial' : 'Commercial'}
                    </button>
                </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Comunidad Autónoma' : isPortuguese ? 'Região' : 'County'} *</label>
                    <select value={county} onChange={e => { setCounty(e.target.value); setTown(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                        <option value="">{getDisplayLabel('Select', lang)}</option>
                        {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Ciudad' : isPortuguese ? 'Cidade' : 'Town'} *</label>
                    <select value={town} onChange={e => setTown(e.target.value)} disabled={!county} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00] ${!county ? 'bg-gray-100 opacity-50 cursor-not-allowed' : ''}`}>
                        <option value="">{county ? getDisplayLabel('Select town', lang) : getDisplayLabel('Select county first', lang)}</option>
                        {county && TOWNS[county]?.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Código Postal' : isPortuguese ? 'Código Postal' : 'Eircode / Postcode'}</label>
                    <input value={eircode} onChange={e => setEircode(e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder={isSpanish ? 'Ej. 28001' : isPortuguese ? 'Ex. 1000-001' : 'D14 AB12'} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Tipo de Propiedad' : isPortuguese ? 'Tipo de Imóvel' : 'Property Type'} *</label>
                    <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                        <option value="">{getDisplayLabel('Select', lang)}</option>
                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{getDisplayLabel(t, lang)}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Tamaño' : isPortuguese ? 'Área do Imóvel' : 'Property Size'}</label>
                    <select value={propertySize} onChange={e => setPropertySize(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                        <option value="">{getDisplayLabel('Select', lang)}</option>
                        {PROPERTY_SIZES.map(s => <option key={s} value={s}>{getDisplayLabel(s, lang)}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Habitaciones' : isPortuguese ? 'Quartos' : 'Bedrooms'}</label>
                    <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                        <option value="">{getDisplayLabel('Select', lang)}</option>
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Propósito BER' : isPortuguese ? 'Finalidade do Certificado' : 'BER Purpose'} *</label>
                    <select value={berPurpose} onChange={e => setBerPurpose(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                        <option value="">{getDisplayLabel('Select', lang)}</option>
                        {BER_PURPOSES.map(p => <option key={p} value={p}>{getDisplayLabel(p, lang)}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Fecha Preferida' : isPortuguese ? 'Data Preferida' : 'Preferred Date'}</label>
                    <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Hora Preferida' : isPortuguese ? 'Hora Preferida' : 'Preferred Time'}</label>
                    <select value={preferredTime} onChange={e => setPreferredTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                        <option value="">{getDisplayLabel('Select', lang)}</option>
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{getDisplayLabel(t, lang)}</option>)}
                    </select>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{isSpanish ? 'Notas Adicionales' : isPortuguese ? 'Notas Adicionais' : 'Additional Notes'}</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder={isSpanish ? 'Instrucciones especiales...' : isPortuguese ? 'Instruções especiais...' : 'Any special instructions...'} />
            </div>

            {/* Submit */}
            <div className="pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#007F00] text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all"
                >
                    <Send size={18} />
                    {isSubmitting
                        ? (isSpanish ? 'Publicando...' : isPortuguese ? 'A publicar...' : 'Posting...')
                        : (isSpanish ? 'Publicar Trabajo Gratis' : isPortuguese ? 'Publicar Trabalho Grátis' : 'Post Job for Free')
                    }
                </button>
                <p className="text-xs text-gray-400 mt-2">
                    {isSpanish
                        ? 'El trabajo se publicará inmediatamente y se notificará a los evaluadores coincidentes.'
                        : isPortuguese
                            ? 'O trabalho será publicado imediatamente e os peritos correspondentes serão notificados.'
                            : 'The job will go live immediately and matching assessors will be notified.'}
                </p>
            </div>
        </div>
    );
};
