import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Check, Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { getTenantFromDomain } from '../lib/tenant';
import { useTranslation } from '../hooks/useTranslation';
import EmailVerification from './EmailVerification';
import JobConfirmation from './JobConfirmation';
import { getTownsForTenant, getCountiesForTenant, getNestedTownsForTenant } from '../lib/tenantData';

const ROUTING_KEYS: Record<string, string> = {
    'Carlow': 'R93', 'Cavan': 'H12', 'Clare': 'V95', 'Cork': 'T12', 'Donegal': 'F92',
    'Dublin': 'D', 'Galway': 'H91', 'Kerry': 'V92', 'Kildare': 'W91', 'Kilkenny': 'R95',
    'Laois': 'R32', 'Leitrim': 'N41', 'Limerick': 'V94', 'Longford': 'N39', 'Louth': 'A91',
    'Mayo': 'F23', 'Meath': 'C15', 'Monaghan': 'H18', 'Offaly': 'R35', 'Roscommon': 'F42',
    'Sligo': 'F91', 'Tipperary': 'E21', 'Waterford': 'X91', 'Westmeath': 'N37', 'Wexford': 'Y35',
    'Wicklow': 'A63'
};

// --- Domestic options ---
const PROPERTY_TYPES = ['Semi-Detached', 'Mid-Terrace', 'End-Terrace', 'Apartment', 'Piso', 'Duplex', 'Detached', 'Bungalow', 'Multi-Unit', 'Other'];
const PROPERTY_SIZES = [
    'Under 750 sq.ft',
    '750 - 1000 sq.ft',
    '1000 - 1250 sq.ft',
    '1250 - 1500 sq.ft',
    '1500 - 1750 sq.ft',
    '1750 - 2000 sq.ft',
    '2000 - 2500 sq.ft',
    '2500 - 3000 sq.ft',
    '3000 - 4000 sq.ft',
    'Over 4000 sq.ft'
];

const PROPERTY_SIZES_METRIC = [
    'Under 70 m²',
    '70 - 90 m²',
    '90 - 110 m²',
    '110 - 140 m²',
    '140 - 160 m²',
    '160 - 185 m²',
    '185 - 230 m²',
    '230 - 280 m²',
    '280 - 370 m²',
    'Over 370 m²'
];
const TIME_SLOTS = ['Any time', '8am - 10am', '10am - 2pm', '2pm - 6pm', '6pm - 8pm'];
const ADDITIONAL_FEATURES = ['Attic/Garage conversion', 'Extensions', 'Conservatory', 'Multiple', 'None'];
const HEAT_PUMP_OPTIONS = ['No', 'Air Source', 'Ground Source'];
const BER_PURPOSES = ['Selling', 'Letting', 'Govt Grant', 'Mortgage', 'New Build', 'Personal Interest', 'Other'];

// --- Commercial options ---
const BUILDING_TYPES = ['Office', 'Retail / Shop', 'Warehouse / Industrial', 'Hospitality', 'Healthcare', 'Education', 'Mixed-Use', 'Other'];
const BUILDING_COMPLEXITY_OPTIONS = ['Single unit', 'Multi-unit building', 'Multi-floor building', 'Large complex site'];
const EXISTING_DOCS_OPTIONS = ['Architectural drawings', 'Mechanical/electrical specs', 'Previous energy report', 'None available'];
const COMMERCIAL_PURPOSES = ['Compliance requirement', 'Selling property', 'Leasing property', 'ESG reporting', 'Grant / funding', 'Energy upgrade planning', 'Other'];
const HEATING_COOLING_OPTIONS = ['Gas boiler', 'Oil boiler', 'Heat pump', 'Chillers', 'Air handling units', 'Unknown'];

// --- Commercial Floor Area options ---
const COMMERCIAL_FLOOR_AREAS_METRIC = [
    'Under 100 m²',
    '100 - 250 m²',
    '250 - 500 m²',
    '500 - 1000 m²',
    '1000 - 2500 m²',
    '2500 - 5000 m²',
    '5000 - 10000 m²',
    'Over 10000 m²'
];
const COMMERCIAL_FLOOR_AREAS_IMPERIAL = [
    'Under 1,076 sq.ft',
    '1,076 - 2,690 sq.ft',
    '2,690 - 5,382 sq.ft',
    '5,382 - 10,764 sq.ft',
    '10,764 - 26,910 sq.ft',
    '26,910 - 53,820 sq.ft',
    '53,820 - 107,639 sq.ft',
    'Over 107,639 sq.ft'
];

// --- Technical Assessment options (tenant-specific) ---
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

interface FormData {
    // Shared
    jobType: 'domestic' | 'commercial' | 'technical' | '';
    preferredDate: string;
    preferredTime: string;
    county: string;
    town: string;
    fullName: string;
    email: string;
    phone: string;
    eircode: string;
    notes: string;
    // Domestic-specific
    propertyType: string;
    propertySize: string;
    bedrooms: string;
    additionalFeatures: string[];
    heatPump: string;
    berPurpose: string;
    // Commercial-specific
    buildingType: string;
    floorArea: string;
    buildingComplexity: string;
    existingDocs: string[];
    assessmentPurpose: string;
    heatingCoolingSystems: string[];
    // Technical-specific
    technicalAssessmentType: string;
    technicalPropertyType: string;
    yearBuilt: string;
    currentHeating: string;
    insulationStatus: string;
    technicalPurpose: string;
}

interface QuoteFormModuleProps {
    onClose?: () => void;
}

