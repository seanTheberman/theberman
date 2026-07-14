import { useEffect, useState, Fragment } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { getTenantEmail, getTenantFromDomain, formatCurrency } from '../lib/tenant';
import { supabase } from '../lib/supabase';

const tenant = getTenantFromDomain();
const isEngland = tenant === 'england';
const isSpanish = tenant === 'spain';
const isPortuguese = tenant === 'portugal';
const SHOW_LOYALTY_PROGRAM = false; // Hidden until further notice
const assessmentLabel = isEngland ? 'EPC' : isSpanish ? 'Certificado Energético' : isPortuguese ? 'Certificado Energético' : 'BER';
const assessorLabel = isEngland ? 'Domestic Energy Assessor' : isSpanish ? 'Certificador Energético' : isPortuguese ? 'Perito Certificado' : 'BER Assessor';
const regAuthority = isSpanish ? 'CEE CAT' : isEngland ? 'accredited' : isPortuguese ? 'ADENE' : 'SEAI';
const brandName = isEngland ? 'EPC Cert' : isSpanish ? 'Certificado Energético' : isPortuguese ? 'Certificado Energia' : 'The Berman';
const logoUrl = isPortuguese ? '/certificado-energia-logo.svg' : '/logo.svg';
import { LogOut, HardHat, ClipboardList, Clock, X, TrendingUp, Briefcase, Calendar, MapPin, ArrowRight, ArrowLeft, AlertTriangle, AlertCircle, Settings, MessageCircle, User, Menu, Plus, Search } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { DatePicker } from '../components/ui/DatePicker';
import { geocodeAddress } from '../lib/geocoding';
import { getCountiesForTenant } from '../lib/tenantData';

import toast from 'react-hot-toast';

// Purpose keyword helpers — support English, Spanish and Portuguese values stored in the database
const purposeIncludes = (value: string | undefined | null, englishKeyword: string) => {
    if (!value) return false;
    const v = value.toLowerCase();
    const map: Record<string, Record<string, string[]>> = {
        selling: { es: ['venta', 'vendiendo'], pt: ['venda', 'vender'] },
        letting: { es: ['alquiler', 'arriendo'], pt: ['arrendamento', 'alugar'] },
        mortgage: { es: ['hipoteca'], pt: ['crédito habitação', 'hipoteca'] },
        grant: { es: ['subvención'], pt: ['subvenção'] },
        compliance: { es: ['cumplimiento'], pt: ['conformidade'] },
        leasing: { es: ['arrendamiento'], pt: ['arrendamento', 'locação'] },
        funding: { es: ['financiación'], pt: ['financiamento'] },
    };
    const keywords = [englishKeyword, ...(map[englishKeyword]?.[isSpanish ? 'es' : isPortuguese ? 'pt' : ''] || [])];
    return keywords.some(k => v.includes(k.toLowerCase()));
};

interface Quote {
    id: string;
    price: number;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    assessment_id: string;
    lowestPrice?: number;
    assessment?: {
        id: string;
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
        property_address?: string;
        scheduled_date: string | null;
        completed_at?: string | null;
        user_id: string;
        status: 'live' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed' | 'expired';
        eircode?: string;
    };
    is_loyalty_payout?: boolean;
}

interface Assessment {
    id: string;
    property_address: string;
    town: string;
    county: string;
    property_type: string;
    status: 'live' | 'submitted' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed' | 'expired';
    created_at: string;
    scheduled_date: string | null;
    completed_at?: string | null;
    user_id: string;
    property_size: string;
    bedrooms: number;
    additional_features: string[];
    heat_pump: string;
    ber_purpose: string;
    preferred_date: string;
    preferred_time: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    certificate_url?: string;
    profiles?: {
        full_name: string;
    };
    quotes?: Quote[];
    payment_status?: string;
    eircode?: string;
    job_type?: string;
    building_type?: string;
    floor_area?: string;
    building_complexity?: string;
    assessment_purpose?: string;
    heating_cooling_systems?: string[];
    existing_docs?: string[];
    notes?: string;
    contractor_payout?: number;
}

const COUNTIES = getCountiesForTenant(tenant);

