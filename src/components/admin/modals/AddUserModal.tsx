import { X, AlertTriangle, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { TOWNS_BY_COUNTY } from '../../../data/irishTowns';

const IRISH_COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
];

interface NewUserFormData {
    fullName: string;
    email: string;
    phone: string;
    county: string;
    town: string;
    seaiNumber: string;
    assessorType: string;
    companyName: string;
    businessAddress: string;
    website: string;
    description: string;
    companyNumber: string;
    vatNumber: string;
    registrationAmount: number;
}

interface Props {
    newUserRole: 'contractor' | 'business';
    newUserFormData: NewUserFormData;
    setNewUserFormData: (v: NewUserFormData) => void;
    isUpdating: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const AddUserModal = ({ newUserRole, newUserFormData, setNewUserFormData, isUpdating, onClose, onSubmit }: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
    >
        <div
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-5 sm:p-8 pb-0 shrink-0">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">Manual Registration</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Adding a new {newUserRole === 'contractor' ? 'Assessor' : 'Business'}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="px-5 sm:px-8 pb-5 sm:pb-8 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
                    <div>
                        <h4 className="text-[10px] font-black text-[#007F00] uppercase tracking-widest mb-3 sm:mb-4">Personal Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={newUserRole === 'contractor' ? 'Full name' : 'Full business name'}
                                    value={newUserFormData.fullName}
                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, fullName: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="email"
                                    value={newUserFormData.email}
                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, email: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+353 8X XXX XXXX"
                                    value={newUserFormData.phone}
                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, phone: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">County</label>
                                    <select
                                        value={newUserFormData.county}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, county: e.target.value, town: '' })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white transition-all outline-none"
                                    >
                                        <option value="">Select County</option>
                                        {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {newUserRole === 'contractor' && newUserFormData.county && (
                                    <div className="animate-in slide-in-from-top-2 duration-200">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Town</label>
                                        <select
                                            value={newUserFormData.town}
                                            onChange={(e) => setNewUserFormData({ ...newUserFormData, town: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white transition-all outline-none"
                                        >
                                            <option value="">Select Town</option>
                                            {(TOWNS_BY_COUNTY[newUserFormData.county] || []).map((t: string) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {newUserRole === 'contractor' && (
                        <div>
                            <h4 className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest mb-4">Assessor Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SEAI Registration #</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 10XXX"
                                        value={newUserFormData.seaiNumber}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, seaiNumber: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assessor Type</label>
                                    <select
                                        value={newUserFormData.assessorType}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, assessorType: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white"
                                    >
                                        <option value="Domestic Assessor">Domestic Assessor</option>
                                        <option value="Commercial Assessor">Commercial Assessor</option>
                                        <option value="Both">Both (Domestic & Commercial)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Company Name <span className="text-gray-300">(optional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ABC Energy Assessments"
                                        value={newUserFormData.companyName}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, companyName: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {newUserRole === 'business' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h4 className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest mb-4">Business Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Business Address</label>
                                    <input
                                        type="text"
                                        placeholder="123 Main Street, Town"
                                        value={newUserFormData.businessAddress}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, businessAddress: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Website <span className="text-gray-300 font-medium">(optional)</span></label>
                                    <input
                                        type="url"
                                        placeholder="https://www.example.ie"
                                        value={newUserFormData.website}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, website: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Company Number <span className="text-gray-300 font-medium">(optional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        value={newUserFormData.companyNumber}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, companyNumber: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">VAT Number <span className="text-gray-300 font-medium">(optional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="IE1234567A"
                                        value={newUserFormData.vatNumber}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, vatNumber: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description <span className="text-gray-300 font-medium">(optional)</span></label>
                                    <textarea
                                        placeholder="Describe the business and services..."
                                        rows={3}
                                        value={newUserFormData.description}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, description: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Registration Amount Section */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard size={14} className="text-purple-600" />
                                    <span className="text-[10px] font-black text-purple-900 uppercase tracking-widest">Registration Fee</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Amount to Pay (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={newUserFormData.registrationAmount || ''}
                                            onChange={(e) => setNewUserFormData({ ...newUserFormData, registrationAmount: parseFloat(e.target.value) || 0 })}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1.5">Set to 0 for free registration</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 w-full">
                                            <p className="text-sm font-bold text-purple-900">
                                                Fee: {newUserFormData.registrationAmount === 0 ? 'FREE' : `€${newUserFormData.registrationAmount.toFixed(2)}`}
                                            </p>
                                            <p className="text-xs text-purple-700 mt-1">
                                                {newUserFormData.registrationAmount === 0
                                                    ? 'Business can register without payment'
                                                    : 'Business must pay this amount to complete registration'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                            <AlertTriangle size={12} className="inline mr-1 text-amber-500" />
                            This will create a profile entry. If the user eventually signs up with this email, their dashboard will automatically link to this record.
                        </p>
                    </div>
                </div>

                <div className="px-5 sm:px-8 py-4 sm:py-6 border-t border-gray-100 flex flex-col gap-3 shrink-0 bg-gray-50/50 rounded-b-2xl sm:rounded-b-3xl">
                    {isUpdating && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <Loader2 size={20} className="animate-spin text-blue-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-blue-900">Creating {newUserRole === 'contractor' ? 'assessor' : 'business'} account...</p>
                                    <p className="text-xs text-blue-600 mt-1">This usually takes 5-10 seconds</p>
                                </div>
                            </div>
                            <div className="mt-3 bg-blue-100 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%', animation: 'pulse 2s ease-in-out infinite' }} />
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-[2] py-3 sm:py-4 bg-[#007F00] text-white font-bold rounded-xl sm:rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            {isUpdating ? 'Creating...' : `Add ${newUserRole === 'contractor' ? 'Assessor' : 'Business'}`}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 hover:text-gray-700 transition-all text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
);
