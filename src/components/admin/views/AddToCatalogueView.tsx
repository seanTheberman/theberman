import { X, Briefcase, MapPin, Newspaper, ImageIcon, Globe, Facebook, Instagram, Linkedin, Twitter, Plus, Star, Check, CheckCircle2, Loader2, UploadCloud, RefreshCw } from 'lucide-react';
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

export const AddToCatalogueView = ({
    catalogueFormData, setCatalogueFormData, catalogueCategories,
    selectedBusinessForCatalogue, selectedListingForEdit,
    isSavingCatalogue, isUploadingLogo, isUpdatingBanner, isUploadingGallery,
    handleSaveCatalogueEntry, handleLogoUpload, handleBannerUpload, handleGalleryUpload,
    toggleCatalogueCategory, setView,
}: Props) => (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <form onSubmit={handleSaveCatalogueEntry} className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-8 bg-gray-50/50 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Add to Catalogue</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {selectedBusinessForCatalogue ? (
                                <>Create a listing for <span className="font-bold text-gray-700">{selectedBusinessForCatalogue.full_name}</span></>
                            ) : 'Create a new standalone business listing'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setView(selectedListingForEdit ? 'catalogue' : 'businesses')}
                        className="bg-white text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:border-gray-300 transition-all flex items-center gap-2"
                    >
                        <X size={18} />Cancel
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-10 space-y-8">
                    {/* Business Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Briefcase size={18} /></div>
                            <h3 className="text-base font-bold text-gray-900">{selectedListingForEdit ? 'Edit Business Details' : 'Business Details'}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name *</label>
                                <input type="text" required value={catalogueFormData.companyName} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, companyName: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" placeholder="e.g. Acme Retrofitting Ltd" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email *</label>
                                <input type="email" required value={catalogueFormData.email} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, email: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" placeholder="info@business.ie" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone <span className="text-gray-300 font-medium">(Optional)</span></label>
                                <input type="tel" value={catalogueFormData.phone} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, phone: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" placeholder="+353 1 234 5678" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Website <span className="text-gray-300 font-medium">(Optional)</span></label>
                                <input type="url" value={catalogueFormData.website} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, website: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" placeholder="https://www.business.ie" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Number <span className="text-gray-300 font-medium">(Optional)</span></label>
                                <input type="text" value={catalogueFormData.companyNumber} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, companyNumber: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" placeholder="e.g. 123456" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">BER Assessor Registration <span className="text-gray-300 font-medium">(Optional)</span></label>
                                <input type="text" value={catalogueFormData.registrationNo} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, registrationNo: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" placeholder="e.g. BER-12345" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">VAT Number <span className="text-gray-300 font-medium">(Optional)</span></label>
                                <input type="text" value={catalogueFormData.vatNumber} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, vatNumber: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" placeholder="e.g. IE1234567T" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Address <span className="text-gray-300 font-medium">(Optional)</span></label>
                                <input type="text" value={catalogueFormData.address} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, address: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" placeholder="123 Industrial Estate, Dublin 12" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">County</label>
                                <select value={catalogueFormData.county} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, county: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all bg-white">
                                    <option value="">Select County</option>
                                    {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Preferred Locations */}
                            <div className="md:col-span-2 space-y-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><MapPin size={18} /></div>
                                    <h3 className="text-base font-bold text-gray-900">Preferred Locations</h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {IRISH_COUNTIES.map(county => {
                                        const isSelected = catalogueFormData.additionalAddresses.includes(county);
                                        return (
                                            <button key={county} type="button"
                                                onClick={() => {
                                                    const newLocs = isSelected
                                                        ? catalogueFormData.additionalAddresses.filter(c => c !== county)
                                                        : [...catalogueFormData.additionalAddresses, county];
                                                    setCatalogueFormData({ ...catalogueFormData, additionalAddresses: newLocs });
                                                }}
                                                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border text-center ${isSelected ? 'bg-[#007F00] text-white border-[#007F00] shadow-md shadow-green-100' : 'bg-white text-gray-500 border-gray-200 hover:border-[#007F00]/30 hover:bg-green-50'}`}
                                            >
                                                {county}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Newspaper size={18} /></div>
                            <h3 className="text-base font-bold text-gray-900">About the Business</h3>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Description</label>
                            <textarea value={catalogueFormData.description} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, description: e.target.value })} rows={4} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all resize-none" placeholder="Describe the services and expertise..." />
                        </div>
                    </div>

                    {/* Branding & Media */}
                    <div className="md:col-span-2 mt-8 pt-8 border-t border-double border-gray-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><ImageIcon size={18} /></div>
                            <h3 className="text-base font-bold text-gray-900 uppercase tracking-widest">Branding & Media</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Logo */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo</label>
                                <div className="mt-1 flex items-center gap-4">
                                    {catalogueFormData.logoUrl ? (
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 group shadow-sm transition-all hover:shadow-md">
                                            <img src={catalogueFormData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                                            <button type="button" onClick={() => setCatalogueFormData({ ...catalogueFormData, logoUrl: ' ' })} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={20} className="text-white" /></button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 bg-gray-50/50">
                                            {isUploadingLogo ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <input type="file" id="catalogue-logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                                        <label htmlFor="catalogue-logo-upload" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm border ${isUploadingLogo ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                                            {isUploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                            {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                        </label>
                                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">Rec: Square PNG/JPG. Max 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Banner */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-3">Master Banner Image</label>
                                <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 group ring-4 ring-white shadow-sm transition-all hover:border-[#007F00]/30">
                                    {catalogueFormData.bannerUrl ? (
                                        <>
                                            <img src={catalogueFormData.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => setCatalogueFormData({ ...catalogueFormData, bannerUrl: '' })} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-xl"><X size={24} /></button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                            {isUpdatingBanner ? (
                                                <Loader2 size={40} className="animate-spin text-[#007F00]" />
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                                                        <ImageIcon size={32} className="group-hover:text-[#007F00] transition-colors" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-bold text-sm text-gray-900 mb-1">Upload Master Banner</p>
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500">1920 x 600 recommended</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input type="file" id="catalogue-banner-upload" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={isUpdatingBanner} />
                                    {!catalogueFormData.bannerUrl && !isUpdatingBanner && <label htmlFor="catalogue-banner-upload" className="absolute inset-0 cursor-pointer" />}
                                </div>
                                {catalogueFormData.bannerUrl && (
                                    <label htmlFor="catalogue-banner-upload" className="mt-2 inline-flex items-center gap-2 text-[10px] font-black uppercase text-[#007EA7] hover:text-[#005f7d] cursor-pointer transition-colors">
                                        <RefreshCw size={12} className={isUpdatingBanner ? 'animate-spin' : ''} />Replace Current Banner
                                    </label>
                                )}
                            </div>

                            {/* Social Media */}
                            <div className="md:col-span-2 space-y-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Globe size={18} /></div>
                                    <h3 className="text-base font-bold text-gray-900">Social Media Connections</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Facebook size={12} /> Facebook</label>
                                            <input type="url" value={catalogueFormData.socialFacebook} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, socialFacebook: e.target.value })} placeholder="https://facebook.com/yourpage" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Instagram size={12} /> Instagram</label>
                                            <input type="url" value={catalogueFormData.socialInstagram} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, socialInstagram: e.target.value })} placeholder="https://instagram.com/yourprofile" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Linkedin size={12} /> LinkedIn</label>
                                            <input type="url" value={catalogueFormData.socialLinkedin} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, socialLinkedin: e.target.value })} placeholder="https://linkedin.com/company/handle" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Twitter size={12} /> Twitter / X</label>
                                            <input type="url" value={catalogueFormData.socialTwitter} onChange={(e) => setCatalogueFormData({ ...catalogueFormData, socialTwitter: e.target.value })} placeholder="https://twitter.com/handle" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-100">
                        <div className="mb-6">
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2"><ImageIcon size={16} /> Manage Gallery Photos</h3>
                            <p className="text-[11px] text-gray-500 font-medium mt-1">Add up to 3 high-quality JPG or PNG photos with short descriptions</p>
                        </div>
                        <div className="space-y-6">
                            {catalogueFormData.galleryImages.map((img, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-6 items-start border border-gray-100 p-6 rounded-2xl bg-gray-50/50">
                                    <div className="flex-grow space-y-4 w-full">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Upload Photo {index + 1}</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="file" accept="image/jpeg, image/png"
                                                    onChange={(e) => handleGalleryUpload(index, e)}
                                                    disabled={isUploadingGallery[index]}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#007EA7]/10 file:text-[#007EA7] hover:file:bg-[#007EA7]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                />
                                                {isUploadingGallery[index] && <Loader2 size={16} className="animate-spin text-[#007EA7] shrink-0" />}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Short Description</label>
                                            <textarea
                                                value={img.description}
                                                onChange={(e) => {
                                                    const newImages = [...catalogueFormData.galleryImages];
                                                    newImages[index] = { ...newImages[index], description: e.target.value };
                                                    setCatalogueFormData({ ...catalogueFormData, galleryImages: newImages });
                                                }}
                                                placeholder="What's happening in this photo?"
                                                rows={2}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-4 focus:ring-[#007EA7]/10 focus:border-[#007EA7] transition-all"
                                            />
                                        </div>
                                    </div>
                                    {img.url ? (
                                        <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 shadow-sm relative group">
                                            <img src={img.url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                            <button type="button"
                                                onClick={() => {
                                                    const newImages = [...catalogueFormData.galleryImages];
                                                    newImages[index] = { ...newImages[index], url: '' };
                                                    setCatalogueFormData({ ...catalogueFormData, galleryImages: newImages });
                                                }}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            ><X size={20} className="text-white" /></button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 bg-white flex-shrink-0 shadow-sm"><ImageIcon size={24} /></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4 pt-8 border-t border-gray-100">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-[#007F00] flex items-center justify-center"><Plus size={18} /></div>
                            <h3 className="text-base font-bold text-gray-900">Service Categories *</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {catalogueCategories.map(cat => (
                                <div key={cat.id} onClick={() => toggleCatalogueCategory(cat.id)}
                                    className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center justify-between transition-all select-none ${catalogueFormData.selectedCategories.includes(cat.id) ? 'bg-green-50/50 border-[#007F00] text-[#007F00] shadow-sm' : 'bg-white border-gray-100 hover:border-green-200 text-gray-600'}`}
                                >
                                    <span className="text-xs font-bold leading-tight">{cat.name}</span>
                                    {catalogueFormData.selectedCategories.includes(cat.id) && <Check size={16} className="text-[#007F00]" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Premium Options */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Star size={18} /></div>
                            <h3 className="text-base font-bold text-gray-900">Premium Placement</h3>
                        </div>
                        <div onClick={() => setCatalogueFormData({ ...catalogueFormData, featured: !catalogueFormData.featured })}
                            className={`cursor-pointer flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${catalogueFormData.featured ? 'bg-amber-50/50 border-amber-400' : 'bg-white border-gray-100 hover:border-amber-200'}`}
                        >
                            <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${catalogueFormData.featured ? 'bg-amber-500' : 'bg-gray-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${catalogueFormData.featured ? 'translate-x-7' : 'translate-x-1'}`} />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-gray-900">Feature this listing</span>
                                <p className="text-[11px] text-gray-400 mt-0.5">Featured businesses appear at the top of search results and in the spotlight carousel.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-4">
                    <button type="button" onClick={() => setView(selectedListingForEdit ? 'catalogue' : 'businesses')} className="px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm">Cancel</button>
                    <button
                        type="submit"
                        disabled={isSavingCatalogue || isUploadingLogo || isUpdatingBanner || Object.values(isUploadingGallery).some(Boolean)}
                        className="px-10 py-4 bg-[#007F00] text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {(isSavingCatalogue || isUploadingLogo || isUpdatingBanner || Object.values(isUploadingGallery).some(Boolean)) ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                        {isSavingCatalogue ? 'Saving Listing...' : (isUploadingLogo || isUpdatingBanner || Object.values(isUploadingGallery).some(Boolean)) ? 'Uploading...' : (selectedListingForEdit ? 'Update Listing' : 'Add to Catalogue')}
                    </button>
                </div>
            </form>
        </div>
    </div>
);