const QuoteFormModule = ({ onClose }: QuoteFormModuleProps) => {
    const { user } = useAuth();
    const { t, o, isSpanish, tenant } = useTranslation();
    const location = useLocation();
    const prefill = (location.state as { county?: string; propertyType?: string } | null) || {};
    const certName = isSpanish ? 'CEE' : (tenant === 'england' ? 'EPC' : tenant === 'france' ? 'DPE' : tenant === 'portugal' ? 'CE' : 'BER');
    const [currentStep, setCurrentStep] = useState(0); // Start at step 0 (Job Type)
    const [sizeUnit, setSizeUnit] = useState<'ft' | 'm'>('m'); // Default to m²
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [platformFeeAmount, setPlatformFeeAmount] = useState(25);
    const [hiddenFeeAmount, setHiddenFeeAmount] = useState(10);

    useEffect(() => {
        const fetchFees = async () => {
            const currentTenant = getTenantFromDomain();
            const { data } = await supabase
                .from('app_settings')
                .select('platform_fee_amount, hidden_fee_amount')
                .eq('tenant', currentTenant)
                .single();
            if (data) {
                if (data.platform_fee_amount != null) setPlatformFeeAmount(parseFloat(data.platform_fee_amount));
                if (data.hidden_fee_amount != null) setHiddenFeeAmount(parseFloat(data.hidden_fee_amount));
            }
        };
        fetchFees();
    }, []);
    const [emailError, _setEmailError] = useState<string | null>(null);
    const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
    const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState(false);
    const [passwordStep, setPasswordStep] = useState<{ loading: boolean; isExistingUser: boolean; password: string; showPassword: boolean; creating: boolean }>({
        loading: false,
        isExistingUser: false,
        password: '',
        showPassword: false,
        creating: false,
    });

    const [formData, setFormData] = useState<FormData>({
        jobType: '',
        preferredDate: '',
        preferredTime: '',
        county: prefill.county || '',
        town: '',
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: '',
        eircode: '',
        notes: '',
        // Domestic
        propertyType: prefill.propertyType || '',
        propertySize: '',
        bedrooms: '',
        additionalFeatures: [],
        heatPump: '',
        berPurpose: '',
        // Commercial
        buildingType: '',
        floorArea: '',
        buildingComplexity: '',
        existingDocs: [],
        assessmentPurpose: '',
        heatingCoolingSystems: [],
        // Technical
        technicalAssessmentType: '',
        technicalPropertyType: '',
        yearBuilt: '',
        currentHeating: '',
        insulationStatus: '',
        technicalPurpose: '',
    });

    const isDomestic = formData.jobType === 'domestic';
    const isCommercial = formData.jobType === 'commercial';
    const isTechnical = formData.jobType === 'technical';

    // Total form steps (excluding auth steps):
    // Domestic: 0 (job type) + 1-11 (form) = 12 steps (0..11)
    // Commercial: 0 (job type) + 1-11 (form) = 12 steps (0..11)
    const TOTAL_FORM_STEPS = 12; // 0..11
    const LAST_FORM_STEP = 11;

    const updateField = (field: keyof FormData, value: string | string[]) => {
        setFormData((prev: FormData) => {
            const newData = { ...prev, [field]: value };
            if (field === 'county' && typeof value === 'string' && !prev.eircode && !isSpanish && tenant !== 'france' && tenant !== 'portugal') {
                newData.eircode = (ROUTING_KEYS[value] || '').replace(/\s/g, '');
            }
            return newData;
        });
    };

    const updateFieldAndAdvance = (field: keyof FormData, value: string | string[]) => {
        setFormData((prev: FormData) => {
            const newData = { ...prev, [field]: value };
            if (field === 'county' && typeof value === 'string' && !prev.eircode && !isSpanish && tenant !== 'france' && tenant !== 'portugal') {
                newData.eircode = (ROUTING_KEYS[value] || '').replace(/\s/g, '');
            }
            return newData;
        });
        setCurrentStep(prev => prev + 1);
    };

    // Domestic: toggle additional features
    const toggleFeature = (feature: string) => {
        if (feature === 'None') {
            setFormData((prev: FormData) => ({ ...prev, additionalFeatures: ['None'] }));
            setTimeout(() => setCurrentStep(prev => prev + 1), 150);
        } else {
            setFormData((prev: FormData) => {
                const current = prev.additionalFeatures.filter((f: string) => f !== 'None');
                if (current.includes(feature)) {
                    return { ...prev, additionalFeatures: current.filter((f: string) => f !== feature) };
                } else {
                    return { ...prev, additionalFeatures: [...current, feature] };
                }
            });
        }
    };

    // Commercial: toggle existing docs
    const toggleExistingDoc = (doc: string) => {
        if (doc === 'None available') {
            setFormData((prev: FormData) => ({ ...prev, existingDocs: ['None available'] }));
            setTimeout(() => setCurrentStep(prev => prev + 1), 150);
        } else {
            setFormData((prev: FormData) => {
                const current = prev.existingDocs.filter((d: string) => d !== 'None available');
                if (current.includes(doc)) {
                    return { ...prev, existingDocs: current.filter((d: string) => d !== doc) };
                } else {
                    return { ...prev, existingDocs: [...current, doc] };
                }
            });
        }
    };

    // Commercial: toggle heating/cooling systems
    const toggleHeatingCooling = (system: string) => {
        if (system === 'Unknown') {
            setFormData((prev: FormData) => ({ ...prev, heatingCoolingSystems: ['Unknown'] }));
            setTimeout(() => setCurrentStep(prev => prev + 1), 150);
        } else {
            setFormData((prev: FormData) => {
                const current = prev.heatingCoolingSystems.filter((s: string) => s !== 'Unknown');
                if (current.includes(system)) {
                    return { ...prev, heatingCoolingSystems: current.filter((s: string) => s !== system) };
                } else {
                    return { ...prev, heatingCoolingSystems: [...current, system] };
                }
            });
        }
    };

    const canProceed = (): boolean => {
        if (currentStep === 0) return !!formData.jobType;

        if (isDomestic) {
            switch (currentStep) {
                case 1: return !!formData.preferredDate;
                case 2: return !!formData.preferredTime;
                case 3: return !!formData.propertyType;
                case 4: return !!formData.propertySize;
                case 5: return !!formData.bedrooms;
                case 6: return formData.additionalFeatures.length > 0;
                case 7: return !!formData.heatPump;
                case 8: return !!formData.county;
                case 9: return !!formData.town;
                case 10: return !!formData.berPurpose;
                case 11: {
                    const key = ROUTING_KEYS[formData.county];
                    const cleanEircode = formData.eircode.replace(/\s/g, '');
                    const eircodeValid = isSpanish
                        ? cleanEircode.length >= 5
                        : tenant === 'england'
                            ? cleanEircode.length >= 5
                            : tenant === 'portugal'
                                ? cleanEircode.length >= 4
                                : tenant === 'france'
                                    ? cleanEircode.length >= 5
                                    : cleanEircode.length >= 7 && (!key || cleanEircode.startsWith(key));
                    return !!formData.fullName && !!formData.email && !!formData.phone && eircodeValid;
                }
                case 12: return true;
                case 13: return true;
                default: return false;
            }
        }

        if (isCommercial) {
            switch (currentStep) {
                case 1: return !!formData.preferredDate;
                case 2: return !!formData.preferredTime;
                case 3: return !!formData.buildingType;
                case 4: return !!formData.floorArea;
                case 5: return !!formData.buildingComplexity;
                case 6: return formData.existingDocs.length > 0;
                case 7: return !!formData.assessmentPurpose;
                case 8: return formData.heatingCoolingSystems.length > 0;
                case 9: return !!formData.county;
                case 10: return !!formData.town;
                case 11: {
                    const key = ROUTING_KEYS[formData.county];
                    const cleanEircode = formData.eircode.replace(/\s/g, '');
                    const eircodeValid = isSpanish
                        ? cleanEircode.length >= 5
                        : tenant === 'england'
                            ? cleanEircode.length >= 5
                            : tenant === 'portugal'
                                ? cleanEircode.length >= 4
                                : tenant === 'france'
                                    ? cleanEircode.length >= 5
                                    : cleanEircode.length >= 7 && (!key || cleanEircode.startsWith(key));
                    return !!formData.fullName && !!formData.email && !!formData.phone && eircodeValid;
                }
                case 12: return true;
                case 13: return true;
                default: return false;
            }
        }

        if (isTechnical) {
            switch (currentStep) {
                case 1: return !!formData.technicalAssessmentType;
                case 2: return !!formData.technicalPropertyType;
                case 3: return !!formData.yearBuilt;
                case 4: return !!formData.currentHeating;
                case 5: return !!formData.insulationStatus;
                case 6: return !!formData.propertySize;
                case 7: return !!formData.technicalPurpose;
                case 8: return !!formData.preferredDate;
                case 9: return !!formData.county;
                case 10: return !!formData.town;
                case 11: {
                    const key = ROUTING_KEYS[formData.county];
                    const cleanEircode = formData.eircode.replace(/\s/g, '');
                    const eircodeValid = isSpanish
                        ? cleanEircode.length >= 5
                        : tenant === 'england'
                            ? cleanEircode.length >= 5
                            : tenant === 'portugal'
                                ? cleanEircode.length >= 4
                                : tenant === 'france'
                                    ? cleanEircode.length >= 5
                                    : cleanEircode.length >= 7 && (!key || cleanEircode.startsWith(key));
                    return !!formData.fullName && !!formData.email && !!formData.phone && eircodeValid;
                }
                case 12: return true;
                case 13: return true;
                default: return false;
            }
        }

        return false;
    };

    const handleNext = () => {
        if (currentStep < LAST_FORM_STEP && canProceed()) {
            setCurrentStep((prev: number) => prev + 1);
        } else if (currentStep === LAST_FORM_STEP) {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev: number) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) return;
        // Only auto-submit if the logged-in user has a profile and matches the contact email
        const validUserId = await resolveValidSessionUserId();
        if (validUserId) {
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('id', validUserId)
                .maybeSingle();
            if (existingProfile && existingProfile.email?.toLowerCase() === formData.email.toLowerCase()) {
                handleFinalSubmission(validUserId);
                return;
            }
        }
        setCurrentStep(12);
    };

    // Returns a valid, DB-backed user id for the current session, or null.
    // Signs out stale sessions whose auth user no longer exists.
    const resolveValidSessionUserId = async (): Promise<string | null> => {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionUserId = session?.user?.id || user?.id;
        if (!sessionUserId) return null;
        const { data: { user: liveUser }, error } = await supabase.auth.getUser();
        if (error || !liveUser) {
            console.warn('Stale session detected, signing out:', error?.message);
            await supabase.auth.signOut();
            return null;
        }
        return liveUser.id;
    };

    const handleEmailVerified = async () => {
        const validUserId = await resolveValidSessionUserId();
        if (validUserId) {
            // Already logged in — skip password step and post job
            handleFinalSubmission(validUserId);
            return;
        }
        // Account creation is always the last step before posting the job
        setCurrentStep(13);
    };

    const handlePasswordSubmit = async () => {
        if (passwordStep.password.length < 6) {
            toast.error(isSpanish ? 'La contraseña debe tener al menos 6 caracteres' : tenant === 'france' ? 'Le mot de passe doit comporter au moins 6 caractères' : tenant === 'portugal' ? 'A palavra-passe deve ter pelo menos 6 caracteres' : 'Password must be at least 6 characters');
            return;
        }
        setPasswordStep(prev => ({ ...prev, creating: true }));
        try {
            const currentTenant = getTenantFromDomain();

            // First try to sign in (existing user)
            const { data: signInData } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: passwordStep.password,
            });

            if (signInData?.user?.id) {
                toast.success(isSpanish ? '¡Sesión iniciada! Publicando trabajo...' : tenant === 'france' ? 'Connecté ! Publication de la mission...' : tenant === 'portugal' ? 'Sessão iniciada! A publicar trabalho...' : 'Signed in! Posting job...');
                setPasswordStep(prev => ({ ...prev, creating: false }));
                handleFinalSubmission(signInData.user.id);
                return;
            }

            // If sign in failed, try to create a new account
            const { data: signupData, error: signupError } = await supabase.functions.invoke('self-signup', {
                body: {
                    email: formData.email,
                    password: passwordStep.password,
                    fullName: formData.fullName,
                    role: 'user',
                    phone: formData.phone,
                    tenant: currentTenant,
                },
            });
            if (signupError) throw signupError;
            if (!signupData?.success) {
                const errMsg = signupData?.error || 'Signup failed';
                if (errMsg === 'EMAIL_EXISTS') {
                    // Account exists but wrong password — tell user to log in with existing password
                    toast.error(isSpanish ? 'Ya existe una cuenta con este email. Inicia sesión con tu contraseña existente.' : tenant === 'france' ? 'Un compte existe déjà avec cet e-mail. Connectez-vous avec votre mot de passe existant.' : tenant === 'portugal' ? 'Já existe uma conta com este email. Inicie sessão com a sua palavra-passe existente.' : 'An account already exists with this email. Sign in with your existing password.');
                    setPasswordStep(prev => ({ ...prev, creating: false, password: '' }));
                    return;
                }
                throw new Error(errMsg);
            }
            const signupUserId = signupData?.user_id || signupData?.user?.id;
            if (!signupUserId) {
                throw new Error('Account created but user ID was not returned. Please try again.');
            }
            toast.success(isSpanish ? '¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.' : tenant === 'france' ? 'Compte créé ! Vérifiez votre e-mail pour confirmer.' : tenant === 'portugal' ? 'Conta criada! Verifique o seu email para confirmar.' : 'Account created! Check your email to confirm your account.');
            setResolvedUserId(signupUserId);
            setPasswordStep(prev => ({ ...prev, creating: false }));
            // New account is unconfirmed: hold the job until the email is confirmed
            handleFinalSubmission(signupUserId, { holdUntilConfirmed: true });
        } catch (err: any) {
            console.error('Password creation error:', err);
            toast.error(err.message || (isSpanish ? 'No se pudo crear la cuenta' : tenant === 'france' ? 'Impossible de créer le compte' : tenant === 'portugal' ? 'Não foi possível criar a conta' : 'Failed to create account'));
            setPasswordStep(prev => ({ ...prev, creating: false }));
        }
    };

    const handleFinalSubmission = async (overrideUserId?: string, opts?: { holdUntilConfirmed?: boolean }) => {
        if (isSubmitting) return; // Prevent double submission
        const holdUntilConfirmed = !!opts?.holdUntilConfirmed;

        // Full validation — re-check all mandatory fields before insert
        const missing: string[] = [];
        if (isDomestic) {
            if (!formData.jobType) missing.push('Assessment type');
            if (!formData.preferredDate) missing.push('Preferred date');
            if (!formData.preferredTime) missing.push('Preferred time');
            if (!formData.propertyType) missing.push('Property type');
            if (!formData.propertySize) missing.push('Property size');
            if (!formData.bedrooms) missing.push('Bedrooms');
            if (!formData.heatPump) missing.push('Heat pump');
            if (!formData.county) missing.push('County');
            if (!formData.town) missing.push('Town');
            if (!formData.berPurpose) missing.push('Purpose');
        } else if (isTechnical) {
            if (!formData.jobType) missing.push('Assessment type');
            if (!formData.technicalAssessmentType) missing.push('Assessment type');
            if (!formData.technicalPropertyType) missing.push('Property type');
            if (!formData.yearBuilt) missing.push('Year built');
            if (!formData.currentHeating) missing.push('Current heating');
            if (!formData.insulationStatus) missing.push('Insulation status');
            if (!formData.propertySize) missing.push('Property size');
            if (!formData.technicalPurpose) missing.push('Purpose');
            if (!formData.county) missing.push('County');
            if (!formData.town) missing.push('Town');
        } else if (isCommercial) {
            if (!formData.jobType) missing.push('Assessment type');
            if (!formData.buildingType) missing.push('Building type');
            if (!formData.floorArea) missing.push('Floor area');
            if (!formData.buildingComplexity) missing.push('Building complexity');
            if (!formData.assessmentPurpose) missing.push('Assessment purpose');
            if (!formData.county) missing.push('County');
            if (!formData.town) missing.push('Town');
        }
        // Common contact fields
        if (!formData.fullName) missing.push('Full name');
        if (!formData.email) missing.push('Email');
        if (!formData.phone) missing.push('Phone');

        if (missing.length > 0) {
            toast.error(`Please complete: ${missing.join(', ')}`);
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        try {
            let currentUserId = overrideUserId || resolvedUserId || await resolveValidSessionUserId();
            const tenant = getTenantFromDomain();

            if (!currentUserId) {
                // No valid account yet — send user to create one
                setIsSubmitting(false);
                setCurrentStep(13);
                return;
            }

            // Safety net: ensure a profile exists for the user_id before inserting the assessment
            if (currentUserId) {
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', currentUserId)
                    .maybeSingle();
                if (!existingProfile) {
                    const { error: profileInsertError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: currentUserId,
                            email: formData.email.toLowerCase(),
                            full_name: formData.fullName,
                            phone: formData.phone || null,
                            tenant,
                            role: 'user',
                            is_active: true,
                            registration_status: 'active',
                        }, { onConflict: 'id' });
                    if (profileInsertError) {
                        console.error('Profile insert error:', profileInsertError);
                        throw new Error('Could not create your profile before posting the job. Please try again.');
                    }
                }
            }

            const lastReferralStr = localStorage.getItem('last_referral');
            let referredByListingId = null;

            if (lastReferralStr) {
                try {
                    const referralData = JSON.parse(lastReferralStr);
                    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
                    if (Date.now() - referralData.timestamp < THIRTY_DAYS) {
                        referredByListingId = referralData.listingId;
                    }
                } catch (e) {
                    console.error('Error parsing referral data:', e);
                }
            }

            // Build the insert payload based on job type
            const basePayload = {
                property_address: `${formData.town}, ${formData.county}`,
                town: formData.town,
                county: formData.county,
                preferred_date: formData.preferredDate === 'Flexible' ? null : formData.preferredDate,
                preferred_time: formData.preferredDate === 'Flexible' ? `${formData.preferredTime} (Flexible)` : formData.preferredTime,
                status: 'submitted',
                contact_name: formData.fullName,
                contact_email: formData.email,
                contact_phone: formData.phone,
                eircode: formData.eircode,
                user_id: currentUserId || null,
                referred_by_listing_id: referredByListingId,
                job_type: formData.jobType,
                platform_fee: platformFeeAmount,
                hidden_fee: hiddenFeeAmount,
            };

            let insertPayload;

            if (isDomestic) {
                insertPayload = {
                    ...basePayload,
                    property_type: formData.propertyType,
                    property_size: formData.propertySize,
                    bedrooms: parseInt(formData.bedrooms),
                    additional_features: formData.additionalFeatures,
                    heat_pump: formData.heatPump,
                    ber_purpose: formData.berPurpose,
                };
            } else if (isTechnical) {
                insertPayload = {
                    ...basePayload,
                    property_type: formData.technicalPropertyType,
                    property_size: formData.propertySize,
                    assessment_purpose: formData.technicalPurpose,
                    notes: `Assessment Type: ${formData.technicalAssessmentType}\nYear Built: ${formData.yearBuilt}\nCurrent Heating: ${formData.currentHeating}\nInsulation: ${formData.insulationStatus}${formData.notes ? '\n\nAdditional Notes: ' + formData.notes : ''}`,
                };
            } else {
                insertPayload = {
                    ...basePayload,
                    building_type: formData.buildingType,
                    floor_area: formData.floorArea,
                    building_complexity: formData.buildingComplexity,
                    existing_docs: formData.existingDocs,
                    assessment_purpose: formData.assessmentPurpose,
                    heating_cooling_systems: formData.heatingCoolingSystems,
                    notes: formData.notes,
                };
            }

            const payloadWithTenant = { ...insertPayload, tenant };

            const { data, error: dbError } = await supabase
                .from('assessments')
                .insert(payloadWithTenant)
                .select()
                .single();

            if (dbError) throw dbError;

            const newAssessmentId = data.id;
            setAssessmentId(newAssessmentId);

            if (holdUntilConfirmed) {
                // Job stays 'submitted'. A DB trigger flips it to 'live' and notifies
                // assessors once the user confirms their email address.
                setPendingEmailConfirmation(true);
                toast.success(t('job_saved_pending_confirmation', 'Job saved! Confirm your email to make it live.'));
                setCurrentStep(14);
                return;
            }

            // Set status to live immediately and send notifications to contractors
            const { error: updateError } = await supabase
                .from('assessments')
                .update({ status: 'live' })
                .eq('id', newAssessmentId);

            if (updateError) {
                console.error('Failed to set assessment to live:', updateError);
            }

            // Send email notifications to contractors
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: formData.email,
                        customerName: formData.fullName,
                        county: formData.county,
                        town: formData.town,
                        assessmentId: newAssessmentId,
                        jobType: formData.jobType,
                        tenant
                    }
                });
            } catch (emailErr) {
                console.error('Failed to send job live email:', emailErr);
                toast.error(t('email_notify_failed', 'Email notification failed but job is live'));
            }

            toast.success(t('quotes_requested', 'Quotes requested successfully!'));
            setCurrentStep(14);

        } catch (error: any) {
            console.error('Error finalising quote:', error);
            toast.error(error.message || t('submit_failed', 'Failed to submit details.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const generateCalendarDates = () => {
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 15; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const formatDateDisplay = (date: Date) => {
        if (isSpanish) {
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
        }
        if (tenant === 'portugal') {
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
        }
        if (tenant === 'france') {
            const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
        }
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        return `${days[date.getDay()]} ${day}${getOrdinalSuffix(day)} ${months[date.getMonth()]}`;
    };

    // ========== RENDER HELPERS ==========

    const renderDateStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('preferred_date')}</h2>
            <p className="text-gray-500 text-center text-sm md:text-base -mt-4">
                {t('flexible_note', "Not sure yet? Just select")} <span className="italic font-medium text-gray-700">{t('flexible', "I'm Flexible")}.</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto overflow-y-auto max-h-[50vh] p-2 custom-scrollbar">
                <button
                    onClick={() => updateFieldAndAdvance('preferredDate', 'Flexible')}
                    className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${formData.preferredDate === 'Flexible' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                >
                    {t('flexible', "I'm Flexible")}
                </button>
                {generateCalendarDates().map((date) => (
                    <button
                        key={formatDate(date)}
                        onClick={() => updateFieldAndAdvance('preferredDate', formatDate(date))}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.preferredDate === formatDate(date) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                    >
                        <span className="block text-sm font-medium">{formatDateDisplay(date)}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderTimeStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('preferred_time')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-3xl mx-auto">
                {TIME_SLOTS.map((time) => (
                    <button
                        key={time}
                        onClick={() => updateFieldAndAdvance('preferredTime', time)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.preferredTime === time ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                    >{o(time)}</button>
                ))}
            </div>
        </div>
    );

    const locationLabel = isSpanish ? 'Comunidad Autónoma' : (tenant === 'england' ? 'Location' : tenant === 'portugal' ? 'Distrito' : tenant === 'france' ? 'Région' : 'County');
    const COUNTIES = getCountiesForTenant(tenant);

    const renderCountyStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{locationLabel}?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {COUNTIES.map((county: string) => (
                    <button
                        key={county}
                        onClick={() => { updateField('county', county); updateField('town', ''); setCurrentStep(prev => prev + 1); }}
                        className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${formData.county === county ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
                    >
                        {county}
                    </button>
                ))}
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">{t('scroll_counties', isSpanish ? 'Desplaza para ver más' : (tenant === 'england' ? 'Scroll to see more locations' : tenant === 'portugal' ? 'Deslize para ver mais distritos' : tenant === 'france' ? 'Faites défiler pour voir plus de régions' : 'Scroll to see more counties'))}</p>
        </div>
    );

    const postcodeLabel = isSpanish ? 'Código Postal' : (tenant === 'england' ? 'Postcode' : tenant === 'portugal' ? 'Código Postal' : tenant === 'france' ? 'Code Postal' : 'Eircode');

    const renderTownButton = (town: string) => (
        <button
            key={town}
            onClick={() => updateFieldAndAdvance('town', town)}
            className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${formData.town === town ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white text-gray-600'}`}
        >
            {town}
        </button>
    );

    const nestedTowns = getNestedTownsForTenant(tenant);
    const provincesForCounty = nestedTowns ? nestedTowns[formData.county] : null;

    const renderTownStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{isSpanish ? 'Municipio' : (tenant === 'england' ? 'Area / Town' : tenant === 'portugal' ? 'Concelho' : tenant === 'france' ? 'Ville' : 'Town')} / {postcodeLabel}?</h2>
            {provincesForCounty ? (
                <div className="max-w-4xl mx-auto max-h-[60vh] overflow-y-auto p-2 custom-scrollbar space-y-6">
                    {Object.entries(provincesForCounty).map(([province, towns]) => (
                        <div key={province}>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 px-1">{province}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {towns.map(renderTownButton)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                    {(getTownsForTenant(tenant)[formData.county] || []).map(renderTownButton)}
                </div>
            )}
            <p className="text-center text-gray-400 text-sm mt-4">{t('scroll_towns', isSpanish ? 'Desplaza para ver más municipios' : tenant === 'portugal' ? 'Deslize para ver mais concelhos' : tenant === 'france' ? 'Faites défiler pour voir plus de villes' : 'Scroll to see more towns')}</p>
        </div>
    );

    const renderContactStep = () => (
        <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center italic">{t('contact_details', 'Contact Details')}</h2>
            <div className="max-w-lg mx-auto space-y-4">
                <input type="text" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder={`${t('full_name')}*`} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500" />
                <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder={`${t('email_address')}*`} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex">
                        <span className="flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-xl text-sm font-bold text-gray-500 bg-gray-50 whitespace-nowrap">
                            {isSpanish ? '+34' : (tenant === 'england' ? '+44' : tenant === 'portugal' ? '+351' : tenant === 'france' ? '+33' : '+353')}
                        </span>
                        <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder={`${t('phone_number')}*`} className="flex-1 p-4 border-2 border-l-0 border-gray-200 rounded-r-xl focus:border-green-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                        <input type="text" value={formData.eircode} onChange={(e) => updateField('eircode', e.target.value.toUpperCase())} placeholder={`${postcodeLabel}*`} className={`w-full p-4 border-2 rounded-xl focus:border-green-500 ${tenant === 'ireland' && formData.eircode && formData.eircode.replace(/\s/g, '').length >= 7 && ROUTING_KEYS[formData.county] && !formData.eircode.replace(/\s/g, '').startsWith(ROUTING_KEYS[formData.county]) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                        {tenant === 'ireland' && formData.county && ROUTING_KEYS[formData.county] && (
                            <p className={`text-[10px] font-bold px-1 uppercase tracking-wide ${formData.eircode.replace(/\s/g, '').startsWith(ROUTING_KEYS[formData.county]) ? 'text-green-600' : 'text-amber-600'}`}>
                                Required: Must start with {ROUTING_KEYS[formData.county]}
                            </p>
                        )}
                    </div>
                </div>
                {isCommercial && (
                    <textarea
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        placeholder={t('notes', 'Additional notes (optional)')}
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 resize-none"
                    />
                )}
            </div>
        </div>
    );

    // ========== STEP CONTENT RENDERER ==========

    const renderStepContent = () => {
        // Step 0: Job Type Selection
        if (currentStep === 0) {
            return (
                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('assessment_type')}</h2>
                    <p className="text-gray-500 text-center text-sm md:text-base -mt-4">
                        {t('choose_property_type_desc', 'Choose the type of property you need assessed.')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <button
                            onClick={() => updateFieldAndAdvance('jobType', 'domestic')}
                            className={`p-8 rounded-2xl border-2 transition-all text-center group hover:shadow-lg ${formData.jobType === 'domestic' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                        >
                            <div className="text-4xl mb-4"></div>
                            <h3 className={`text-xl font-bold mb-2 ${formData.jobType === 'domestic' ? 'text-green-700' : 'text-gray-800'}`}>{t('domestic')} ({certName})</h3>
                            <p className="text-sm text-gray-500">{t('domestic_desc', 'Houses, apartments, duplexes & other residential properties')}</p>
                        </button>
                        <button
                            onClick={() => updateFieldAndAdvance('jobType', 'commercial')}
                            className={`p-8 rounded-2xl border-2 transition-all text-center group hover:shadow-lg ${formData.jobType === 'commercial' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                        >
                            <div className="text-4xl mb-4"></div>
                            <h3 className={`text-xl font-bold mb-2 ${formData.jobType === 'commercial' ? 'text-green-700' : 'text-gray-800'}`}>{t('commercial')} ({certName})</h3>
                            <p className="text-sm text-gray-500">{t('commercial_desc', 'Offices, retail, warehouses & other commercial properties')}</p>
                        </button>
                        <button
                            onClick={() => updateFieldAndAdvance('jobType', 'technical')}
                            className={`p-8 rounded-2xl border-2 transition-all text-center group hover:shadow-lg ${formData.jobType === 'technical' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                        >
                            <div className="text-4xl mb-4"></div>
                            <h3 className={`text-xl font-bold mb-2 ${formData.jobType === 'technical' ? 'text-green-700' : 'text-gray-800'}`}>{t('technical_assessment', 'Technical Assessment')}</h3>
                            <p className="text-sm text-gray-500">{t('technical_desc', 'Heat pumps, new builds & energy audits')}</p>
                        </button>
                    </div>
                </div>
            );
        }

        // ---------- DOMESTIC FLOW ----------
        if (isDomestic) {
            switch (currentStep) {
                case 1: return renderDateStep();
                case 2: return renderTimeStep();
                case 3:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('property_type')}?</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {PROPERTY_TYPES.filter(t => tenant === 'spain' || t !== 'Piso').map((type) => (
                                    <button key={type} onClick={() => updateFieldAndAdvance('propertyType', type)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.propertyType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(type)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 4:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('property_size')}?</h2>
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setSizeUnit('m')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'm' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Meters')}</button>
                                    <button
                                        onClick={() => setSizeUnit('ft')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'ft' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Feet')}</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-2xl mx-auto">
                                {(sizeUnit === 'ft' ? PROPERTY_SIZES : PROPERTY_SIZES_METRIC).map((size) => (
                                    <button key={size} onClick={() => updateFieldAndAdvance('propertySize', size)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.propertySize === size ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{size}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 5:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('number_of_bedrooms')}?</h2>
                            <div className="flex justify-center gap-4 flex-wrap max-w-xl mx-auto">
                                {['1', '2', '3', '4', '5', '6'].map((num) => (
                                    <button key={num} onClick={() => updateFieldAndAdvance('bedrooms', num)}
                                        className={`w-16 h-16 rounded-full border-2 transition-all text-xl font-medium ${formData.bedrooms === num ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 hover:border-green-300 bg-white text-gray-700'}`}
                                    >{num}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 6:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('additional_features')}?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                {ADDITIONAL_FEATURES.map((feature) => (
                                    <button key={feature} onClick={() => toggleFeature(feature)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center flex items-center justify-between ${formData.additionalFeatures.includes(feature) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >
                                        <span>{o(feature)}</span>
                                        {formData.additionalFeatures.includes(feature) && <Check size={20} className="text-green-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                case 7:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('heat_pump')}?</h2>
                            <div className="flex justify-center gap-4 flex-wrap max-w-xl mx-auto">
                                {HEAT_PUMP_OPTIONS.map((option) => (
                                    <button key={option} onClick={() => updateFieldAndAdvance('heatPump', option)}
                                        className={`px-8 py-4 rounded-lg border-2 transition-all ${formData.heatPump === option ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(option)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 8: return renderCountyStep();
                case 9: return renderTownStep();
                case 10:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('ber_purpose')}?</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {BER_PURPOSES.map((purpose) => (
                                    <button key={purpose} onClick={() => updateFieldAndAdvance('berPurpose', purpose)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.berPurpose === purpose ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(purpose)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 11: return renderContactStep();
                case 12:
                    return (
                        <EmailVerification
                            email={formData.email}
                            assessmentId={assessmentId}
                            onVerified={handleEmailVerified}
                            onBack={() => setCurrentStep(11)}
                        />
                    );
                case 13:
                    return (
                        <div className="space-y-6 max-w-md mx-auto pt-8">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <Lock size={28} className="text-green-600" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">
                                    {isSpanish ? 'Crea tu Contraseña' : tenant === 'france' ? 'Créez votre Mot de Passe' : tenant === 'portugal' ? 'Crie a sua Palavra-passe' : 'Create Your Password'}
                                </h2>
                                <p className="text-gray-500">
                                    {isSpanish ? 'Necesitarás esta contraseña para iniciar sesión y ver tus presupuestos.' : tenant === 'france' ? 'Vous aurez besoin de ce mot de passe pour vous connecter et voir vos devis.' : tenant === 'portugal' ? 'Necessitará desta palavra-passe para iniciar sessão e ver os seus orçamentos.' : 'You\'ll need this password to log in and view your quotes.'}
                                </p>
                            </div>
                            <div className="relative">
                                <input
                                    type={passwordStep.showPassword ? 'text' : 'password'}
                                    value={passwordStep.password}
                                    onChange={(e) => setPasswordStep(prev => ({ ...prev, password: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && passwordStep.password.length >= 6) handlePasswordSubmit(); }}
                                    placeholder="••••••••"
                                    autoFocus
                                    className="w-full px-4 py-4 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none pr-12 text-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordStep(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {passwordStep.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={passwordStep.creating || passwordStep.password.length < 6}
                                className="w-full py-4 bg-[#007F00] text-white rounded-full font-bold text-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {passwordStep.creating ? (
                                    <><span className="animate-spin">⟳</span> {isSpanish ? 'Creando...' : tenant === 'france' ? 'Création...' : tenant === 'portugal' ? 'A criar...' : 'Creating...'}</>
                                ) : (
                                    <>{isSpanish ? 'Crear Cuenta y Publicar' : tenant === 'france' ? 'Créer et Publier' : tenant === 'portugal' ? 'Criar e Publicar' : 'Create Account & Post Job'}</>
                                )}
                            </button>
                            <p className="text-center text-gray-400 text-sm">
                                {isSpanish ? 'Te enviaremos un correo de confirmación.' : tenant === 'france' ? 'Nous vous enverrons un e-mail de confirmation.' : tenant === 'portugal' ? 'Enviaremos um email de confirmação.' : 'We\'ll send you a confirmation email.'}
                            </p>
                        </div>
                    );
                case 14:
                    return (
                        <div className="pt-8">
                            <JobConfirmation
                                customerName={formData.fullName}
                                county={formData.county}
                                email={formData.email}
                                emailError={emailError}
                                hideNavigation={!!onClose || pendingEmailConfirmation}
                                pendingEmailConfirmation={pendingEmailConfirmation}
                            />
                            {onClose && !pendingEmailConfirmation && (
                                <button onClick={onClose} className="mt-8 w-full bg-gray-900 text-white font-bold py-4 rounded-xl">
                                    {isSpanish ? 'Cerrar e Ir al Panel' : tenant === 'portugal' ? 'Fechar e Ir para o Painel' : tenant === 'france' ? 'Fermer et Aller au Tableau de Bord' : 'Close & Go to Dashboard'}
                                </button>
                            )}
                        </div>
                    );
                default: return null;
            }
        }

        // ---------- COMMERCIAL FLOW ----------
        if (isCommercial) {
            switch (currentStep) {
                case 1: return renderDateStep();
                case 2: return renderTimeStep();
                case 3:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('building_type_prompt', 'Building type')}?</h2>
                            <p className="text-gray-500 text-center text-sm -mt-4">{t('select_building_type', 'Select the type of commercial building')}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                                {BUILDING_TYPES.map((type) => (
                                    <button key={type} onClick={() => updateFieldAndAdvance('buildingType', type)}
                                        className={`p-5 rounded-xl border-2 transition-all text-center ${formData.buildingType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(type)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 4:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('floor_area_prompt', 'Approx. floor area')}?</h2>
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setSizeUnit('m')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'm' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Meters')}</button>
                                    <button
                                        onClick={() => setSizeUnit('ft')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'ft' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Feet')}</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                                {(sizeUnit === 'ft' ? COMMERCIAL_FLOOR_AREAS_IMPERIAL : COMMERCIAL_FLOOR_AREAS_METRIC).map((size) => (
                                    <button key={size} onClick={() => updateFieldAndAdvance('floorArea', size)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.floorArea === size ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{size}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 5:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('building_complexity_prompt', 'Building complexity')}?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                {BUILDING_COMPLEXITY_OPTIONS.map((opt) => (
                                    <button key={opt} onClick={() => updateFieldAndAdvance('buildingComplexity', opt)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.buildingComplexity === opt ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(opt)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 6:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('existing_docs_prompt', 'Existing documentation')}?</h2>
                            <p className="text-gray-500 text-center text-sm -mt-4">{t('select_all_that_apply', 'Select all that apply')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                {EXISTING_DOCS_OPTIONS.map((doc) => (
                                    <button key={doc} onClick={() => toggleExistingDoc(doc)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center flex items-center justify-between ${formData.existingDocs.includes(doc) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >
                                        <span>{o(doc)}</span>
                                        {formData.existingDocs.includes(doc) && <Check size={20} className="text-green-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                case 7:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('purpose_prompt', 'Purpose of assessment')}?</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {COMMERCIAL_PURPOSES.map((purpose) => (
                                    <button key={purpose} onClick={() => updateFieldAndAdvance('assessmentPurpose', purpose)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.assessmentPurpose === purpose ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{o(purpose)}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 8:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('heating_cooling_prompt', 'Heating / Cooling Systems')}?</h2>
                            <p className="text-gray-500 text-center text-sm -mt-4">{t('select_all_that_apply', 'Select all that apply')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                {HEATING_COOLING_OPTIONS.map((system) => (
                                    <button key={system} onClick={() => toggleHeatingCooling(system)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center flex items-center justify-between ${formData.heatingCoolingSystems.includes(system) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >
                                        <span>{o(system)}</span>
                                        {formData.heatingCoolingSystems.includes(system) && <Check size={20} className="text-green-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                case 9: return renderCountyStep();
                case 10: return renderTownStep();
                case 11: return renderContactStep();
                case 12:
                    return (
                        <EmailVerification
                            email={formData.email}
                            assessmentId={assessmentId}
                            onVerified={handleEmailVerified}
                            onBack={() => setCurrentStep(11)}
                        />
                    );
                case 13:
                    return (
                        <div className="space-y-6 max-w-md mx-auto pt-8">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <Lock size={28} className="text-green-600" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">
                                    {isSpanish ? 'Crea tu Contraseña' : tenant === 'france' ? 'Créez votre Mot de Passe' : tenant === 'portugal' ? 'Crie a sua Palavra-passe' : 'Create Your Password'}
                                </h2>
                                <p className="text-gray-500">
                                    {isSpanish ? 'Necesitarás esta contraseña para iniciar sesión y ver tus presupuestos.' : tenant === 'france' ? 'Vous aurez besoin de ce mot de passe pour vous connecter et voir vos devis.' : tenant === 'portugal' ? 'Necessitará desta palavra-passe para iniciar sessão e ver os seus orçamentos.' : 'You\'ll need this password to log in and view your quotes.'}
                                </p>
                            </div>
                            <div className="relative">
                                <input
                                    type={passwordStep.showPassword ? 'text' : 'password'}
                                    value={passwordStep.password}
                                    onChange={(e) => setPasswordStep(prev => ({ ...prev, password: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && passwordStep.password.length >= 6) handlePasswordSubmit(); }}
                                    placeholder="••••••••"
                                    autoFocus
                                    className="w-full px-4 py-4 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none pr-12 text-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordStep(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {passwordStep.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={passwordStep.creating || passwordStep.password.length < 6}
                                className="w-full py-4 bg-[#007F00] text-white rounded-full font-bold text-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {passwordStep.creating ? (
                                    <><span className="animate-spin">⟳</span> {isSpanish ? 'Creando...' : tenant === 'france' ? 'Création...' : tenant === 'portugal' ? 'A criar...' : 'Creating...'}</>
                                ) : (
                                    <>{isSpanish ? 'Crear Cuenta y Publicar' : tenant === 'france' ? 'Créer et Publier' : tenant === 'portugal' ? 'Criar e Publicar' : 'Create Account & Post Job'}</>
                                )}
                            </button>
                            <p className="text-center text-gray-400 text-sm">
                                {isSpanish ? 'Te enviaremos un correo de confirmación.' : tenant === 'france' ? 'Nous vous enverrons un e-mail de confirmation.' : tenant === 'portugal' ? 'Enviaremos um email de confirmação.' : 'We\'ll send you a confirmation email.'}
                            </p>
                        </div>
                    );
                case 14:
                    return (
                        <div className="pt-8">
                            <JobConfirmation
                                customerName={formData.fullName}
                                county={formData.county}
                                email={formData.email}
                                emailError={emailError}
                                hideNavigation={!!onClose || pendingEmailConfirmation}
                                pendingEmailConfirmation={pendingEmailConfirmation}
                            />
                            {onClose && !pendingEmailConfirmation && (
                                <button onClick={onClose} className="mt-8 w-full bg-gray-900 text-white font-bold py-4 rounded-xl">
                                    {isSpanish ? 'Cerrar e Ir al Panel' : tenant === 'portugal' ? 'Fechar e Ir para o Painel' : tenant === 'france' ? 'Fermer et Aller au Tableau de Bord' : 'Close & Go to Dashboard'}
                                </button>
                            )}
                        </div>
                    );
                default: return null;
            }
        }

        // ---------- TECHNICAL FLOW ----------
        if (isTechnical) {
            const tenant = getTenantFromDomain();
            const techTypes = TECHNICAL_ASSESSMENT_TYPES[tenant] || TECHNICAL_ASSESSMENT_TYPES.ireland;
            const techPropertyTypes = TECHNICAL_PROPERTY_TYPES[tenant] || TECHNICAL_PROPERTY_TYPES.ireland;
            const yearOptions = YEAR_BUILT_OPTIONS[tenant] || YEAR_BUILT_OPTIONS.ireland;
            const heatingOptions = CURRENT_HEATING_OPTIONS[tenant] || CURRENT_HEATING_OPTIONS.ireland;
            const insulationOptions = INSULATION_STATUS_OPTIONS[tenant] || INSULATION_STATUS_OPTIONS.ireland;
            const purposeOptions = TECHNICAL_PURPOSES[tenant] || TECHNICAL_PURPOSES.ireland;

            switch (currentStep) {
                case 1:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('technical_type_prompt', 'What type of assessment do you need?')}</h2>
                            <p className="text-gray-500 text-center text-sm -mt-4">{t('technical_type_desc', 'Select the technical service you require')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                {techTypes.map((type) => (
                                    <button key={type} onClick={() => updateFieldAndAdvance('technicalAssessmentType', type)}
                                        className={`p-5 rounded-xl border-2 transition-all text-center ${formData.technicalAssessmentType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{type}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 2:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('technical_property_type_prompt', 'Property type?')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                {techPropertyTypes.map((type) => (
                                    <button key={type} onClick={() => updateFieldAndAdvance('technicalPropertyType', type)}
                                        className={`p-5 rounded-xl border-2 transition-all text-center ${formData.technicalPropertyType === type ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{type}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 3:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('year_built_prompt', 'When was the property built?')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {yearOptions.map((year) => (
                                    <button key={year} onClick={() => updateFieldAndAdvance('yearBuilt', year)}
                                        className={`p-5 rounded-xl border-2 transition-all text-center ${formData.yearBuilt === year ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{year}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 4:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('current_heating_prompt', 'Current heating system?')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {heatingOptions.map((option) => (
                                    <button key={option} onClick={() => updateFieldAndAdvance('currentHeating', option)}
                                        className={`p-5 rounded-xl border-2 transition-all text-center ${formData.currentHeating === option ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{option}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 5:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('insulation_prompt', 'Insulation status?')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {insulationOptions.map((option) => (
                                    <button key={option} onClick={() => updateFieldAndAdvance('insulationStatus', option)}
                                        className={`p-5 rounded-xl border-2 transition-all text-center ${formData.insulationStatus === option ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{option}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 6:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('property_size')}?</h2>
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setSizeUnit('m')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'm' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Meters')}</button>
                                    <button
                                        onClick={() => setSizeUnit('ft')}
                                        className={`px-6 py-2 rounded-lg font-bold transition-all ${sizeUnit === 'ft' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >{o('Sq. Feet')}</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-2xl mx-auto">
                                {(sizeUnit === 'ft' ? PROPERTY_SIZES : PROPERTY_SIZES_METRIC).map((size) => (
                                    <button key={size} onClick={() => updateFieldAndAdvance('propertySize', size)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.propertySize === size ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{size}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 7:
                    return (
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-light text-gray-800 text-center">{t('technical_purpose_prompt', 'Purpose of this assessment?')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {purposeOptions.map((purpose) => (
                                    <button key={purpose} onClick={() => updateFieldAndAdvance('technicalPurpose', purpose)}
                                        className={`p-4 rounded-lg border-2 transition-all text-center ${formData.technicalPurpose === purpose ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                                    >{purpose}</button>
                                ))}
                            </div>
                        </div>
                    );
                case 8: return renderDateStep();
                case 9: return renderCountyStep();
                case 10: return renderTownStep();
                case 11: return renderContactStep();
                case 12:
                    return (
                        <EmailVerification
                            email={formData.email}
                            assessmentId={assessmentId}
                            onVerified={handleEmailVerified}
                            onBack={() => setCurrentStep(11)}
                        />
                    );
                case 13:
                    return (
                        <div className="space-y-6 max-w-md mx-auto pt-8">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <Lock size={28} className="text-green-600" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">
                                    {isSpanish ? 'Crea tu Contraseña' : tenant === 'france' ? 'Créez votre Mot de Passe' : tenant === 'portugal' ? 'Crie a sua Palavra-passe' : 'Create Your Password'}
                                </h2>
                                <p className="text-gray-500">
                                    {isSpanish ? 'Necesitarás esta contraseña para iniciar sesión y ver tus presupuestos.' : tenant === 'france' ? 'Vous aurez besoin de ce mot de passe pour vous connecter et voir vos devis.' : tenant === 'portugal' ? 'Necessitará desta palavra-passe para iniciar sessão e ver os seus orçamentos.' : 'You\'ll need this password to log in and view your quotes.'}
                                </p>
                            </div>
                            <div className="relative">
                                <input
                                    type={passwordStep.showPassword ? 'text' : 'password'}
                                    value={passwordStep.password}
                                    onChange={(e) => setPasswordStep(prev => ({ ...prev, password: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && passwordStep.password.length >= 6) handlePasswordSubmit(); }}
                                    placeholder="••••••••"
                                    autoFocus
                                    className="w-full px-4 py-4 bg-[#e8f0fe] border-none rounded-lg focus:ring-2 focus:ring-[#007F00]/30 outline-none pr-12 text-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordStep(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {passwordStep.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={passwordStep.creating || passwordStep.password.length < 6}
                                className="w-full py-4 bg-[#007F00] text-white rounded-full font-bold text-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {passwordStep.creating ? (
                                    <><span className="animate-spin">⟳</span> {isSpanish ? 'Creando...' : tenant === 'france' ? 'Création...' : tenant === 'portugal' ? 'A criar...' : 'Creating...'}</>
                                ) : (
                                    <>{isSpanish ? 'Crear Cuenta y Publicar' : tenant === 'france' ? 'Créer et Publier' : tenant === 'portugal' ? 'Criar e Publicar' : 'Create Account & Post Job'}</>
                                )}
                            </button>
                            <p className="text-center text-gray-400 text-sm">
                                {isSpanish ? 'Te enviaremos un correo de confirmación.' : tenant === 'france' ? 'Nous vous enverrons un e-mail de confirmation.' : tenant === 'portugal' ? 'Enviaremos um email de confirmação.' : 'We\'ll send you a confirmation email.'}
                            </p>
                        </div>
                    );
                case 14:
                    return (
                        <div className="pt-8">
                            <JobConfirmation
                                customerName={formData.fullName}
                                county={formData.county}
                                email={formData.email}
                                emailError={emailError}
                                hideNavigation={!!onClose || pendingEmailConfirmation}
                                pendingEmailConfirmation={pendingEmailConfirmation}
                            />
                            {onClose && !pendingEmailConfirmation && (
                                <button onClick={onClose} className="mt-8 w-full bg-gray-900 text-white font-bold py-4 rounded-xl">
                                    {isSpanish ? 'Cerrar e Ir al Panel' : tenant === 'portugal' ? 'Fechar e Ir para o Painel' : tenant === 'france' ? 'Fermer et Aller au Tableau de Bord' : 'Close & Go to Dashboard'}
                                </button>
                            )}
                        </div>
                    );
                default: return null;
            }
        }

        return null;
    };

    // Steps that need a "Next" button (checkbox-based steps and contact step)
    const needsNextButton = () => {
        if (currentStep === 0) return false; // job type auto-advances
        if (currentStep >= 12) return false; // auth/confirmation steps handle themselves

        if (isDomestic) {
            return currentStep === 6 || currentStep === 11; // features (multi-select) & contact
        }
        if (isCommercial) {
            return currentStep === 6 || currentStep === 8 || currentStep === 11; // docs, heating/cooling (multi-select) & contact
        }
        if (isTechnical) {
            return currentStep === 11; // contact step only (all other steps auto-advance)
        }
        return false;
    };

    const getProgressInfo = () => {
        if (currentStep === 0) return { label: t('step_1_of_12', 'Step 1 of 12'), percent: 0 };
        if (currentStep >= 12) {
            const authLabel = currentStep === 12 ? t('verify', 'Verify') : t('auth', 'Auth');
            return { label: `${t('step', 'Step')} ${authLabel}`, percent: 100 };
        }
        const stepNum = currentStep + 1;
        return {
            label: `${t('step', 'Step')} ${stepNum} ${t('of', 'of')} ${TOTAL_FORM_STEPS}`,
            percent: Math.round((stepNum / TOTAL_FORM_STEPS) * 100)
        };
    };

    const progress = getProgressInfo();

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            {currentStep < 14 && (
                <div className="px-8 pt-8">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                        <span>{progress.label}</span>
                        <span>{progress.percent}% {t('percent_complete', 'Complete')}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress.percent}%` }} />
                    </div>
                    {formData.jobType && currentStep > 0 && currentStep < 12 && (
                        <div className="mt-3 flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDomestic ? 'bg-blue-50 text-blue-600 border border-blue-100' : isTechnical ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                                {isDomestic ? `${t('domestic')} ${certName}` : isTechnical ? t('technical_assessor') : `${t('commercial')} ${certName}`}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div className="p-8 md:p-12">
                {renderStepContent()}
            </div>

            {currentStep < 12 && (
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
                    <button onClick={handleBack} disabled={currentStep === 0}
                        className={`px-6 py-4 rounded-xl font-bold transition-all ${currentStep === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-200'}`}
                    >{t('back')}</button>
                    {needsNextButton() && (
                        <button onClick={handleNext} disabled={!canProceed()}
                            className={`px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-2 ${canProceed() ? 'bg-green-500 text-white shadow-lg shadow-green-100 hover:bg-green-600' : 'bg-gray-200 text-gray-400'}`}
                        >
                            {currentStep === LAST_FORM_STEP ? (isSubmitting ? t('loading') : t('get_quotes')) : t('next')}
                            {currentStep < LAST_FORM_STEP && <ChevronRight size={18} />}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuoteFormModule;