const ContractorDashboard = () => {
    const { t, isSpanish } = useTranslation();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const getStatusLabel = (status: string) => {
        if (isSpanish) {
            const map: Record<string, string> = {
                live: 'Activo',
                submitted: 'Enviado',
                pending_quote: 'Pendiente de Presupuesto',
                quote_accepted: 'Presupuesto Aceptado',
                scheduled: 'Programado',
                completed: 'Completado',
                draft: 'Borrador',
            };
            return map[status] || status;
        }
        if (isPortuguese) {
            const map: Record<string, string> = {
                live: 'Ativo',
                submitted: 'Enviado',
                pending_quote: 'Pendente de Orçamento',
                quote_accepted: 'Orçamento Aceite',
                scheduled: 'Agendado',
                completed: 'Concluído',
                draft: 'Rascunho',
            };
            return map[status] || status;
        }
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getQuoteStatusLabel = (status: string) => {
        if (isSpanish) {
            const map: Record<string, string> = {
                pending: 'Pendiente',
                accepted: 'Aceptado',
                rejected: 'Rechazado',
            };
            return map[status] || status;
        }
        if (isPortuguese) {
            const map: Record<string, string> = {
                pending: 'Pendente',
                accepted: 'Aceite',
                rejected: 'Rejeitado',
            };
            return map[status] || status;
        }
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const [view, setView] = useState<'available' | 'my_quotes' | 'active' | 'settings'>('available');
    const [profile, setProfile] = useState<any>(null);
    const [catalogueListing, setCatalogueListing] = useState<any>(null);
    const [availableJobs, setAvailableJobs] = useState<Assessment[]>([]);
    const [myQuotes, setMyQuotes] = useState<Quote[]>([]);
    const [activeJobs, setActiveJobs] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    // Date constants for restrictions
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [selectedJob, setSelectedJob] = useState<Assessment | null>(null);
    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [quotePrice, setQuotePrice] = useState('');
    const [quoteNotes, setQuoteNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNotifying, setIsNotifying] = useState(false);
    const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
    const [schedulingJob, setSchedulingJob] = useState<Assessment | null>(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [completingJob, setCompletingJob] = useState<Assessment | null>(null);

    // Auto-detect home county from address
    useEffect(() => {
        if (catalogueListing?.address) {
            const addressLower = catalogueListing.address.toLowerCase();
            const detectedCounty = COUNTIES.find(c => addressLower.includes(c.toLowerCase()));
            if (detectedCounty && detectedCounty !== profile?.home_county) {
                setProfile((prev: any) => ({ ...prev, home_county: detectedCounty }));
            }
        }
    }, [catalogueListing?.address]);
    const [certUrl, setCertUrl] = useState('');

    // Multi-step Quoting & Rejection States
    const [quoteStep, setQuoteStep] = useState<1 | 2 | 3 | 4>(1);
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
    const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState<string | null>(null);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');



    useEffect(() => {
        if (user) {
            fetchData();

            // Real-time updates
            const channel = supabase
                .channel('contractor-dashboard')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Profile Data (needed for location filtering)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .maybeSingle();

            if (!profileError && profileData) {
                setProfile({
                    ...profileData,
                    home_county: profileData.home_county || profileData.county || '',
                    preferred_counties: profileData.preferred_counties?.length
                        ? profileData.preferred_counties
                        : (profileData.county ? [profileData.county] : []),
                });
            }

            // 1b. Fetch Catalogue Listing Data
            const { data: listingData, error: listingError } = await supabase
                .from('catalogue_listings')
                .select('*')
                .eq('email', user?.email)
                .maybeSingle();

            if (!listingError && listingData) {
                setCatalogueListing(listingData);
            }

            // 2. Fetch Available Jobs (submitted status, no quote from this contractor yet)
            const contractorTenant = profileData?.tenant || 'ireland';
            const { data: jobs, error: jobsError } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    quotes (*)
                `)
                .eq('tenant', contractorTenant)
                .in('status', ['live', 'submitted', 'pending_quote'])
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            // Remove 5-day filter - allow assessors to see jobs immediately when posted
            const activeJobs = jobs || [];

            // 2. Fetch My Quotes with assessment details
            const { data: quotes, error: quotesError } = await supabase
                .from('quotes')
                .select(`
                    *,
                    assessment:assessment_id (
                        id,
                        town,
                        county,
                        property_type,
                        property_size,
                        bedrooms,
                        heat_pump,
                        ber_purpose,
                        additional_features,
                        preferred_date,
                        preferred_time,
                        created_at,
                        property_address,
                        eircode,
                        job_type,
                        building_type,
                        floor_area,
                        building_complexity,
                        assessment_purpose,
                        heating_cooling_systems,
                        existing_docs,
                        notes
                    )
                `)
                .eq('created_by', user?.id)
                .eq('tenant', contractorTenant)
                .order('created_at', { ascending: false });

            if (quotesError) throw quotesError;

            // Filter out duplicates (keep only the latest quote per assessment)
            const uniqueQuotesMap = new Map();
            quotes?.forEach(q => {
                if (!uniqueQuotesMap.has(q.assessment_id)) {
                    uniqueQuotesMap.set(q.assessment_id, q);
                }
            });

            // Filter out quotes for expired assessments (unless accepted) - remove 5-day limit
            const uniqueQuotes = Array.from(uniqueQuotesMap.values()).filter((q: any) => {
                if (q.status === 'accepted') return true;
                const createdAt = new Date(q.assessment?.created_at || q.created_at);
                const now = new Date();
                const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
                return diffInDays <= 30; // Increased to 30 days from 5 days
            });

            // 3. Fetch lowest quotes for these assessments
            const assessmentIds = uniqueQuotes.map(q => q.assessment_id);
            let enrichedQuotes = uniqueQuotes;

            if (assessmentIds.length > 0) {
                const { data: lowestQuotesData, error: rpcError } = await supabase
                    .rpc('get_assessment_lowest_quotes', { p_assessment_ids: assessmentIds });

                if (!rpcError && lowestQuotesData) {
                    const minPrices: Record<string, number> = {};
                    lowestQuotesData.forEach((item: any) => {
                        minPrices[item.assessment_id] = item.min_price;
                    });

                    enrichedQuotes = uniqueQuotes.map(q => ({
                        ...q,
                        lowestPrice: minPrices[q.assessment_id] || q.price
                    }));
                }
            }

            // 4. Update states
            setMyQuotes(enrichedQuotes);

            // Available jobs filtering:
            // 1. Exclude jobs already quoted for
            const quotedIds = new Set(quotes?.map(q => q.assessment_id) || []);
            let filteredAvailableJobs = activeJobs?.filter(j => !quotedIds.has(j.id)) || [];

            // 2. Apply location preference filtering if configured
            if (profileData?.preferred_counties && profileData.preferred_counties.length > 0) {
                filteredAvailableJobs = filteredAvailableJobs.filter(job =>
                    profileData.preferred_counties.includes(job.county)
                );
            }

            // 3. Apply Assessor Type filtering using explicit job_type field
            const assessorType = profileData?.assessor_type || '';
            const isDomesticAssessor = assessorType.includes('Domestic');
            const isCommercialAssessor = assessorType.includes('Commercial');

            filteredAvailableJobs = filteredAvailableJobs.filter(job => {
                const isCommercialJob = job.job_type === 'commercial';

                if (isCommercialJob) {
                    return isCommercialAssessor;
                } else {
                    return isDomesticAssessor;
                }
            });

            // 4. Filter out expired jobs — 7 days with no activity
            // Activity = quote submitted, buyer accepted/rejected, job scheduled
            filteredAvailableJobs = filteredAvailableJobs.filter(job => {
                const jobCreated = new Date(job.created_at).getTime();
                let lastActivity = jobCreated;

                // Check latest quote submission date
                if (job.quotes && job.quotes.length > 0) {
                    for (const q of job.quotes) {
                        const qDate = new Date(q.created_at).getTime();
                        if (qDate > lastActivity) lastActivity = qDate;
                    }
                    // Buyer action (accepted/rejected) counts as activity
                    const buyerActed = job.quotes.filter((q: any) => q.status === 'accepted' || q.status === 'rejected');
                    for (const q of buyerActed) {
                        const qDate = new Date(q.created_at).getTime();
                        if (qDate > lastActivity) lastActivity = qDate;
                    }
                }

                // Scheduled date = activity
                if (job.scheduled_date) {
                    const sd = new Date(job.scheduled_date).getTime();
                    if (sd > lastActivity) lastActivity = sd;
                }

                const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
                return daysSinceActivity < 7;
            });

            setAvailableJobs(filteredAvailableJobs);

            // Active jobs are those where contractor_id matches this contractor
            const { data: active, error: activeError } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    contact_name,
                    contact_email,
                    contact_phone,
                    certificate_url
                `)
                .eq('contractor_id', user?.id)
                .order('created_at', { ascending: false });

            if (activeError) throw activeError;

            // Map quotes to active jobs manually for reliability
            const activeWithQuotes = (active || []).map(job => ({
                ...job,
                quotes: quotes?.filter(q => q.assessment_id === job.id) || []
            }));

            setActiveJobs(activeWithQuotes);

        } catch (error: any) {
            console.error('Error fetching contractor data:', error);
            toast.error(isSpanish ? 'Error al cargar datos del panel' : isPortuguese ? 'Erro ao carregar dados do painel' : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const handleStartQuote = () => {
        setJobDetailsModalOpen(false);
        setQuoteModalOpen(true);
        setQuoteStep(1);
        setSelectedAvailabilityDate(null);
        setTermsAgreed(false);
        setQuotePrice('');
        setQuoteNotes('');
    };

    const handleReQuote = (quote: Quote) => {
        if (!quote.assessment) return;

        // Map Quote assessment data back to Assessment interface
        const jobData: Assessment = {
            id: quote.assessment_id,
            property_address: quote.assessment.property_address || '',
            town: quote.assessment.town,
            county: quote.assessment.county,
            property_type: quote.assessment.property_type,
            property_size: quote.assessment.property_size,
            bedrooms: quote.assessment.bedrooms,
            heat_pump: quote.assessment.heat_pump,
            ber_purpose: quote.assessment.ber_purpose,
            additional_features: quote.assessment.additional_features,
            created_at: quote.assessment.created_at,
            preferred_date: quote.assessment.preferred_date,
            preferred_time: quote.assessment.preferred_time || '',
            status: 'pending_quote', // Default status for quoting
            scheduled_date: quote.assessment.scheduled_date,
            completed_at: quote.assessment.completed_at,
            user_id: quote.assessment.user_id,
        };

        setSelectedJob(jobData);
        setQuoteModalOpen(true);
        setQuoteStep(1);
        setSelectedAvailabilityDate(null);
        setTermsAgreed(false);
        setQuotePrice('');
        setQuoteNotes('');
    };



    const handleSubmitQuote = async () => {
        if (!selectedJob || !quotePrice || isSubmitting) return;

        try {
            setIsSubmitting(true);

            // Expiry check: 7 days since last activity
            const notOpenStatus = !['live', 'submitted', 'pending_quote'].includes(selectedJob.status || '');
            let lastActivity = new Date(selectedJob.created_at).getTime();
            if (selectedJob.scheduled_date) {
                const sd = new Date(selectedJob.scheduled_date).getTime();
                if (sd > lastActivity) lastActivity = sd;
            }
            const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
            if (notOpenStatus || daysSince >= 7) {
                toast.error(isSpanish ? 'Este trabajo ha expirado y ya no acepta presupuestos.' : isPortuguese ? 'Este trabalho expirou e já não aceita orçamentos.' : 'This job has expired and is no longer accepting quotes.');
                setQuoteModalOpen(false);
                return;
            }

            const existingQuote = myQuotes.find(q => q.assessment_id === selectedJob.id);

            let error;
            if (existingQuote) {
                const { error: updateError } = await supabase
                    .from('quotes')
                    .update({
                        price: parseFloat(quotePrice),
                        notes: quoteNotes,
                        status: 'pending' // Reset status to pending on re-quote
                    })
                    .eq('id', existingQuote.id);
                error = updateError;
            } else {
                const isLoyaltyJob = (profile?.completed_jobs_count || 0) % 11 === 10;
                const { error: insertError } = await supabase.from('quotes').insert({
                    assessment_id: selectedJob.id,
                    price: parseFloat(quotePrice),
                    notes: quoteNotes,
                    created_by: user?.id,
                    status: 'pending',
                    is_loyalty_payout: isLoyaltyJob
                });
                error = insertError;
            }

            if (error) throw error;

            if (selectedJob.status === 'submitted') {
                await supabase
                    .from('assessments')
                    .update({ status: 'pending_quote' })
                    .eq('id', selectedJob.id);
            }

            // Notify homeowner about the new quote (guard against double send)
            if (!isNotifying) {
                setIsNotifying(true);
                supabase.functions.invoke('send-quote-notification', {
                    body: { assessmentId: selectedJob.id }
                }).catch(err => console.error('Failed to trigger homeowner notification:', err)).finally(() => setIsNotifying(false));
            }

            toast.success(isSpanish ? '¡Presupuesto enviado correctamente!' : isPortuguese ? 'Orçamento enviado com sucesso!' : 'Quote submitted successfully!');
            setQuoteModalOpen(false);
            setQuotePrice('');
            setQuoteNotes('');
            setSelectedJob(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || (isSpanish ? 'Error al enviar presupuesto' : isPortuguese ? 'Erro ao enviar orçamento' : 'Failed to submit quote'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectJob = async () => {
        if (!selectedJob || !rejectionReason || isSubmitting) return;

        try {
            setIsSubmitting(true);
            // Log rejection
            const { error } = await supabase.from('audit_logs').insert({
                user_id: user?.id,
                action: 'lead_rejected',
                details: {
                    assessment_id: selectedJob.id,
                    reason: rejectionReason,
                    address: selectedJob.property_address
                }
            });

            if (error) throw error;

            toast.success(isSpanish ? 'Solicitud rechazada. Ya no aparecerá en tu lista.' : isPortuguese ? 'Pedido rejeitado. Já não aparecerá na sua lista.' : 'Lead rejected. It will no longer appear in your list.');
            setRejectionModalOpen(false);
            setJobDetailsModalOpen(false);
            setRejectionReason('');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || (isSpanish ? 'Error al rechazar solicitud' : isPortuguese ? 'Erro ao rejeitar pedido' : 'Failed to reject lead'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (jobId: string, newStatus: string, extraData: any = {}) => {
        try {
            setIsSubmitting(true);

            // Fetch current job to check if it was already scheduled (for rescheduling notification)
            const { data: currentJob } = await supabase
                .from('assessments')
                .select('status, scheduled_date')
                .eq('id', jobId)
                .maybeSingle();

            const isRescheduled = newStatus === 'scheduled' && currentJob?.status === 'scheduled' && currentJob?.scheduled_date !== extraData.scheduled_date;

            const { error } = await supabase
                .from('assessments')
                .update({
                    status: newStatus,
                    ...extraData
                })
                .eq('id', jobId)
                .select();

            if (error) throw error;

            // Trigger notification
            if (newStatus === 'scheduled' || newStatus === 'completed') {
                supabase.functions.invoke('send-job-status-notification', {
                    body: {
                        assessmentId: jobId,
                        status: isRescheduled ? 'rescheduled' : newStatus,
                        details: {
                            inspectionDate: extraData.scheduled_date,
                            certificateUrl: extraData.certificate_url,
                            contractorName: profile?.full_name
                        }
                    }
                }).catch(err => console.error('Failed to trigger status notification:', err));
            }

            toast.success(isSpanish ? `Trabajo marcado como ${getStatusLabel(newStatus)}` : isPortuguese ? `Trabalho marcado como ${getStatusLabel(newStatus)}` : `Job marked as ${newStatus.replace('_', ' ')}`);
            setSchedulingJob(null);
            setCompletingJob(null);
            fetchData();
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error(error.message || (isSpanish ? 'Error al actualizar estado' : isPortuguese ? 'Erro ao atualizar estado' : 'Failed to update status'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const stats = {
        loyaltyJobs: profile?.completed_jobs_count || 0
    };

    // Suspended or Pending - show website-style page with navigation
    const isSuspended = profile?.stripe_payment_id === 'SUSPENDED';
    if (isSuspended || profile?.registration_status === 'pending') {
        const suspended = isSuspended;
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                {/* Site-style header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-[9999] shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                        <Link to="/" className="flex-shrink-0">
                            <img src={logoUrl} alt={`${brandName} Logo`} className="h-9 w-auto" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-[#007F00] transition-colors">Home</Link>
                            <Link to="/catalogue" className="text-sm font-medium text-gray-600 hover:text-[#007F00] transition-colors">Catalogue</Link>
                            <Link to="/news" className="text-sm font-medium text-gray-600 hover:text-[#007F00] transition-colors">News</Link>
                            <Link to="/contact-us" className="text-sm font-medium text-gray-600 hover:text-[#007F00] transition-colors">Contact</Link>
                        </nav>
                        <button
                            onClick={handleSignOut}
                            className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </header>

                <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
                    <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className={`h-2 ${suspended ? 'bg-red-500' : 'bg-[#007F00]'}`} />
                        <div className="p-10 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${suspended ? 'bg-red-50' : 'bg-green-50'}`}>
                                <AlertCircle size={40} className={`${suspended ? 'text-red-500' : 'text-[#007F00]'} animate-pulse`} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-3">
                                {suspended ? (isSpanish ? 'Cuenta Suspendida' : isPortuguese ? 'Conta Suspensa' : 'Account Suspended') : (isSpanish ? 'Cuenta Pendiente de Aprobación' : isPortuguese ? 'Conta Pendente de Aprovação' : 'Account Pending Approval')}
                            </h1>
                            <p className="text-gray-500 mb-2 font-medium leading-relaxed">
                                {suspended
                                    ? (isSpanish ? 'Tu cuenta ha sido suspendida por un administrador.' : isPortuguese ? 'A sua conta foi suspensa por um administrador.' : 'Your account has been suspended by an administrator.')
                                    : (isSpanish ? 'Tu perfil ha sido enviado y está esperando ser revisado por nuestro equipo.' : isPortuguese ? 'O seu perfil foi enviado e está à espera de revisão pela nossa equipa.' : 'Your profile has been submitted and is waiting to be reviewed by our team.')}
                            </p>
                            <p className="text-gray-400 text-sm mb-8">
                                {suspended
                                    ? (isSpanish ? 'Si crees que esto es un error, por favor contacta con nuestro equipo de soporte.' : isPortuguese ? 'Se acredita que isto é um erro, por favor contacte a nossa equipa de suporte.' : 'If you believe this is a mistake, please contact our support team.')
                                    : (isSpanish ? 'Una vez aprobado, tendrás acceso completo al Portal del Certificador.' : isPortuguese ? 'Uma vez aprovado, terá acesso completo ao Portal do Perito.' : 'Once approved, you will receive full access to the Assessor Portal.')}
                            </p>
                            <div className={`border rounded-xl p-4 mb-8 text-left ${suspended ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${suspended ? 'text-red-600' : 'text-[#007F00]'}`}>
                                    {suspended ? (isSpanish ? 'Cuenta suspendida' : isPortuguese ? 'Conta suspensa' : 'Suspended account') : (isSpanish ? 'Registrado como' : isPortuguese ? 'Registado como' : 'Registered as')}
                                </p>
                                <p className="text-sm font-semibold text-gray-800">{user?.user_metadata?.full_name || user?.email}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <p className="text-xs text-gray-400 mb-6">
                                {isSpanish ? '¿Preguntas? Contáctanos en' : isPortuguese ? 'Dúvidas? Contacte-nos em' : 'Questions? Contact us at'}{' '}
                                <a href={`mailto:${getTenantEmail(getTenantFromDomain())}`} className={`font-semibold hover:underline ${suspended ? 'text-red-500' : 'text-[#007F00]'}`}>
                                    {getTenantEmail(getTenantFromDomain())}
                                </a>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    to="/"
                                    className={`flex-1 py-3 px-6 text-white rounded-xl font-bold text-sm transition-colors text-center ${suspended ? 'bg-red-500 hover:bg-red-600' : 'bg-[#007F00] hover:bg-[#006600]'}`}
                                >
                                    {isSpanish ? 'Explorar Web' : isPortuguese ? 'Explorar Site' : 'Explore Website'}
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex-1 py-3 px-6 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                                >
                                    {t('sign_out')}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Nav */}
            <header className="bg-[#0c121d] backdrop-blur-md border-b border-white/5 sticky top-0 z-[9999] shadow-lg transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="relative flex-shrink-0">
                            <img src={logoUrl} alt={`${brandName} Logo`} className="h-10 w-auto relative z-10" />
                        </Link>
                        <div className="hidden xl:block">
                            <h1 className="text-lg font-bold text-white leading-tight">{isSpanish ? 'Portal del Certificador' : isPortuguese ? 'Portal do Perito' : 'Assessor Portal'}</h1>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1.5 uppercase tracking-widest font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                {isSpanish ? 'Red de Certificación Activa' : isPortuguese ? 'Rede de Certificação Ativa' : 'Live Assessment Network'}
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
                                            { id: 'available', label: isSpanish ? 'Trabajos Disponibles' : isPortuguese ? 'Trabalhos Disponíveis' : 'Available Jobs', icon: Briefcase },
                                            { id: 'my_quotes', label: isSpanish ? 'Mis Presupuestos' : isPortuguese ? 'Os Meus Orçamentos' : 'My Quotes', icon: ClipboardList },
                                            { id: 'active', label: isSpanish ? 'Mis Clientes' : isPortuguese ? 'Os Meus Clientes' : 'My Clients', icon: User },
                                            { id: 'settings', label: isSpanish ? 'Ajustes' : isPortuguese ? 'Configurações' : 'Settings', icon: Settings },
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

            <main className="w-full px-4 md:px-6 py-6">
                {/* Live Jobs Section - BerCert Style */}
                <div className="bg-white flex flex-col">
                    {/* Live Jobs Header - Green banner matching BerCert */}
                    <div className="bg-[#c8e6c9] py-6 px-6 text-center">
                        <h2 className="text-2xl font-bold italic text-gray-900 mb-1">
                            {view === 'available' ? (isSpanish ? 'Trabajos Activos' : isPortuguese ? 'Trabalhos Ativos' : 'Live Jobs') :
                                view === 'my_quotes' ? (isSpanish ? 'Mis Presupuestos Activos' : isPortuguese ? 'Os Meus Orçamentos Ativos' : 'My Active Quotes') :
                                    view === 'active' ? (isSpanish ? 'Mis Clientes' : isPortuguese ? 'Os Meus Clientes' : 'My Assessment Clients') :
                                        view === 'settings' ? (isSpanish ? 'Ajustes del Certificador' : isPortuguese ? 'Configurações do Perito' : 'Assessor Settings') : (isSpanish ? 'Panel' : isPortuguese ? 'Painel' : 'Dashboard')}
                        </h2>
                        {view === 'available' && (
                            <div className="text-sm italic text-gray-800">
                                <p>{availableJobs.length > 0
                                    ? (isSpanish ? 'Aún no has enviado un presupuesto para estos trabajos.' : isPortuguese ? 'Ainda não enviou um orçamento para estes trabalhos.' : 'You have not yet submitted a quote for these jobs.')
                                    : (isSpanish ? 'No hay trabajos disponibles ahora mismo.' : isPortuguese ? 'Não há trabalhos disponíveis de momento.' : 'No jobs available right now.')}</p>
                                <p>{availableJobs.length > 0
                                    ? (isSpanish ? 'Envía tu presupuesto a continuación.' : isPortuguese ? 'Envie o seu orçamento abaixo.' : 'Submit your quote below.')
                                    : (isSpanish ? 'Te notificaremos cuando lleguen nuevas solicitudes.' : isPortuguese ? 'Notificá-lo-emos quando chegarem novos pedidos.' : 'We\'ll notify you when new requests come in.')}</p>
                            </div>
                        )}
                        {view === 'my_quotes' && <p className="text-sm italic text-gray-800">{isSpanish ? 'Controla y gestiona los presupuestos que has enviado a los propietarios.' : isPortuguese ? 'Acompanhe e gira os orçamentos que enviou aos proprietários.' : 'Track and manage quotes you\'ve submitted to homeowners.'}</p>}
                        {view === 'active' && <p className="text-sm italic text-gray-800">{isSpanish ? 'Gestiona tu agenda de inspecciones actual y las comunicaciones con clientes.' : isPortuguese ? 'Gira a sua agenda de inspeções atual e as comunicações com clientes.' : 'Manage your current inspection schedule and client communications.'}</p>}
                        {view === 'settings' && <p className="text-sm italic text-gray-800">{isSpanish ? 'Configura tus preferencias de notificación y área de servicio.' : isPortuguese ? 'Configure as suas preferências de notificação e área de serviço.' : 'Configure your notification preferences and service area.'}</p>}
                    </div>

                    {/* Filters Row */}
                    {view === 'available' && availableJobs.length > 0 && (
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-3 items-center">
                            <div className="flex-1 relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder={isSpanish ? 'Buscar por ciudad, provincia, tipo, código postal...' : isPortuguese ? 'Pesquisar por cidade, distrito, tipo, código postal...' : 'Search by town, county, type, eircode...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#007EA7]"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <span className="px-3 py-1.5 bg-[#007EA7] text-white rounded text-xs font-bold">
                                    {isSpanish ? 'Todos' : isPortuguese ? 'Todos' : 'All'} ({availableJobs.length})
                                </span>
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                    {isSpanish ? 'Dom' : isPortuguese ? 'Dom' : 'Dom'} ({availableJobs.filter(j => j.job_type !== 'commercial').length})
                                </span>
                                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                    {isSpanish ? 'Com' : isPortuguese ? 'Com' : 'Comm'} ({availableJobs.filter(j => j.job_type === 'commercial').length})
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex-1">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-blue-50 border-t-[#007EA7] rounded-full animate-spin"></div>
                                <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">{isSpanish ? 'Actualizando Panel...' : isPortuguese ? 'A Atualizar Painel...' : 'Refreshing Dashboard...'}</p>
                            </div>
                        ) : view === 'available' ? (
                            availableJobs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <Briefcase size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{isSpanish ? 'No hay trabajos disponibles ahora mismo' : isPortuguese ? 'Não há trabalhos disponíveis de momento' : 'No jobs available right now'}</h3>
                                    <p className="text-gray-500 max-w-sm">{isSpanish ? 'Te notificaremos cuando los propietarios de tu zona envíen nuevas solicitudes de evaluación.' : isPortuguese ? 'Notificá-lo-emos quando os proprietários da sua área enviarem novos pedidos de avaliação.' : "We'll notify you when new assessment requests are submitted by homeowners in your area."}</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Excel-style Spreadsheet Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[13px] border-collapse">
                                            <thead>
                                                <tr className="border-b-2 border-gray-300">
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'Fecha' : isPortuguese ? 'Data' : 'Job'}<br/><span className="font-bold">{isSpanish ? 'Publicación' : isPortuguese ? 'Publicação' : 'Posted'}</span></th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'Ciudad' : isPortuguese ? 'Cidade' : 'Town'}</th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'C. Autónoma' : isPortuguese ? 'Distrito' : 'County'}</th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'Tipo' : isPortuguese ? 'Tipo' : 'Type'}</th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'm²' : isPortuguese ? 'm²' : 'Sq. Mt.'}</th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'Hab.' : isPortuguese ? 'Quartos' : 'Beds'}</th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'Bomba Calor' : isPortuguese ? 'Bomba Calor' : 'Heat Pump'}</th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'Finalidad' : isPortuguese ? 'Finalidade' : 'Purpose'}</th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'Añadidos' : isPortuguese ? 'Extras' : 'Addition'}</th>
                                                    <th className="text-left py-3 px-3 font-bold text-gray-800 whitespace-nowrap">{isSpanish ? 'Fecha' : isPortuguese ? 'Data' : 'Preferred'}<br/>{isSpanish ? 'Preferida' : isPortuguese ? 'Preferida' : 'Date'}</th>
                                                    <th className="py-3 px-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {availableJobs
                                                    .filter(job => {
                                                        if (!searchQuery.trim()) return true;
                                                        const s = searchQuery.toLowerCase();
                                                        return (
                                                            job.town?.toLowerCase().includes(s) ||
                                                            job.county?.toLowerCase().includes(s) ||
                                                            job.property_type?.toLowerCase().includes(s) ||
                                                            job.eircode?.toLowerCase().includes(s) ||
                                                            (job.ber_purpose || '')?.toLowerCase().includes(s) ||
                                                            (job.building_type || '')?.toLowerCase().includes(s)
                                                        );
                                                    })
                                                    .map((job) => (
                                                    <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                        <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                                                            {new Date(job.created_at).toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : 'en-IE', { day: '2-digit', month: 'short' })}
                                                        </td>
                                                        <td className="py-3 px-3 text-gray-900">{job.town}</td>
                                                        <td className="py-3 px-3 text-gray-700">{job.county}</td>
                                                        <td className="py-3 px-3 text-gray-700">{job.job_type === 'commercial' ? (job.building_type || (isSpanish ? 'Comercial' : isPortuguese ? 'Comercial' : 'Commercial')) : job.property_type}</td>
                                                        <td className="py-3 px-3 text-gray-700">{job.job_type === 'commercial' ? (job.floor_area || '-') : job.property_size}</td>
                                                        <td className="py-3 px-3 text-gray-700">{job.job_type === 'commercial' ? '-' : job.bedrooms}</td>
                                                        <td className="py-3 px-3 text-gray-700">{job.heat_pump || (isSpanish ? 'Ninguna' : isPortuguese ? 'Nenhuma' : 'None')}</td>
                                                        <td className="py-3 px-3 text-gray-700">{job.ber_purpose || job.assessment_purpose || '-'}</td>
                                                        <td className="py-3 px-3 text-gray-700">{job.additional_features?.length > 0 ? job.additional_features.join(', ') : (isSpanish ? 'Ninguna' : isPortuguese ? 'Nenhuma' : 'None')}</td>
                                                        <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{job.preferred_date || (isSpanish ? 'Flexible' : isPortuguese ? 'Flexível' : 'Flexible')}</td>
                                                        <td className="py-3 px-3">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedJob(job);
                                                                    handleStartQuote();
                                                                }}
                                                                className="px-4 py-1.5 bg-[#e8a838] hover:bg-[#d4962f] text-white rounded text-xs font-bold transition-colors"
                                                            >
                                                                {isSpanish ? 'Presupuestar' : isPortuguese ? 'Orçamentar' : 'Quote'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden space-y-3 p-4">
                                        {availableJobs
                                            .filter(job => {
                                                if (!searchQuery.trim()) return true;
                                                const s = searchQuery.toLowerCase();
                                                return (
                                                    job.town?.toLowerCase().includes(s) ||
                                                    job.county?.toLowerCase().includes(s) ||
                                                    job.property_type?.toLowerCase().includes(s) ||
                                                    job.eircode?.toLowerCase().includes(s)
                                                );
                                            })
                                            .map(job => (
                                            <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{job.town}, {job.county}</p>
                                                        <p className="text-xs text-gray-500">{job.job_type === 'commercial' ? (job.building_type || (isSpanish ? 'Comercial' : isPortuguese ? 'Comercial' : 'Commercial')) : job.property_type} {job.job_type !== 'commercial' && <>• {job.bedrooms} {isSpanish ? 'hab.' : isPortuguese ? 'quartos' : 'beds'}</>}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(job.created_at).toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : 'en-IE', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mb-3 text-[11px]">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.ber_purpose || '-'}</span>
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.heat_pump || (isSpanish ? 'Ninguna' : isPortuguese ? 'Nenhuma' : 'None')}</span>
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.preferred_date || (isSpanish ? 'Flexible' : isPortuguese ? 'Flexível' : 'Flexible')}</span>
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedJob(job); setJobDetailsModalOpen(true); }}
                                                    className="w-full py-2.5 bg-[#e8a838] hover:bg-[#d4962f] text-white rounded font-bold text-sm transition-colors"
                                                >
                                                    {isSpanish ? 'Presupuestar' : isPortuguese ? 'Orçamentar' : 'Quote'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ) : view === 'my_quotes' ? (
                            myQuotes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <ClipboardList size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{isSpanish ? 'Aún no has enviado presupuestos' : isPortuguese ? 'Ainda não enviou orçamentos' : "You haven't sent any quotes"}</h3>
                                    <p className="text-gray-500 max-w-sm">{isSpanish ? 'Toca en "Trabajos Disponibles" para encontrar propietarios que buscan evaluaciones de' : isPortuguese ? 'Clique em "Trabalhos Disponíveis" para encontrar proprietários à procura de avaliações de' : 'Tap on "Available Jobs" to find homeowners looking for'} {assessmentLabel.toLowerCase()}.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder={isSpanish ? 'Buscar por ciudad, provincia, tipo o código postal...' : isPortuguese ? 'Pesquisar por cidade, distrito, tipo ou código postal...' : 'Search by town, county, type, or eircode...'}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] transition-all shadow-sm"
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

                                    {/* ===== MERGED QUOTES TABLE (Domestic + Commercial) ===== */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        {/* Desktop Table View */}
                                        <div className="overflow-x-auto overflow-y-auto max-h-[500px] hidden md:block">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 z-10">
                                                    <tr className="bg-gray-50 border-b border-gray-200">
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Fecha' : isPortuguese ? 'Data' : 'Posted'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Tipo Trabajo' : isPortuguese ? 'Tipo Trabalho' : 'Job Type'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Ciudad' : isPortuguese ? 'Cidade' : 'Town'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'C. Autónoma' : isPortuguese ? 'Distrito' : 'County'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-blue-600 uppercase tracking-wider">{isSpanish ? 'Código Postal' : isPortuguese ? 'Código Postal' : 'Eircode'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Tipo / Edificio' : isPortuguese ? 'Tipo / Edifício' : 'Type / Building'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Tamaño / Área' : isPortuguese ? 'Área / Superfície' : 'Size / Area'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Hab. / Complejidad' : isPortuguese ? 'Quartos / Complexidade' : 'Beds / Complexity'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Bomba Calor / Sistemas' : isPortuguese ? 'Bomba Calor / Sistemas' : 'Heat Pump / Systems'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Finalidad' : isPortuguese ? 'Finalidade' : 'Purpose'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Estado' : isPortuguese ? 'Estado' : 'Status'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Fecha Inspección' : isPortuguese ? 'Data Inspeção' : 'Survey Date'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-900 uppercase tracking-wider">{isSpanish ? 'Presupuesto Mínimo' : isPortuguese ? 'Orçamento Mínimo' : 'Lowest Quote'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Mi Presupuesto' : isPortuguese ? 'O Meu Orçamento' : 'My Quote'}</th>
                                                        <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {myQuotes.filter(q => {
                                                        if (!searchQuery.trim()) return true;
                                                        const s = searchQuery.toLowerCase();
                                                        const a = (q as any).assessment;
                                                        return (
                                                            (a?.town?.toLowerCase().includes(s)) ||
                                                            (a?.county?.toLowerCase().includes(s)) ||
                                                            (a?.property_type?.toLowerCase().includes(s)) ||
                                                            (a?.building_type?.toLowerCase().includes(s)) ||
                                                            (a?.eircode?.toLowerCase().includes(s)) ||
                                                            (a?.ber_purpose?.toLowerCase().includes(s)) ||
                                                            (a?.assessment_purpose?.toLowerCase().includes(s))
                                                        );
                                                    }).map((quote, index) => {
                                                        const isCompetitive = !quote.lowestPrice || quote.price <= quote.lowestPrice;
                                                        const a = (quote as any).assessment;
                                                        const isCommercial = a?.job_type === 'commercial';
                                                        return (
                                                            <tr
                                                                key={quote.id}
                                                                className={`border-b border-gray-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                            >
                                                                <td className="py-3 px-3 text-gray-600 font-medium">
                                                                    {new Date(a?.created_at || quote.created_at).toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : 'en-IE', { day: '2-digit', month: 'short' })}
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isCommercial ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                                        {isCommercial ? (isSpanish ? 'Comercial' : isPortuguese ? 'Comercial' : 'Commercial') : (isSpanish ? 'Doméstico' : isPortuguese ? 'Doméstico' : 'Domestic')}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3 text-gray-900 font-bold">{a?.town || '-'}</td>
                                                                <td className="py-3 px-3 text-gray-600">{a?.county || '-'}</td>
                                                                <td className="py-3 px-3 text-blue-600 font-medium">{a?.eircode || '-'}</td>
                                                                {/* Type / Building */}
                                                                <td className="py-3 px-3 text-gray-600">
                                                                    {isCommercial ? (a?.building_type || '-') : (a?.property_type || '-')}
                                                                </td>
                                                                {/* Size / Area */}
                                                                <td className="py-3 px-3 text-gray-600">
                                                                    {isCommercial ? (a?.floor_area || '-') : (a?.property_size || '-')}
                                                                </td>
                                                                {/* Beds / Complexity */}
                                                                <td className="py-3 px-3 text-gray-600">
                                                                    {isCommercial ? (a?.building_complexity || '-') : (a?.bedrooms || '-')}
                                                                </td>
                                                                {/* Heat Pump / Systems */}
                                                                <td className="py-3 px-3 text-gray-600 text-xs">
                                                                    {isCommercial
                                                                        ? (a?.heating_cooling_systems?.length ? a.heating_cooling_systems.join(', ') : '-')
                                                                        : (a?.heat_pump || (isSpanish ? 'Ninguna' : isPortuguese ? 'Nenhuma' : 'None'))
                                                                    }
                                                                </td>
                                                                {/* Purpose */}
                                                                <td className="py-3 px-3">
                                                                    {isCommercial ? (
                                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${purposeIncludes(a?.assessment_purpose, 'compliance') ? 'bg-blue-100 text-blue-700' :
                                                                            purposeIncludes(a?.assessment_purpose, 'leasing') ? 'bg-amber-100 text-amber-700' :
                                                                                purposeIncludes(a?.assessment_purpose, 'selling') ? 'bg-purple-100 text-purple-700' :
                                                                                    'bg-gray-100 text-gray-600'
                                                                            }`}>
                                                                            {a?.assessment_purpose || '-'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${purposeIncludes(a?.ber_purpose, 'mortgage') ? 'bg-blue-100 text-blue-700' :
                                                                            purposeIncludes(a?.ber_purpose, 'grant') ? 'bg-green-100 text-green-700' :
                                                                                purposeIncludes(a?.ber_purpose, 'letting') ? 'bg-amber-100 text-amber-700' :
                                                                                    purposeIncludes(a?.ber_purpose, 'selling') ? 'bg-purple-100 text-purple-700' :
                                                                                        'bg-gray-100 text-gray-600'
                                                                            }`}>
                                                                            {a?.ber_purpose || '-'}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                                        quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                            'bg-amber-100 text-amber-700'
                                                                        }`}>
                                                                        {getQuoteStatusLabel(quote.status) || '-'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3 text-gray-600">{a?.preferred_date || (isSpanish ? 'Flexible' : isPortuguese ? 'Flexível' : 'Flexible')}</td>
                                                                <td className="py-3 px-3 text-gray-900 font-bold">{quote.lowestPrice != null ? formatCurrency(quote.lowestPrice) : '-'}</td>
                                                                <td className={`py-3 px-3 font-bold ${isCompetitive ? 'text-green-700' : 'text-red-600'}`}>
                                                                    {formatCurrency(quote.price)}
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <button
                                                                        onClick={() => handleReQuote(quote)}
                                                                        disabled={quote.status === 'accepted'}
                                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-bold transition-all"
                                                                    >
                                                                        {isSpanish ? 'Re-Presupuestar' : isPortuguese ? 'Re-Orçamentar' : 'Re-Quote'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden divide-y divide-gray-100">
                                            {myQuotes.filter(q => {
                                                if (!searchQuery.trim()) return true;
                                                const s = searchQuery.toLowerCase();
                                                const a = (q as any).assessment;
                                                return (
                                                    (a?.town?.toLowerCase().includes(s)) ||
                                                    (a?.county?.toLowerCase().includes(s)) ||
                                                    (a?.property_type?.toLowerCase().includes(s)) ||
                                                    (a?.building_type?.toLowerCase().includes(s)) ||
                                                    (a?.eircode?.toLowerCase().includes(s))
                                                );
                                            }).map(quote => {
                                                const a = (quote as any).assessment;
                                                const isCommercial = a?.job_type === 'commercial';
                                                return (
                                                    <div key={quote.id} className="p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <p className="font-bold text-gray-900">{a?.town || '-'}, {a?.county || '-'}</p>
                                                                <p className="text-[10px] text-blue-600 font-bold">{a?.eircode}</p>
                                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${isCommercial ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                                    {isCommercial ? (isSpanish ? 'Comercial' : isPortuguese ? 'Comercial' : 'Commercial') : (isSpanish ? 'Doméstico' : isPortuguese ? 'Doméstico' : 'Domestic')}
                                                                </span>
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${quote.status === 'accepted' ? 'bg-green-100 text-green-700' : quote.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {getQuoteStatusLabel(quote.status)}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                                            <div>
                                                                <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{isSpanish ? 'Tipo / Edificio' : isPortuguese ? 'Tipo / Edifício' : 'Type / Building'}</p>
                                                                <p className="text-gray-700 font-medium">{isCommercial ? (a?.building_type || '-') : (a?.property_type || '-')}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{isSpanish ? 'Tamaño / Área' : isPortuguese ? 'Área / Superfície' : 'Size / Area'}</p>
                                                                <p className="text-gray-700 font-medium">{isCommercial ? (a?.floor_area || '-') : (a?.property_size || '-')}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{isCommercial ? (isSpanish ? 'Complejidad' : isPortuguese ? 'Complexidade' : 'Complexity') : (isSpanish ? 'Habitaciones' : isPortuguese ? 'Quartos' : 'Bedrooms')}</p>
                                                                <p className="text-gray-700 font-medium">{isCommercial ? (a?.building_complexity || '-') : (a?.bedrooms || '-')}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{isCommercial ? (isSpanish ? 'Sistemas' : isPortuguese ? 'Sistemas' : 'Systems') : (isSpanish ? 'Bomba Calor' : isPortuguese ? 'Bomba Calor' : 'Heat Pump')}</p>
                                                                <p className="text-gray-700 font-medium">{isCommercial ? (a?.heating_cooling_systems?.length ? a.heating_cooling_systems.join(', ') : '-') : (a?.heat_pump || (isSpanish ? 'Ninguna' : isPortuguese ? 'Nenhuma' : 'None'))}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{isSpanish ? 'Finalidad' : isPortuguese ? 'Finalidade' : 'Purpose'}</p>
                                                                <p className="text-gray-700 font-medium">{isCommercial ? (a?.assessment_purpose || '-') : (a?.ber_purpose || '-')}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{isSpanish ? 'Fecha Inspección' : isPortuguese ? 'Data Inspeção' : 'Survey Date'}</p>
                                                                <p className="text-gray-700 font-medium">{a?.preferred_date || (isSpanish ? 'Flexible' : isPortuguese ? 'Flexível' : 'Flexible')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isSpanish ? 'Presupuesto Mínimo' : isPortuguese ? 'Orçamento Mínimo' : 'Lowest Quote'}</p>
                                                                <p className="text-lg font-bold text-[#8B0000]">{quote.lowestPrice != null ? formatCurrency(quote.lowestPrice) : '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{isSpanish ? 'Mi Presupuesto' : isPortuguese ? 'O Meu Orçamento' : 'My Quote'}</p>
                                                                <p className="text-lg font-bold text-green-700">{formatCurrency(quote.price)}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleReQuote(quote)}
                                                            disabled={quote.status === 'accepted'}
                                                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                        >
                                                            {isSpanish ? 'Re-Presupuestar' : isPortuguese ? 'Re-Orçamentar' : 'Re-Quote'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : view === 'active' ? (
                            activeJobs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                        <HardHat size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{isSpanish ? 'No hay trabajos activos' : isPortuguese ? 'Não há trabalhos ativos' : 'No active jobs'}</h3>
                                    <p className="text-gray-500 max-w-sm">{isSpanish ? 'Cuando un propietario acepte tu presupuesto, el trabajo aparecerá aquí para que lo gestiones.' : isPortuguese ? 'Quando um proprietário aceitar o seu orçamento, o trabalho aparecerá aqui para o gerir.' : 'When a homeowner accepts your quote, the job will appear here for you to manage.'}</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Header */}
                                    {/* <div className="bg-[#007EA7] text-white p-6 rounded-xl text-center">
                                        <h2 className="text-xl font-bold mb-1">My Clients</h2>
                                        <p className="text-sm text-white/80">Here's your successful quotes on theberman.eu. Please contact <span className="text-yellow-300">your clients</span> within one business day.</p>
                                    </div> */}

                                    {/* Desktop Table View */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm hidden md:table">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Fecha Aceptado' : isPortuguese ? 'Data Aceite' : 'Date Accepted'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Trabajo' : isPortuguese ? 'Trabalho' : 'Job'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Ciudad' : isPortuguese ? 'Cidade' : 'Town'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'C. Autónoma' : isPortuguese ? 'Distrito' : 'County'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-blue-600 uppercase tracking-wider">{isSpanish ? 'Código Postal' : isPortuguese ? 'Código Postal' : 'Eircode'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Tipo' : isPortuguese ? 'Tipo' : 'Type'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'm²' : isPortuguese ? 'm²' : 'Sq. Mt.'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Hab.' : isPortuguese ? 'Quartos' : 'Beds'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Bomba Calor' : isPortuguese ? 'Bomba Calor' : 'Heat Pump'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Finalidad' : isPortuguese ? 'Finalidade' : 'Purpose'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Estado' : isPortuguese ? 'Estado' : 'Status'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Pagado' : isPortuguese ? 'Pago' : 'Paid'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Añadidos' : isPortuguese ? 'Extras' : 'Addition'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Fecha Inspección' : isPortuguese ? 'Data Inspeção' : 'Survey Date'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Contacto' : isPortuguese ? 'Contacto' : 'Contact'}</th>
                                                    <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{isSpanish ? 'Pago' : isPortuguese ? 'Pagamento' : 'Payout'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeJobs.map((job, index) => (
                                                    <Fragment key={job.id}>
                                                        <tr
                                                            key={job.id}
                                                            className={`border-b border-gray-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                                        >
                                                            <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">
                                                                {new Date(job.created_at).toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : 'en-IE', { day: '2-digit', month: 'short' })}
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${job.job_type === 'commercial' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                    {job.job_type === 'commercial' ? (isSpanish ? 'Com' : isPortuguese ? 'Com' : 'Comm') : (isSpanish ? 'Dom' : isPortuguese ? 'Dom' : 'Dom')}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-900 font-bold">{job.town}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.county}</td>
                                                            <td className="py-3 px-3">
                                                                <span className="text-blue-600 font-medium">
                                                                    {job.eircode || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600">{job.job_type === 'commercial' ? (job.building_type || '-') : job.property_type}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.job_type === 'commercial' ? (job.floor_area || '-') : job.property_size}</td>
                                                            <td className="py-3 px-3 text-gray-600 font-bold">{job.job_type === 'commercial' ? '-' : job.bedrooms}</td>
                                                            <td className="py-3 px-3 text-gray-600">{job.heat_pump || 'None'}</td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${purposeIncludes(job.ber_purpose || job.assessment_purpose, 'mortgage') ? 'bg-blue-100 text-blue-700' :
                                                                    purposeIncludes(job.ber_purpose || job.assessment_purpose, 'grant') || purposeIncludes(job.ber_purpose || job.assessment_purpose, 'funding') ? 'bg-green-100 text-green-700' :
                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {job.ber_purpose || job.assessment_purpose || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${job.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                                                    job.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-green-100 text-green-700'
                                                                    }`}>
                                                                    {getStatusLabel(job.status) || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${job.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                    'bg-orange-100 text-orange-700'
                                                                    }`}>
                                                                    {job.payment_status || (isSpanish ? 'Impagado' : isPortuguese ? 'Não pago' : 'Unpaid')}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600 text-xs italic">
                                                                {job.additional_features?.length ? job.additional_features.join(', ') : (isSpanish ? 'Ninguna' : isPortuguese ? 'Nenhuma' : 'None')}
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-600 font-bold">
                                                                {job.scheduled_date
                                                                    ? new Date(job.scheduled_date).toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : 'en-IE', { day: '2-digit', month: 'short' })
                                                                    : (isSpanish ? 'Pendiente' : isPortuguese ? 'Por definir' : 'TBD')
                                                                }
                                                            </td>
                                                            <td className="py-3 px-3 flex flex-col gap-1">
                                                                <button
                                                                    onClick={() => setExpandedContactId(expandedContactId === job.id ? null : job.id)}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-black uppercase transition-all whitespace-nowrap"
                                                                >
                                                                    {isSpanish ? 'Info Contacto' : isPortuguese ? 'Info Contacto' : 'Contact Info'}
                                                                </button>
                                                                {job.status === 'quote_accepted' && (
                                                                    <button
                                                                        onClick={() => setSchedulingJob(job)}
                                                                        className="px-3 py-1.5 bg-[#007EA7] hover:bg-[#005F7E] text-white rounded text-[10px] font-black uppercase transition-all whitespace-nowrap"
                                                                    >
                                                                        {isSpanish ? 'Programar' : isPortuguese ? 'Agendar' : 'Schedule'}
                                                                    </button>
                                                                )}
                                                                {job.status === 'scheduled' && (
                                                                    <div className="flex flex-col gap-1">
                                                                        <button
                                                                            onClick={() => setCompletingJob(job)}
                                                                            className="px-3 py-1.5 bg-[#007F00] hover:bg-green-800 text-white rounded text-[10px] font-black uppercase transition-all whitespace-nowrap"
                                                                        >
                                                                            {isSpanish ? 'Completar' : isPortuguese ? 'Concluir' : 'Complete'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setSchedulingJob(job)}
                                                                            className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-[10px] font-black uppercase transition-all whitespace-nowrap"
                                                                        >
                                                                            {isSpanish ? 'Reprogramar' : isPortuguese ? 'Reagendar' : 'Reschedule'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-3 text-green-700 font-bold">
                                                                {formatCurrency(job.contractor_payout || job.quotes?.find((q: any) => q.status === 'accepted')?.price || job.quotes?.[0]?.price)}
                                                            </td>

                                                        </tr>
                                                        {/* Expandable Contact Details Row */}
                                                        {expandedContactId === job.id && (
                                                            <tr key={`${job.id}-contact`} className="bg-green-50 border-b border-gray-100">
                                                                <td colSpan={15} className="py-3 px-6">
                                                                    <div className="flex items-center gap-6 text-sm">
                                                                        <span className="text-gray-400">↳</span>
                                                                        <span><strong>{isSpanish ? 'Nombre:' : isPortuguese ? 'Nome:' : 'Name:'}</strong> {job.contact_name || job.profiles?.full_name || 'N/A'}</span>
                                                                        <span><strong>{isSpanish ? 'Email:' : isPortuguese ? 'Email:' : 'Email:'}</strong> <a href={`mailto:${job.contact_email}`} className="text-blue-600 hover:underline">{job.contact_email || 'N/A'}</a></span>
                                                                        <span><strong>{isSpanish ? 'Teléfono:' : isPortuguese ? 'Telefone:' : 'Phone:'}</strong> <a href={`tel:${job.contact_phone}`} className="text-blue-600 hover:underline">{job.contact_phone || 'N/A'}</a></span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="md:hidden space-y-4">
                                            {activeJobs.map(job => (
                                                <div key={job.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                    {isSpanish ? 'Aceptado el' : isPortuguese ? 'Aceite em' : 'Accepted'} {new Date(job.created_at).toLocaleDateString()}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${job.status === 'completed' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                                    job.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                        'bg-green-50 text-green-700 border-green-100'
                                                                    }`}>
                                                                    {getStatusLabel(job.status) || '-'}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${job.job_type === 'commercial' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                                    {job.job_type === 'commercial' ? (isSpanish ? 'Com' : isPortuguese ? 'Com' : 'Comm') : (isSpanish ? 'Dom' : isPortuguese ? 'Dom' : 'Dom')}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-bold text-gray-900">{job.property_address}</h4>
                                                            <p className="text-xs text-gray-500">{job.town}, {job.county}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-green-700">
                                                                {formatCurrency(job.contractor_payout || job.quotes?.find((q: any) => q.status === 'accepted')?.price || job.quotes?.[0]?.price)}
                                                            </p>
                                                            <p className="text-[10px] font-extrabold text-orange-600 uppercase">
                                                                {job.payment_status || 'Unpaid'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 mt-4">
                                                        <button
                                                            onClick={() => setExpandedContactId(expandedContactId === job.id ? null : job.id)}
                                                            className="w-full py-3 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all uppercase tracking-tight"
                                                        >
                                                            {expandedContactId === job.id ? (isSpanish ? 'Cerrar Detalles Contacto' : isPortuguese ? 'Fechar Detalhes de Contacto' : 'Close Contact Details') : (isSpanish ? 'Ver Detalles Contacto' : isPortuguese ? 'Ver Detalhes de Contacto' : 'View Contact Details')}
                                                        </button>

                                                        {job.status === 'quote_accepted' && (
                                                            <button
                                                                onClick={() => setSchedulingJob(job)}
                                                                className="w-full py-3 bg-[#007EA7] text-white rounded-xl font-black text-xs hover:bg-[#005F7E] transition-all uppercase tracking-tight shadow-md shadow-blue-50"
                                                            >
                                                                {isSpanish ? 'Programar Inspección' : isPortuguese ? 'Agendar Inspeção' : 'Schedule Inspection'}
                                                            </button>
                                                        )}

                                                        {job.status === 'scheduled' && (
                                                            <>
                                                                <button
                                                                    onClick={() => setCompletingJob(job)}
                                                                    className="w-full py-3 bg-[#007F00] text-white rounded-xl font-black text-xs hover:bg-green-800 transition-all uppercase tracking-tight shadow-md shadow-green-50"
                                                                >
                                                                    {isSpanish ? 'Marcar Completado' : isPortuguese ? 'Marcar como Concluído' : 'Mark Complete'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setSchedulingJob(job)}
                                                                    className="w-full py-2 bg-gray-500 text-white rounded-xl font-bold text-[10px] hover:bg-gray-600 transition-all uppercase tracking-widest"
                                                                >
                                                                    {isSpanish ? 'Reprogramar' : isPortuguese ? 'Reagendar' : 'Reschedule'}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Mobile Expandable Contact Info */}
                                                    {expandedContactId === job.id && (
                                                        <div className="mt-4 pt-4 border-t border-gray-50 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">{isSpanish ? 'Nombre:' : isPortuguese ? 'Nome:' : 'Name:'}</span>
                                                                <span className="font-bold text-gray-900">{job.contact_name || job.profiles?.full_name || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">{isSpanish ? 'Email:' : isPortuguese ? 'Email:' : 'Email:'}</span>
                                                                <a href={`mailto:${job.contact_email}`} className="font-bold text-blue-600 underline">{job.contact_email || 'N/A'}</a>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">{isSpanish ? 'Teléfono:' : isPortuguese ? 'Telefone:' : 'Phone:'}</span>
                                                                <a href={`tel:${job.contact_phone}`} className="font-bold text-blue-600 underline">{job.contact_phone || 'N/A'}</a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : view === 'settings' ? (
                            <div className="animate-in fade-in duration-700 bg-gray-100 min-h-screen pb-20">
                                {SHOW_LOYALTY_PROGRAM && (
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 md:rounded-3xl p-8 text-white shadow-xl relative overflow-hidden md:m-6 md:mt-6">
                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex-1 text-center md:text-left">
                                                <h2 className="text-2xl font-black mb-2 flex items-center justify-center md:justify-start gap-2">
                                                    <TrendingUp className="text-blue-200" />
                                                    {isSpanish ? 'Programa de Fidelidad del Certificador' : isPortuguese ? 'Programa de Fidelidade do Perito' : 'Assessor Loyalty Program'}
                                                </h2>
                                                <p className="text-blue-100 font-medium">
                                                    {isSpanish ? 'Completa 10 evaluaciones y la tasa de plataforma del 11º trabajo va por nuestra cuenta.' : isPortuguese ? 'Conclua 10 avaliações e a taxa de plataforma do 11º trabalho é por nossa conta.' : 'Complete 10 assessments and your 11th job\'s platform fee is on us!'}
                                                    <span className="block text-sm text-blue-200 opacity-80 mt-1">{isSpanish ? 'Mantén un seguimiento de tu progreso hacia tu próximo trabajo gratuito.' : isPortuguese ? 'Acompanhe o seu progresso em direção ao próximo trabalho gratuito.' : 'Keep track of your progress toward your next free job.'}</span>
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[200px] w-full md:w-auto">
                                                <div className="text-4xl font-black mb-1">{(stats.loyaltyJobs % 11) > 10 ? 0 : (stats.loyaltyJobs % 11)}/10</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">{isSpanish ? 'Trabajos hacia tarifa gratis' : isPortuguese ? 'Trabalhos até isenção de taxa' : 'Jobs toward fee-free'}</div>
                                                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-green-400 h-full transition-all duration-1000"
                                                        style={{ width: `${Math.min((stats.loyaltyJobs % 11) * 10, 100)}%` }}
                                                    ></div>
                                                </div>
                                                {stats.loyaltyJobs % 11 === 10 && (
                                                    <div className="mt-3 text-[10px] font-black bg-green-500 text-white px-3 py-1 rounded-full animate-bounce">
                                                    {isSpanish ? '¡PRÓXIMO TRABAJO GRATIS!' : isPortuguese ? 'PRÓXIMO TRABALHO GRÁTIS!' : 'NEXT JOB IS FREE!'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Decorative Background Elements */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
                                    </div>
                                )}
                                {/* SMS Notifications Banner */}
                                <div className="bg-[#E6F4EA] border-b border-gray-200 py-12 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <h2 className="text-xl font-medium text-green-800">{isSpanish ? 'Notificaciones SMS' : isPortuguese ? 'Notificações SMS' : 'SMS Notifications'}</h2>
                                        <MessageCircle className="text-green-800 fill-green-800" size={24} />
                                    </div>
                                    <p className="text-sm text-green-700">
                                        {isSpanish ? 'Actualmente estás recibiendo notificaciones de trabajos por SMS en' : isPortuguese ? 'Está atualmente a receber notificações de trabalhos por SMS em'} <span className="font-bold underline">{profile?.phone}</span>.
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase
                                                    .from('profiles')
                                                    .update({ sms_notifications_enabled: !profile?.sms_notifications_enabled })
                                                    .eq('id', user?.id);
                                                if (error) toast.error(isSpanish ? 'Error al actualizar notificaciones' : isPortuguese ? 'Erro ao atualizar notificações' : 'Failed to update notifications');
                                                else {
                                                    setProfile({ ...profile, sms_notifications_enabled: !profile?.sms_notifications_enabled });
                                                    toast.success(isSpanish ? 'Ajustes de notificación actualizados' : isPortuguese ? 'Definições de notificação atualizadas' : 'Notification settings updated');
                                                }
                                            }}
                                            className="ml-1 underline hover:text-green-900"
                                        >
                                            {profile?.sms_notifications_enabled ? (isSpanish ? 'Cancelar Notificaciones SMS' : isPortuguese ? 'Cancelar Notificações SMS' : 'Cancel SMS Notifications') : (isSpanish ? 'Activar Notificaciones SMS' : isPortuguese ? 'Ativar Notificações SMS' : 'Enable SMS Notifications')}
                                        </button>
                                    </p>
                                </div>

                                {/* County Preferences */}
                                <div className="py-12 px-4 text-center">
                                    <h3 className="text-gray-600 font-medium mb-8 flex items-center justify-center gap-2 text-lg">
                                        {isSpanish ? 'Áreas de Servicio / Provincias' : isPortuguese ? 'Áreas de Serviço / Distritos'} <span className="text-red-500">*</span> <MapPin className="text-gray-700 fill-gray-700" size={24} />
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6">{isSpanish ? 'Selecciona tu ubicación preferida donde quieres recibir notificaciones de trabajos. Debes seleccionar al menos una.' : isPortuguese ? 'Selecione a sua localização preferida onde quer receber notificações de trabalhos. Deve selecionar pelo menos uma.' : 'Select your Preference location where you want to receive job notifications. You must select at least one.'}</p>
                                    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 px-4">
                                        {COUNTIES.map(county => {
                                            const isSelected = profile?.preferred_counties?.includes(county);
                                            return (
                                                <button
                                                    key={county}
                                                    onClick={async () => {
                                                        const current = profile?.preferred_counties || (profile?.home_county ? [profile.home_county] : []);
                                                        let newCounties;
                                                        if (current.includes(county)) {
                                                            if (current.length === 1) {
                                                                toast.error(isSpanish ? 'Debes seleccionar al menos una Área de Servicio / Comunidad Autónoma' : isPortuguese ? 'Deve selecionar pelo menos uma Área de Serviço / Distrito' : 'You must select at least one Service Area / County');
                                                                return;
                                                            }
                                                            newCounties = current.filter((c: string) => c !== county);
                                                        } else {
                                                            newCounties = [...current, county];
                                                        }

                                                        // Update local state first for immediate UI response
                                                        setProfile({ ...profile, preferred_counties: newCounties });

                                                        // Auto-save to database
                                                        try {
                                                            const { error } = await supabase
                                                                .from('profiles')
                                                                .update({
                                                                    preferred_counties: newCounties
                                                                })
                                                                .eq('id', user?.id);

                                                            if (error) throw error;
                                                            toast.success(isSpanish ? `Preferencia de ${county} actualizada` : isPortuguese ? `Preferência de ${county} atualizada` : `${county} preference updated`, {
                                                                duration: 2000,
                                                                icon: '📍',
                                                                style: {
                                                                    borderRadius: '10px',
                                                                    background: '#333',
                                                                    color: '#fff',
                                                                },
                                                            });
                                                        } catch (err) {
                                                            console.error('Auto-save error:', err);
                                                            toast.error(isSpanish ? 'Error al guardar preferencia automáticamente' : isPortuguese ? 'Erro ao guardar preferência automaticamente' : 'Failed to auto-save preference');
                                                        }
                                                    }}
                                                    className={`py-3 px-6 rounded-md border transition-all text-sm font-medium ${isSelected
                                                        ? 'bg-[#5CB85C] border-[#5CB85C] text-white shadow-sm'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {county}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* My Profile Separator */}
                                <div className="border-t border-white mb-8"></div>

                                {/* My Profile Form */}
                                <div className="max-w-3xl mx-auto px-4 text-center">
                                    <h3 className="text-gray-600 font-medium mb-8 flex items-center justify-center gap-2 text-lg">
                                        {isSpanish ? 'Mi Perfil' : isPortuguese ? 'O Meu Perfil'} <div className="bg-gray-700 rounded-full p-1"><Settings className="text-white w-4 h-4" /></div>
                                    </h3>

                                    <div className="space-y-6 text-left">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{isSpanish ? 'Sobre Mí' : isPortuguese ? 'Sobre Mim' : 'About Me'}</label>
                                            <p className="text-[10px] text-gray-500 mb-2 ml-1">{isSpanish ? 'La información que envíes a continuación se muestra en la sección \'Sobre\' de tu perfil de' : isPortuguese ? 'A informação que enviar abaixo é apresentada na secção \'Sobre\' do seu perfil de'} {assessorLabel.toLowerCase()} {isSpanish ? 'en el sitio web (máx 200 palabras).' : isPortuguese ? 'no site (máx 200 palavras).' : 'profile on the website (max 200 words).'}</p>
                                            <textarea
                                                value={profile?.about_me || ''}
                                                onChange={(e) => setProfile({ ...profile, about_me: e.target.value })}
                                                className="w-full min-h-[120px] p-4 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{isSpanish ? 'URL del Sitio Web' : isPortuguese ? 'URL do Website' : 'Website URL'}</label>
                                            <input
                                                type="url"
                                                value={profile?.website_url || ''}
                                                onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                                                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 ml-1">{isSpanish ? 'Debe empezar con www., http://, https://, http://www., o https://www.' : isPortuguese ? 'Deve começar com www., http://, https://, http://www., ou https://www.' : 'Must start with www., http://, https://, http://www., or https://www.'}</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{isSpanish ? 'Nombre de la Empresa' : isPortuguese ? 'Nome da Empresa' : 'Company Name'}</label>
                                            <input
                                                type="text"
                                                value={profile?.company_name || ''}
                                                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                                                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{isSpanish ? 'URL del Logo de la Empresa' : isPortuguese ? 'URL do Logótipo da Empresa' : 'Company Logo URL'}</label>
                                            <input
                                                type="url"
                                                value={catalogueListing?.logo_url || ''}
                                                onChange={(e) => setCatalogueListing({ ...catalogueListing, logo_url: e.target.value })}
                                                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                placeholder="https://example.com/logo.png"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 ml-1">{isSpanish ? 'Proporciona una URL al logo de tu empresa (PNG, JPG o SVG).' : isPortuguese ? 'Forneça um URL para o logótipo da sua empresa (PNG, JPG ou SVG).' : 'Provide a URL to your company logo (PNG, JPG, or SVG).'}</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{isSpanish ? 'Dirección de la Empresa' : isPortuguese ? 'Endereço da Empresa' : 'Business Address'}</label>
                                            <input
                                                type="text"
                                                value={catalogueListing?.address || ''}
                                                onChange={(e) => setCatalogueListing({ ...catalogueListing, address: e.target.value })}
                                                className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                placeholder={isSpanish ? 'Ej. Navan, Co. Meath' : isPortuguese ? 'Ex. Lisboa, Portugal' : 'e.g. Navan, Co. Meath'}
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 ml-1">{isSpanish ? 'Esta dirección se mostrará en el listado del catálogo.' : isPortuguese ? 'Este endereço será apresentado na listagem do catálogo.' : 'This address will be displayed on the catalogue listing.'}</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{isSpanish ? 'Provincia Principal (Auto-detectada)' : isPortuguese ? 'Distrito Principal (Auto-detectado)' : 'Home County (Auto-detected)'}</label>
                                            <p className="text-[10px] text-gray-500 mb-2 ml-1">{isSpanish ? 'Tu ubicación en el mapa se detecta automáticamente desde tu dirección.' : isPortuguese ? 'A sua localização no mapa é detetada automaticamente a partir do seu endereço.' : 'Your business location on the map is automatically detecting from your address.'}</p>
                                            <input
                                                type="text"
                                                value={profile?.home_county || (isSpanish ? 'No detectada' : isPortuguese ? 'Não detetado' : 'Not detected')}
                                                readOnly
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500 cursor-not-allowed"
                                            />
                                        </div>

                                        {/* Social Media */}
                                        <div className="pt-4">
                                            <label className="block text-xs font-medium text-gray-700 mb-2 ml-1">{isSpanish ? 'Redes Sociales' : isPortuguese ? 'Redes Sociais' : 'Social Media'} <span className="text-gray-400 font-normal">{isSpanish ? '(opcional)' : isPortuguese ? '(opcional)' : '(optional)'}</span></label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-1 ml-1">Facebook</label>
                                                    <input
                                                        type="url"
                                                        value={catalogueListing?.social_media?.facebook || ''}
                                                        onChange={(e) => setCatalogueListing({ ...catalogueListing, social_media: { ...catalogueListing?.social_media, facebook: e.target.value } })}
                                                        className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                        placeholder="https://facebook.com/..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-1 ml-1">Instagram</label>
                                                    <input
                                                        type="url"
                                                        value={catalogueListing?.social_media?.instagram || ''}
                                                        onChange={(e) => setCatalogueListing({ ...catalogueListing, social_media: { ...catalogueListing?.social_media, instagram: e.target.value } })}
                                                        className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                        placeholder="https://instagram.com/..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-1 ml-1">LinkedIn</label>
                                                    <input
                                                        type="url"
                                                        value={catalogueListing?.social_media?.linkedin || ''}
                                                        onChange={(e) => setCatalogueListing({ ...catalogueListing, social_media: { ...catalogueListing?.social_media, linkedin: e.target.value } })}
                                                        className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                        placeholder="https://linkedin.com/in/..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="pt-4">
                                            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{isSpanish ? 'Características / Servicios' : isPortuguese ? 'Características / Serviços' : 'Features / Services'} <span className="text-gray-400 font-normal">{isSpanish ? '(opcional)' : isPortuguese ? '(opcional)' : '(optional)'}</span></label>
                                            <p className="text-[10px] text-gray-400 mb-2 ml-1">{isSpanish ? 'Destaca servicios clave en tu listado (ej. "Respuesta Rápida", "Certificados E 24h").' : isPortuguese ? 'Destaque serviços chave na sua listagem (ex. "Resposta Rápida", "Certificados E 24h").' : 'Highlight key services on your listing (e.g. "Fast Turnaround", "24hr E-certs").'}</p>
                                            <div className="flex gap-2 mb-3">
                                                <input
                                                    type="text"
                                                    id="dashboardFeatureInput"
                                                    className="flex-1 p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                    placeholder={isSpanish ? 'Escribe y pulsa Enter o haz clic en Añadir' : isPortuguese ? 'Escreva e prima Enter ou clique em Adicionar' : 'Type and press Enter or click Add'}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.currentTarget;
                                                            const val = input.value.trim();
                                                            if (val && !(catalogueListing?.features || []).includes(val)) {
                                                                setCatalogueListing({ ...catalogueListing, features: [...(catalogueListing?.features || []), val] });
                                                                input.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.getElementById('dashboardFeatureInput') as HTMLInputElement;
                                                        const val = input?.value.trim();
                                                        if (val && !(catalogueListing?.features || []).includes(val)) {
                                                            setCatalogueListing({ ...catalogueListing, features: [...(catalogueListing?.features || []), val] });
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-[#5CB85C] text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                                                >
                                                    <Plus size={14} /> {isSpanish ? 'Añadir' : isPortuguese ? 'Adicionar' : 'Add'}
                                                </button>
                                            </div>
                                            {(catalogueListing?.features || []).length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {(catalogueListing?.features || []).map((feature: string, i: number) => (
                                                        <span key={i} className="inline-flex items-center gap-1 bg-green-50 border border-green-500 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                                            {feature}
                                                            <button type="button" onClick={() => setCatalogueListing({ ...catalogueListing, features: (catalogueListing?.features || []).filter((_: string, idx: number) => idx !== i) })} className="hover:text-red-500 transition-colors">
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-center gap-4 pt-8 pb-12">
                                            <button
                                                onClick={async () => {
                                                    if (!profile?.preferred_counties || profile.preferred_counties.length === 0) {
                                                        toast.error(isSpanish ? 'Por favor, selecciona al menos una Área de Servicio / Comunidad Autónoma' : isPortuguese ? 'Por favor, selecione pelo menos uma Área de Serviço / Distrito' : 'Please select at least one Service Area / County');
                                                        return;
                                                    }
                                                    setIsSubmitting(true);
                                                    try {
                                                        // Fetch coordinates silently via Nominatim
                                                        let finalLat = catalogueListing?.latitude || null;
                                                        let finalLng = catalogueListing?.longitude || null;

                                                        if (catalogueListing?.address) {
                                                            const coords = await geocodeAddress(catalogueListing.address);
                                                            if (coords) {
                                                                finalLat = coords.latitude;
                                                                finalLng = coords.longitude;
                                                            }
                                                        }


                                                        // Update profile
                                                        const { error: profileErr } = await supabase
                                                            .from('profiles')
                                                            .update({
                                                                about_me: profile.about_me || '',
                                                                company_name: profile.company_name,
                                                                website_url: profile.website_url,
                                                                home_county: profile.home_county,
                                                                county: profile.home_county || profile.county,
                                                                preferred_counties: profile.preferred_counties
                                                            })
                                                            .eq('id', user?.id);

                                                        if (profileErr) throw profileErr;

                                                        // Update catalogue listing if it exists
                                                        if (catalogueListing) {
                                                            const { error: listErr } = await supabase
                                                                .from('catalogue_listings')
                                                                .update({
                                                                    name: profile.full_name,
                                                                    company_name: profile.company_name,
                                                                    description: profile.about_me || '',
                                                                    address: catalogueListing.address,
                                                                    website: profile.website_url,
                                                                    phone: profile.phone,
                                                                    logo_url: catalogueListing.logo_url,
                                                                    latitude: finalLat,
                                                                    longitude: finalLng,
                                                                    features: catalogueListing.features || [],
                                                                    social_media: catalogueListing.social_media || {}
                                                                })
                                                                .eq('id', catalogueListing.id);

                                                            if (listErr) throw listErr;


                                                            // Update location mapping if home_county is set
                                                            if (profile.home_county) {
                                                                // 1. Get the location ID for the home county
                                                                const { data: locData } = await supabase
                                                                    .from('catalogue_locations')
                                                                    .select('id')
                                                                    .eq('name', profile.home_county)
                                                                    .maybeSingle();

                                                                if (locData) {
                                                                    // 2. Remove existing location links for this listing
                                                                    await supabase
                                                                        .from('catalogue_listing_locations')
                                                                        .delete()
                                                                        .eq('listing_id', catalogueListing.id);

                                                                    // 3. Insert new location link
                                                                    const { error: locErr } = await supabase
                                                                        .from('catalogue_listing_locations')
                                                                        .insert({
                                                                            listing_id: catalogueListing.id,
                                                                            location_id: locData.id
                                                                        });

                                                                    if (locErr) console.error('Failed to update location link:', locErr);
                                                                }
                                                            }
                                                        }

                                                        toast.success(isSpanish ? 'Perfil y datos de negocio actualizados' : isPortuguese ? 'Perfil e dados de negócio atualizados' : 'Profile and Business details updated');
                                                    } catch (error: any) {
                                                        console.error('Update error:', error);
                                                        toast.error(error.message || (isSpanish ? 'Error al guardar cambios' : isPortuguese ? 'Erro ao guardar alterações' : 'Failed to save changes'));
                                                    } finally {
                                                        setIsSubmitting(false);
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                                className={`px-8 py-2 bg-[#007BFF] text-white rounded font-medium transition-colors text-sm flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Clock className="w-4 h-4 animate-spin" /> {isSpanish ? 'Guardando...' : isPortuguese ? 'A guardar...' : 'Saving...'}
                                                    </>
                                                ) : (
                                                    isSpanish ? 'Enviar' : isPortuguese ? 'Enviar' : 'Submit'
                                                )}
                                            </button>
                                            <Link
                                                to={`/profiles/${user?.id}`}
                                                target="_blank"
                                                className="px-8 py-2 bg-[#5CB85C] text-white rounded font-medium hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                                            >
                                                {isSpanish ? 'Ver Perfil' : isPortuguese ? 'Ver Perfil' : 'View Profile'} <User size={14} className="fill-white" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>

            {/* Job Details Modal - STEP 1 */}
            {jobDetailsModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-white border-b border-gray-100 p-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{isSpanish ? 'Oportunidad de Trabajo' : isPortuguese ? 'Oportunidade de Trabalho' : 'Job Opportunity'}</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">{isSpanish ? 'Revisa los detalles antes de continuar' : isPortuguese ? 'Reveja os detalhes antes de continuar' : 'Review the details before proceeding'}</p>
                            </div>
                            <button onClick={() => setJobDetailsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSpanish ? 'Ubicación' : isPortuguese ? 'Localização' : 'Location'}</span>
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin size={14} className="text-[#007EA7]" />
                                        {selectedJob.town}, {selectedJob.county}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSpanish ? 'Código Postal' : isPortuguese ? 'Código Postal' : 'Eircode'}</span>
                                    <p className="text-sm font-bold text-blue-600">{selectedJob.eircode || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSpanish ? 'Tamaño' : isPortuguese ? 'Área' : 'Size'}</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.property_size}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSpanish ? 'Habitaciones' : isPortuguese ? 'Quartos' : 'Bedrooms'}</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.bedrooms}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSpanish ? 'Finalidad' : isPortuguese ? 'Finalidade' : 'Purpose'}</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.ber_purpose}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isSpanish ? 'Bomba Calor' : isPortuguese ? 'Bomba Calor' : 'Heat Pump'}</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedJob.heat_pump}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">{isSpanish ? 'Horario Preferido' : isPortuguese ? 'Horário Preferido' : 'Preferred Schedule'}</span>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Calendar size={14} />
                                            {selectedJob.preferred_date} {isSpanish ? 'a las' : isPortuguese ? 'às' : 'at'} {selectedJob.preferred_time}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">{isSpanish ? 'Características' : isPortuguese ? 'Características' : 'Features'}</span>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedJob.additional_features && selectedJob.additional_features.length > 0 ? (
                                                selectedJob.additional_features.map((feature, i) => (
                                                    <span key={i} className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                                        {feature}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400">{isSpanish ? 'Propiedad estándar' : isPortuguese ? 'Propriedade padrão' : 'Standard property'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block mb-2">{isSpanish ? 'Referencia Interna' : isPortuguese ? 'Referência Interna' : 'Internal Reference'}</span>
                                <p className="text-base font-bold text-gray-900 leading-relaxed italic">
                                    "{selectedJob.property_address}"
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setJobDetailsModalOpen(false);
                                            setRejectionModalOpen(true);
                                        }}
                                        className="flex-1 py-4 text-red-500 rounded-2xl font-bold bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={20} />
                                        {isSpanish ? 'Rechazar Solicitud' : isPortuguese ? 'Rejeitar Pedido' : 'Reject Lead'}
                                    </button>
                                    <button
                                        onClick={handleStartQuote}
                                        className="flex-[2] py-4 bg-[#007EA7] text-white rounded-2xl font-black text-lg hover:bg-[#005F7E] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                                    >
                                        {isSpanish ? 'Iniciar Presupuesto' : isPortuguese ? 'Iniciar Orçamento' : 'Start Quoting'}
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setJobDetailsModalOpen(false)}
                                    className="text-sm text-gray-400 font-bold hover:text-gray-600"
                                >
                                    {isSpanish ? 'Decidir Más Tarde' : isPortuguese ? 'Decidir Mais Tarde' : 'Decide Later'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Quote Modal - DATE PICKER + QUOTE FORM */}
            {
                quoteModalOpen && selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 relative">

                            {/* Step 1: Date Picker */}
                            {quoteStep === 1 && (
                                <div className="p-8">
                                    <button
                                        onClick={() => setQuoteModalOpen(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                    >
                                        <X size={24} />
                                    </button>

                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{isSpanish ? 'Fecha más temprana para la inspección.' : isPortuguese ? 'Data mais próxima para a inspeção.' : 'Earliest date you can do the survey.'}</h2>
                                        {myQuotes.find(q => q.assessment_id === selectedJob.id) && (
                                            <p className="text-sm font-medium text-green-700 mb-4 bg-green-50 py-2 px-4 rounded-full inline-block">
                                                {isSpanish ? 'Tu presupuesto anterior fue' : isPortuguese ? 'O seu orçamento anterior foi'} <span className="underline font-bold">{formatCurrency(myQuotes.find(q => q.assessment_id === selectedJob.id)?.price)}</span>
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600">
                                            {isSpanish ? 'La' : isPortuguese ? 'A'} <span className="text-amber-600 underline">{isSpanish ? 'fecha destacada' : isPortuguese ? 'data destacada'}</span> {isSpanish ? 'es la fecha y hora preferida del cliente.' : isPortuguese ? 'é a data e hora preferida do cliente.' : "is the customer's preferred date & time."}
                                            {isSpanish ? 'Selecciona la fecha más temprana en la que estés disponible, incluso si es anterior a la fecha preferida del cliente.' : isPortuguese ? 'Selecione a data mais próxima em que está disponível, mesmo que seja antes da data preferida do cliente.' : "Select the earliest date that you are available, even if it's before the customer's preferred date."}
                                        </p>
                                    </div>

                                    {/* Calendar Grid - 30 days */}
                                    <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-2">
                                        {Array.from({ length: 30 }, (_, i) => {
                                            const date = new Date();
                                            // Start from tomorrow (i + 1)
                                            date.setDate(date.getDate() + i + 1);
                                            const dateStr = date.toISOString().split('T')[0];
                                            const isPreferred = selectedJob.preferred_date === dateStr ||
                                                new Date(selectedJob.preferred_date).toDateString() === date.toDateString();
                                            const isSelected = selectedAvailabilityDate === dateStr;

                                            return (
                                                <button
                                                    key={dateStr}
                                                    onClick={() => {
                                                        setSelectedAvailabilityDate(dateStr);
                                                        setQuoteStep(2);
                                                    }}
                                                    className={`p-4 rounded-lg border-2 text-center transition-all ${isSelected
                                                        ? 'border-green-500 bg-green-50'
                                                        : isPreferred
                                                            ? 'border-amber-400 bg-amber-50'
                                                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                                                        }`}
                                                >
                                                    <p className="text-sm font-medium text-gray-600">
                                                        {date.toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : 'en-IE', { weekday: 'long' })}
                                                    </p>
                                                    <p className={`text-lg font-bold ${isSelected ? 'text-green-700' : isPreferred ? 'text-amber-700' : 'text-gray-800'}`}>
                                                        {date.toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : 'en-IE', { day: '2-digit', month: 'short' })}
                                                    </p>
                                                    {isPreferred && (
                                                        <p className="text-[10px] text-amber-600 font-medium mt-1">
                                                            ({selectedJob.preferred_time || '8am - 10am'})
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>


                                </div>
                            )}

                            {/* Step 2: Quote Form with Job Details */}
                            {quoteStep === 2 && (
                                <div>
                                    {/* Header */}
                                    <div className="bg-green-100 p-6 text-center border-b border-green-200 relative">
                                        <button
                                            onClick={() => setQuoteModalOpen(false)}
                                            className="absolute top-4 right-4 text-green-700 hover:text-green-900 transition-colors"
                                        >
                                            <X size={24} />
                                        </button>
                                        <h2 className="text-xl font-bold text-green-800">{isSpanish ? 'Presupuesto para este trabajo en' : isPortuguese ? 'Orçamento para este trabalho em'} {selectedJob.town}, {isSpanish ? 'Prov.' : isPortuguese ? 'Dist.' : 'Co.'} {selectedJob.county}</h2>
                                        {(() => {
                                            const previousQuote = myQuotes.find(q => q.assessment_id === selectedJob.id);
                                            return previousQuote ? (
                                                <p className="text-sm font-medium text-green-700">
                                                    {isSpanish ? 'Tu presupuesto anterior fue' : isPortuguese ? 'O seu orçamento anterior foi'} <span className="underline font-bold">{formatCurrency(previousQuote.price)}</span>
                                                </p>
                                            ) : (
                                                <p className="text-sm text-green-600">{isSpanish ? 'Envía tu presupuesto a continuación.' : isPortuguese ? 'Envie o seu orçamento abaixo.' : 'Submit your quote below.'}</p>
                                            );
                                        })()}
                                    </div>

                                    <div className="p-6 grid md:grid-cols-2 gap-6">
                                        {/* Left: Job Details */}
                                        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-200 px-4 py-3 border-b border-gray-300">
                                                <h3 className="font-bold text-gray-700 text-center">{isSpanish ? 'Detalles del Trabajo' : isPortuguese ? 'Detalhes do Trabalho' : 'Job Details'}</h3>
                                            </div>
                                            <div className="divide-y divide-gray-200">
                                                <div className="flex justify-between px-4 py-3">
                                                    <span className="text-gray-600">{isSpanish ? 'Ubicación:' : isPortuguese ? 'Localização:' : 'Location:'}</span>
                                                    <span className="font-medium text-gray-800">{selectedJob.town}, {isSpanish ? 'Prov.' : isPortuguese ? 'Dist.' : 'Co.'} {selectedJob.county}</span>
                                                </div>
                                                <div className="flex justify-between px-4 py-3">
                                                    <span className="text-gray-600">{isSpanish ? 'Código Postal:' : isPortuguese ? 'Código Postal:' : 'Eircode:'}</span>
                                                    <span className="font-medium text-blue-600">{selectedJob.eircode || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between px-4 py-3">
                                                    <span className="text-gray-600">{isSpanish ? 'Tipo de Propiedad:' : isPortuguese ? 'Tipo de Propriedade:' : 'Property Type:'}</span>
                                                    <span className="font-medium text-gray-800">{selectedJob.property_type}</span>
                                                </div>
                                                <div className="flex justify-between px-4 py-3">
                                                    <span className="text-gray-600">{isSpanish ? 'Tamaño:' : isPortuguese ? 'Área:' : 'Size:'}</span>
                                                    <span className="font-medium text-gray-800">{selectedJob.property_size}</span>
                                                </div>
                                                <div className="flex justify-between px-4 py-3">
                                                    <span className="text-gray-600">{isSpanish ? 'Hab.:' : isPortuguese ? 'Quartos:' : 'Beds:'}</span>
                                                    <span className="font-medium text-gray-800">{selectedJob.bedrooms}</span>
                                                </div>
                                                <div className="flex justify-between px-4 py-3">
                                                    <span className="text-gray-600">{isSpanish ? 'Bomba Calor:' : isPortuguese ? 'Bomba Calor:' : 'Heat Pump:'}</span>
                                                    <span className="font-medium text-gray-800">{selectedJob.heat_pump || (isSpanish ? 'Ninguna' : isPortuguese ? 'Nenhuma' : 'None')}</span>
                                                </div>
                                                <div className="flex justify-between px-4 py-3">
                                                    <span className="text-gray-600">{isSpanish ? 'Añadidos:' : isPortuguese ? 'Extras:' : 'Additions:'}</span>
                                                    <span className="font-medium text-gray-800">{selectedJob.additional_features?.length ? selectedJob.additional_features.join(', ') : (isSpanish ? 'Ninguna' : isPortuguese ? 'Nenhuma' : 'None')}</span>
                                                </div>
                                                <div className="flex justify-between px-4 py-3">
                                                    <span className="text-gray-600">{isSpanish ? 'Finalidad:' : isPortuguese ? 'Finalidade:' : 'Purpose:'}</span>
                                                    <span className="font-medium text-gray-800">{selectedJob.ber_purpose}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Your Quote */}
                                        <div className="bg-green-50 rounded-xl border border-green-200 overflow-hidden">
                                            <div className="bg-green-200 px-4 py-3 border-b border-green-300">
                                                <h3 className="font-bold text-green-800 text-center">{isSpanish ? 'Tu Presupuesto' : isPortuguese ? 'O Seu Orçamento' : 'Your Quote'}</h3>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <p className="text-sm text-green-700 text-center italic">{isSpanish ? 'Incluye tarifas de' : isPortuguese ? 'Inclui taxas de'} {regAuthority}.</p>
                                                <p className="text-sm text-green-700 text-center italic">{isSpanish ? 'Incluye IVA (si estás registrado).' : isPortuguese ? 'Inclui IVA (se registado).' : 'Include VAT (if registered).'}</p>
                                                <p className="text-sm text-green-700 text-center font-bold">
                                                    <span className="italic">{isSpanish ? 'Incluye' : isPortuguese ? 'Inclui' : 'Includes'} {formatCurrency(25)} {isSpanish ? 'tasa de plataforma.' : isPortuguese ? 'taxa de plataforma.' : 'platform fee.'}</span>
                                                </p>

                                                <div className="relative mt-4">
                                                    <input
                                                        type="number"
                                                        value={quotePrice}
                                                        onChange={(e) => setQuotePrice(e.target.value)}
                                                        className="w-full bg-white border-2 border-gray-200 focus:border-green-500 rounded-lg px-4 py-3 text-center text-xl font-bold outline-none transition-all"
                                                        placeholder="170"
                                                    />
                                                </div>
                                                <p className="text-sm text-center font-bold text-gray-600">
                                                    {isSpanish ? 'Recibirás:' : isPortuguese ? 'Receberá:' : 'You will receive:'} {formatCurrency(quotePrice ? (parseInt(quotePrice) - ((profile?.completed_jobs_count || 0) % 11 === 10 ? 0 : 25)) : 0)} {isSpanish ? '(directo del cliente)' : isPortuguese ? '(direto do cliente)' : '(direct from customer)'}
                                                </p>
                                                <p className="text-xs text-gray-400 text-center">{isSpanish ? 'Ej. 170, sin símbolo de moneda ni céntimos.' : isPortuguese ? 'Ex. 170, sem símbolo de moeda nem cêntimos.' : 'Eg. 170, no currency symbol or cents.'}</p>

                                                <div className="flex items-start gap-2 mt-4">
                                                    <input
                                                        type="checkbox"
                                                        id="termsCheck"
                                                        checked={termsAgreed}
                                                        onChange={(e) => setTermsAgreed(e.target.checked)}
                                                        className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                                    />
                                                    <label htmlFor="termsCheck" className="text-sm text-gray-600">
                                                        {isSpanish ? 'Acepto los' : isPortuguese ? 'Aceito os'} <a href="/assessor-terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{isSpanish ? 'términos de uso' : isPortuguese ? 'termos de utilização' : 'terms of use'}</a>
                                                    </label>
                                                </div>
                                                <p className="text-sm text-gray-500 text-center">
                                                    {isSpanish ? 'y estoy disponible desde' : isPortuguese ? 'e estou disponível desde'} {selectedAvailabilityDate ? new Date(selectedAvailabilityDate).toLocaleDateString(isSpanish ? 'es-ES' : isPortuguese ? 'pt-PT' : 'en-IE', { weekday: 'short', day: '2-digit', month: 'short' }) : (isSpanish ? 'la fecha seleccionada' : isPortuguese ? 'a data selecionada' : 'selected date')}.
                                                </p>

                                                <button
                                                    onClick={handleSubmitQuote}
                                                    disabled={!quotePrice || !termsAgreed || isSubmitting}
                                                    className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? (isSpanish ? 'Enviando...' : isPortuguese ? 'A enviar...' : 'Submitting...') : (isSpanish ? 'Enviar Presupuesto' : isPortuguese ? 'Enviar Orçamento' : 'Submit Quote')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back button */}
                                    <div className="px-6 pb-6 flex justify-start">
                                        <button
                                            onClick={() => setQuoteStep(1)}
                                            className="text-sm font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                        >
                                            <ArrowLeft size={14} /> {isSpanish ? 'Volver a selección de fecha' : isPortuguese ? 'Voltar à seleção de data' : 'Back to date selection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Rejection Modal */}
            {
                rejectionModalOpen && selectedJob && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8 text-center space-y-6">
                                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                    <AlertTriangle size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900">{isSpanish ? '¿Rechazar esta solicitud?' : isPortuguese ? 'Rejeitar este pedido?' : 'Reject this lead?'}</h3>
                                    <p className="text-sm text-gray-500 font-medium">{isSpanish ? 'Por favor, dinos por qué no puedes tomar este trabajo.' : isPortuguese ? 'Por favor, diga-nos por que não pode aceitar este trabalho.' : "Please let us know why you're unable to take this job."}</p>
                                </div>

                                <select
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                                >
                                    <option value="">{isSpanish ? 'Selecciona un motivo...' : isPortuguese ? 'Selecione um motivo...' : 'Select a reason...'}</option>
                                    <option value="too_busy">{isSpanish ? 'Muy ocupado / Mucha carga de trabajo' : isPortuguese ? 'Muito ocupado / Muita carga de trabalho' : 'Too busy / High workload'}</option>
                                    <option value="outside_area">{isSpanish ? 'Fuera de mi área de servicio' : isPortuguese ? 'Fora da minha área de serviço' : 'Outside my service area'}</option>
                                    <option value="incorrect_requirements">{isSpanish ? 'Requisitos de propiedad incorrectos' : isPortuguese ? 'Requisitos de propriedade incorretos' : 'Incorrect property requirements'}</option>
                                    <option value="safety_concerns">{isSpanish ? 'Preocupaciones de seguridad o acceso' : isPortuguese ? 'Preocupações de segurança ou acesso' : 'Safety or access concerns'}</option>
                                    <option value="other">{isSpanish ? 'Otro motivo' : isPortuguese ? 'Outro motivo' : 'Other reason'}</option>
                                </select>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => setRejectionModalOpen(false)}
                                        className="flex-1 py-4 text-gray-500 font-bold bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all"
                                    >
                                        {isSpanish ? 'Cancelar' : isPortuguese ? 'Cancelar' : 'Cancel'}
                                    </button>
                                    <button
                                        onClick={handleRejectJob}
                                        disabled={!rejectionReason || isSubmitting}
                                        className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
                                    >
                                        {isSpanish ? 'Confirmar Rechazo' : isPortuguese ? 'Confirmar Rejeição' : 'Confirm Rejection'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Scheduling Modal */}
            {
                schedulingJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900">{isSpanish ? 'Programar Inspección' : isPortuguese ? 'Agendar Inspeção' : 'Schedule Inspection'}</h3>
                                <button onClick={() => setSchedulingJob(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{isSpanish ? 'Fecha de Inspección' : isPortuguese ? 'Data de Inspeção' : 'Inspection Date'}</label>
                                    <DatePicker
                                        value={scheduledDate}
                                        onChange={setScheduledDate}
                                        min={tomorrow}
                                        label=""
                                        placeholder={isSpanish ? 'Seleccionar fecha de inspección' : isPortuguese ? 'Selecionar data de inspeção' : 'Select inspection date'}
                                    />
                                </div>
                                <button
                                    onClick={() => handleUpdateStatus(schedulingJob.id, 'scheduled', { scheduled_date: scheduledDate })}
                                    disabled={isSubmitting || !scheduledDate}
                                    className="w-full bg-[#007EA7] text-white py-4 rounded-2xl font-bold hover:bg-[#005F7E] transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                                >
                                    {isSubmitting ? (isSpanish ? 'Programando...' : isPortuguese ? 'A agendar...' : 'Scheduling...') : (isSpanish ? 'Confirmar Programación' : isPortuguese ? 'Confirmar Agendamento' : 'Confirm Schedule')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Completion Modal */}
            {
                completingJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900">{isSpanish ? 'Completar Trabajo' : isPortuguese ? 'Concluir Trabalho' : 'Complete Job'}</h3>
                                <button onClick={() => setCompletingJob(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{isSpanish ? 'URL del Certificado' : isPortuguese ? 'URL do Certificado' : 'BER Certificate URL'}</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={certUrl}
                                        onChange={(e) => setCertUrl(e.target.value)}
                                        className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#007EA7] transition-colors font-bold text-gray-900"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium italic">{isSpanish ? 'Por favor, proporciona un enlace al certificado generado.' : isPortuguese ? 'Por favor, forneça um link para o certificado gerado.' : 'Please provide a link to the generated BER certificate.'}</p>
                                </div>
                                <button
                                    onClick={() => handleUpdateStatus(completingJob.id, 'completed', { certificate_url: certUrl, completed_at: new Date().toISOString() })}
                                    disabled={isSubmitting || !certUrl}
                                    className="w-full bg-[#007F00] text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                                >
                                    {isSubmitting ? (isSpanish ? 'Completando...' : isPortuguese ? 'A concluir...' : 'Completing...') : (isSpanish ? 'Enviar y Completar' : isPortuguese ? 'Enviar e Concluir' : 'Submit & Complete')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


        </div>
    );
};

export default ContractorDashboard;
