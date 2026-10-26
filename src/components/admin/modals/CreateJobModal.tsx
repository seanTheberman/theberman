import { useState } from 'react';
import { X, Plus, Home, Briefcase, Wrench, Loader2, CheckCircle2, AlertTriangle, UserPlus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { getCountiesForTenant } from '../../../lib/tenantData';

const TECHNICAL_ASSESSMENT_TYPES: Record<string, string[]> = {
    ireland: ['Heat Pump Survey', 'New Build Compliance (Part L / NZEB)', 'Energy Audit', 'Retrofit Assessment', 'Air Tightness Test', 'Thermal Imaging', 'Ventilation Assessment', 'SEAI Grant Assessment'],
    spain: ['Auditoría Energética', 'Certificación Edificio Nuevo (CTE)', 'Evaluación Bomba de Calor', 'Evaluación de Rehabilitación', 'Test de Hermeticidad', 'Termografía Infrarroja', 'Evaluación de Ventilación', 'Evaluación para Subvenciones'],
    england: ['Heat Pump Assessment', 'SAP Calculation (New Build)', 'Energy Audit', 'PAS 2035 Retrofit Assessment', 'Air Tightness Test', 'Thermal Imaging Survey', 'Ventilation Assessment', 'ECO4 / Grant Assessment'],
    france: ['Audit Énergétique', 'DPE Neuf (RT2012/RE2020)', 'Évaluation Pompe à Chaleur', 'Évaluation Rénovation Énergétique', 'Test d\'Étanchéité à l\'Air', 'Thermographie Infrarouge', 'Évaluation Ventilation', 'Évaluation pour Subventions'],
    portugal: ['Auditoria Energética', 'Certificação Edifício Novo (RCCTE/REH)', 'Avaliação Bomba de Calor', 'Avaliação de Reabilitação', 'Teste de Estanqueidade', 'Termografia Infravermelha', 'Avaliação de Ventilação', 'Avaliação para Subsídios'],
};
const TECHNICAL_PROPERTY_TYPES: Record<string, string[]> = {
    ireland: ['Detached House', 'Semi-Detached', 'Terraced', 'Bungalow', 'Apartment', 'New Build (Under Construction)', 'Commercial Property'],
    spain: ['Casa Individual', 'Adosado', 'Piso / Apartamento', 'Chalet', 'Dúplex', 'Obra Nueva (En Construcción)', 'Local Comercial'],
    england: ['Detached House', 'Semi-Detached', 'Terraced', 'Bungalow', 'Flat / Maisonette', 'New Build (Under Construction)', 'Commercial Property'],
    france: ['Maison Individuelle', 'Jumelée', 'Mitoyenne', 'Pavillon', 'Appartement', 'Construction Neuve', 'Local Commercial'],
    portugal: ['Moradia Isolada', 'Geminada', 'Banda', 'Vivenda', 'Apartamento', 'Construção Nova', 'Imóvel Comercial'],
};
const YEAR_BUILT_OPTIONS: Record<string, string[]> = {
    ireland: ['Pre-1940', '1940–1970', '1970–2000', '2000–2010', '2010–2020', '2020+ / New Build'],
    spain: ['Anterior a 1940', '1940–1970', '1970–2000', '2000–2010', '2010–2020', '2020+ / Obra Nueva'],
    england: ['Pre-1940', '1940–1970', '1970–2000', '2000–2010', '2010–2020', '2020+ / New Build'],
    france: ['Avant 1940', '1940–1970', '1970–2000', '2000–2010', '2010–2020', '2020+ / Construction Neuve'],
    portugal: ['Antes de 1940', '1940–1970', '1970–2000', '2000–2010', '2010–2020', '2020+ / Construção Nova'],
};
const CURRENT_HEATING_OPTIONS: Record<string, string[]> = {
    ireland: ['Gas Boiler', 'Oil Boiler', 'Electric Storage Heaters', 'Heat Pump (Existing)', 'Solid Fuel / Stove', 'LPG', 'None / Under Construction'],
    spain: ['Caldera de Gas', 'Caldera de Gasóleo', 'Calefacción Eléctrica', 'Bomba de Calor (Existente)', 'Biomasa / Pellets', 'Sin Calefacción / En Construcción'],
    england: ['Gas Boiler', 'Oil Boiler', 'Electric Storage Heaters', 'Heat Pump (Existing)', 'Solid Fuel / Log Burner', 'LPG', 'District Heating', 'None / Under Construction'],
    france: ['Chaudière Gaz', 'Chaudière Fioul', 'Chauffage Électrique', 'Pompe à Chaleur (Existante)', 'Biomasse / Granulés', 'Sans Chauffage / En Construction'],
    portugal: ['Caldeira a Gás', 'Caldeira a Gasóleo', 'Aquecimento Elétrico', 'Bomba de Calor (Existente)', 'Biomassa / Pellets', 'Sem Aquecimento / Em Construção'],
};
const INSULATION_STATUS_OPTIONS: Record<string, string[]> = {
    ireland: ['Fully Insulated (Walls, Attic, Floor)', 'Partially Insulated', 'Minimal / No Insulation', 'Unknown'],
    spain: ['Totalmente Aislada (Paredes, Techo, Suelo)', 'Parcialmente Aislada', 'Sin Aislamiento / Mínimo', 'Desconocido'],
    england: ['Fully Insulated (Walls, Loft, Floor)', 'Partially Insulated', 'Minimal / No Insulation', 'Unknown'],
    france: ['Entièrement Isolé (Murs, Toit, Sol)', 'Partiellement Isolé', 'Minimal / Non Isolé', 'Inconnu'],
    portugal: ['Totalmente Isolada (Paredes, Sótão, Pavimento)', 'Parcialmente Isolada', 'Sem Isolamento / Mínimo', 'Desconhecido'],
};
const TECHNICAL_PURPOSES: Record<string, string[]> = {
    ireland: ['SEAI Grant Application', 'Heat Pump Installation', 'Building Regulations (Part L)', 'Pre-Purchase Survey', 'Energy Upgrade Planning', 'Compliance Certificate', 'Other'],
    spain: ['Solicitud de Subvención', 'Instalación de Bomba de Calor', 'Cumplimiento Normativo (CTE)', 'Evaluación Pre-Compra', 'Planificación de Mejora Energética', 'Certificado de Cumplimiento', 'Otro'],
    england: ['ECO4 / Grant Application', 'Heat Pump Installation', 'Building Regulations (Part L)', 'Pre-Purchase Survey', 'Energy Upgrade Planning', 'EPC Improvement', 'PAS 2035 Compliance', 'Other'],
    france: ['Demande de Subvention', 'Installation Pompe à Chaleur', 'Réglementation Thermique (RT2012/RE2020)', 'Évaluation Pré-Achat', 'Planification Rénovation Énergétique', 'Certification de Conformité', 'Autre'],
    portugal: ['Pedido de Subsídio', 'Instalação de Bomba de Calor', 'Cumprimento Regulamentar (RCCTE/REH)', 'Avaliação Pré-Compra', 'Planeamento de Melhoria Energética', 'Certificado de Conformidade', 'Outro'],
};
const PROPERTY_TYPES = ['Semi-Detached', 'Mid-Terrace', 'End-Terrace', 'Apartment', 'Piso', 'Duplex', 'Detached', 'Bungalow', 'Multi-Unit', 'Other'];
const PROPERTY_SIZES = [
    'Under 70 m²', '70 - 90 m²', '90 - 110 m²', '110 - 140 m²', '140 - 160 m²',
    '160 - 185 m²', '185 - 230 m²', '230 - 280 m²', '280 - 370 m²', 'Over 370 m²'
];
const TIME_SLOTS = ['Any time', '8am - 10am', '10am - 2pm', '2pm - 6pm', '6pm - 8pm'];
const ADDITIONAL_FEATURES = ['Attic/Garage conversion', 'Extensions', 'Conservatory', 'Multiple', 'None'];
const HEAT_PUMP_OPTIONS = ['No', 'Air Source', 'Ground Source'];
const BER_PURPOSES = ['Selling', 'Letting', 'Govt Grant', 'Mortgage', 'New Build', 'Personal Interest', 'Other'];
const BUILDING_TYPES = ['Office', 'Retail / Shop', 'Warehouse / Industrial', 'Hospitality', 'Healthcare', 'Education', 'Mixed-Use', 'Other'];
const BUILDING_COMPLEXITY = ['Single unit', 'Multi-unit building', 'Multi-floor building', 'Large complex site'];
const COMMERCIAL_FLOOR_AREAS = [
    'Under 100 m²', '100 - 250 m²', '250 - 500 m²', '500 - 1000 m²',
    '1000 - 2500 m²', '2500 - 5000 m²', '5000 - 10000 m²', 'Over 10000 m²'
];
const EXISTING_DOCS = ['Architectural drawings', 'Mechanical/electrical specs', 'Previous energy report', 'None available'];
const COMMERCIAL_PURPOSES = ['Compliance requirement', 'Selling property', 'Leasing property', 'ESG reporting', 'Grant / funding', 'Energy upgrade planning', 'Other'];
const HEATING_COOLING = ['Gas boiler', 'Oil boiler', 'Heat pump', 'Chillers', 'Air handling units', 'Unknown'];

interface Props {
    onClose: () => void;
    onJobCreated: () => void;
    selectedTenant?: string;
}

export const CreateJobModal = ({ onClose, onJobCreated, selectedTenant = 'ireland' }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobType, setJobType] = useState<'domestic' | 'commercial' | 'technical' | ''>('');
    const [step, setStep] = useState(1);

    // Contact / Homeowner Details
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    // Location
    const [county, setCounty] = useState('');
    const [town, setTown] = useState('');
    const [eircode, setEircode] = useState('');

    // Domestic
    const [propertyType, setPropertyType] = useState('');
    const [propertySize, setPropertySize] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [additionalFeatures, setAdditionalFeatures] = useState<string[]>([]);
    const [heatPump, setHeatPump] = useState('');
    const [berPurpose, setBerPurpose] = useState('');

    // Commercial
    const [buildingType, setBuildingType] = useState('');
    const [floorArea, setFloorArea] = useState('');
    const [buildingComplexity, setBuildingComplexity] = useState('');
    const [existingDocs, setExistingDocs] = useState<string[]>([]);
    const [assessmentPurpose, setAssessmentPurpose] = useState('');
    const [heatingCooling, setHeatingCooling] = useState<string[]>([]);

    // Technical
    const [technicalAssessmentType, setTechnicalAssessmentType] = useState('');
    const [technicalPropertyType, setTechnicalPropertyType] = useState('');
    const [yearBuilt, setYearBuilt] = useState('');
    const [currentHeating, setCurrentHeating] = useState('');
    const [insulationStatus, setInsulationStatus] = useState('');
    const [technicalPurpose, setTechnicalPurpose] = useState('');

    // Shared
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [notes, setNotes] = useState('');

    // Homeowner profile check/create
    const [homeownerUserId, setHomeownerUserId] = useState<string | null>(null);
    const [homeownerStatus, setHomeownerStatus] = useState<'idle' | 'checking' | 'found' | 'not_found' | 'created' | 'error'>('idle');
    const [homeownerMessage, setHomeownerMessage] = useState('');
    const [isCreatingHomeowner, setIsCreatingHomeowner] = useState(false);

    const resetForm = () => {
        setJobType('');
        setStep(1);
        setContactName(''); setContactEmail(''); setContactPhone('');
        setCounty(''); setTown(''); setEircode('');
        setPropertyType(''); setPropertySize(''); setBedrooms('');
        setAdditionalFeatures([]); setHeatPump(''); setBerPurpose('');
        setBuildingType(''); setFloorArea(''); setBuildingComplexity('');
        setExistingDocs([]); setAssessmentPurpose(''); setHeatingCooling([]);
        setTechnicalAssessmentType(''); setTechnicalPropertyType(''); setYearBuilt('');
        setCurrentHeating(''); setInsulationStatus(''); setTechnicalPurpose('');
        setPreferredDate(''); setPreferredTime(''); setNotes('');
        setHomeownerUserId(null); setHomeownerStatus('idle'); setHomeownerMessage('');
    };

    const checkHomeowner = async () => {
        if (!contactEmail) return;
        setHomeownerStatus('checking');
        setHomeownerMessage('');
        setHomeownerUserId(null);
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, role')
                .eq('email', contactEmail.toLowerCase())
                .maybeSingle();
            if (error) throw error;
            if (profile) {
                setHomeownerUserId(profile.id);
                setHomeownerStatus('found');
                setHomeownerMessage(`Profile found for ${profile.email} (${profile.role || 'user'})`);
            } else {
                setHomeownerStatus('not_found');
                setHomeownerMessage('No homeowner profile found for this email. Create one to continue.');
            }
        } catch (err: any) {
            setHomeownerStatus('error');
            setHomeownerMessage(err?.message || 'Error checking profile');
        }
    };

    const createHomeowner = async () => {
        if (!contactEmail || !contactName) return;
        if (!contactPhone || contactPhone.trim() === '') {
            toast.error('A phone number is required to create a homeowner account');
            return;
        }
        setIsCreatingHomeowner(true);
        setHomeownerStatus('checking');
        setHomeownerMessage('');
        try {
            const { data, error } = await supabase.functions.invoke('create-homeowner-account', {
                body: { email: contactEmail, fullName: contactName, phone: contactPhone, tenant: selectedTenant }
            });
            if (error || !data?.success) {
                const msg = data?.error || error?.message || 'Failed to create homeowner';
                setHomeownerStatus('error');
                setHomeownerMessage(msg);
                toast.error(msg);
            } else {
                setHomeownerUserId(data.userId);
                setHomeownerStatus(data.created ? 'created' : 'found');
                setHomeownerMessage(data.created ? `Homeowner account created for ${contactEmail}` : `Existing profile linked: ${data.message || ''}`);
                toast.success(data.created ? `Homeowner account created for ${contactEmail}` : `Existing profile found for ${contactEmail}`);

                if (data.created && data.password) {
                    supabase.functions.invoke('send-homeowner-credentials', {
                        body: {
                            fullName: contactName,
                            email: contactEmail,
                            password: data.password,
                            loginUrl: data.loginUrl,
                            tenant: selectedTenant,
                        },
                    }).catch(err => console.error('Failed to send homeowner credentials email:', err));
                }
            }
        } catch (err: any) {
            setHomeownerStatus('error');
            setHomeownerMessage(err?.message || 'Failed to create homeowner');
            toast.error('Failed to create homeowner profile');
        } finally {
            setIsCreatingHomeowner(false);
        }
    };

    const handleEmailChange = (value: string) => {
        setContactEmail(value);
        if (homeownerStatus !== 'idle') {
            setHomeownerStatus('idle');
            setHomeownerMessage('');
            setHomeownerUserId(null);
        }
    };

    const toggleFeature = (feature: string, current: string[], setter: (v: string[]) => void) => {
        if (feature === 'None' || feature === 'None available' || feature === 'Unknown') {
            setter([feature]);
        } else {
            const cleaned = current.filter(f => f !== 'None' && f !== 'None available' && f !== 'Unknown');
            if (cleaned.includes(feature)) {
                setter(cleaned.filter(f => f !== feature));
            } else {
                setter([...cleaned, feature]);
            }
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return; // Prevent double submission
        if (!contactName || !contactEmail || !contactPhone || !county || !town || !eircode) {
            toast.error('Please fill in all required fields (including Eircode/Postcode)');
            return;
        }
        if (jobType === 'commercial' && (!buildingType || !floorArea)) {
            toast.error('Building type and floor area are required for commercial jobs');
            return;
        }
        if (jobType === 'technical' && (!technicalPropertyType || !propertySize)) {
            toast.error('Property type and property size are required');
            return;
        }
        if (jobType !== 'commercial' && jobType !== 'technical' && (!propertyType || !propertySize)) {
            toast.error('Property type and property size are required');
            return;
        }
        if (!homeownerUserId) {
            toast.error('Please verify or create the homeowner profile before posting the job');
            setStep(2);
            return;
        }
        setIsSubmitting(true);
        try {
            const tenant = selectedTenant;

            const basePayload: any = {
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
                user_id: homeownerUserId,
                job_type: jobType || 'domestic',
                tenant,
                posted_by: 'admin',
                payer_type: 'homeowner',
                notes: notes || null,
            };

            let insertPayload;
            if (jobType === 'commercial') {
                insertPayload = {
                    ...basePayload,
                    building_type: buildingType || null,
                    floor_area: floorArea || null,
                    building_complexity: buildingComplexity || null,
                    existing_docs: existingDocs.length > 0 ? existingDocs : null,
                    assessment_purpose: assessmentPurpose || null,
                    heating_cooling_systems: heatingCooling.length > 0 ? heatingCooling : null,
                };
            } else if (jobType === 'technical') {
                const technicalNotes = `Assessment Type: ${technicalAssessmentType}\nYear Built: ${yearBuilt}\nCurrent Heating: ${currentHeating}\nInsulation: ${insulationStatus}${notes ? '\n\nAdditional Notes: ' + notes : ''}`;
                insertPayload = {
                    ...basePayload,
                    property_type: technicalPropertyType || null,
                    property_size: propertySize || null,
                    assessment_purpose: technicalPurpose || null,
                    notes: technicalNotes,
                };
            } else {
                insertPayload = {
                    ...basePayload,
                    property_type: propertyType || null,
                    property_size: propertySize || null,
                    bedrooms: bedrooms ? parseInt(bedrooms) : null,
                    additional_features: additionalFeatures.length > 0 ? additionalFeatures : null,
                    heat_pump: heatPump || null,
                    ber_purpose: berPurpose || null,
                };
            }

            const { data, error } = await supabase
                .from('assessments')
                .insert(insertPayload)
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
                        jobType: jobType || 'domestic',
                        customerPhone: contactPhone,
                        tenant,
                    }
                });
            } catch (emailErr) {
                console.error('Failed to send notification:', emailErr);
            }

            toast.success('Job created and assessors notified!');
            resetForm();
            onJobCreated();
            onClose();
        } catch (error: any) {
            console.error('Error creating job:', error);
            toast.error(error.message || 'Failed to create job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        if (step === 1) return !!jobType;
        if (step === 2) return !!contactName && !!contactEmail && !!contactPhone && (homeownerStatus === 'found' || homeownerStatus === 'created');
        if (step === 3) return !!county && !!town;
        if (jobType === 'domestic') {
            if (step === 4) return !!propertyType && !!propertySize && !!bedrooms;
            if (step === 5) return !!berPurpose;
        }
        if (jobType === 'commercial') {
            if (step === 4) return !!buildingType && !!floorArea && !!buildingComplexity;
            if (step === 5) return !!assessmentPurpose;
        }
        if (jobType === 'technical') {
            if (step === 4) return !!technicalAssessmentType && !!technicalPropertyType && !!propertySize;
            if (step === 5) return !!technicalPurpose;
        }
        return true;
    };

    const totalSteps = jobType === 'commercial' ? 6 : 6;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#007F00] to-green-600 p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Create Job for Homeowner</h2>
                        <p className="text-green-100 text-sm mt-1">Register a job on behalf of a homeowner</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Job Type */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">What type of job?</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => setJobType('domestic')} className={`p-4 rounded-xl border-2 text-left transition-all ${jobType === 'domestic' ? 'border-[#007F00] bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                                    <Home size={24} className="text-[#007F00] mb-2" />
                                    <div className="font-bold text-gray-900">Domestic</div>
                                    <div className="text-xs text-gray-500">Residential property</div>
                                </button>
                                <button onClick={() => setJobType('commercial')} className={`p-4 rounded-xl border-2 text-left transition-all ${jobType === 'commercial' ? 'border-[#007F00] bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                                    <Briefcase size={24} className="text-[#007F00] mb-2" />
                                    <div className="font-bold text-gray-900">Commercial</div>
                                    <div className="text-xs text-gray-500">Business property</div>
                                </button>
                                <button onClick={() => setJobType('technical')} className={`p-4 rounded-xl border-2 text-left transition-all ${jobType === 'technical' ? 'border-[#007F00] bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                                    <Wrench size={24} className="text-[#007F00] mb-2" />
                                    <div className="font-bold text-gray-900">Technical</div>
                                    <div className="text-xs text-gray-500">Heat pumps, new builds & energy audits</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Homeowner Contact Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input value={contactName} onChange={e => setContactName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="John Smith" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <div className="flex gap-2">
                                        <input type="email" value={contactEmail} onChange={e => handleEmailChange(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="john@example.com" />
                                        <button
                                            type="button"
                                            onClick={checkHomeowner}
                                            disabled={!contactEmail || homeownerStatus === 'checking'}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                        >
                                            {homeownerStatus === 'checking' ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                    <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="+353 85 123 4567" />
                                </div>
                            </div>

                            {/* Homeowner Profile Status */}
                            {homeownerStatus === 'found' && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                                    <p className="text-sm text-green-800 font-medium">{homeownerMessage}</p>
                                </div>
                            )}
                            {homeownerStatus === 'created' && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                                    <p className="text-sm text-green-800 font-medium">{homeownerMessage}</p>
                                </div>
                            )}
                            {homeownerStatus === 'not_found' && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-800 font-medium">{homeownerMessage}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={createHomeowner}
                                        disabled={isCreatingHomeowner || !contactName}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#007F00] text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isCreatingHomeowner ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                        {isCreatingHomeowner ? 'Creating...' : 'Create Homeowner Profile'}
                                    </button>
                                </div>
                            )}
                            {homeownerStatus === 'error' && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-3">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-800 font-medium">{homeownerMessage}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={createHomeowner}
                                        disabled={isCreatingHomeowner || !contactName}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#007F00] text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isCreatingHomeowner ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                        {isCreatingHomeowner ? 'Creating...' : 'Try Create Homeowner Profile'}
                                    </button>
                                </div>
                            )}
                            {homeownerStatus === 'idle' && contactEmail && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <AlertTriangle size={18} className="text-blue-600 flex-shrink-0" />
                                    <p className="text-sm text-blue-800 font-medium">Click "Check" to verify if a homeowner profile exists for this email.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Property Location</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                                    <select value={county} onChange={e => setCounty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select county</option>
                                        {getCountiesForTenant(selectedTenant).map((c: string) => <option key={c} value={c}>{c}</option>)},
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Town *</label>
                                    <input value={town} onChange={e => setTown(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="e.g. Dundrum" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Eircode / Postcode</label>
                                    <input value={eircode} onChange={e => setEircode(e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="e.g. D14 AB12" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Property Details */}
                    {step === 4 && jobType === 'domestic' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Property Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                                    <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select type</option>
                                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Size</label>
                                    <select value={propertySize} onChange={e => setPropertySize(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select size</option>
                                        {PROPERTY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                    <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Features</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ADDITIONAL_FEATURES.map(f => (
                                            <button key={f} onClick={() => toggleFeature(f, additionalFeatures, setAdditionalFeatures)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${additionalFeatures.includes(f) ? 'bg-green-100 border-[#007F00] text-[#007F00] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Heat Pump</label>
                                    <select value={heatPump} onChange={e => setHeatPump(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {HEAT_PUMP_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && jobType === 'technical' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Technical Assessment Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                                    <select value={technicalAssessmentType} onChange={e => setTechnicalAssessmentType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select type</option>
                                        {(TECHNICAL_ASSESSMENT_TYPES[selectedTenant] || TECHNICAL_ASSESSMENT_TYPES.ireland).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                                    <select value={technicalPropertyType} onChange={e => setTechnicalPropertyType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select type</option>
                                        {(TECHNICAL_PROPERTY_TYPES[selectedTenant] || TECHNICAL_PROPERTY_TYPES.ireland).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Size</label>
                                    <select value={propertySize} onChange={e => setPropertySize(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select size</option>
                                        {PROPERTY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                                    <select value={yearBuilt} onChange={e => setYearBuilt(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {(YEAR_BUILT_OPTIONS[selectedTenant] || YEAR_BUILT_OPTIONS.ireland).map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Heating</label>
                                    <select value={currentHeating} onChange={e => setCurrentHeating(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {(CURRENT_HEATING_OPTIONS[selectedTenant] || CURRENT_HEATING_OPTIONS.ireland).map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Insulation Status</label>
                                    <select value={insulationStatus} onChange={e => setInsulationStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {(INSULATION_STATUS_OPTIONS[selectedTenant] || INSULATION_STATUS_OPTIONS.ireland).map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && jobType === 'commercial' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Building Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Building Type</label>
                                    <select value={buildingType} onChange={e => setBuildingType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select type</option>
                                        {BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Area</label>
                                    <select value={floorArea} onChange={e => setFloorArea(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select area</option>
                                        {COMMERCIAL_FLOOR_AREAS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Building Complexity</label>
                                    <select value={buildingComplexity} onChange={e => setBuildingComplexity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select</option>
                                        {BUILDING_COMPLEXITY.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Existing Docs</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EXISTING_DOCS.map(f => (
                                            <button key={f} onClick={() => toggleFeature(f, existingDocs, setExistingDocs)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${existingDocs.includes(f) ? 'bg-green-100 border-[#007F00] text-[#007F00] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Heating / Cooling</label>
                                    <div className="flex flex-wrap gap-2">
                                        {HEATING_COOLING.map(f => (
                                            <button key={f} onClick={() => toggleFeature(f, heatingCooling, setHeatingCooling)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${heatingCooling.includes(f) ? 'bg-green-100 border-[#007F00] text-[#007F00] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Purpose & Schedule */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Purpose & Schedule</h3>
                            <div className="space-y-3">
                                {jobType === 'domestic' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">BER Purpose</label>
                                        <select value={berPurpose} onChange={e => setBerPurpose(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                            <option value="">Select purpose</option>
                                            {BER_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                )}
                                {jobType === 'commercial' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Purpose</label>
                                        <select value={assessmentPurpose} onChange={e => setAssessmentPurpose(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                            <option value="">Select purpose</option>
                                            {COMMERCIAL_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                )}
                                {jobType === 'technical' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Technical Purpose</label>
                                        <select value={technicalPurpose} onChange={e => setTechnicalPurpose(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                            <option value="">Select purpose</option>
                                            {(TECHNICAL_PURPOSES[selectedTenant] || TECHNICAL_PURPOSES.ireland).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                    <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                    <select value={preferredTime} onChange={e => setPreferredTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]">
                                        <option value="">Select time</option>
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Notes */}
                    {step === 6 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Additional Notes</h3>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007F00]" placeholder="Any special instructions or notes for assessors..." />
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <h4 className="font-bold text-gray-800 mb-2">Summary</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Type:</strong> {jobType || 'N/A'}</p>
                                    <p><strong>Contact:</strong> {contactName} — {contactEmail} — {contactPhone}</p>
                                    <p><strong>Location:</strong> {town}, {county} {eircode && `(${eircode})`}</p>
                                    {jobType === 'domestic' && <p><strong>Property:</strong> {propertyType}, {propertySize}, {bedrooms} bed</p>}
                                    {jobType === 'commercial' && <p><strong>Building:</strong> {buildingType}, {floorArea}</p>}
                                    {jobType === 'technical' && <p><strong>Technical:</strong> {technicalAssessmentType}, {technicalPropertyType}, {propertySize}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 flex justify-between items-center shrink-0 bg-gray-50">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-medium">Step {step} of {totalSteps}</span>
                        {step < totalSteps ? (
                            <button onClick={() => isStepValid() && setStep(s => s + 1)} disabled={!isStepValid()} className="px-5 py-2 bg-[#007F00] text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-2 bg-[#007F00] text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2">
                                {isSubmitting ? 'Creating...' : <><Plus size={16} /> Create Job</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
