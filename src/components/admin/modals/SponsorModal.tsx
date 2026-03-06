import { X, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Sponsor } from '../../../types/admin';

interface Props {
    sponsors: Sponsor[];
    editingSponsor: Sponsor | null;
    setEditingSponsor: (s: Sponsor | null) => void;
    isUpdating: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    onDelete: (id: string) => void;
}

export const SponsorModal = ({ sponsors, editingSponsor, setEditingSponsor, isUpdating, onClose, onSave, onDelete }: Props) => (
    <div
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => { onClose(); setEditingSponsor(null); }}
    >
        <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-gray-900">Manage Sponsors</h3>
                <button onClick={() => { onClose(); setEditingSponsor(null); }} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="p-8 overflow-y-auto">
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Current Sponsors ({sponsors.length}/3)</h4>
                    <div className="space-y-3">
                        {sponsors.length === 0 && <p className="text-sm text-gray-500 italic">No sponsors added yet.</p>}
                        {sponsors.map(sponsor => (
                            <div key={sponsor.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                {sponsor.image_url && <img src={sponsor.image_url} alt={sponsor.name} className="w-12 h-12 object-cover rounded-md" />}
                                <div className="flex-grow">
                                    <p className="font-bold text-sm">{sponsor.headline}</p>
                                    <p className="text-xs text-gray-500">{sponsor.sub_text}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setEditingSponsor(sponsor)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => onDelete(sponsor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {(sponsors.length < 3 || editingSponsor) && (
                    <form onSubmit={onSave} className="space-y-4 border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-bold text-gray-900">{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Business Name</label>
                                <input name="name" defaultValue={editingSponsor?.name} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Internal name" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Headline</label>
                                <input name="headline" defaultValue={editingSponsor?.headline} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Need Solar?" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Sub-text</label>
                                <input name="sub_text" defaultValue={editingSponsor?.sub_text} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Short description" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Destination URL</label>
                                <input name="destination_url" defaultValue={editingSponsor?.destination_url} required type="url" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Image URL</label>
                            <input name="image_url" defaultValue={editingSponsor?.image_url} required type="url" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                        </div>
                        <div className="pt-2 flex justify-end gap-3">
                            {editingSponsor && (
                                <button type="button" onClick={() => setEditingSponsor(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel Edit</button>
                            )}
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="px-6 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                                {editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
                            </button>
                        </div>
                    </form>
                )}

                {sponsors.length >= 3 && !editingSponsor && (
                    <div className="text-center p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg mt-4">
                        Maximum of 3 sponsors allowed. Delete one to add a new one.
                    </div>
                )}
            </div>
        </div>
    </div>
);
