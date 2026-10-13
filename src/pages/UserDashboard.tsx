
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import { formatCurrency, getTenantFromDomain, getTenantCurrency } from '../lib/tenant';
import { LogOut, FileText, User, Home, AlertCircle, X, Menu, Trash2, Search, Filter, ChevronDown, MapPin, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuoteModal from '../components/QuoteModal';
import PaymentModal from '../components/PaymentModal';

interface Quote {
    id: string;
    price: number;
    estimated_date: string | null;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    assessment_id: string;
    created_by: string;
    contractor?: {
        full_name: string;
        seai_number: string;
        assessor_type?: string;
        company_name?: string;
        insurance_holder?: boolean;
        vat_registered?: boolean;
    };
    assessment?: any;
    is_loyalty_payout?: boolean;
}

interface Assessment {
    id: string;
    property_address: string;
    status: 'draft' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed' | 'live' | 'expired';
    scheduled_date: string | null;
    certificate_url: string | null;
    created_at: string;
    eircode?: string;
    town?: string;
    county?: string;
    property_type?: string;
    quotes?: Quote[];
    preferred_date?: string;
    preferred_time?: string;
    property_size?: string;
    bedrooms?: number;
    heat_pump?: string;
    isExpired?: boolean;
    ber_purpose?: string;
    additional_features?: string[];
    job_type?: string;
    building_type?: string;
    floor_area?: string;
    building_complexity?: string;
    heating_cooling_systems?: string[];
    assessment_purpose?: string;
    existing_docs?: string[];
    notes?: string;
}

const UserDashboard = () => {
    const { t, isSpanish } = useTranslation();
    const tenant = getTenantFromDomain();
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';
    const isFrench = tenant === 'france';
    const brandName = isEngland ? 'EPC Cert' : isSpanish ? 'Certificado Energético' : isPortuguese ? 'Certificado Energia' : isFrench ? 'DPE Cert France' : 'The Berman';
    const logoUrl = isPortuguese ? '/certificado-energia-logo.png' : tenant === 'france' ? '/dpecert-logo.png' : '/logo.svg';
    const assessmentLabel = isEngland ? 'EPC' : isSpanish ? 'Certificación Energética' : isPortuguese ? 'Certificado Energético' : isFrench ? 'DPE' : 'BER';
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<Assessment[]>([]);

    const getStatusLabel = (status: string, isExpired?: boolean) => {
        if (isExpired) return isSpanish ? 'Caducado' : isPortuguese ? 'Expirado' : isFrench ? 'Expiré' : 'Expired';
        if (isFrench) {
            const map: Record<string, string> = {
                draft: 'Brouillon',
                submitted: 'Envoyé',
                pending_quote: 'Devis en Attente',
                quote_accepted: 'Devis Accepté',
                scheduled: 'Planifié',
                completed: 'Terminé',
                live: 'Actif',
            };
            return map[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        if (isPortuguese) {
            const map: Record<string, string> = {
                draft: 'Rascunho',
                submitted: 'Submetido',
                pending_quote: 'Pendente de Orçamento',
                quote_accepted: 'Orçamento Aceite',
                scheduled: 'Agendado',
                completed: 'Concluído',
                live: 'Ativo',
            };
            return map[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        if (!isSpanish) return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const map: Record<string, string> = {
            draft: 'Borrador',
            submitted: 'Enviado',
            pending_quote: 'Pendiente de Presupuesto',
            quote_accepted: 'Presupuesto Aceptado',
            scheduled: 'Programado',
            completed: 'Completado',
            live: 'Activo',
        };
        return map[status] || status;
    };

    const getQuoteStatusLabel = (status: string) => {
        if (isFrench) {
            const map: Record<string, string> = { pending: 'En attente', accepted: 'Accepté', rejected: 'Refusé' };
            return map[status] || status.charAt(0).toUpperCase() + status.slice(1);
        }
        if (isPortuguese) {
            const map: Record<string, string> = { pending: 'Pendente', accepted: 'Aceite', rejected: 'Rejeitado' };
            return map[status] || status.charAt(0).toUpperCase() + status.slice(1);
        }
        if (!isSpanish) return status.charAt(0).toUpperCase() + status.slice(1);
        const map: Record<string, string> = {
            pending: 'Pendiente',
            accepted: 'Aceptado',
            rejected: 'Rechazado',
        };
        return map[status] || status;
    };
    const [loading, setLoading] = useState(true);

    const [selectedDetailsQuote, setSelectedDetailsQuote] = useState<Quote | null>(null); // New state for quote details modal
    const [view, setView] = useState<'assessments' | 'quotes'>('assessments');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAssessmentId, setFilteredAssessmentId] = useState<string | null>(null);
    const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);
    const [confirmReject, setConfirmReject] = useState<{ assessmentId: string, quoteId: string } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentQuote, setPaymentQuote] = useState<{ assessmentId: string, quoteId: string, amount: number, balance?: number } | null>(null);
    const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null);
    const [submittingAssessmentId, setSubmittingAssessmentId] = useState<string | null>(null);
    const [bookingDepositAmount, setBookingDepositAmount] = useState<number>(35);
    const [hiddenFee, setHiddenFee] = useState<number>(5);
    const [platformFeeAmount, setPlatformFeeAmount] = useState<number>(30);
    const [commercialPlatformFeeAmount, setCommercialPlatformFeeAmount] = useState<number>(50);

    useEffect(() => {
        fetchAssessments();
        fetchAppSettings();

        // Real-time subscription
        if (!user) return;

        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'assessments', filter: `user_id=eq.${user.id}` },
                () => fetchAssessments()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'quotes' },
                () => fetchAssessments()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'assessment_messages' },
                () => fetchAssessments()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchAppSettings = async () => {
        try {
            const currentTenant = getTenantFromDomain();
            const { data, error } = await supabase
                .from('app_settings')
                .select('platform_fee_amount, hidden_fee_amount, commercial_platform_fee_amount')
                .eq('tenant', currentTenant)
                .single();
            if (error) throw error;
            if (data) {
                const platform = parseFloat(data.platform_fee_amount) || 25;
                const hidden = parseFloat(data.hidden_fee_amount) || 10;
                const commercialPlatform = parseFloat(data.commercial_platform_fee_amount) || 50;
                setBookingDepositAmount(platform + hidden);
                setHiddenFee(hidden);
                setPlatformFeeAmount(platform);
                setCommercialPlatformFeeAmount(commercialPlatform);
            }
        } catch (error) {
            console.error('Error fetching app settings:', error);
        }
    };

    const fetchAssessments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('assessments')
                .select(`
                    *,
                    quotes (
                        *,
                        contractor:profiles(
                            full_name,
                            seai_number,
                            assessor_type,
                            company_name,
                            insurance_holder,
                            vat_registered
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const jobsWithExpired = (data || []).map((assessment: Assessment) => {
                if (assessment.status === 'expired') {
                    return { ...assessment, isExpired: true };
                }
                const lastActivity = (() => {
                    let latest = new Date(assessment.created_at).getTime();
                    if (assessment.scheduled_date) {
                        const sd = new Date(assessment.scheduled_date).getTime();
                        if (sd > latest) latest = sd;
                    }
                    if (assessment.quotes) {
                        for (const q of assessment.quotes) {
                            const qd = new Date(q.created_at).getTime();
                            if (qd > latest) latest = qd;
                        }
                    }
                    return latest;
                })();
                const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
                const isExpired = daysSinceActivity >= 7;
                return { ...assessment, isExpired };
            });

            setAssessments(jobsWithExpired);

            // On first load, if there are pending quotes, land on the quotes view
            if (!initialViewSet.current) {
                initialViewSet.current = true;
                const hasPendingQuotes = jobsWithExpired.some(a => (a.quotes || []).some(q => q.status === 'pending'));
                if (hasPendingQuotes) setView('quotes');
            }
        } catch (error: any) {
            console.error('Error fetching assessments:', error);
            toast.error(isSpanish ? 'Error al cargar certificaciones' : 'Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const initialViewSet = useRef(false);

    const handleSubmitAssessment = async (id: string) => {
        if (submittingAssessmentId) return; // prevent double-submit
        setSubmittingAssessmentId(id);
        try {
            // 1. Fetch assessment details for notification
            const { data: assessment, error: fetchError } = await supabase
                .from('assessments')
                .select('*, profiles(full_name, email)')
                .eq('id', id)
                .maybeSingle();

            if (fetchError) throw fetchError;

            // 2. Update status to live
            const { error: updateError } = await supabase
                .from('assessments')
                .update({ status: 'live' })
                .eq('id', id);

            if (updateError) throw updateError;

            // 3. Notify contractors. The edge function is idempotent, so repeat
            // clicks won't resend duplicate emails.
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: assessment?.profiles?.email || assessment?.contact_email,
                        customerName: assessment?.profiles?.full_name || assessment?.contact_name,
                        county: assessment?.county,
                        town: assessment?.town,
                        assessmentId: id,
                        jobType: assessment?.job_type || 'domestic',
                        customerPhone: assessment?.contact_phone,
                        tenant: assessment?.tenant || 'ireland',
                    }
                });
            } catch (emailErr) {
                console.error('Failed to send job live email:', emailErr);
            }

            toast.success(isSpanish ? '¡La certificación está activa y los certificadores han sido notificados!' : 'Assessment is now live and assessors have been notified!');
            fetchAssessments();
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || (isSpanish ? 'Error al enviar' : 'Failed to submit'));
        } finally {
            setSubmittingAssessmentId(null);
        }
    };

    const handleDeleteAssessment = async (id: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('delete-assessment', {
                body: { assessmentId: id }
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.error || 'Failed to delete job');

            toast.success(isSpanish ? 'Trabajo eliminado correctamente' : 'Job deleted successfully');
            fetchAssessments();
        } catch (error: any) {
            console.error('Delete assessment error:', error);
            toast.error(error.message || (isSpanish ? 'Error al eliminar el trabajo' : 'Failed to delete job'));
        } finally {
            setDeletingAssessmentId(null);
        }
    };

    const handleUpdateQuoteStatus = async (assessmentId: string, quoteId: string, newStatus: 'accepted' | 'rejected') => {
        try {
            if (newStatus === 'accepted') {
                // Fetch the quote to get the price and loyalty status
                const { data: quote, error: fetchError } = await supabase
                    .from('quotes')
                    .select('price, is_loyalty_payout')
                    .eq('id', quoteId)
                    .single();

                if (fetchError) throw fetchError;

                // Open Payment Modal with booking deposit (platform_fee + hidden_fee)
                const depositAmount = bookingDepositAmount;
                const balance = quote.price - platformFeeAmount; // Balance = assessor's net (quote minus platform fee), paid directly to them
                setPaymentQuote({ assessmentId, quoteId, amount: depositAmount, balance });
                setPaymentModalOpen(true);
                return;
            } else {
                const { error: quoteError } = await supabase
                    .from('quotes')
                    .update({ status: newStatus })
                    .eq('id', quoteId);

                if (quoteError) throw quoteError;
                toast.success(isSpanish ? 'Presupuesto rechazado' : 'Quote rejected');
            }
            fetchAssessments();
        } catch (error: any) {
            toast.error(error.message || (isSpanish ? 'La acción falló' : 'Action failed'));
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string, terms?: { termsAcceptedAt: string | null; expressExecutionRequested: boolean }) => {
        if (!paymentQuote) return;

        try {
            // 1. Record Payment in DB
            const { error: paymentError } = await supabase.from('payments').insert({
                amount: paymentQuote.amount,
                currency: getTenantCurrency(tenant).toLowerCase(),
                status: 'completed',
                assessment_id: paymentQuote.assessmentId,
                user_id: user?.id,
                stripe_payment_id: paymentIntentId
            });

            if (paymentError) {
                console.error('Payment recorded failed but stripe succeeded:', paymentError);
                toast.error(isSpanish ? 'Pago registrado con errores. Por favor, contacta con soporte.' : 'Payment recorded with errors. Please contact support.');
            }

            // 2. Finalize Quote Acceptance
            // Fetch the quote to get the contractor_id and price
            const { data: quote, error: fetchError } = await supabase
                .from('quotes')
                .select('created_by, price, assessment:assessments(job_type)')
                .eq('id', paymentQuote.quoteId)
                .single();

            if (fetchError) throw fetchError;

            const { error: quoteError } = await supabase
                .from('quotes')
                .update({
                    status: 'accepted',
                    ...(terms ? {
                        terms_accepted_at: terms.termsAcceptedAt,
                        express_execution_requested: terms.expressExecutionRequested,
                    } : {}),
                })
                .eq('id', paymentQuote.quoteId);

            if (quoteError) throw quoteError;

            const isCommercial = (quote as any)?.assessment?.job_type === 'commercial';
            const applicableFee = isCommercial ? commercialPlatformFeeAmount : platformFeeAmount;

            const { error: assessmentError } = await supabase
                .from('assessments')
                .update({
                    status: 'quote_accepted',
                    contractor_id: quote.created_by,
                    payment_status: 'paid',
                    contractor_payout: quote.price - applicableFee
                })
                .eq('id', paymentQuote.assessmentId);

            if (assessmentError) throw assessmentError;

            // Notify homeowner and contractor about the acceptance
            supabase.functions.invoke('send-acceptance-notification', {
                body: { assessmentId: paymentQuote.assessmentId, quoteId: paymentQuote.quoteId }
            }).catch(err => console.error('Failed to trigger acceptance notification:', err));

            toast.success(isSpanish ? '¡Pago exitoso! Presupuesto aceptado.' : 'Payment successful! Quote accepted.');
            setPaymentModalOpen(false);
            setPaymentQuote(null);
            fetchAssessments();

        } catch (error: any) {
            console.error('Error finalizing acceptance:', error);
            toast.error(isSpanish ? 'El pago tuvo éxito pero la actualización falló. Contacta con soporte.' : 'Payment succeeded but update failed. Contact support.');
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const getStatusStyles = (status: string, isExpired?: boolean) => {
        if (isExpired) return 'bg-red-50 text-red-700 border-red-100';
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'scheduled': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'quote_accepted': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'pending_quote': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'draft': return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans">
            <header className="bg-[#0c121d] backdrop-blur-md border-b border-white/5 sticky top-0 z-[9999] shadow-lg transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="relative flex-shrink-0">
                            <img src={logoUrl} alt={`${brandName} Logo`} className="h-10 w-auto relative z-10" />
                        </Link>
                        <div className="hidden xl:block">
                            <h1 className="text-lg font-bold text-white leading-tight">{isSpanish ? 'Mi Panel' : isPortuguese ? 'O Meu Painel' : 'My Dashboard'}</h1>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1.5 uppercase tracking-widest font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                {isSpanish ? 'Estado de Cuenta Activo' : isPortuguese ? 'Estado da Conta Ativo' : 'Active Account Status'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="bg-white/5 p-2.5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-2 text-white/70"
                            >
                                {isMenuOpen ? <X size={20} className="text-[#5CB85C]" /> : <Menu size={20} className="text-[#5CB85C]" />}
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] hidden sm:block">{isSpanish ? 'Menú' : isPortuguese ? 'Menu' : 'Menu'}</span>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="p-2 space-y-1 border-b border-gray-50 bg-gray-50/30">
                                        <div className="px-4 py-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSpanish ? 'Sesión iniciada como' : isPortuguese ? 'Sessão iniciada como' : 'Signed in as'}</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {[
                                            { id: 'assessments', label: isSpanish ? 'Mis Certificaciones' : isPortuguese ? 'Os Meus Certificados' : 'My Assessments', icon: Home },
                                            { id: 'quotes', label: isSpanish ? 'Mis Presupuestos' : isPortuguese ? 'Os Meus Orçamentos' : 'My Quotes', icon: FileText },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => { setView(item.id as any); setIsMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-200 ${view === item.id ? 'bg-[#5CB85C]/10 text-[#5CB85C]' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={16} />
                                                    {item.label}
                                                </div>
                                                {view === item.id && <div className="w-1.5 h-1.5 rounded-full bg-[#5CB85C]"></div>}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-2 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-1">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] text-red-500 hover:bg-red-50 flex items-center justify-between"
                                        >
                                            {t('sign_out')}
                                            <LogOut size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#007F00] rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">{isSpanish ? 'Cargando tus certificaciones...' : isPortuguese ? 'A carregar os seus certificados...' : isFrench ? 'Chargement de vos diagnostics...' : 'Loading your assessments...'}</p>
                    </div>
                ) : assessments.length === 0 ? (
                    /* Empty State Dashboard */
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-10 md:p-16 text-center">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#007F00]">
                                <User size={48} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">{isSpanish ? '¡Bienvenido de Nuevo!' : isPortuguese ? 'Bem-vindo de Volta!' : isFrench ? 'Bon Retour !' : 'Welcome Back!'}</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                                {isSpanish ? 'Este es tu panel personal. El seguimiento de tus certificaciones energéticas aparecerá aquí pronto.' : isPortuguese ? 'Este é o seu painel pessoal. O acompanhamento dos seus certificados energéticos aparecerá aqui em breve.' : isFrench ? 'Ceci est votre tableau de bord personnel. Le suivi de vos diagnostics apparaîtra ici prochainement.' : isEngland ? 'This is your personal dashboard. Tracking of your EPC assessments will appear here soon.' : 'This is your personal dashboard. Tracking of your BER assessments will appear here soon.'}
                            </p>

                            <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-8 text-left flex flex-col md:flex-row gap-6 items-center">
                                <div className="bg-white p-4 rounded-xl shadow-sm text-[#007F00] border border-gray-50">
                                    <FileText size={32} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{isSpanish ? 'No Hay Certificaciones Activas' : isPortuguese ? 'Sem Certificados Ativos' : isFrench ? 'Aucun Diagnostic Actif' : 'No Active Assessments'}</h4>
                                    <p className="text-gray-500 leading-relaxed">
                                        {isSpanish ? 'No tienes certificaciones energéticas pendientes. Contáctanos para solicitar una y mejorar la eficiencia energética de tu hogar.' : isPortuguese ? 'Não tem certificados energéticos pendentes. Contacte-nos para solicitar um e melhorar a eficiência energética da sua casa.' : isFrench ? "Vous n'avez aucun diagnostic en attente. Contactez-nous pour en planifier un et améliorer l'efficacité énergétique de votre maison." : isEngland ? "You don't have any pending EPC assessments. Contact us to schedule one and improve your home's energy efficiency." : "You don't have any pending BER assessments. Contact us to schedule one and improve your home's energy efficiency."}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/get-quote')}
                                className="mt-12 inline-flex items-center gap-2 bg-[#007F00] text-white px-8 py-4 rounded-full font-bold hover:bg-[#006600] transition-all shadow-lg shadow-green-100 hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isSpanish ? 'Solicitar una Certificación Energética' : isPortuguese ? 'Solicitar um Certificado Energético' : isFrench ? `Planifier un Diagnostic ${assessmentLabel}` : `Schedule a ${assessmentLabel} Assessment`}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Populated Dashboard */
                    <div className="w-full mx-auto">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                            <div className="px-8 py-10 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black text-gray-900 mb-2">
                                            {view === 'assessments' ? (isSpanish ? 'Mis Certificaciones Energéticas' : isPortuguese ? 'Os Meus Certificados Energéticos' : isFrench ? `Mes Diagnostics ${assessmentLabel}` : `My ${assessmentLabel} Assessments`) : (isSpanish ? 'Tus Presupuestos' : isPortuguese ? 'Os Seus Orçamentos' : isFrench ? `Vos Devis ${assessmentLabel}` : `Your ${assessmentLabel} Quotes`)}
                                        </h2>
                                        <p className="text-gray-500 font-medium max-w-2xl">
                                            {view === 'assessments' ? (isSpanish ? 'Sigue el progreso de tu certificación energética y consulta las evaluaciones programadas.' : isPortuguese ? 'Acompanhe o progresso da sua certificação energética e veja as avaliações agendadas.' : isFrench ? `Suivez le progrès de votre diagnostic et consultez les évaluations planifiées.` : `Track the progress of your property certification and view scheduled ${assessmentLabel.toLowerCase()} assessments.`) : (isSpanish ? 'Revisa y gestiona presupuestos de nuestros certificadores energéticos verificados.' : isPortuguese ? 'Revise e gerencie orçamentos dos nossos peritos qualificados verificados.' : isFrench ? `Examinez et gérez les devis de nos diagnostiqueurs certifiés.` : `Review and manage quotes from our verified professional ${assessmentLabel} Assessors.`)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/get-quote')}
                                        className="bg-[#007F00] text-white px-8 py-4 rounded-full font-bold hover:bg-[#006600] transition-all shadow-lg shadow-green-100 hover:shadow-green-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                                    >
                                        <Home size={20} />
                                        {isSpanish ? 'Nueva Certificación' : isPortuguese ? 'Novo Certificado' : isFrench ? `Nouveau ${assessmentLabel}` : `New ${assessmentLabel}`}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {view === 'assessments' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder={isSpanish ? 'Buscar por ciudad, comunidad autónoma, tipo o dirección...' : isPortuguese ? 'Pesquisar por cidade, região, tipo ou morada...' : isFrench ? 'Rechercher par ville, région, type ou adresse...' : 'Search by town, county, type, or address...'}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* ===== ALL BER ASSESSMENTS (Merged Table) ===== */}
                                {assessments.filter(a => {
                                    if (!searchQuery.trim()) return true;
                                    const q = searchQuery.toLowerCase();
                                    return (
                                        (a.town?.toLowerCase().includes(q)) ||
                                        (a.county?.toLowerCase().includes(q)) ||
                                        (a.property_type?.toLowerCase().includes(q)) ||
                                        (a.building_type?.toLowerCase().includes(q)) ||
                                        (a.property_address?.toLowerCase().includes(q)) ||
                                        (a.ber_purpose?.toLowerCase().includes(q)) ||
                                        (a.assessment_purpose?.toLowerCase().includes(q)) ||
                                        (a.heat_pump?.toLowerCase().includes(q))
                                    );
                                }).length > 0 && (
                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{isEngland ? 'All EPC Assessments' : isSpanish ? 'Todas las Certificaciones' : isPortuguese ? 'Todos os Certificados' : isFrench ? 'Tous les Diagnostics' : 'All BER Assessments'}</h3>
                                                <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{assessments.length}</span>
                                            </div>
                                            {/* Desktop Table View */}
                                            <div className="overflow-x-auto overflow-y-auto max-h-[600px] hidden md:block">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-200">
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Posted</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Type</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Town</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">County</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Building Type</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Floor Area</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Details</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Purpose</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Extra Info</th>
                                                            <th className="text-left py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Preferred Date</th>
                                                            <th className="text-right py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {assessments.filter(a => {
                                                            if (!searchQuery.trim()) return true;
                                                            const q = searchQuery.toLowerCase();
                                                            return (
                                                                (a.town?.toLowerCase().includes(q)) ||
                                                                (a.county?.toLowerCase().includes(q)) ||
                                                                (a.property_type?.toLowerCase().includes(q)) ||
                                                                (a.building_type?.toLowerCase().includes(q)) ||
                                                                (a.property_address?.toLowerCase().includes(q)) ||
                                                                (a.ber_purpose?.toLowerCase().includes(q)) ||
                                                                (a.assessment_purpose?.toLowerCase().includes(q)) ||
                                                                (a.heat_pump?.toLowerCase().includes(q))
                                                            );
                                                        }).map((assessment, index) => {
                                                            const isCommercial = assessment.job_type === 'commercial';
                                                            const hasPendingQuotes = !!(assessment.quotes && assessment.quotes.some(q => q.status === 'pending'));
                                                            return (
                                                                <tr
                                                                    key={assessment.id}
                                                                    className={`border-b border-gray-50 hover:bg-green-50/20 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'} ${hasPendingQuotes ? 'cursor-pointer' : ''}`}
                                                                    onClick={() => {
                                                                        if (hasPendingQuotes) {
                                                                            setFilteredAssessmentId(assessment.id);
                                                                            setView('quotes');
                                                                        }
                                                                    }}
                                                                >
                                                                    <td className="py-4 px-6">
                                                                        <div className="text-xs font-bold text-gray-400 whitespace-nowrap">
                                                                            {new Date(assessment.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' })}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6 whitespace-nowrap">
                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isCommercial ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                                            {isCommercial ? 'Commercial' : 'Domestic'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                                                                        <div className="flex items-center gap-2">
                                                                            {assessment.town}
                                                                            {assessment.quotes && assessment.quotes.some(q => q.status === 'pending') && (
                                                                                <span className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${isCommercial ? 'bg-purple-500 shadow-purple-200' : 'bg-green-500 shadow-green-200'}`} title="New Quote"></span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-600 font-medium whitespace-nowrap">
                                                                        {assessment.county}
                                                                    </td>
                                                                    <td className={`py-4 px-6 font-bold text-xs uppercase tracking-tight whitespace-nowrap ${isCommercial ? 'text-purple-700' : 'text-gray-400'}`}>
                                                                        {isCommercial ? (assessment.building_type || '-') : (assessment.property_type || '-')}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                                        {isCommercial ? (assessment.floor_area || '-') : (assessment.property_size || '-')}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                                        {isCommercial
                                                                            ? (assessment.building_complexity || '-')
                                                                            : (`${assessment.bedrooms || '-'} beds / ${assessment.heat_pump || 'No'} HP`)}
                                                                    </td>
                                                                    <td className="py-4 px-6">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${isCommercial ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                            {isCommercial ? (assessment.assessment_purpose || '-') : (assessment.ber_purpose || '-')}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-500 text-xs max-w-[150px] truncate" title={isCommercial ? assessment.existing_docs?.join(', ') : assessment.additional_features?.join(', ')}>
                                                                        {isCommercial
                                                                            ? (assessment.existing_docs?.join(', ') || '-')
                                                                            : (assessment.additional_features?.join(', ') || 'None')}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                                                                        {assessment.preferred_date || 'Flexible'}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                                                        <div className="flex justify-end items-center gap-3">
                                                                            {assessment.status === 'draft' ? (
                                                                                <button
                                                                                    onClick={() => handleSubmitAssessment(assessment.id)}
                                                                                    disabled={submittingAssessmentId === assessment.id}
                                                                                    className={`px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isCommercial ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#007F00] hover:bg-[#006600]'}`}
                                                                                >
                                                                                    {submittingAssessmentId === assessment.id ? (isSpanish ? 'Enviando...' : 'Submitting...') : (isSpanish ? 'Enviar' : 'Submit')}
                                                                                </button>
                                                                            ) : assessment.status === 'completed' && assessment.certificate_url ? (
                                                                                <a
                                                                                    href={assessment.certificate_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className={`px-4 py-2 border rounded-xl text-xs font-black transition-all ${isCommercial ? 'border-purple-100 text-purple-600 bg-purple-50/50 hover:bg-purple-600 hover:text-white' : 'border-green-100 text-[#007F00] bg-green-50/50 hover:bg-[#007F00] hover:text-white'}`}
                                                                                >
                                                                                    {isSpanish ? 'Ver Certificado' : 'View Certificate'}
                                                                                </a>
                                                                            ) : null}
                                                                            {assessment.status !== 'completed' && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setDeletingAssessmentId(assessment.id);
                                                                                    }}
                                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                                    title={isSpanish ? 'Eliminar Certificación' : 'Delete Assessment'}
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Card View - All Assessments */}
                                            <div className="md:hidden divide-y divide-gray-100">
                                                {assessments.filter(a => {
                                                    if (!searchQuery.trim()) return true;
                                                    const q = searchQuery.toLowerCase();
                                                    return (
                                                        (a.town?.toLowerCase().includes(q)) ||
                                                        (a.county?.toLowerCase().includes(q)) ||
                                                        (a.property_type?.toLowerCase().includes(q)) ||
                                                        (a.building_type?.toLowerCase().includes(q)) ||
                                                        (a.property_address?.toLowerCase().includes(q)) ||
                                                        (a.ber_purpose?.toLowerCase().includes(q)) ||
                                                        (a.assessment_purpose?.toLowerCase().includes(q)) ||
                                                        (a.heat_pump?.toLowerCase().includes(q))
                                                    );
                                                }).map((assessment) => {
                                                    const isCommercial = assessment.job_type === 'commercial';
                                                    const hasPendingQuotes = !!(assessment.quotes && assessment.quotes.some(q => q.status === 'pending'));
                                                    return (
                                                        <div
                                                            key={assessment.id}
                                                            className={`p-5 ${hasPendingQuotes ? 'cursor-pointer active:bg-green-50/40 transition-colors' : ''}`}
                                                            onClick={() => {
                                                                if (hasPendingQuotes) {
                                                                    setFilteredAssessmentId(assessment.id);
                                                                    setView('quotes');
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                            {new Date(assessment.created_at).toLocaleDateString()}
                                                                        </p>
                                                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${isCommercial ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                                            {isCommercial ? 'Commercial' : 'Domestic'}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="font-bold text-gray-900">{assessment.property_address}</h4>
                                                                    <p className="text-xs text-gray-500">{assessment.town}, {assessment.county}</p>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(assessment.status, assessment.isExpired)}`}>
                                                                    {getStatusLabel(assessment.status, assessment.isExpired)}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className={`text-xs font-bold px-2 py-1 rounded ${isCommercial ? 'text-purple-700 bg-purple-50' : 'text-gray-600 bg-gray-50'}`}>
                                                                    {isCommercial ? (assessment.building_type || '-') : (assessment.property_type || '-')}
                                                                </div>
                                                                {hasPendingQuotes && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setFilteredAssessmentId(assessment.id);
                                                                            setView('quotes');
                                                                        }}
                                                                        className={`text-[10px] font-black flex items-center gap-1 px-2 py-1 rounded-lg border ${isCommercial ? 'text-purple-600 border-purple-200 bg-purple-50' : 'text-[#007F00] border-green-200 bg-green-50'}`}
                                                                    >
                                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCommercial ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                                                        {isSpanish ? 'VER PRESUPUESTOS' : isPortuguese ? 'VER ORÇAMENTOS' : isFrench ? 'VOIR LES DEVIS' : 'VIEW QUOTES'}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {assessment.status === 'draft' ? (
                                                                <button
                                                                    onClick={() => handleSubmitAssessment(assessment.id)}
                                                                    className={`w-full py-3 text-white rounded-xl font-black text-xs transition-all mb-3 ${isCommercial ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#007F00] hover:bg-[#006600]'}`}
                                                                >
                                                                    {isSpanish ? 'Enviar' : 'Submit'}
                                                                </button>
                                                            ) : assessment.status === 'completed' && assessment.certificate_url ? (
                                                                <a
                                                                    href={assessment.certificate_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`w-full py-3 text-white rounded-xl font-black text-xs transition-all shadow-md mb-3 block text-center ${isCommercial ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-100' : 'bg-[#007F00] hover:bg-[#006600] shadow-green-100'}`}
                                                                >
                                                                    {isSpanish ? 'Ver Certificado' : 'View Certificate'}
                                                                </a>
                                                            ) : null}

                                                            {assessment.status !== 'completed' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDeletingAssessmentId(assessment.id);
                                                                    }}
                                                                    className="w-full py-3 border border-red-50 text-red-400 rounded-xl font-black text-xs hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    {isSpanish ? 'Eliminar Certificación' : 'Delete Assessment'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                            </div>

                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {(() => {
                                    const allQuotes = assessments.flatMap(a => (a.quotes || []).map(q => ({ ...q, assessment: a })))
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                                    if (allQuotes.length === 0) {
                                        return (
                                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                    <FileText size={32} />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{isSpanish ? 'Aún no hay presupuestos' : 'No quotes received yet'}</h3>
                                                <p className="text-gray-500 max-w-sm mx-auto">{isSpanish ? 'Cuando los certificadores revisen tus solicitudes, sus presupuestos aparecerán aquí.' : isEngland ? 'Once EPC Assessors review your submitted assessments, their quotes will appear here.' : 'Once BER Assessors review your submitted assessments, their quotes will appear here.'}</p>
                                            </div>
                                        );
                                    }

                                    // Group quotes by assessment
                                    const groupedQuotes = allQuotes.reduce((acc, q) => {
                                        const key = q.assessment.id;
                                        if (!acc[key]) acc[key] = { assessment: q.assessment, quotes: [] };
                                        acc[key].quotes.push(q);
                                        return acc;
                                    }, {} as Record<string, { assessment: Assessment, quotes: typeof allQuotes }>);

                                    const groupedArray = Object.values(groupedQuotes).sort((a, b) => {
                                        const aLatest = Math.max(...a.quotes.map(q => new Date(q.created_at).getTime()));
                                        const bLatest = Math.max(...b.quotes.map(q => new Date(q.created_at).getTime()));
                                        return bLatest - aLatest;
                                    });

                                    const displayedGroups = filteredAssessmentId
                                        ? groupedArray.filter(g => g.assessment.id === filteredAssessmentId)
                                        : groupedArray;
                                    const filteredAssessment = filteredAssessmentId
                                        ? assessments.find(a => a.id === filteredAssessmentId)
                                        : null;

                                    // Auto-expand when filtered
                                    const effectiveExpandedId = filteredAssessmentId || expandedAssessmentId;

                                    return (
                                        <>
                                            {/* BER Cert style banner */}
                                            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
                                                <p className="text-sm font-bold text-green-800">
                                                    {isSpanish ? 'Todos los presupuestos incluyen tasas y IVA (si aplica)' : isPortuguese ? 'Todos os orçamentos incluem taxas e IVA (se aplicável)' : isFrench ? 'Tous les devis incluent les frais et la TVA (le cas échéant)' : isEngland ? 'All quotes incl. fees & VAT (if applicable)' : 'All quotes incl. SEAI fees & VAT (if applicable)'}
                                                </p>
                                                <p className="text-sm font-medium text-green-700 mt-1">
                                                    {isSpanish ? 'Confirma tu reserva al instante abajo.' : isPortuguese ? 'Confirme a sua reserva instantaneamente abaixo.' : isFrench ? 'Confirmez instantanément votre réservation ci-dessous.' : 'Instantly confirm your booking below.'}
                                                </p>
                                            </div>
                                            {filteredAssessmentId && (
                                                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                            <Filter size={16} className="text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-green-800">
                                                                {isSpanish ? 'Presupuestos filtrados para:' : 'Quotes filtered for:'} {filteredAssessment?.property_address || filteredAssessment?.town || 'this job'}
                                                            </p>
                                                            <p className="text-xs text-green-600 font-medium">{displayedGroups[0]?.quotes.length || 0} {isSpanish ? 'presupuesto(s)' : 'quote(s)'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setFilteredAssessmentId(null)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-all border border-green-200"
                                                    >
                                                        <X size={14} />
                                                        {isSpanish ? 'Ver todos' : 'Clear filter'}
                                                    </button>
                                                </div>
                                            )}
                                            {displayedGroups.map(({ assessment, quotes }) => {
                                                const isExpanded = effectiveExpandedId === assessment.id;
                                                const pendingCount = quotes.filter(q => q.status === 'pending').length;
                                                const hasAccepted = quotes.some(q => q.status === 'accepted');
                                                const lowestPrice = Math.min(...quotes.map(q => q.price + hiddenFee));
                                                const isCommercial = assessment.job_type === 'commercial';

                                                return (
                                                    <div key={assessment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                        {/* Property Header Card - Clickable */}
                                                        <button
                                                            onClick={() => setExpandedAssessmentId(isExpanded ? null : assessment.id)}
                                                            className="w-full p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
                                                        >
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${hasAccepted ? 'bg-green-50' : pendingCount > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                                                                    <MapPin size={22} className={hasAccepted ? 'text-green-600' : pendingCount > 0 ? 'text-amber-500' : 'text-gray-400'} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h4 className="font-black text-gray-900 text-base truncate">{assessment.property_address || assessment.town || 'Property'}</h4>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-[10px] text-gray-500 font-medium">{assessment.town}{assessment.county ? `, ${assessment.county}` : ''}</span>
                                                                        {isCommercial && (
                                                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">Commercial</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-1.5">
                                                                        <span className="text-xs font-bold text-gray-900">
                                                                            {quotes.length} {isSpanish ? 'presupuesto(s)' : 'quote(s)'}
                                                                        </span>
                                                                        {pendingCount > 0 && (
                                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                                                                                {pendingCount} {isSpanish ? 'pendiente(s)' : 'pending'}
                                                                            </span>
                                                                        )}
                                                                        {hasAccepted && (
                                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                                                                                {isSpanish ? 'Aceptado' : 'Accepted'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                <div className="text-right hidden sm:block">
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isSpanish ? 'Desde' : 'From'}</p>
                                                                    <p className="text-lg font-black text-gray-900">{formatCurrency(lowestPrice)}</p>
                                                                </div>
                                                                <ChevronDown
                                                                    size={24}
                                                                    className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                                />
                                                            </div>
                                                        </button>

                                                        {/* Dropdown Content - Quotes for this property */}
                                                        {isExpanded && (
                                                            <div className="border-t border-gray-100 divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                {quotes.map((quote) => (
                                                                    <div key={quote.id} className="p-5">
                                                                        {/* Desktop layout */}
                                                                        <div className="hidden md:flex items-center justify-between gap-6">
                                                                            {/* Price */}
                                                                            <div className="flex-shrink-0">
                                                                                <div className="text-xl font-black text-gray-900">{formatCurrency(quote.price + hiddenFee)}</div>
                                                                                <div className="text-[10px] text-gray-500 font-medium">
                                                                                    {isSpanish ? 'Depósito: ' : 'Deposit: '}{formatCurrency(bookingDepositAmount)}{isSpanish ? ' | Saldo: ' : ' | Balance: '}{formatCurrency(quote.price - platformFeeAmount)}
                                                                                </div>
                                                                            </div>

                                                                            {/* Availability */}
                                                                            <div className="flex-shrink-0">
                                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isSpanish ? 'Disponibilidad' : 'Availability'}</p>
                                                                                <p className="text-sm text-gray-700 font-medium whitespace-nowrap">
                                                                                    {quote.estimated_date ? new Date(quote.estimated_date).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' }) : (isSpanish ? 'Por confirmar' : 'TBC')}
                                                                                </p>
                                                                            </div>

                                                                            {/* Assessor */}
                                                                            <div className="flex-shrink-0">
                                                                                {quote.contractor ? (
                                                                                    <div className="flex flex-col">
                                                                                        <span className="font-bold text-gray-700 text-sm">
                                                                                            {quote.status === 'accepted'
                                                                                                ? quote.contractor.full_name
                                                                                                : `Ref-${quote.id.slice(0, 4).toUpperCase()}`}
                                                                                        </span>
                                                                                        {quote.status === 'accepted' && (
                                                                                            <Link
                                                                                                to={`/profiles/${quote.created_by}`}
                                                                                                className="text-[10px] text-green-600 hover:text-green-700 font-bold hover:underline flex items-center gap-1"
                                                                                            >
                                                                                                <User size={10} />
                                                                                                {isSpanish ? 'Ver Perfil' : isPortuguese ? 'Ver Perfil' : isFrench ? 'Voir le Profil' : 'View Profile'}
                                                                                            </Link>
                                                                                        )}
                                                                                    </div>
                                                                                ) : <span className="text-gray-400">-</span>}
                                                                            </div>

                                                                            {/* Status / Actions */}
                                                                            <div className="flex-shrink-0 ml-auto">
                                                                                {quote.status === 'pending' ? (
                                                                                    (quote.assessment.quotes && quote.assessment.quotes.some(q => q.status === 'accepted')) ? (
                                                                                        <div className="flex flex-col items-end">
                                                                                            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                                                                                                {isSpanish ? 'Presupuesto Cerrado' : 'Quote Closed'}
                                                                                            </span>
                                                                                            <span className="mt-1 text-[9px] font-bold text-gray-500 italic">
                                                                                                {isSpanish ? 'Trabajo Adjudicado' : 'Job Awarded'}
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="flex justify-end gap-3">
                                                                                            <button
                                                                                                onClick={() => setConfirmReject({ assessmentId: quote.assessment_id || quote.assessment.id, quoteId: quote.id })}
                                                                                                className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                                                title={isSpanish ? 'Rechazar Presupuesto' : 'Reject Quote'}
                                                                                            >
                                                                                                <X size={18} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => setSelectedDetailsQuote(quote)}
                                                                                                className="px-6 py-2.5 bg-[#007F00] text-white rounded-lg font-black text-xs hover:bg-[#006600] transition-all shadow-sm active:scale-95 leading-tight text-center"
                                                                                            >
                                                                                                {isSpanish ? <>Aceptar<br />Presupuesto</> : <>Accept<br />Quote</>}
                                                                                            </button>
                                                                                        </div>
                                                                                    )
                                                                                ) : (
                                                                                    <div className="flex flex-col items-end">
                                                                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${quote.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                                                            {getQuoteStatusLabel(quote.status)}
                                                                                        </span>
                                                                                        <span className="mt-1 text-[9px] font-bold text-gray-400 italic">
                                                                                            {new Date(quote.created_at).toLocaleDateString()}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Mobile layout */}
                                                                        <div className="md:hidden">
                                                                            <div className="flex justify-between items-start mb-4">
                                                                                <div>
                                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{new Date(quote.created_at).toLocaleDateString()}</p>
                                                                                    <p className="text-xs text-gray-500 font-medium italic">
                                                                                        {isSpanish ? 'Lo antes posible:' : 'Earliest:'} {quote.estimated_date ? new Date(quote.estimated_date).toLocaleDateString() : (isSpanish ? 'Por confirmar' : 'TBC')}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="text-xl font-black text-gray-900">{formatCurrency(quote.price + hiddenFee)}</p>
                                                                                    <div className="text-[9px] text-gray-500 font-medium mt-0.5">
                                                                                        {isSpanish ? `Depósito: ${formatCurrency(bookingDepositAmount)} / Saldo: ` : `Deposit: ${formatCurrency(bookingDepositAmount)} / Balance: `}{formatCurrency(quote.price - platformFeeAmount)}
                                                                                    </div>
                                                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${quote.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                                        quote.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                                                                        }`}>
                                                                                        {getQuoteStatusLabel(quote.status)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            {quote.contractor && (
                                                                                <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                                                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-[#007F00] font-black text-xs shadow-sm border border-gray-100">
                                                                                        {quote.status === 'accepted' ? quote.contractor.full_name.charAt(0) : '#'}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-[10px] font-bold text-gray-900">
                                                                                            {quote.status === 'accepted'
                                                                                                ? quote.contractor.full_name
                                                                                                : `Ref-${quote.id.slice(0, 4).toUpperCase()}`}
                                                                                        </p>
                                                                                        {quote.status === 'accepted' && (
                                                                                            <Link
                                                                                                to={`/profiles/${quote.created_by}`}
                                                                                                className="text-[9px] text-green-600 hover:text-green-700 font-bold hover:underline flex items-center gap-1"
                                                                                            >
                                                                                                <User size={9} />
                                                                                                {isSpanish ? 'Ver Perfil' : isPortuguese ? 'Ver Perfil' : isFrench ? 'Voir le Profil' : 'View Profile'}
                                                                                            </Link>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {(() => {
                                                                                if (quote.status === 'pending') {
                                                                                    if (quote.assessment.status === 'quote_accepted') {
                                                                                        return (
                                                                                            <div className="text-center py-2 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 border border-gray-100">
                                                                                                {isSpanish ? 'Presupuesto Cerrado - Trabajo Adjudicado' : 'Quote Closed - Job Awarded'}
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                    return (
                                                                                        <div className="grid grid-cols-2 gap-3">
                                                                                            <button
                                                                                                onClick={() => setConfirmReject({ assessmentId: quote.assessment_id || quote.assessment.id, quoteId: quote.id })}
                                                                                                className="w-full py-3 border border-red-100 text-red-600 rounded-xl font-black text-xs hover:bg-red-50 transition-all"
                                                                                            >
                                                                                                {isSpanish ? 'Rechazar' : 'Reject'}
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => setSelectedDetailsQuote(quote)}
                                                                                                className="w-full py-3 bg-[#80FF80] text-white rounded-xl font-black text-xs hover:bg-[#66E666] transition-all shadow-md shadow-green-100"
                                                                                            >
                                                                                                {isSpanish ? 'Aceptar Presupuesto' : 'Accept Quote'}
                                                                                            </button>
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                                return (
                                                                                    <div className="text-center py-2 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-400">
                                                                                        {isSpanish ? 'Procesado el' : 'Processed on'} {new Date(quote.created_at).toLocaleDateString()}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {/* SEAI registered footer */}
                                                                <div className="py-3 flex items-center justify-center gap-2 bg-gray-50/50">
                                                                    <CheckCircle2 size={16} className="text-green-600" />
                                                                    <span className="text-xs font-medium text-gray-600">
                                                                        {isSpanish ? 'Todos los certificadores están registrados oficialmente' : isPortuguese ? 'Todos os peritos estão registados na ADENE' : isFrench ? 'Tous les diagnostiqueurs sont certifiés' : 'All assessors are SEAI registered'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}
            </main>


            {/* Quote Questionnaire Modal */}
            <QuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => {
                    setIsQuoteModalOpen(false);
                    fetchAssessments();
                }}
            />

            {/* Payment Modal */}
            {paymentModalOpen && paymentQuote && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    amount={paymentQuote.amount}
                    currency={getTenantCurrency(tenant).toLowerCase()}
                    onSuccess={handlePaymentSuccess}
                    metadata={{
                        assessmentId: paymentQuote.assessmentId,
                        quoteId: paymentQuote.quoteId,
                        userId: user?.id
                    }}
                    title="Secure Booking Deposit"
                    description={`Pay ${formatCurrency(bookingDepositAmount)} deposit to book your assessment. The remaining balance of ${formatCurrency(paymentQuote.balance)} will be payable directly to the assessor.`}
                />
            )}

            {/* Reject Confirmation Modal */}
            {confirmReject && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <AlertCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Reject Quote?</h3>
                            <p className="text-gray-500 font-medium mb-8">This action cannot be undone. You will need to wait for other BER Assessors to provide new quotes.</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        handleUpdateQuoteStatus(confirmReject.assessmentId, confirmReject.quoteId, 'rejected');
                                        setConfirmReject(null);
                                    }}
                                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                >
                                    {isSpanish ? 'Sí, Rechazar Presupuesto' : isPortuguese ? 'Sim, Rejeitar Orçamento' : isFrench ? 'Oui, Rejeter le Devis' : 'Yes, Reject Quote'}
                                </button>
                                <button
                                    onClick={() => setConfirmReject(null)}
                                    className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Details & Final Confirmation Modal */}
            {selectedDetailsQuote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200 border border-gray-100">
                        {/* Header */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-1">
                                {`Ref-${selectedDetailsQuote.id.slice(0, 4).toUpperCase()}`}
                            </h3>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-500 font-medium text-sm">Total Price</span>
                                <span className="text-gray-900 font-black text-lg">{formatCurrency(selectedDetailsQuote.price + hiddenFee)}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium">Assessor Fee</span>
                                <span className="text-gray-600 font-bold">{formatCurrency(selectedDetailsQuote.price - platformFeeAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium">Booking Deposit</span>
                                <span className="text-gray-600 font-bold">{formatCurrency(bookingDepositAmount)}</span>
                            </div>

                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">{isSpanish ? 'Fecha Disponible' : 'Earliest Availability'}</p>
                                <p className="text-lg font-black text-green-800">
                                    {selectedDetailsQuote.estimated_date
                                        ? new Date(selectedDetailsQuote.estimated_date).toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' })
                                        : (isSpanish ? 'Por confirmar' : 'TBC')}
                                </p>
                                {selectedDetailsQuote.estimated_date && (
                                    <p className="text-[10px] text-green-600 mt-1">{isSpanish ? 'El asesor está disponible desde esta fecha' : 'Assessor is available from this date onwards'}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium text-sm">SEAI Registered</span>
                                <span className="text-gray-900 font-black text-sm">Yes</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium text-sm">VAT Registered</span>
                                <span className="text-gray-900 font-black text-sm">{selectedDetailsQuote.contractor?.vat_registered ? 'Yes' : 'No'}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium text-sm">Professional Insurance</span>
                                <span className="text-gray-900 font-black text-sm">{selectedDetailsQuote.contractor?.insurance_holder ? 'Yes' : 'No'}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-10">
                            <button
                                onClick={() => setSelectedDetailsQuote(null)}
                                className="flex-1 py-3 bg-[#B0BEC5] text-white rounded-lg font-black text-sm hover:bg-[#90A4AE] transition-all shadow-sm active:scale-95"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const quote = selectedDetailsQuote;
                                    handleUpdateQuoteStatus(quote.assessment_id || (quote.assessment && quote.assessment.id), quote.id, 'accepted');
                                    setSelectedDetailsQuote(null);
                                }}
                                className="flex-[1.5] py-3 bg-[#007F00] text-white rounded-lg font-black text-sm hover:bg-[#006600]  transition-all shadow-sm active:scale-95"
                            >
                                Accept {formatCurrency(selectedDetailsQuote.price + hiddenFee)} Quote
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Assessment Confirmation Modal */}
            {deletingAssessmentId && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Job?</h3>
                            <p className="text-gray-500 font-medium mb-8 text-sm">Are you sure you want to delete this assessment? This action cannot be undone and will remove all associated quotes.</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleDeleteAssessment(deletingAssessmentId)}
                                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                >
                                    Yes, Delete Job
                                </button>
                                <button
                                    onClick={() => setDeletingAssessmentId(null)}
                                    className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
