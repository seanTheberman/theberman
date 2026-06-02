import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { uploadImageToCloudinary } from '../../../lib/cloudinary';
import { CMS_PAGES, getDefaultsForTenant, getPageLabel, getSectionLabel, getSectionDescription } from '../../../lib/cmsDefaults';
import type { FieldDefinition, PageDefinition, SectionDefinition } from '../../../lib/cmsDefaults';
import {
    ChevronDown, ChevronRight, Save, RotateCcw, Monitor, Smartphone,
    Loader2, Upload, ExternalLink, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    selectedTenant: string;
}

type SectionData = Record<string, any>;
type PageSectionMap = Record<string, SectionData>; // sectionId -> content

export const VisualEditorView = ({ selectedTenant }: Props) => {
    const [selectedPage, setSelectedPage] = useState<PageDefinition>(CMS_PAGES[0]);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
    const [sectionData, setSectionData] = useState<PageSectionMap>({});
    const [originalData, setOriginalData] = useState<PageSectionMap>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Sample location used for visual editor preview per tenant
    const getSampleLocation = (tenant: string): string => {
        const map: Record<string, string> = {
            ireland: 'Dublin',
            england: 'Greater London',
            spain: 'Comunidad de Madrid',
            france: 'Île-de-France',
            portugal: 'Lisboa',
        };
        return map[tenant] || 'Dublin';
    };

    const getSampleLocationPath = (tenant: string): string => {
        return '/' + getSampleLocation(tenant).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    // Load content from DB for current page + tenant
    const loadPageContent = useCallback(async () => {
        setLoading(true);
        try {
            if (selectedPage.id === 'location') {
                // Location pages load from location_pages table
                const sampleLoc = getSampleLocation(selectedTenant);
                const { data, error } = await supabase
                    .from('location_pages')
                    .select('*')
                    .eq('tenant', selectedTenant)
                    .eq('location_name', sampleLoc)
                    .maybeSingle();

                if (error) throw error;

                const map: PageSectionMap = {};
                for (const section of selectedPage.sections) {
                    const defaults = getDefaultsForTenant(selectedPage.id, section.id, selectedTenant);
                    if (section.id === 'hero') {
                        map[section.id] = {
                            ...defaults,
                            hero_title: data?.hero_title || defaults.hero_title,
                            hero_subtitle: data?.hero_subtitle || defaults.hero_subtitle,
                        };
                    } else if (section.id === 'content') {
                        map[section.id] = {
                            ...defaults,
                            intro_text: data?.intro_text || defaults.intro_text,
                        };
                    } else if (section.id === 'seo') {
                        map[section.id] = {
                            ...defaults,
                            seo_title: data?.seo_title || defaults.seo_title,
                            seo_description: data?.seo_description || defaults.seo_description,
                            meta_keywords: data?.meta_keywords || defaults.meta_keywords,
                            is_active: data?.is_active ?? defaults.is_active,
                        };
                    } else {
                        map[section.id] = defaults;
                    }
                }
                setSectionData(map);
                setOriginalData(JSON.parse(JSON.stringify(map)));
                setHasChanges(false);
            } else {
                const { data, error } = await supabase
                    .from('page_content')
                    .select('*')
                    .eq('page', selectedPage.id)
                    .eq('tenant', selectedTenant);

                if (error) throw error;

                // Build section data map: merge DB data over defaults
                const map: PageSectionMap = {};
                for (const section of selectedPage.sections) {
                    const defaults = getDefaultsForTenant(selectedPage.id, section.id, selectedTenant);
                    const dbRow = data?.find(d => d.section === section.id);
                    map[section.id] = { ...defaults, ...(dbRow?.content || {}) };
                }
                setSectionData(map);
                setOriginalData(JSON.parse(JSON.stringify(map)));
                setHasChanges(false);
            }
        } catch (err: any) {
            console.error('Failed to load page content:', err);
            // Fall back to defaults
            const map: PageSectionMap = {};
            for (const section of selectedPage.sections) {
                map[section.id] = getDefaultsForTenant(selectedPage.id, section.id, selectedTenant);
            }
            setSectionData(map);
            setOriginalData(JSON.parse(JSON.stringify(map)));
        } finally {
            setLoading(false);
        }
    }, [selectedPage, selectedTenant]);

    useEffect(() => {
        loadPageContent();
        setExpandedSection(null);
    }, [loadPageContent]);

    // Track changes
    useEffect(() => {
        setHasChanges(JSON.stringify(sectionData) !== JSON.stringify(originalData));
    }, [sectionData, originalData]);

    // Update a field value
    const updateField = (sectionId: string, key: string, value: any) => {
        setSectionData(prev => ({
            ...prev,
            [sectionId]: { ...prev[sectionId], [key]: value },
        }));
    };

    // Save all sections to DB
    const handleSave = async () => {
        setSaving(true);
        try {
            if (selectedPage.id === 'location') {
                // Save location page data to location_pages table
                const sampleLoc = getSampleLocation(selectedTenant);
                const hero = sectionData['hero'] || {};
                const content = sectionData['content'] || {};
                const seo = sectionData['seo'] || {};

                const payload = {
                    hero_title: hero.hero_title || '',
                    hero_subtitle: hero.hero_subtitle || '',
                    intro_text: content.intro_text || '',
                    seo_title: seo.seo_title || '',
                    seo_description: seo.seo_description || '',
                    meta_keywords: seo.meta_keywords || '',
                    is_active: seo.is_active ?? true,
                    updated_at: new Date().toISOString(),
                };

                const { data: existing } = await supabase
                    .from('location_pages')
                    .select('id')
                    .eq('tenant', selectedTenant)
                    .eq('location_name', sampleLoc)
                    .maybeSingle();

                if (existing) {
                    const { error } = await supabase
                        .from('location_pages')
                        .update(payload)
                        .eq('id', existing.id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('location_pages')
                        .insert({
                            tenant: selectedTenant,
                            location_name: sampleLoc,
                            slug: sampleLoc.toLowerCase().replace(/\s+/g, '-'),
                            ...payload,
                        });
                    if (error) throw error;
                }
                toast.success('Location page saved successfully!');
            } else {
                for (const section of selectedPage.sections) {
                    const content = sectionData[section.id];
                    if (!content) continue;

                    const { data: existing } = await supabase
                        .from('page_content')
                        .select('id')
                        .eq('page', selectedPage.id)
                        .eq('section', section.id)
                        .eq('tenant', selectedTenant)
                        .maybeSingle();

                    if (existing) {
                        const { error } = await supabase
                            .from('page_content')
                            .update({ content, updated_at: new Date().toISOString() })
                            .eq('id', existing.id);
                        if (error) throw error;
                    } else {
                        const { error } = await supabase
                            .from('page_content')
                            .insert({
                                page: selectedPage.id,
                                section: section.id,
                                tenant: selectedTenant,
                                content,
                                sort_order: selectedPage.sections.indexOf(section),
                                is_active: true,
                            });
                        if (error) throw error;
                    }
                }
                toast.success('All changes saved successfully!');
            }
            setOriginalData(JSON.parse(JSON.stringify(sectionData)));
            setHasChanges(false);
            // Refresh iframe
            if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Reset to defaults
    const handleResetToDefaults = async () => {
        if (!confirm('Reset all sections on this page to default content? This will discard any saved customizations.')) return;
        const map: PageSectionMap = {};
        for (const section of selectedPage.sections) {
            map[section.id] = getDefaultsForTenant(selectedPage.id, section.id, selectedTenant);
        }
        setSectionData(map);
    };

    // Discard unsaved changes
    const handleDiscard = () => {
        setSectionData(JSON.parse(JSON.stringify(originalData)));
        setHasChanges(false);
    };

    // Image upload
    const handleImageUpload = async (sectionId: string, fieldKey: string, file: File) => {
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
        const uploadKey = `${sectionId}.${fieldKey}`;
        setUploadingField(uploadKey);
        try {
            const url = await uploadImageToCloudinary(file);
            updateField(sectionId, fieldKey, url);
            toast.success('Image uploaded');
        } catch (err: any) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploadingField(null);
        }
    };

    // Get groups for a section's fields
    const getFieldGroups = (fields: FieldDefinition[]): { group: string; fields: FieldDefinition[] }[] => {
        const groups: Record<string, FieldDefinition[]> = {};
        fields.forEach(f => {
            const g = f.group || 'General';
            if (!groups[g]) groups[g] = [];
            groups[g].push(f);
        });
        return Object.entries(groups).map(([group, fields]) => ({ group, fields }));
    };

    // Get the live preview URL – pass tenant as query param so the iframe
    // renders the correct tenant even on localhost or when the admin switches tenants
    const getPreviewUrl = () => {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        const base = isLocal
            ? `${window.location.protocol}//${hostname}:${window.location.port}`
            : `${window.location.protocol}//${window.location.host}`;
        const path = selectedPage.id === 'location'
            ? getSampleLocationPath(selectedTenant)
            : selectedPage.path;
        const separator = path.includes('?') ? '&' : '?';
        return `${base}${path}${separator}tenant=${selectedTenant}`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 -mt-2">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {/* Page Selector */}
                    <select
                        value={selectedPage.id}
                        onChange={(e) => {
                            const page = CMS_PAGES.find(p => p.id === e.target.value);
                            if (page) setSelectedPage(page);
                        }}
                        className="text-sm font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        {CMS_PAGES.map(p => (
                            <option key={p.id} value={p.id}>{getPageLabel(p, selectedTenant)} Page</option>
                        ))}
                    </select>

                    {/* Device Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button
                            onClick={() => setDeviceMode('desktop')}
                            className={`p-1.5 rounded-md transition-all ${deviceMode === 'desktop' ? 'bg-white shadow-sm text-[#007F00]' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Desktop"
                        >
                            <Monitor size={16} />
                        </button>
                        <button
                            onClick={() => setDeviceMode('mobile')}
                            className={`p-1.5 rounded-md transition-all ${deviceMode === 'mobile' ? 'bg-white shadow-sm text-[#007F00]' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Mobile"
                        >
                            <Smartphone size={16} />
                        </button>
                    </div>

                    <a
                        href={getPreviewUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#007F00] transition-colors p-1.5"
                        title="Open in new tab"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            <AlertCircle size={12} />
                            Unsaved changes
                        </span>
                    )}
                    <button
                        onClick={handleDiscard}
                        disabled={!hasChanges || saving}
                        className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#007F00] hover:bg-[#006400] px-4 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Main Content: Sidebar + Preview */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Section Editor */}
                <div className="w-[360px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
                    {/* Section List Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-gray-900">
                                {selectedTenant === 'spain' ? 'Secciones' : selectedTenant === 'france' ? 'Sections' : selectedTenant === 'portugal' ? 'Secções' : 'Sections'}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                {selectedPage.sections.length} {selectedTenant === 'spain' ? 'secciones' : selectedTenant === 'france' ? 'sections' : selectedTenant === 'portugal' ? 'secções' : 'sections'} · {selectedTenant === 'spain' ? 'España' : selectedTenant === 'france' ? 'France' : selectedTenant === 'portugal' ? 'Portugal' : selectedTenant === 'england' ? 'England' : 'Ireland'}
                            </p>
                        </div>
                        <button
                            onClick={handleResetToDefaults}
                            className="text-[10px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                            title={selectedTenant === 'spain' ? 'Restablecer valores predeterminados' : selectedTenant === 'france' ? 'Réinitialiser aux valeurs par défaut' : selectedTenant === 'portugal' ? 'Repor predefinições' : 'Reset to defaults'}
                        >
                            <RotateCcw size={12} />
                            {selectedTenant === 'spain' ? 'Restablecer' : selectedTenant === 'france' ? 'Réinitialiser' : selectedTenant === 'portugal' ? 'Repor' : 'Reset'}
                        </button>
                    </div>

                    {/* Sections */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="animate-spin text-gray-300" size={24} />
                            </div>
                        ) : (
                            selectedPage.sections.map((section) => (
                                <SectionPanel
                                    key={section.id}
                                    section={section}
                                    tenant={selectedTenant}
                                    data={sectionData[section.id] || {}}
                                    isExpanded={expandedSection === section.id}
                                    expandedGroup={expandedSection === section.id ? expandedGroup : null}
                                    onToggle={() => {
                                        setExpandedSection(expandedSection === section.id ? null : section.id);
                                        setExpandedGroup(null);
                                    }}
                                    onGroupToggle={(g) => setExpandedGroup(expandedGroup === g ? null : g)}
                                    onFieldChange={(key, value) => updateField(section.id, key, value)}
                                    onImageUpload={(key, file) => handleImageUpload(section.id, key, file)}
                                    uploadingField={uploadingField}
                                    sectionId={section.id}
                                    getFieldGroups={getFieldGroups}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Preview Panel */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center p-6 overflow-hidden">
                    <div
                        className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500 border border-gray-200 ${
                            deviceMode === 'mobile'
                                ? 'w-[375px] h-[667px]'
                                : 'w-full h-full'
                        }`}
                        style={deviceMode === 'mobile' ? { borderRadius: '2rem' } : {}}
                    >
                        {deviceMode === 'mobile' && (
                            <div className="bg-gray-900 h-6 flex items-center justify-center">
                                <div className="w-16 h-1 bg-gray-700 rounded-full" />
                            </div>
                        )}
                        <iframe
                            ref={iframeRef}
                            src={getPreviewUrl()}
                            className="w-full h-full border-0"
                            title="Page Preview"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Section Panel ───────────────────────────────────────────────────────────

interface SectionPanelProps {
    section: SectionDefinition;
    tenant: string;
    data: SectionData;
    isExpanded: boolean;
    expandedGroup: string | null;
    onToggle: () => void;
    onGroupToggle: (g: string) => void;
    onFieldChange: (key: string, value: any) => void;
    onImageUpload: (key: string, file: File) => void;
    uploadingField: string | null;
    sectionId: string;
    getFieldGroups: (fields: FieldDefinition[]) => { group: string; fields: FieldDefinition[] }[];
}

const SectionPanel = ({
    section, tenant, data, isExpanded, expandedGroup, onToggle, onGroupToggle,
    onFieldChange, onImageUpload, uploadingField, sectionId, getFieldGroups,
}: SectionPanelProps) => {
    const groups = getFieldGroups(section.fields);

    return (
        <div className={`border-b border-gray-100 ${isExpanded ? 'bg-gray-50/50' : ''}`}>
            {/* Section Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
            >
                <span className="text-lg flex-shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-gray-900 block">{getSectionLabel(section, tenant)}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{getSectionDescription(section, tenant)}</span>
                </div>
                {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="pb-2">
                    {groups.map(({ group, fields }) => (
                        <div key={group} className="mx-3 mb-1">
                            {/* Group Header */}
                            <button
                                onClick={() => onGroupToggle(group)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {expandedGroup === group ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                {group}
                            </button>

                            {/* Group Fields */}
                            {expandedGroup === group && (
                                <div className="space-y-2.5 px-2 pb-3">
                                    {fields.map(field => (
                                        <FieldEditor
                                            key={field.key}
                                            field={field}
                                            value={data[field.key] ?? ''}
                                            onChange={(v) => onFieldChange(field.key, v)}
                                            onImageUpload={(file) => onImageUpload(field.key, file)}
                                            isUploading={uploadingField === `${sectionId}.${field.key}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Field Editor ────────────────────────────────────────────────────────────

interface FieldEditorProps {
    field: FieldDefinition;
    value: any;
    onChange: (value: any) => void;
    onImageUpload: (file: File) => void;
    isUploading: boolean;
}

const FieldEditor = ({ field, value, onChange, onImageUpload, isUploading }: FieldEditorProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const labelEl = (
        <label className="block text-[11px] font-bold text-gray-600 mb-1">{field.label}</label>
    );

    switch (field.type) {
        case 'text':
        case 'url':
            return (
                <div>
                    {labelEl}
                    <input
                        type={field.type === 'url' ? 'url' : 'text'}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-white placeholder:text-gray-300"
                    />
                </div>
            );

        case 'textarea':
            return (
                <div>
                    {labelEl}
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all bg-white resize-none placeholder:text-gray-300"
                    />
                </div>
            );

        case 'color':
            return (
                <div>
                    {labelEl}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="color"
                                value={value || '#000000'}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                            />
                        </div>
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-700 focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none bg-white"
                            placeholder="#000000"
                        />
                    </div>
                </div>
            );

        case 'select':
            return (
                <div>
                    {labelEl}
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none bg-white cursor-pointer"
                    >
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );

        case 'number':
            return (
                <div>
                    {labelEl}
                    <input
                        type="number"
                        value={value ?? ''}
                        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none bg-white"
                    />
                </div>
            );

        case 'toggle':
            return (
                <div className="flex items-center justify-between py-1">
                    <span className="text-[11px] font-bold text-gray-600">{field.label}</span>
                    <button
                        onClick={() => onChange(!value)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${value ? 'bg-[#007F00]' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                </div>
            );

        case 'image':
            return (
                <div>
                    {labelEl}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onImageUpload(file);
                            e.target.value = '';
                        }}
                    />
                    {value ? (
                        <div className="relative group">
                            <img
                                src={value}
                                alt={field.label}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-white text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : 'Replace'}
                                </button>
                                <button
                                    onClick={() => onChange('')}
                                    className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1.5 hover:border-[#007F00] hover:bg-green-50/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isUploading ? (
                                <Loader2 size={20} className="animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <Upload size={18} className="text-gray-400" />
                                    <span className="text-[10px] font-bold text-gray-400">Click to upload</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            );

        default:
            return null;
    }
};
