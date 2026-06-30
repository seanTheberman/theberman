import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Check, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getTownsForTenant, getCountiesForTenant } from '../lib/tenantData';
import { geocodeAddress } from '../lib/geocoding';
import { getTenantFromDomain } from '../lib/tenant';

// Tenant-specific registration number labels
const REGISTRATION_NUMBER_LABELS: Record<string, { label: string; placeholder: string; sinceLabel: string }> = {
    ireland: {
        label: 'SEAI Registration #',
        placeholder: 'e.g. 10XXX',
        sinceLabel: 'SEAI Assessor since'
    },
    spain: {
        label: 'CEE Registration #',
        placeholder: 'e.g. 123456',
        sinceLabel: 'Certificado desde'
    },
    england: {
        label: 'Assessor ID',
        placeholder: 'e.g. ELH123456',
        sinceLabel: 'Accredited since'
    }
};

const ONBOARDING_LABELS: Record<string, Record<string, string>> = {
    en: {
        firstName: 'First Name', lastName: 'Last Name', emailAddress: 'Email Address',
        mobilePhone: 'Mobile Phone', optional: '(optional)',
        assessorType: 'Assessor Type (select one or more)',
        domesticAssessor: 'Domestic Assessor', commercialAssessor: 'Commercial Assessor', technicalAssessor: 'Technical Assessor',
        businessDetails: 'Business Details', companyName: 'Company Name',
        companyPlaceholder: 'e.g. ABC Energy Assessments',
        website: 'Website', websitePlaceholder: 'https://www.example.com',
        socialMedia: 'Social Media', facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn',
        featuresServices: 'Features / Services',
        featuresDesc: 'Add key services or features to highlight on your listing (e.g. "Fast Turnaround", "24hr E-certs").',
        featurePlaceholder: 'Type a feature and press Enter', add: 'Add',
        insuranceHolder: 'Professional insurance policy holder',
        insuranceDesc: 'Do you hold valid professional indemnity insurance?',
        vatRegistered: 'VAT Registered', yes: 'Yes', no: 'No',
        proceed: 'Proceed', savingProfile: 'Saving Profile...',
        requiredFields: 'Please fill in all required fields including Assessor Type and Registration Number',
        serviceAreaRequired: 'Please select at least one service area',
        regNumberRequired: 'Please enter your registration number',
        registrationSubmitted: 'Registration submitted! Your account is pending admin approval.',
        failedToProcess: 'Failed to process information. Please try again.',
    },
    es: {
        firstName: 'Nombre', lastName: 'Apellidos', emailAddress: 'Correo Electrónico',
        mobilePhone: 'Teléfono Móvil', optional: '(opcional)',
        assessorType: 'Tipo de Certificador (selecciona uno o más)',
        domesticAssessor: 'Certificador de Viviendas', commercialAssessor: 'Certificador Comercial', technicalAssessor: 'Técnico Certificado',
        businessDetails: 'Datos del Negocio', companyName: 'Nombre de la Empresa',
        companyPlaceholder: 'Ej. Certificaciones Energéticas SL',
        website: 'Sitio Web', websitePlaceholder: 'https://www.ejemplo.com',
        socialMedia: 'Redes Sociales', facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn',
        featuresServices: 'Servicios / Características',
        featuresDesc: 'Añade servicios clave para destacar en tu perfil (ej. "Entrega Rápida", "Certificados 24h").',
        featurePlaceholder: 'Escribe un servicio y pulsa Enter', add: 'Añadir',
        insuranceHolder: 'Titular de seguro profesional',
        insuranceDesc: '¿Tienes seguro de responsabilidad civil profesional vigente?',
        vatRegistered: 'Autónomo / Empresa Registrada', yes: 'Sí', no: 'No',
        proceed: 'Continuar', savingProfile: 'Guardando perfil...',
        requiredFields: 'Por favor completa todos los campos obligatorios incluyendo el Tipo de Certificador y el Número de Registro',
        serviceAreaRequired: 'Por favor selecciona al menos una zona de servicio',
        regNumberRequired: 'Por favor introduce tu número de registro',
        registrationSubmitted: '¡Registro enviado! Tu cuenta está pendiente de aprobación por el administrador.',
        failedToProcess: 'Error al procesar la información. Por favor inténtalo de nuevo.',
    },
};

