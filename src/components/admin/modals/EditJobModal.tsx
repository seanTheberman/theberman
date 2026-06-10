import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import type { Assessment } from '../../../types/admin';

const IRISH_COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
];

const JOB_STATUSES = ['draft', 'submitted', 'pending', 'pending_quote', 'quote_accepted', 'scheduled', 'completed', 'assigned', 'live', 'expired'];

interface Props {
    assessment: Assessment;
    onClose: () => void;
    onSaved: () => void;
}

export const EditJobModal = ({ assessment, onClose, onSaved }: Props) => {
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        contact_name: assessment.contact_name || '',
        contact_email: assessment.contact_email || '',
        contact_phone: assessment.contact_phone || '',
        property_address: assessment.property_address || '',
        town: assessment.town || '',
        county: assessment.county || '',
        eircode: assessment.eircode || '',
        property_type: assessment.property_type || '',
        property_size: assessment.property_size || '',
        bedrooms: assessment.bedrooms?.toString() || '',
        ber_purpose: assessment.ber_purpose || '',
        heat_pump: assessment.heat_pump || '',
        building_type: assessment.building_type || '',
        floor_area: assessment.floor_area || '',
        building_complexity: assessment.building_complexity || '',
        assessment_purpose: assessment.assessment_purpose || '',
        preferred_date: assessment.preferred_date || '',
        preferred_time: assessment.preferred_time || '',
        status: assessment.status,
        notes: assessment.notes || '',
    });

    useEffect(() => {
        setFormData({
            contact_name: assessment.contact_name || '',
            contact_email: assessment.contact_email || '',
            contact_phone: assessment.contact_phone || '',
            property_address: assessment.property_address || '',
            town: assessment.town || '',
            county: assessment.county || '',
            eircode: assessment.eircode || '',
            property_type: assessment.property_type || '',
            property_size: assessment.property_size || '',
            bedrooms: assessment.bedrooms?.toString() || '',
            ber_purpose: assessment.ber_purpose || '',
            heat_pump: assessment.heat_pump || '',
            building_type: assessment.building_type || '',
            floor_area: assessment.floor_area || '',
            building_complexity: assessment.building_complexity || '',
            assessment_purpose: assessment.assessment_purpose || '',
            preferred_date: assessment.preferred_date || '',
            preferred_time: assessment.preferred_time || '',
            status: assessment.status,
            notes: assessment.notes || '',
        });
    }, [assessment]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload: any = {
                contact_name: formData.contact_name || null,
                contact_email: formData.contact_email || null,
                contact_phone: formData.contact_phone || null,
                property_address: formData.property_address || null,
                town: formData.town || null,
                county: formData.county || null,
                eircode: formData.eircode || null,
                property_type: formData.property_type || null,
                property_size: formData.property_size || null,
                bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
                ber_purpose: formData.ber_purpose || null,
                heat_pump: formData.heat_pump || null,
                building_type: formData.building_type || null,
                floor_area: formData.floor_area || null,
                building_complexity: formData.building_complexity || null,
                assessment_purpose: formData.assessment_purpose || null,
                preferred_date: formData.preferred_date || null,
                preferred_time: formData.preferred_time || null,
                status: formData.status,
                notes: formData.notes || null,
            };

            const { error } = await supabase
                .from('assessments')
                .update(payload)
                .eq('id', assessment.id);

            if (error) throw error;

            toast.success('Job updated successfully!');
            onSaved();
            onClose();
        } catch (error: any) {
            console.error('Error updating job:', error);
            toast.error(error.message || 'Failed to update job');
        } finally {
            setIsSaving(false);
        }
    };

    const isDomestic = assessment.job_type === 'domestic' || !assessment.building_type;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Edit Job Details</h2>
                        <p className="text-blue-100 text-sm mt-1">Assessment ID: {assessment.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Job Status</label>
                            <select value={formData.status} onChange={e => updateField('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                {JOB_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>

                        {/* Contact Details */}
                        <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                            <h3 className="font-bold text-gray-800">Contact Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                    <input value={formData.contact_name} onChange={e => updateField('contact_name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                    <input value={formData.contact_email} onChange={e => updateField('contact_email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                    <input value={formData.contact_phone} onChange={e => updateField('contact_phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-green-50 rounded-xl p-4 space-y-3">
                            <h3 className="font-bold text-gray-800">Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Property Address</label>
                                    <input value={formData.property_address} onChange={e => updateField('property_address', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Town</label>
                                    <input value={formData.town} onChange={e => updateField('town', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">County</label>
                                    <select value={formData.county} onChange={e => updateField('county', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                                        <option value="">Select county</option>
                                        {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Eircode / Postcode</label>
                                    <input value={formData.eircode} onChange={e => updateField('eircode', e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Property Details */}
                        {isDomestic ? (
                            <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                                <h3 className="font-bold text-gray-800">Property Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
                                        <input value={formData.property_type} onChange={e => updateField('property_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                                        <input value={formData.property_size} onChange={e => updateField('property_size', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Bedrooms</label>
                                        <input type="number" value={formData.bedrooms} onChange={e => updateField('bedrooms', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">BER Purpose</label>
                                        <input value={formData.ber_purpose} onChange={e => updateField('ber_purpose', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Heat Pump</label>
                                        <input value={formData.heat_pump} onChange={e => updateField('heat_pump', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                                <h3 className="font-bold text-gray-800">Building Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Building Type</label>
                                        <input value={formData.building_type} onChange={e => updateField('building_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Floor Area</label>
                                        <input value={formData.floor_area} onChange={e => updateField('floor_area', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Complexity</label>
                                        <input value={formData.building_complexity} onChange={e => updateField('building_complexity', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Purpose</label>
                                        <input value={formData.assessment_purpose} onChange={e => updateField('assessment_purpose', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Schedule */}
                        <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                            <h3 className="font-bold text-gray-800">Schedule</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Date</label>
                                    <input type="date" value={formData.preferred_date} onChange={e => updateField('preferred_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Time</label>
                                    <input value={formData.preferred_time} onChange={e => updateField('preferred_time', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                            <textarea value={formData.notes} onChange={e => updateField('notes', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Additional notes..." />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 p-4 flex justify-end gap-3 shrink-0 bg-gray-50">
                    <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2">
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
