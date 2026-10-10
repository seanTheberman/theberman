import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Home, Calendar, Clock, Euro, PoundSterling, Mail, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getTenantFromDomain } from '../lib/tenant';
import { getPhonePlaceholder } from '../lib/phoneFormats';

interface Assessment {
    id: string;
    property_address: string;
    town: string;
    county: string;
    property_type: string;
    property_size: string;
    bedrooms: number;
    heat_pump: string;
    ber_purpose: string;
    additional_features: string[];
    preferred_date: string;
    preferred_time?: string;
    created_at: string;
    eircode?: string;
    job_type?: string;
    building_type?: string;
    floor_area?: string;
    building_complexity?: string;
    assessment_purpose?: string;
    heating_cooling_systems?: string[];
    existing_docs?: string[];
    notes?: string;
}

interface QuoteData {
    price: string;
    notes: string;
    availability_date: string;
    availability_time: string;
}

const QuickQuotePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const isPortuguese = tenant === 'portugal';
    const isFrench = tenant === 'france';
    const isEngland = tenant === 'england';
    
    // Phone pre-filled from SMS link — skip the contact step
    const phoneFromUrl = searchParams.get('phone') || '';
    
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Quote form, 2: Email/Phone (skipped if phone in URL), 3: Results
    
    const [quoteData, setQuoteData] = useState<QuoteData>({
        price: '',
        notes: '',
        availability_date: '',
        availability_time: ''
    });
    
    const [contactInfo, setContactInfo] = useState({
        email: '',
        phone: phoneFromUrl
    });
    
    const [searchResult, setSearchResult] = useState<{
        found: boolean;
        contractor?: any;
        message: string;
    } | null>(null);

    useEffect(() => {
        if (id) {
            fetchAssessment();
        }
    }, [id]);

    const fetchAssessment = async () => {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setAssessment(data);

            // Compute expiry: 7 days since last activity
            if (data) {
                const notOpenStatus = !['live', 'submitted', 'pending_quote'].includes(data.status);
                let lastActivity = new Date(data.created_at).getTime();
                if (data.scheduled_date) {
                    const sd = new Date(data.scheduled_date).getTime();
                    if (sd > lastActivity) lastActivity = sd;
                }
                const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
                if (notOpenStatus || daysSince >= 7) setIsExpired(true);
            }
        } catch (error: any) {
            toast.error(isSpanish ? 'No se pudieron cargar los detalles del trabajo' : isPortuguese ? 'Não foi possível carregar os detalhes do trabalho' : isFrench ? 'Impossible de charger les détails de la mission' : 'Failed to load job details');
            console.error('Error fetching assessment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!quoteData.price || !quoteData.availability_date) {
            toast.error(isSpanish ? 'Por favor, completa todos los campos obligatorios' : isPortuguese ? 'Por favor, preencha todos os campos obrigatórios' : isFrench ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields');
            return;
        }
        
        // If phone came from the SMS/email link, skip step 2 and submit via RPC
        if (phoneFromUrl) {
            setSubmitting(true);
            try {
                await submitQuoteByPhone(phoneFromUrl);
            } finally {
                setSubmitting(false);
                setCurrentStep(3);
            }
            return;
        }
        
        setCurrentStep(2);
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!contactInfo.phone) {
            toast.error(isSpanish ? 'Por favor, indica tu número de teléfono' : isPortuguese ? 'Por favor, indique o seu número de telefone' : isFrench ? 'Veuillez indiquer votre numéro de téléphone' : 'Please provide your phone number');
            return;
        }
        
        setSubmitting(true);
        try {
            await submitQuoteByPhone(contactInfo.phone);
        } finally {
            setSubmitting(false);
            setCurrentStep(3);
        }
    };

    // Submits the quote via a SECURITY DEFINER RPC that matches the contractor by
    // phone server-side. Anonymous-safe and impersonation-safe.
    const submitQuoteByPhone = async (phone: string) => {
        try {
            const { data, error } = await supabase.rpc('submit_anonymous_quote', {
                p_assessment_id: id,
                p_phone: phone,
                p_price: parseFloat(quoteData.price),
                p_notes: null,
            });

            if (error) {
                const msg = (error.message || '').toLowerCase();
                if (msg.includes('contractor_not_found')) {
                    setSearchResult({
                        found: false,
                        message: isSpanish ? 'No se encontró ninguna cuenta de certificador con este número de teléfono. Regístrate para enviar tu presupuesto.' : isPortuguese ? 'Não foi encontrada nenhuma conta de perito com este número de telefone. Registe-se para enviar o seu orçamento.' : isFrench ? 'Aucun compte de diagnostiqueur trouvé pour ce numéro de téléphone. Inscrivez-vous pour envoyer votre devis.' : 'No assessor account found for this phone number. Please register to submit your quote.'
                    });
                    return;
                }
                if (msg.includes('already_quoted')) {
                    setSearchResult({
                        found: true,
                        message: isSpanish ? 'Ya has enviado un presupuesto para este trabajo. Inicia sesión para actualizarlo.' : isPortuguese ? 'Já enviou um orçamento para este trabalho. Inicie sessão para o atualizar.' : isFrench ? 'Vous avez déjà envoyé un devis pour cette mission. Connectez-vous pour le mettre à jour.' : 'You have already submitted a quote for this job. Please log in to update it.'
                    });
                    return;
                }
                if (msg.includes('assessment_not_found')) {
                    setSearchResult({
                        found: false,
                        message: isSpanish ? 'Este trabajo ya no está disponible para presupuestar.' : isPortuguese ? 'Este trabalho já não está disponível para orçamentar.' : isFrench ? 'Cette mission n\'est plus disponible pour les devis.' : 'This job is no longer available for quoting.'
                    });
                    return;
                }
                if (msg.includes('assessment_expired')) {
                    setIsExpired(true);
                    setSearchResult({
                        found: false,
                        message: isSpanish ? 'Este trabajo ha caducado y ya no acepta presupuestos.' : isPortuguese ? 'Este trabalho expirou e já não aceita orçamentos.' : isFrench ? 'Cette mission a expiré et n\'accepte plus de devis.' : 'This job has expired and is no longer accepting quotes.'
                    });
                    return;
                }
                throw error;
            }

            const row = Array.isArray(data) ? data[0] : data;
            setSearchResult({
                found: true,
                contractor: row ? { id: row.contractor_id, full_name: row.contractor_name } : undefined,
                message: row?.contractor_name
                    ? (isSpanish ? `¡Bienvenido de nuevo, ${row.contractor_name}! Tu presupuesto ha sido enviado y vinculado a tu cuenta.` : isPortuguese ? `Bem-vindo de volta, ${row.contractor_name}! O seu orçamento foi enviado e associado à sua conta.` : isFrench ? `Bon retour, ${row.contractor_name}! Votre devis a été envoyé et lié à votre compte.` : `Welcome back, ${row.contractor_name}! Your quote has been submitted and linked to your account.`)
                    : (isSpanish ? 'Tu presupuesto ha sido enviado y vinculado a tu cuenta.' : isPortuguese ? 'O seu orçamento foi enviado e associado à sua conta.' : isFrench ? 'Votre devis a été envoyé et lié à votre compte.' : 'Your quote has been submitted and linked to your account.'),
            });
            toast.success(isSpanish ? '¡Presupuesto enviado con éxito!' : isPortuguese ? 'Orçamento enviado com sucesso!' : isFrench ? 'Devis envoyé avec succès !' : 'Quote submitted successfully!');
        } catch (err: any) {
            console.error('Quote submission error:', err);
            toast.error(isSpanish ? 'No se pudo enviar el presupuesto. Inténtalo de nuevo.' : isPortuguese ? 'Não foi possível enviar o orçamento. Tente novamente.' : isFrench ? 'Échec de l\'envoi du devis. Veuillez réessayer.' : 'Failed to submit quote. Please try again.');
            setSearchResult({
                found: false,
                message: isSpanish ? 'Algo salió mal al enviar tu presupuesto. Inténtalo de nuevo o inicia sesión.' : isPortuguese ? 'Algo correu mal ao enviar o seu orçamento. Tente novamente ou inicie sessão.' : isFrench ? 'Une erreur s\'est produite lors de l\'envoi de votre devis. Veuillez réessayer ou vous connecter.' : 'Something went wrong submitting your quote. Please try again or log in.'
            });
        }
    };

    const handleRegister = () => {
        // Store quote data in sessionStorage to retrieve after registration
        sessionStorage.setItem('pendingQuote', JSON.stringify({
            assessmentId: id,
            quoteData,
            contactInfo
        }));
        
        navigate('/signup?role=contractor&redirect=quote');
    };

    const handleLogin = () => {
        navigate('/login?redirect=quote');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#007F00]" size={48} />
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{isSpanish ? 'Trabajo No Encontrado' : isPortuguese ? 'Trabalho Não Encontrado' : isFrench ? 'Mission Introuvable' : 'Job Not Found'}</h2>
                    <p className="text-gray-600 mb-4">{isSpanish ? 'Es posible que este trabajo ya no esté disponible.' : isPortuguese ? 'É possível que este trabalho já não esteja disponível.' : isFrench ? 'Il est possible que cette mission ne soit plus disponible.' : 'This job may no longer be available.'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-[#007F00] text-white rounded-lg hover:bg-[#006600]"
                    >
                        {isSpanish ? 'Ir al Inicio' : isPortuguese ? 'Ir para o Início' : isFrench ? 'Accueil' : 'Go Home'}
                    </button>
                </div>
            </div>
        );
    }

    if (isExpired) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft size={20} /> {isSpanish ? 'Volver al inicio' : isPortuguese ? 'Voltar ao início' : isFrench ? 'Retour à l\'accueil' : 'Back to Home'}
                        </button>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <AlertCircle className="mx-auto text-amber-500 mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{isSpanish ? 'Este Trabajo Ha Caducado' : isPortuguese ? 'Este Trabalho Expirou' : isFrench ? 'Cette Mission a Expiré' : 'This Job Has Expired'}</h2>
                    <p className="text-gray-600 mb-2">{isSpanish ? 'Este trabajo ya no acepta nuevos presupuestos.' : isPortuguese ? 'Este trabalho já não aceita novos orçamentos.' : isFrench ? 'Cette mission n\'accepte plus de nouveaux devis.' : 'This job is no longer accepting new quotes.'}</p>
                    <p className="text-sm text-gray-400">{isSpanish ? 'Los trabajos caducan tras 7 días de inactividad.' : isPortuguese ? 'Os trabalhos expiram após 7 dias de inatividade.' : isFrench ? 'Les missions expirent après 7 jours d\'inactivité.' : 'Jobs expire after 7 days of inactivity.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                        {isSpanish ? 'Volver al inicio' : isPortuguese ? 'Voltar ao início' : isFrench ? 'Retour à l\'accueil' : 'Back to Home'}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 1 ? 'bg-[#007F00] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            1
                        </div>
                        <span className="ml-2 text-sm font-medium">{isSpanish ? 'Detalles del Presupuesto' : isPortuguese ? 'Detalhes do Orçamento' : isFrench ? 'Détails du Devis' : 'Quote Details'}</span>
                    </div>
                    <div className={`w-16 h-1 mx-4 ${currentStep >= 2 ? 'bg-[#007F00]' : 'bg-gray-200'}`} />
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 2 ? 'bg-[#007F00] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            2
                        </div>
                        <span className="ml-2 text-sm font-medium">{isSpanish ? 'Datos de Contacto' : isPortuguese ? 'Dados de Contacto' : isFrench ? 'Coordonnées' : 'Contact Info'}</span>
                    </div>
                    <div className={`w-16 h-1 mx-4 ${currentStep >= 3 ? 'bg-[#007F00]' : 'bg-gray-200'}`} />
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            currentStep >= 3 ? 'bg-[#007F00] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            3
                        </div>
                        <span className="ml-2 text-sm font-medium">{isSpanish ? 'Completado' : isPortuguese ? 'Concluído' : isFrench ? 'Terminé' : 'Complete'}</span>
                    </div>
                </div>

                {/* Job Details Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{isSpanish ? 'Detalles del Trabajo' : isPortuguese ? 'Detalhes do Trabalho' : isFrench ? 'Détails de la Mission' : 'Job Details'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="font-medium text-gray-900">{assessment.property_address}</p>
                                <p className="text-sm text-gray-600">{assessment.town}, {isSpanish || isPortuguese || isFrench || isEngland ? '' : 'Co. '}{assessment.county}</p>
                                {assessment.eircode && (
                                    <p className="text-sm text-green-600 font-medium">{isSpanish ? 'Código Postal' : isPortuguese ? 'Código Postal' : isFrench ? 'Code Postal' : isEngland ? 'Postcode' : 'Eircode'}: {assessment.eircode}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Home className="text-gray-400 mt-1" size={18} />
                            <div>
                                {assessment.job_type === 'commercial' ? (
                                    <>
                                        <p className="font-medium text-gray-900">{assessment.building_type || assessment.property_type}</p>
                                        <p className="text-sm text-gray-600">{isSpanish ? 'Superficie' : isPortuguese ? 'Área útil' : isFrench ? 'Surface' : 'Floor area'}: {assessment.floor_area || assessment.property_size}</p>
                                        {assessment.building_complexity && (
                                            <p className="text-sm text-gray-600">{isSpanish ? 'Complejidad' : isPortuguese ? 'Complexidade' : isFrench ? 'Complexité' : 'Complexity'}: {assessment.building_complexity}</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium text-gray-900">{assessment.property_type}</p>
                                        <p className="text-sm text-gray-600">{assessment.property_size}</p>
                                        {assessment.bedrooms != null && (
                                            <p className="text-sm text-gray-600">{assessment.bedrooms} {isSpanish ? 'habitaciones' : isPortuguese ? 'quartos' : isFrench ? 'chambres' : 'bedrooms'}</p>
                                        )}
                                    </>
                                )}
                                {(assessment.assessment_purpose || assessment.ber_purpose) && (
                                    <p className="text-sm text-gray-600 mt-1">{isSpanish ? 'Finalidad' : isPortuguese ? 'Finalidade' : isFrench ? 'Objet' : 'Purpose'}: <span className="font-medium">{assessment.assessment_purpose || assessment.ber_purpose}</span></p>
                                )}
                                {assessment.job_type !== 'commercial' && assessment.heat_pump && (
                                    <p className="text-sm text-gray-600">{isSpanish ? 'Bomba de calor' : isPortuguese ? 'Bomba de calor' : isFrench ? 'Pompe à chaleur' : 'Heat pump'}: {assessment.heat_pump}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="font-medium text-gray-900">{isSpanish ? 'Fecha Preferida' : isPortuguese ? 'Data Preferida' : isFrench ? 'Date Souhaitée' : 'Preferred Date'}</p>
                                <p className="text-sm text-gray-600">{assessment.preferred_date || (isSpanish ? 'Flexible' : isPortuguese ? 'Flexível' : isFrench ? 'Flexible' : 'Flexible')}</p>
                                {assessment.preferred_time && (
                                    <p className="text-sm text-gray-600">{assessment.preferred_time}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="text-gray-400 mt-1" size={18} />
                            <div>
                                <p className="font-medium text-gray-900">{isSpanish ? 'Publicado' : isPortuguese ? 'Publicado' : isFrench ? 'Publié' : 'Posted'}</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(assessment.created_at).toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : isFrench ? 'fr-FR' : 'en-IE')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {(assessment.additional_features?.length > 0 || assessment.heating_cooling_systems?.length > 0 || assessment.existing_docs?.length > 0) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {assessment.job_type !== 'commercial' && assessment.additional_features?.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{isSpanish ? 'Añadidos' : isPortuguese ? 'Extras' : isFrench ? 'Extras' : 'Additional features'}</p>
                                    <p className="text-sm text-gray-700">{assessment.additional_features.join(', ')}</p>
                                </div>
                            )}
                            {assessment.heating_cooling_systems?.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{isSpanish ? 'Climatización' : isPortuguese ? 'Climatização' : isFrench ? 'Chauffage/Clim' : 'Heating & cooling'}</p>
                                    <p className="text-sm text-gray-700">{assessment.heating_cooling_systems.join(', ')}</p>
                                </div>
                            )}
                            {assessment.existing_docs?.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{isSpanish ? 'Documentación' : isPortuguese ? 'Documentação' : isFrench ? 'Documentation' : 'Existing docs'}</p>
                                    <p className="text-sm text-gray-700">{assessment.existing_docs.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {assessment.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{isSpanish ? 'Notas del Cliente' : isPortuguese ? 'Notas do Cliente' : isFrench ? 'Notes du Client' : 'Notes from customer'}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{assessment.notes}</p>
                        </div>
                    )}
                </div>

                {/* Step 1: Quote Form */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{isSpanish ? 'Envía tu Presupuesto' : isPortuguese ? 'Envie o seu Orçamento' : isFrench ? 'Envoyez votre Devis' : 'Submit Your Quote'}</h2>
                        <form onSubmit={handleQuoteSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isSpanish ? 'Precio del Presupuesto' : isPortuguese ? 'Preço do Orçamento' : isFrench ? 'Prix du Devis' : 'Quote Price'} ({getTenantFromDomain() === 'england' ? '£' : '€'}) *
                                </label>
                                <div className="relative">
                                    {getTenantFromDomain() === 'england'
                                        ? <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        : <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={quoteData.price}
                                        onChange={(e) => setQuoteData({ ...quoteData, price: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isSpanish ? 'Fecha de Disponibilidad' : isPortuguese ? 'Data de Disponibilidade' : isFrench ? 'Date de Disponibilité' : 'Availability Date'} *
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={quoteData.availability_date}
                                    onChange={(e) => setQuoteData({ ...quoteData, availability_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isSpanish ? 'Hora Preferida' : isPortuguese ? 'Hora Preferida' : isFrench ? 'Heure Souhaitée' : 'Preferred Time'}
                                </label>
                                <select
                                    value={quoteData.availability_time}
                                    onChange={(e) => setQuoteData({ ...quoteData, availability_time: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                >
                                    <option value="">{isSpanish ? 'Seleccionar hora' : isPortuguese ? 'Selecionar hora' : isFrench ? 'Sélectionner l\'heure' : 'Select time'}</option>
                                    <option value="Morning (9am-12pm)">{isSpanish ? 'Mañana (9-12h)' : isPortuguese ? 'Manhã (9-12h)' : isFrench ? 'Matin (9h-12h)' : 'Morning (9am-12pm)'}</option>
                                    <option value="Afternoon (12pm-5pm)">{isSpanish ? 'Tarde (12-17h)' : isPortuguese ? 'Tarde (12-17h)' : isFrench ? 'Après-midi (12h-17h)' : 'Afternoon (12pm-5pm)'}</option>
                                    <option value="Evening (5pm-7pm)">{isSpanish ? 'Última hora (17-19h)' : isPortuguese ? 'Fim de tarde (17-19h)' : isFrench ? 'Soir (17h-19h)' : 'Evening (5pm-7pm)'}</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#007F00] text-white font-bold rounded-lg hover:bg-[#006600] transition-colors"
                            >
                                {isSpanish ? 'Continuar a Datos de Contacto' : isPortuguese ? 'Continuar para Dados de Contacto' : isFrench ? 'Continuer vers les Coordonnées' : 'Continue to Contact Details'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Email/Phone Collection */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{isSpanish ? 'Tus Datos de Contacto' : isPortuguese ? 'Os seus Dados de Contacto' : isFrench ? 'Vos Coordonnées' : 'Your Contact Information'}</h2>
                        <p className="text-gray-600 mb-6">
                            {isSpanish ? 'Necesitamos tu correo y número de teléfono para vincular este presupuesto a tu cuenta.' : isPortuguese ? 'Necessitamos do seu email e número de telefone para associar este orçamento à sua conta.' : isFrench ? 'Nous avons besoin de votre email et numéro de téléphone pour lier ce devis à votre compte.' : 'We need your email and phone number to link this quote to your account.'}
                        </p>
                        <form onSubmit={handleContactSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isSpanish ? 'Correo Electrónico' : isPortuguese ? 'Email' : isFrench ? 'Adresse E-mail' : 'Email Address'} *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={contactInfo.email}
                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                        placeholder="email"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isSpanish ? 'Número de Teléfono' : isPortuguese ? 'Número de Telefone' : isFrench ? 'Numéro de Téléphone' : 'Phone Number'} *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        required
                                        value={contactInfo.phone}
                                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007F00]"
                                        placeholder={getPhonePlaceholder(tenant)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
                                >
                                    {isSpanish ? 'Atrás' : isPortuguese ? 'Anterior' : isFrench ? 'Retour' : 'Back'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-[#007F00] text-white font-bold rounded-lg hover:bg-[#006600] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={18} />}
                                    {isSpanish ? 'Enviar Presupuesto' : isPortuguese ? 'Enviar Orçamento' : isFrench ? 'Envoyer le Devis' : 'Submit Quote'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 3: Results */}
                {currentStep === 3 && searchResult && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        {searchResult.found ? (
                            <div className="text-center">
                                <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{isSpanish ? '¡Presupuesto Enviado!' : isPortuguese ? 'Orçamento Enviado!' : isFrench ? 'Devis Envoyé !' : 'Quote Submitted!'}</h2>
                                <p className="text-gray-600 mb-6">{searchResult.message}</p>
                                <p className="text-sm text-gray-500 mb-6">
                                    {isSpanish ? 'Puedes ver y gestionar tus presupuestos iniciando sesión en tu cuenta.' : isPortuguese ? 'Pode ver e gerir os seus orçamentos iniciando sessão na sua conta.' : isFrench ? 'Vous pouvez consulter et gérer vos devis en vous connectant à votre compte.' : "We've sent a login link to your email. You can view and manage your quotes after logging in."}
                                </p>
                                <button
                                    onClick={handleLogin}
                                    className="px-6 py-2 bg-[#007F00] text-white font-bold rounded-lg hover:bg-[#006600]"
                                >
                                    {isSpanish ? 'Iniciar Sesión en tu Cuenta' : isPortuguese ? 'Iniciar Sessão na sua Conta' : isFrench ? 'Se Connecter à votre Compte' : 'Login to Your Account'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <AlertCircle className="mx-auto text-amber-500 mb-4" size={64} />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{isSpanish ? 'Cuenta Requerida' : isPortuguese ? 'Conta Necessária' : isFrench ? 'Compte Requis' : 'Account Required'}</h2>
                                <p className="text-gray-600 mb-6">{searchResult.message}</p>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleRegister}
                                        className="w-full py-3 bg-[#007F00] text-white font-bold rounded-lg hover:bg-[#006600]"
                                    >
                                        {isSpanish ? 'Registrarse como Certificador' : isPortuguese ? 'Registar como Perito' : isFrench ? 'S\'inscrire comme Diagnostiqueur' : 'Register as Contractor'}
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="w-full py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50"
                                    >
                                        {isSpanish ? 'Probar con Otro Correo/Teléfono' : isPortuguese ? 'Tentar com Outro Email/Telefone' : isFrench ? 'Essayer avec un Autre Email/Téléphone' : 'Try Different Email/Phone'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickQuotePage;