// Tenant-specific page titles and labels
const TENANT_LABELS: Record<string, { title: string; subtitle: string; catalogueLabel: string; catalogueDesc: string }> = {
    ireland: {
        title: 'BER Assessor Registration',
        subtitle: 'Complete your profile to get more BER jobs in your area.',
        catalogueLabel: 'Would you like to be listed in our Home Energy catalogue as a "BER ASSESSOR"?',
        catalogueDesc: 'This will help homeowners find you directly for BER assessments in your area.'
    },
    spain: {
        title: 'Registro de Certificador Energético',
        subtitle: 'Completa tu perfil para recibir más trabajos de certificados energéticos en tu zona.',
        catalogueLabel: '¿Te gustaría aparecer en nuestro catálogo de Eficiencia Energética como "CERTIFICADOR ENERGÉTICO"?',
        catalogueDesc: 'Esto ayudará a los propietarios a encontrarte directamente para certificaciones energéticas en tu zona.'
    },
    england: {
        title: 'EPC Assessor Registration',
        subtitle: 'Complete your profile to get more EPC jobs in your area.',
        catalogueLabel: 'Would you like to be listed in our Home Energy catalogue as an "EPC ASSESSOR"?',
        catalogueDesc: 'This will help homeowners find you directly for EPC assessments in your area.'
    }
};

