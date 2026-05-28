import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { MapPin, Edit2, Save, X, Plus, Loader2, Search, Globe, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { getTownsForTenant, getCountiesForTenant } from '../../../lib/tenantData';

interface LocationPage {
    id?: string;
    tenant: string;
    location_name: string;
    slug: string;
    hero_title: string;
    hero_subtitle: string;
    intro_text: string;
    seo_title: string;
    seo_description: string;
    meta_keywords: string;
    is_active: boolean;
}

interface Props {
    selectedTenant: string;
}

const TENANT_LOCATIONS: Record<string, { regions: string[]; towns: Record<string, string[]> }> = {
    ireland: { regions: getCountiesForTenant('ireland'), towns: getTownsForTenant('ireland') },
    spain: { regions: getCountiesForTenant('spain'), towns: getTownsForTenant('spain') },
    england: { regions: getCountiesForTenant('england'), towns: getTownsForTenant('england') },
    france: { regions: getCountiesForTenant('france'), towns: getTownsForTenant('france') },
    portugal: { regions: getCountiesForTenant('portugal'), towns: getTownsForTenant('portugal') },
};

const makeSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const defaultPage = (tenant: string, name: string): LocationPage => ({
    tenant,
    location_name: name,
    slug: makeSlug(name),
    hero_title: '',
    hero_subtitle: '',
    intro_text: '',
    seo_title: '',
    seo_description: '',
    meta_keywords: '',
    is_active: true,
});

export const LocationPagesView = ({ selectedTenant }: Props) => {
    const [pages, setPages] = useState<LocationPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPage, setEditingPage] = useState<LocationPage | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

    const tenant = selectedTenant || 'ireland';
    const tenantData = TENANT_LOCATIONS[tenant] || TENANT_LOCATIONS.ireland;

    const fetchPages = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('location_pages')
                .select('*')
                .eq('tenant', tenant)
                .order('location_name');
            if (error) throw error;
            setPages(data || []);
        } catch (err: any) {
            toast.error('Failed to load location pages');
        } finally {
            setLoading(false);
        }
    }, [tenant]);

    useEffect(() => {
        fetchPages();
        setEditingPage(null);
        setExpandedRegion(null);
    }, [fetchPages]);

    const getPage = (name: string) => pages.find(p => p.location_name === name);

    const handleEdit = (locationName: string) => {
        const existing = getPage(locationName);
        setEditingPage(existing ? { ...existing } : defaultPage(tenant, locationName));
    };

    const handleSave = async () => {
        if (!editingPage) return;
        setSaving(true);
        try {
            if (editingPage.id) {
                const { error } = await supabase
                    .from('location_pages')
                    .update({
                        hero_title: editingPage.hero_title,
                        hero_subtitle: editingPage.hero_subtitle,
                        intro_text: editingPage.intro_text,
                        seo_title: editingPage.seo_title,
                        seo_description: editingPage.seo_description,
                        meta_keywords: editingPage.meta_keywords,
                        is_active: editingPage.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingPage.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('location_pages').insert({
                    tenant: editingPage.tenant,
                    location_name: editingPage.location_name,
                    slug: editingPage.slug,
                    hero_title: editingPage.hero_title,
                    hero_subtitle: editingPage.hero_subtitle,
                    intro_text: editingPage.intro_text,
                    seo_title: editingPage.seo_title,
                    seo_description: editingPage.seo_description,
                    meta_keywords: editingPage.meta_keywords,
                    is_active: editingPage.is_active,
                });
                if (error) throw error;
            }
            toast.success('Location page saved');
            setEditingPage(null);
            await fetchPages();
        } catch (err: any) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete page for "${name}"?`)) return;
        try {
            const { error } = await supabase.from('location_pages').delete().eq('id', id);
            if (error) throw error;
            toast.success('Page deleted');
            await fetchPages();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete');
        }
    };

    const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none bg-white';
    const lbl = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1';

    // Flatten all locations for search
    const allLocations = tenantData.regions.flatMap(region => [
        { name: region, isRegion: true },
        ...(tenantData.towns[region] || []).map(town => ({ name: town, isRegion: false })),
    ]);

    const filteredLocations = searchTerm.trim()
        ? allLocations.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : null;

    const configuredCount = pages.length;
    const totalLocations = allLocations.length;

    return (
        <div className="flex gap-6 h-[calc(100vh-10rem)]">
            {/* Left: Location Tree */}
            <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-black text-gray-900 mb-0.5">Location Pages</h3>
                    <p className="text-[10px] text-gray-400 font-medium capitalize">{tenant} · {configuredCount}/{totalLocations} configured</p>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search locations..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-gray-300" size={24} />
                        </div>
                    ) : filteredLocations ? (
                        /* Search results flat list */
                        <div className="py-1">
                            {filteredLocations.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-6">No results</p>
                            ) : filteredLocations.map(loc => {
                                const pg = getPage(loc.name);
                                const isEditing = editingPage?.location_name === loc.name;
                                return (
                                    <button
                                        key={loc.name}
                                        onClick={() => handleEdit(loc.name)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${isEditing ? 'bg-green-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <MapPin size={12} className={pg ? 'text-[#007F00]' : 'text-gray-300'} />
                                            <span className="text-xs font-medium text-gray-700 truncate">{loc.name}</span>
                                            {loc.isRegion && <span className="text-[9px] text-gray-400 font-bold uppercase bg-gray-100 px-1.5 py-0.5 rounded">Region</span>}
                                        </div>
                                        {pg ? (
                                            <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded flex-shrink-0">Saved</span>
                                        ) : (
                                            <Plus size={12} className="text-gray-300 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        /* Region tree */
                        <div className="py-1">
                            {tenantData.regions.map(region => {
                                const regionPg = getPage(region);
                                const isExpanded = expandedRegion === region;
                                const towns = tenantData.towns[region] || [];
                                const configuredTowns = towns.filter(t => getPage(t)).length;

                                return (
                                    <div key={region} className="border-b border-gray-50">
                                        {/* Region row */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => setExpandedRegion(isExpanded ? null : region)}
                                                className="flex items-center gap-1.5 px-3 py-2.5 flex-1 min-w-0 hover:bg-gray-50 transition-colors text-left"
                                            >
                                                {isExpanded ? <ChevronDown size={12} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />}
                                                <Globe size={12} className={regionPg ? 'text-[#007F00] flex-shrink-0' : 'text-gray-300 flex-shrink-0'} />
                                                <span className="text-xs font-bold text-gray-800 truncate">{region}</span>
                                                {configuredTowns > 0 && (
                                                    <span className="text-[9px] text-gray-400 ml-auto flex-shrink-0">{configuredTowns}/{towns.length}</span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(region)}
                                                className={`px-2 py-2.5 hover:bg-gray-50 flex-shrink-0 ${editingPage?.location_name === region ? 'text-[#007F00]' : 'text-gray-300 hover:text-gray-500'}`}
                                                title="Edit region page"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        </div>

                                        {/* Towns */}
                                        {isExpanded && towns.map(town => {
                                            const townPg = getPage(town);
                                            const isEditing = editingPage?.location_name === town;
                                            return (
                                                <button
                                                    key={town}
                                                    onClick={() => handleEdit(town)}
                                                    className={`w-full flex items-center justify-between pl-8 pr-4 py-2 text-left hover:bg-gray-50 transition-colors ${isEditing ? 'bg-green-50' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <MapPin size={11} className={townPg ? 'text-[#007F00] flex-shrink-0' : 'text-gray-200 flex-shrink-0'} />
                                                        <span className="text-xs text-gray-600 truncate">{town}</span>
                                                    </div>
                                                    {townPg ? (
                                                        <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded flex-shrink-0">Saved</span>
                                                    ) : (
                                                        <Plus size={11} className="text-gray-200 flex-shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Editor */}
            <div className="flex-1 overflow-y-auto">
                {editingPage ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                                    <MapPin size={16} className="text-[#007F00]" />
                                    {editingPage.location_name}
                                    {editingPage.id && <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded">Saved</span>}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">/{editingPage.slug}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {editingPage.id && (
                                    <button
                                        onClick={() => handleDelete(editingPage.id!, editingPage.location_name)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete page"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                                <button onClick={() => setEditingPage(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Hero Section */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Hero Content</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className={lbl}>Hero Title</label>
                                        <input type="text" value={editingPage.hero_title} onChange={e => setEditingPage({ ...editingPage, hero_title: e.target.value })} className={inp} placeholder={`Energy Assessors in ${editingPage.location_name}`} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Hero Subtitle</label>
                                        <input type="text" value={editingPage.hero_subtitle} onChange={e => setEditingPage({ ...editingPage, hero_subtitle: e.target.value })} className={inp} placeholder={`Find certified assessors in ${editingPage.location_name}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Intro */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Intro Text</h4>
                                <textarea
                                    value={editingPage.intro_text}
                                    onChange={e => setEditingPage({ ...editingPage, intro_text: e.target.value })}
                                    rows={4}
                                    className={inp}
                                    placeholder={`Describe services available in ${editingPage.location_name}...`}
                                />
                            </div>

                            {/* SEO */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">SEO</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className={lbl}>SEO Title <span className="normal-case text-gray-300 font-normal">(recommended: 50–60 chars)</span></label>
                                        <input type="text" value={editingPage.seo_title} onChange={e => setEditingPage({ ...editingPage, seo_title: e.target.value })} className={inp} placeholder={`BER Assessors in ${editingPage.location_name} | Platform Name`} />
                                        <p className="text-[10px] text-gray-400 mt-0.5">{editingPage.seo_title.length} chars</p>
                                    </div>
                                    <div>
                                        <label className={lbl}>SEO Description <span className="normal-case text-gray-300 font-normal">(recommended: 150–160 chars)</span></label>
                                        <textarea value={editingPage.seo_description} onChange={e => setEditingPage({ ...editingPage, seo_description: e.target.value })} rows={3} className={inp} placeholder={`Find certified BER assessors in ${editingPage.location_name}. Compare quotes and book online.`} />
                                        <p className="text-[10px] text-gray-400 mt-0.5">{editingPage.seo_description.length} chars</p>
                                    </div>
                                    <div>
                                        <label className={lbl}>Meta Keywords <span className="normal-case text-gray-300 font-normal">(comma-separated)</span></label>
                                        <input type="text" value={editingPage.meta_keywords} onChange={e => setEditingPage({ ...editingPage, meta_keywords: e.target.value })} className={inp} placeholder={`BER assessor ${editingPage.location_name}, energy cert ${editingPage.location_name}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Page Active</p>
                                    <p className="text-xs text-gray-400">Inactive pages won't be indexed or shown publicly</p>
                                </div>
                                <button
                                    onClick={() => setEditingPage({ ...editingPage, is_active: !editingPage.is_active })}
                                    className={`relative w-10 h-6 rounded-full transition-colors ${editingPage.is_active ? 'bg-[#007F00]' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingPage.is_active ? 'left-[22px]' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Save button */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setEditingPage(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#007F00] text-white rounded-lg text-sm font-bold hover:bg-[#006400] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                {saving ? 'Saving...' : 'Save Page'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <MapPin size={40} className="text-gray-200 mb-4" />
                        <h3 className="text-base font-black text-gray-400">Select a location to edit</h3>
                        <p className="text-sm text-gray-300 mt-1">Click any location in the list to configure its page content</p>
                    </div>
                )}
            </div>
        </div>
    );
};
