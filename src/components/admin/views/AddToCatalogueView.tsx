import { useState } from 'react';
import { X, Briefcase, MapPin, ImageIcon, Globe, Facebook, Instagram, Linkedin, Twitter, Plus, Star, Check, CheckCircle2, Loader2, UploadCloud, Youtube, MessageCircle, ChevronRight } from 'lucide-react';
import type { Profile, CatalogueFormData, AdminView } from '../../../types/admin';

const IRISH_COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
];

interface Props {
    catalogueFormData: CatalogueFormData;
    setCatalogueFormData: (data: CatalogueFormData) => void;
    catalogueCategories: { id: string; name: string }[];
    selectedBusinessForCatalogue: Profile | null;
    selectedListingForEdit: any | null;
    isSavingCatalogue: boolean;
    isUploadingLogo: boolean;
    isUpdatingBanner: boolean;
    isUploadingGallery: { [key: number]: boolean };
    handleSaveCatalogueEntry: (e: React.FormEvent) => void;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGalleryUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleCatalogueCategory: (categoryId: string) => void;
    setView: (v: AdminView) => void;
}

type Tab = 'info' | 'media' | 'social' | 'settings';

export const AddToCatalogueView = ({
    catalogueFormData, setCatalogueFormData, catalogueCategories,
    selectedBusinessForCatalogue, selectedListingForEdit,
    isSavingCatalogue, isUploadingLogo, isUpdatingBanner, isUploadingGallery,
    handleSaveCatalogueEntry, handleLogoUpload, handleBannerUpload, handleGalleryUpload,
    toggleCatalogueCategory, setView,
}: Props) => {
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all outline-none";
    const lbl = "text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block";

    const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'info', label: 'Business Info', icon: Briefcase },
        { id: 'media', label: 'Media', icon: ImageIcon },
        { id: 'social', label: 'Social Media', icon: Globe },
        { id: 'settings', label: 'Categories', icon: Plus },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <form onSubmit={handleSaveCatalogueEntry} className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{selectedListingForEdit ? 'Edit Listing' : 'Add to Catalogue'}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {selectedBusinessForCatalogue ? <>For <span className="font-bold text-gray-600">{selectedBusinessForCatalogue.full_name}</span></> : 'New standalone listing'}
                            </p>
                        </div>
                        <button type="button" onClick={() => setView(selectedListingForEdit ? 'catalogue' : 'businesses')}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
                        {TABS.map(tab => (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-[#007F00] text-[#007F00]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                                <tab.icon size={13} />{tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="px-6 py-6 min-h-[500px]">

                        {/* INFO TAB */}
                        {activeTab === 'info' && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className={lbl}>Company Name *</label><input type="text" required value={catalogueFormData.companyName} onChange={e => setCatalogueFormData({ ...catalogueFormData, companyName: e.target.value })} className={inp} placeholder="Acme Retrofitting Ltd" /></div>
                                    <div><label className={lbl}>Email *</label><input type="email" required value={catalogueFormData.email} onChange={e => setCatalogueFormData({ ...catalogueFormData, email: e.target.value })} className={inp} placeholder="info@business.ie" /></div>
                                    <div><label className={lbl}>Phone</label><input type="tel" value={catalogueFormData.phone} onChange={e => setCatalogueFormData({ ...catalogueFormData, phone: e.target.value })} className={inp} placeholder="+353 1 234 5678" /></div>
                                    <div><label className={lbl}>Website</label><input type="url" value={catalogueFormData.website} onChange={e => setCatalogueFormData({ ...catalogueFormData, website: e.target.value })} className={inp} placeholder="https://www.business.ie" /></div>
                                    <div><label className={lbl}>Company Number</label><input type="text" value={catalogueFormData.companyNumber} onChange={e => setCatalogueFormData({ ...catalogueFormData, companyNumber: e.target.value })} className={inp} placeholder="e.g. 123456" /></div>
                                    <div><label className={lbl}>BER Assessor Registration</label><input type="text" value={catalogueFormData.registrationNo} onChange={e => setCatalogueFormData({ ...catalogueFormData, registrationNo: e.target.value })} className={inp} placeholder="e.g. BER-12345" /></div>
                                    <div><label className={lbl}>VAT Number</label><input type="text" value={catalogueFormData.vatNumber} onChange={e => setCatalogueFormData({ ...catalogueFormData, vatNumber: e.target.value })} className={inp} placeholder="e.g. IE1234567T" /></div>
                                    <div><label className={lbl}>County</label>
                                        <select value={catalogueFormData.county} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, county: e.target.value })} className={inp + " bg-white"}>
                                            <option value="">Select County</option>
                                            {IRISH_COUNTIES.map((c, index) => (
                                                <option key={index} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2"><label className={lbl}>Primary Address</label><input type="text" value={catalogueFormData.address} onChange={e => setCatalogueFormData({ ...catalogueFormData, address: e.target.value })} className={inp} placeholder="123 Industrial Estate, Dublin 12" /></div>
                                    <div className="md:col-span-2"><label className={lbl}>Company Description</label>
                                        <textarea value={catalogueFormData.description} onChange={e => setCatalogueFormData({ ...catalogueFormData, description: e.target.value })} rows={3} className={inp + " resize-none"} placeholder="Describe the services and expertise..." />
                                    </div>
                                </div>

                                {/* Preference locations */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-3"><MapPin size={14} className="text-orange-500" /><span className="text-xs font-bold text-gray-700">Preference locations</span></div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                                        {IRISH_COUNTIES.map(county => {
                                            const isSelected = catalogueFormData.additionalAddresses.includes(county);
                                            return (
                                                <button key={county} type="button"
                                                    onClick={() => setCatalogueFormData({ ...catalogueFormData, additionalAddresses: isSelected ? catalogueFormData.additionalAddresses.filter(c => c !== county) : [...catalogueFormData.additionalAddresses, county] })}
                                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border text-center ${isSelected ? 'bg-[#007F00] text-white border-[#007F00]' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}
                                                >{county}</button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MEDIA TAB */}
                        {activeTab === 'media' && (
                            <div className="space-y-6">
                                {/* Logo */}
                                <div>
                                    <label className={lbl}>Company Logo</label>
                                    <div className="flex items-center gap-4 mt-1">
                                        {catalogueFormData.logoUrl ? (
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 group">
                                                <img src={catalogueFormData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                                <button type="button" onClick={() => setCatalogueFormData({ ...catalogueFormData, logoUrl: '' })} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0">
                                                {isUploadingLogo ? <Loader2 size={22} className="animate-spin" /> : <ImageIcon size={22} />}
                                            </div>
                                        )}
                                        <div>
                                            <input type="file" id="catalogue-logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                                            <label htmlFor="catalogue-logo-upload" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-gray-200 bg-white hover:bg-gray-50 transition-all">
                                                {isUploadingLogo ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                                                {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                            </label>
                                            <p className="text-[10px] text-gray-400 mt-1">Recommended: 400×400px square PNG/JPG · Max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Catalogue Card Banner */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ImageIcon size={14} className="text-[#007F00]" />
                                        <span className="text-xs font-bold text-gray-700">Catalogue Card Banner</span>
                                        <span className="text-[9px] text-gray-400 ml-auto">Portrait · 800×1000px · This appears on the catalogue grid</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mb-3">This image is shown as the main visual on the catalogue listing cards on the public website.</p>

                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        {/* Upload area */}
                                        <div className="flex-1">
                                            {catalogueFormData.bannerUrl ? (
                                                <div className="relative w-full max-w-[200px] aspect-[4/5] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                                                    <img src={catalogueFormData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                                    <button type="button"
                                                        onClick={() => setCatalogueFormData({ ...catalogueFormData, bannerUrl: '' })}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                    ><X size={12} /></button>
                                                </div>
                                            ) : (
                                                <label htmlFor="catalogue-banner-upload" className={`flex flex-col items-center justify-center w-full max-w-[200px] aspect-[4/5] rounded-xl border-2 border-dashed cursor-pointer transition-all ${isUpdatingBanner ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-gray-50 hover:border-[#007F00] hover:bg-green-50'}`}>
                                                    {isUpdatingBanner ? (
                                                        <><Loader2 size={24} className="animate-spin text-[#007F00] mb-2" /><span className="text-[10px] font-bold text-gray-400">Uploading...</span></>
                                                    ) : (
                                                        <><UploadCloud size={24} className="text-gray-300 mb-2" /><span className="text-[10px] font-bold text-gray-400 text-center px-4">Click to upload portrait banner</span></>
                                                    )}
                                                </label>
                                            )}
                                            <input type="file" id="catalogue-banner-upload" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={isUpdatingBanner} />
                                            {!catalogueFormData.bannerUrl && (
                                                <label htmlFor="catalogue-banner-upload" className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-gray-200 bg-white hover:bg-gray-50 transition-all">
                                                    {isUpdatingBanner ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                                                    {isUpdatingBanner ? 'Uploading...' : 'Upload Banner'}
                                                </label>
                                            )}
                                        </div>

                                        {/* Live preview */}
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Live Preview — How it looks on the catalogue</p>
                                            <div className="relative w-[160px] aspect-[4/5] overflow-hidden border border-gray-100 rounded-lg shadow-md">
                                                <img
                                                    src={catalogueFormData.bannerUrl || catalogueFormData.logoUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400'}
                                                    alt="Preview"
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <p className="text-[9px] font-black text-white uppercase tracking-tight leading-tight drop-shadow-lg">
                                                        {catalogueFormData.companyName || 'Company Name'}
                                                    </p>
                                                    <p className="text-[8px] text-white/60 mt-0.5">{catalogueFormData.county || 'Ireland'}</p>
                                                </div>
                                                {catalogueFormData.bannerUrl && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Live</div>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-gray-400 mt-1.5">
                                                {catalogueFormData.bannerUrl ? '✓ Banner set — will show on catalogue' : 'No banner — logo/fallback will be used'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Gallery */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-3"><ImageIcon size={14} className="text-blue-500" /><span className="text-xs font-bold text-gray-700">Gallery Photos (up to 10)</span><span className="text-[9px] text-gray-400 ml-auto">Recommended: 800×600px · JPG/PNG · Max 10MB each</span></div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        {catalogueFormData.galleryImages.map((img, index) => (
                                            <div key={index} className="flex flex-col gap-1.5">
                                                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                                                    {img.url ? (
                                                        <>
                                                            <img src={img.url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                                            <button type="button"
                                                                onClick={() => { const n = [...catalogueFormData.galleryImages]; n[index] = { ...n[index], url: '' }; setCatalogueFormData({ ...catalogueFormData, galleryImages: n }); }}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                            ><X size={10} /></button>
                                                        </>
                                                    ) : (
                                                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-gray-300 hover:text-gray-400 transition-colors">
                                                            {isUploadingGallery[index] ? <Loader2 size={18} className="animate-spin text-[#007EA7]" /> : <><UploadCloud size={18} /><span className="text-[9px] mt-1 font-bold">Photo {index + 1}</span></>}
                                                            <input type="file" accept="image/jpeg,image/png" onChange={e => handleGalleryUpload(index, e)} disabled={isUploadingGallery[index]} className="hidden" />
                                                        </label>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={img.description}
                                                    onChange={e => { const n = [...catalogueFormData.galleryImages]; n[index] = { ...n[index], description: e.target.value }; setCatalogueFormData({ ...catalogueFormData, galleryImages: n }); }}
                                                    placeholder="Caption..."
                                                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-[10px] focus:outline-none focus:border-[#007F00]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SOCIAL TAB */}
                        {activeTab === 'social' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'socialFacebook', label: 'Facebook', icon: <Facebook size={13} className="text-[#1877F2]" />, placeholder: 'https://facebook.com/yourpage' },
                                    { key: 'socialInstagram', label: 'Instagram', icon: <Instagram size={13} className="text-[#e4405f]" />, placeholder: 'https://instagram.com/yourprofile' },
                                    { key: 'socialLinkedin', label: 'LinkedIn', icon: <Linkedin size={13} className="text-[#0A66C2]" />, placeholder: 'https://linkedin.com/company/handle' },
                                    { key: 'socialTwitter', label: 'Twitter / X', icon: <Twitter size={13} />, placeholder: 'https://twitter.com/handle' },
                                    { key: 'socialWhatsapp', label: 'WhatsApp', icon: <MessageCircle size={13} className="text-[#25D366]" />, placeholder: '+353 87 123 4567' },
                                    { key: 'socialYoutube', label: 'YouTube', icon: <Youtube size={13} className="text-[#FF0000]" />, placeholder: 'https://youtube.com/@channel' },
                                    { key: 'socialSnapchat', label: 'Snapchat', icon: <span className="text-[13px]">👻</span>, placeholder: 'https://snapchat.com/add/username' },
                                    { key: 'socialTiktok', label: 'TikTok', icon: <span className="font-black text-[13px]">♪</span>, placeholder: 'https://tiktok.com/@username' },
                                ].map(({ key, label, icon, placeholder }) => (
                                    <div key={key}>
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{icon}{label}</label>
                                        <input type="text" value={(catalogueFormData as any)[key]} onChange={e => setCatalogueFormData({ ...catalogueFormData, [key]: e.target.value })} placeholder={placeholder} className={inp} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-3"><Plus size={14} className="text-[#007F00]" /><span className="text-xs font-bold text-gray-700">Service Categories *</span></div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {catalogueCategories.map(cat => (
                                            <div key={cat.id} onClick={() => toggleCatalogueCategory(cat.id)}
                                                className={`cursor-pointer p-3 rounded-xl border-2 flex items-center justify-between transition-all select-none ${catalogueFormData.selectedCategories.includes(cat.id) ? 'bg-green-50 border-[#007F00] text-[#007F00]' : 'bg-white border-gray-100 hover:border-green-200 text-gray-600'}`}
                                            >
                                                <span className="text-xs font-bold leading-tight">{cat.name}</span>
                                                {catalogueFormData.selectedCategories.includes(cat.id) && <Check size={14} className="text-[#007F00] flex-shrink-0" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#007EA7]" /><span className="text-xs font-bold text-gray-700">Key Features / Highlights</span></div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Shown on listing page</span>
                                    </div>
                                    <div className="space-y-2">
                                        {catalogueFormData.features.map((feature, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={e => {
                                                        const updated = [...catalogueFormData.features];
                                                        updated[idx] = e.target.value;
                                                        setCatalogueFormData({ ...catalogueFormData, features: updated });
                                                    }}
                                                    placeholder="e.g. 24/7 Emergency Support"
                                                    className={inp}
                                                />
                                                <button type="button"
                                                    onClick={() => setCatalogueFormData({ ...catalogueFormData, features: catalogueFormData.features.filter((_, i) => i !== idx) })}
                                                    className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                                                ><X size={14} /></button>
                                            </div>
                                        ))}
                                        <button type="button"
                                            onClick={() => setCatalogueFormData({ ...catalogueFormData, features: [...catalogueFormData.features, ''] })}
                                            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-[#007F00] hover:text-[#007F00] transition-all"
                                        >+ Add Feature</button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-3"><Star size={14} className="text-amber-500" /><span className="text-xs font-bold text-gray-700">Premium Placement</span></div>
                                    <div onClick={() => setCatalogueFormData({ ...catalogueFormData, featured: !catalogueFormData.featured })}
                                        className={`cursor-pointer flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${catalogueFormData.featured ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-100 hover:border-amber-200'}`}
                                    >
                                        <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${catalogueFormData.featured ? 'bg-amber-500' : 'bg-gray-200'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${catalogueFormData.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-gray-900">Feature this listing</span>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Appears at top of search results and spotlight carousel.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex gap-1">
                            {TABS.map((tab) => (
                                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                    className={`w-2 h-2 rounded-full transition-all ${activeTab === tab.id ? 'bg-[#007F00] w-4' : 'bg-gray-300'}`} />
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            {activeTab !== 'settings' && (
                                <button type="button"
                                    onClick={() => { const order: Tab[] = ['info', 'media', 'social', 'settings']; setActiveTab(order[order.indexOf(activeTab) + 1]); }}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-all">
                                    Next <ChevronRight size={14} />
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSavingCatalogue || isUploadingLogo || isUpdatingBanner || Object.values(isUploadingGallery).some(Boolean)}
                                className="flex items-center gap-2 px-6 py-2 bg-[#007F00] text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {(isSavingCatalogue || isUploadingLogo || isUpdatingBanner || Object.values(isUploadingGallery).some(Boolean)) ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                {isSavingCatalogue ? 'Saving...' : (selectedListingForEdit ? 'Update' : 'Add to Catalogue')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