const ContractorOnboarding = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const tenant = getTenantFromDomain();
    const isSpanish = tenant === 'spain';
    const regLabels = REGISTRATION_NUMBER_LABELS[tenant] || REGISTRATION_NUMBER_LABELS.ireland;
    const tenantLabels = TENANT_LABELS[tenant] || TENANT_LABELS.ireland;
    const lbl = ONBOARDING_LABELS[isSpanish ? 'es' : 'en'];
    const COUNTIES = getCountiesForTenant(tenant);
    const TOWNS_DATA = getTownsForTenant(tenant);
    const areaPrefix = isSpanish ? '' : '';

    // Form State
    const [formData, setFormData] = useState({
        phone: '',
        homeCounty: '',
        homeTown: '',
        seaiNumber: '',
        seaiYear: new Date().getFullYear().toString(),
        insuranceHolder: false,
        vatRegistered: false,
        assessorTypes: [] as string[],
        serviceAreas: [] as string[],
        preferredTowns: [] as string[],
        isCompany: false,
        companyName: '',
        bio: '',
        socialTwitter: '',
        socialInstagram: '',
        socialLinkedin: '',
        socialFacebook: '',
        website: '',
        features: [] as string[],
        wantsCatalogueListing: true
    });

    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        if (!user) return;

        // Try to load from sessionStorage first (partially saved form state)
        const pendingData = sessionStorage.getItem(`pending_assessor_registration_${user.id}`);
        if (pendingData) {
            try {
                const parsed = JSON.parse(pendingData);
                setFormData(parsed);
                return; // sessionStorage takes priority
            } catch (e) {
                console.error('Error parsing pending assessor data:', e);
            }
        }

        // Otherwise, pre-fill from existing profile (data admin already entered)
        supabase
            .from('profiles')
            .select('phone, county, town, seai_number, assessor_type, company_name, website_url')
            .eq('id', user.id)
            .maybeSingle()
            .then(({ data: profile }) => {
                if (!profile) return;
                setFormData(prev => ({
                    ...prev,
                    phone: profile.phone || prev.phone,
                    homeCounty: profile.county || prev.homeCounty,
                    homeTown: profile.town || prev.homeTown,
                    seaiNumber: profile.seai_number || prev.seaiNumber,
                    // assessor_type stored as "Both", "Domestic Assessor", "Commercial Assessor" or "Domestic Assessor & Commercial Assessor"
                    assessorTypes: profile.assessor_type
                        ? profile.assessor_type === 'Both' 
                            ? ['Domestic Assessor', 'Commercial Assessor']
                            : profile.assessor_type.split(' & ').filter(Boolean)
                        : prev.assessorTypes,
                    companyName: profile.company_name || prev.companyName,
                    website: profile.website_url || prev.website,
                }));
            });
    }, [user]);


    const handleServiceAreaToggle = (county: string) => {
        setFormData(prev => {
            const areas = [...prev.serviceAreas];
            if (areas.includes(county)) {
                // Remove county and its towns
                const townsToRemove = new Set(TOWNS_DATA[county] || []);
                return {
                    ...prev,
                    serviceAreas: areas.filter(c => c !== county),
                    preferredTowns: prev.preferredTowns.filter(t => !townsToRemove.has(t))
                };
            } else {
                return { ...prev, serviceAreas: [...areas, county] };
            }
        });
    };

    const handlePreferredTownToggle = (town: string) => {
        setFormData(prev => {
            const towns = [...prev.preferredTowns];
            if (towns.includes(town)) {
                return { ...prev, preferredTowns: towns.filter(t => t !== town) };
            } else {
                return { ...prev, preferredTowns: [...towns, town] };
            }
        });
    };

    const handleAssessorTypeToggle = (type: string) => {
        setFormData(prev => {
            const types = [...prev.assessorTypes];
            if (types.includes(type)) {
                return { ...prev, assessorTypes: types.filter(t => t !== type) };
            } else {
                return { ...prev, assessorTypes: [...types, type] };
            }
        });
    };

    const setWantsCatalogueListing = (val: boolean) => {
        setFormData(prev => ({ ...prev, wantsCatalogueListing: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.phone || !formData.homeCounty || !formData.homeTown || formData.assessorTypes.length === 0) {
            toast.error(lbl.requiredFields);
            return;
        }

        if (!formData.seaiNumber || formData.seaiNumber.trim() === '') {
            toast.error(lbl.regNumberRequired);
            return;
        }

        if (formData.serviceAreas.length === 0) {
            toast.error(lbl.serviceAreaRequired);
            return;
        }

        // Check for duplicate phone number
        if (formData.phone && formData.phone.trim().length >= 7) {
            const { data: existingPhone } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('phone', formData.phone.trim())
                .neq('id', user?.id || '')
                .maybeSingle();
            if (existingPhone) {
                toast.error(isSpanish
                    ? 'Este número de teléfono ya está asociado a otra cuenta. Por favor usa un número diferente.'
                    : 'This phone number is already associated with another account. Please use a different number.');
                return;
            }
        }

        setLoading(true);
        try {
            // Fetch coordinates silently
            let latitude = null;
            let longitude = null;

            const fullAddress = `${formData.homeTown}, Co. ${formData.homeCounty}`;
            const coords = await geocodeAddress(fullAddress);
            if (coords) {
                latitude = coords.latitude;
                longitude = coords.longitude;
            }

            // Store registration data in sessionStorage for later persistence (after payment)
            const registrationData = {
                ...formData,
                latitude,
                longitude,
                user_id: user?.id,
                user_email: user?.email,
                user_full_name: user?.user_metadata?.full_name || 'Assessor'
            };

            sessionStorage.setItem('pending_assessor_registration', JSON.stringify(registrationData));

            // Update profile with pending status — admin will manually activate
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({
                    role: 'contractor',
                    registration_status: 'pending',
                    phone: formData.phone,
                    home_county: formData.homeCounty,
                    seai_number: formData.seaiNumber,
                    insurance_holder: formData.insuranceHolder,
                    vat_registered: formData.vatRegistered,
                    assessor_type: formData.assessorTypes.length === 2 ? 'Both' : formData.assessorTypes.join(' & '),
                    preferred_counties: formData.serviceAreas,
                    preferred_towns: formData.preferredTowns,
                    company_name: formData.companyName,
                    website_url: formData.website,
                })
                .eq('id', user?.id);

            if (profileUpdateError) {
                console.error('Failed to update initial profile:', profileUpdateError);
                throw profileUpdateError;
            }

            toast.success(lbl.registrationSubmitted);
            await refreshProfile();
            sessionStorage.removeItem(`pending_assessor_registration_${user?.id}`);
            navigate('/dashboard/ber-assessor', { replace: true });

        } catch (error: unknown) {
            console.error('Onboarding Processing Error:', error);
            toast.error(lbl.failedToProcess);
        } finally {
            setLoading(false);
        }
    };

    const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 font-serif">
                        {tenantLabels.title}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {tenantLabels.subtitle}
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* READ ONLY INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border border-gray-100 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{lbl.firstName}</label>
                                <div className="mt-1 text-gray-900 font-medium">{user?.user_metadata?.full_name?.split(' ')[0] || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{lbl.lastName}</label>
                                <div className="mt-1 text-gray-900 font-medium">{user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '-'}</div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">{lbl.emailAddress}</label>
                                <div className="mt-1 text-gray-900 font-medium">{user?.email}</div>
                            </div>
                        </div>

                        {/* NEW FIELDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-gray-700">{lbl.mobilePhone}</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    required
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="homeCounty" className="block text-sm font-bold text-gray-700 mb-1">{isSpanish ? 'Comunidad Autónoma' : 'Home County'}</label>
                                <select
                                    id="homeCounty"
                                    name="homeCounty"
                                    required
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors bg-white"
                                    value={formData.homeCounty}
                                    onChange={(e) => setFormData({ ...formData, homeCounty: e.target.value, homeTown: '' })}
                                >
                                    <option value="">{isSpanish ? 'Seleccionar Comunidad' : 'Select County'}</option>
                                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="homeTown" className="block text-sm font-bold text-gray-700 mb-1">{isSpanish ? 'Ciudad' : 'Home Town'}</label>
                                <select
                                    id="homeTown"
                                    name="homeTown"
                                    required
                                    disabled={!formData.homeCounty}
                                    className={`mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors bg-white ${!formData.homeCounty ? 'bg-gray-50 opacity-50 cursor-not-allowed' : ''}`}
                                    value={formData.homeTown}
                                    onChange={(e) => setFormData({ ...formData, homeTown: e.target.value })}
                                >
                                    <option value="">{formData.homeCounty ? (isSpanish ? 'Seleccionar Ciudad' : 'Select Town') : (isSpanish ? 'Seleccionar Comunidad Primero' : 'Select County First')}</option>
                                    {formData.homeCounty && TOWNS_DATA[formData.homeCounty]?.map(town => (
                                        <option key={town} value={town}>{town}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="seaiNumber" className="block text-sm font-bold text-gray-700 mb-1">{regLabels.label} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="seaiNumber"
                                    id="seaiNumber"
                                    required
                                    placeholder={regLabels.placeholder}
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                    value={formData.seaiNumber}
                                    onChange={(e) => setFormData({ ...formData, seaiNumber: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="seaiYear" className="block text-sm font-bold text-gray-700 mb-1">{regLabels.sinceLabel}</label>
                                <select
                                    id="seaiYear"
                                    name="seaiYear"
                                    className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors bg-white"
                                    value={formData.seaiYear}
                                    onChange={(e) => setFormData({ ...formData, seaiYear: e.target.value })}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-3">{lbl.assessorType} <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-4">
                                    {[
                                        { key: 'Domestic Assessor', label: lbl.domesticAssessor },
                                        { key: 'Commercial Assessor', label: lbl.commercialAssessor },
                                        { key: 'Technical Assessor', label: lbl.technicalAssessor },
                                    ].map(({ key, label }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleAssessorTypeToggle(key)}
                                            className={`px-6 py-3 rounded-xl border-2 font-bold transition-all flex items-center gap-2 ${formData.assessorTypes.includes(key) ? 'border-[#007F00] bg-green-50 text-[#007F00]' : 'border-gray-200 bg-white text-gray-400'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.assessorTypes.includes(key) ? 'border-[#007F00]' : 'border-gray-300'}`}>
                                                {formData.assessorTypes.includes(key) && <div className="w-2.5 h-2.5 rounded-full bg-[#007F00]" />}
                                            </div>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* BUSINESS DETAILS */}
                        <div className="pt-8 border-t border-gray-100">
                            <label className="block text-lg font-bold text-gray-900 mb-4">
                                {lbl.businessDetails}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-bold text-gray-700 mb-1">{lbl.companyName}</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        id="companyName"
                                        className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder={lbl.companyPlaceholder}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="website" className="block text-sm font-bold text-gray-700 mb-1">{lbl.website}</label>
                                    <input
                                        type="url"
                                        name="website"
                                        id="website"
                                        className="mt-1 block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder={lbl.websitePlaceholder}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SOCIAL MEDIA */}
                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-3">{lbl.socialMedia} <span className="text-gray-400 font-normal">{lbl.optional}</span></label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">{lbl.facebook}</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.socialFacebook}
                                        onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">{lbl.instagram}</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.socialInstagram}
                                        onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 ml-1">{lbl.linkedin}</label>
                                    <input
                                        type="url"
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                        value={formData.socialLinkedin}
                                        onChange={(e) => setFormData({ ...formData, socialLinkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FEATURES */}
                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-1">{lbl.featuresServices} <span className="text-gray-400 font-normal">{lbl.optional}</span></label>
                            <p className="text-xs text-gray-500 mb-3">{lbl.featuresDesc}</p>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-200 rounded-xl shadow-sm py-2 px-4 focus:ring-[#007F00] focus:border-[#007F00] transition-colors text-sm"
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
                                                setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
                                                setFeatureInput('');
                                            }
                                        }
                                    }}
                                    placeholder={lbl.featurePlaceholder}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
                                            setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
                                            setFeatureInput('');
                                        }
                                    }}
                                    className="px-4 py-2 bg-[#007F00] text-white rounded-xl text-sm font-bold hover:bg-[#006600] transition-colors flex items-center gap-1"
                                >
                                    <Plus size={16} /> {lbl.add}
                                </button>
                            </div>
                            {formData.features.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map((feature, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 bg-green-50 border border-[#007F00] text-[#007F00] px-3 py-1.5 rounded-full text-xs font-bold">
                                            {feature}
                                            <button type="button" onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })} className="hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BOOLEANS */}
                        <div className="space-y-4 pt-4">
                            <div className={`flex items-center justify-between border p-4 rounded-xl transition-all ${formData.insuranceHolder ? 'border-[#007F00] bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                                <div>
                                    <span className={`block text-sm font-bold ${formData.insuranceHolder ? 'text-[#007F00]' : 'text-gray-900'}`}>{lbl.insuranceHolder}</span>
                                    <span className="text-xs text-gray-500">{lbl.insuranceDesc}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, insuranceHolder: !formData.insuranceHolder })}
                                        className={`relative inline-flex flex-shrink-0 h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007F00] ${formData.insuranceHolder ? 'bg-[#007F00]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${formData.insuranceHolder ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className={`text-sm font-bold w-8 ${formData.insuranceHolder ? 'text-[#007F00]' : 'text-gray-700'}`}>{formData.insuranceHolder ? lbl.yes : lbl.no}</span>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between border p-4 rounded-xl transition-all ${formData.vatRegistered ? 'border-[#007F00] bg-green-50/30' : 'border-gray-200 bg-white'}`}>
                                <div>
                                    <span className={`block text-sm font-bold ${formData.vatRegistered ? 'text-[#007F00]' : 'text-gray-900'}`}>{lbl.vatRegistered}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, vatRegistered: !formData.vatRegistered })}
                                        className={`relative inline-flex flex-shrink-0 h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007F00] ${formData.vatRegistered ? 'bg-[#007F00]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${formData.vatRegistered ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className={`text-sm font-bold w-8 ${formData.vatRegistered ? 'text-[#007F00]' : 'text-gray-700'}`}>{formData.vatRegistered ? lbl.yes : lbl.no}</span>
                                </div>
                            </div>
                        </div>

                        {/* CATALOGUE LISTING */}
                        <div className="pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                {tenantLabels.catalogueLabel}
                            </label>
                            <p className="text-sm text-gray-500 mb-4">{tenantLabels.catalogueDesc}</p>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setWantsCatalogueListing(true)}
                                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${formData.wantsCatalogueListing ? 'border-[#007F00] bg-green-50 text-[#007F00]' : 'border-gray-200 bg-white text-gray-400'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.wantsCatalogueListing ? 'border-[#007F00]' : 'border-gray-300'}`}>
                                        {formData.wantsCatalogueListing && <div className="w-2.5 h-2.5 rounded-full bg-[#007F00]" />}
                                    </div>
                                    {lbl.yes.toUpperCase()}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWantsCatalogueListing(false)}
                                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${!formData.wantsCatalogueListing ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-400'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!formData.wantsCatalogueListing ? 'border-red-500' : 'border-gray-300'}`}>
                                        {!formData.wantsCatalogueListing && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                                    </div>
                                    {lbl.no.toUpperCase()}
                                </button>
                            </div>
                        </div>

                        {/* Service Areas */}
                        <div className="pt-8">
                            <label className="block text-lg font-bold text-gray-900 mb-4">
                                {isSpanish ? 'Zonas de Servicio / Comunidades' : 'Service Areas / Counties'} <span className="text-red-500">*</span>
                            </label>
                            <p className="text-sm text-gray-500 mb-4">{isSpanish ? 'Selecciona tu ubicación preferida para recibir trabajos. Debes seleccionar al menos una.' : 'Select your Preference location to receive jobs in. You must select at least one.'}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {COUNTIES.map(county => (
                                    <div
                                        key={county}
                                        onClick={() => handleServiceAreaToggle(county)}
                                        className={`
                                                cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all select-none
                                                ${formData.serviceAreas.includes(county)
                                                ? 'bg-green-50/50 border-[#007F00] text-[#007F00] shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-green-300 text-gray-600'}
                                            `}
                                    >
                                        <span className="font-medium text-sm">{areaPrefix}{county}</span>
                                        {formData.serviceAreas.includes(county) && <Check size={16} className="text-[#007F00]" />}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right">{formData.serviceAreas.length} {isSpanish ? 'comunidades seleccionadas' : 'counties selected'}</p>
                        </div>

                        {/* Preferred Towns (optional) */}
                        {formData.serviceAreas.length > 0 && (
                            <div className="pt-6">
                                <label className="block text-lg font-bold text-gray-900 mb-4">
                                    {isSpanish ? 'Ciudades Preferidas (Opcional)' : 'Preferred Towns (Optional)'}
                                </label>
                                <p className="text-sm text-gray-500 mb-4">{isSpanish ? 'Selecciona ciudades específicas dentro de tus comunidades para recibir trabajos más localizados.' : 'Select specific towns within your counties to receive more targeted jobs.'}</p>
                                {formData.serviceAreas.map(county => {
                                    const towns = TOWNS_DATA[county];
                                    if (!towns || towns.length === 0) return null;
                                    const selectedTowns = formData.preferredTowns.filter(t => towns.includes(t));
                                    return (
                                        <div key={county} className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-gray-700">{county}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (selectedTowns.length === towns.length) {
                                                            setFormData(prev => ({ ...prev, preferredTowns: prev.preferredTowns.filter(t => !towns.includes(t)) }));
                                                        } else {
                                                            setFormData(prev => ({ ...prev, preferredTowns: [...new Set([...prev.preferredTowns, ...towns])] }));
                                                        }
                                                    }}
                                                    className="text-xs text-[#007F00] font-bold hover:underline"
                                                >
                                                    {selectedTowns.length === towns.length ? (isSpanish ? 'Quitar todas' : 'Clear all') : (isSpanish ? 'Seleccionar todas' : 'Select all')}
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {towns.map(town => (
                                                    <div
                                                        key={town}
                                                        onClick={() => handlePreferredTownToggle(town)}
                                                        className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-medium transition-all select-none ${
                                                            formData.preferredTowns.includes(town)
                                                                ? 'bg-green-50 border-[#007F00] text-[#007F00]'
                                                                : 'bg-white border-gray-200 hover:border-green-300 text-gray-600'
                                                        }`}
                                                    >
                                                        {town}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                <p className="text-xs text-gray-500 mt-2 text-right">{formData.preferredTowns.length} {isSpanish ? 'ciudades seleccionadas' : 'towns selected'}</p>
                            </div>
                        )}

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-[#007F00] hover:bg-[#006600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007F00] transition-all transform active:scale-95 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? lbl.savingProfile : lbl.proceed}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContractorOnboarding;
