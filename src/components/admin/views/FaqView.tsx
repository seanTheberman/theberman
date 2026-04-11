import React, { useState, useRef } from 'react';
import { RefreshCw, Pencil, Trash2, Plus, Save, X, GripVertical } from 'lucide-react';
import type { FaqItem } from '../../../types/admin';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Props {
    faqItems: FaqItem[];
    loading: boolean;
    fetchFaqItems: () => void;
}

const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const FaqView = React.memo(({ faqItems, loading, fetchFaqItems }: Props) => {
    const [editingItem, setEditingItem] = useState<Partial<FaqItem> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const draggedId = useRef<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!editingItem?.title || !editingItem?.content) {
            toast.error('Title and content are required');
            return;
        }

        setIsSaving(true);
        try {
            const data = {
                title: editingItem.title,
                content: editingItem.content,
                slug: editingItem.slug || generateSlug(editingItem.title),
                category: editingItem.category || 'General',
                sort_order: editingItem.sort_order ?? faqItems.length,
                is_active: editingItem.is_active ?? true,
                updated_at: new Date().toISOString(),
            };

            if (editingItem.id) {
                const { error } = await supabase.from('faq_items').update(data).eq('id', editingItem.id);
                if (error) throw error;
                toast.success('FAQ item updated');
            } else {
                const { error } = await supabase.from('faq_items').insert(data);
                if (error) throw error;
                toast.success('FAQ item created');
            }

            setEditingItem(null);
            fetchFaqItems();
        } catch (error: any) {
            toast.error(`Failed to save: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this FAQ item?')) return;
        try {
            const { error } = await supabase.from('faq_items').delete().eq('id', id);
            if (error) throw error;
            toast.success('FAQ item deleted');
            fetchFaqItems();
        } catch (error: any) {
            toast.error('Failed to delete FAQ item');
        }
    };

    const handleDrop = async (targetId: string) => {
        const fromId = draggedId.current;
        if (!fromId || fromId === targetId) return;

        const fromIdx = faqItems.findIndex(f => f.id === fromId);
        const toIdx = faqItems.findIndex(f => f.id === targetId);
        if (fromIdx < 0 || toIdx < 0) return;

        const reordered = [...faqItems];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);

        try {
            await Promise.all(
                reordered.map((item, i) =>
                    supabase.from('faq_items').update({ sort_order: i }).eq('id', item.id)
                )
            );
            fetchFaqItems();
        } catch {
            toast.error('Failed to reorder');
        }
    };

    const toggleActive = async (item: FaqItem) => {
        try {
            const { error } = await supabase.from('faq_items').update({ is_active: !item.is_active }).eq('id', item.id);
            if (error) throw error;
            fetchFaqItems();
        } catch {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">FAQ Management</h3>
                        <p className="text-sm text-gray-500">Manage questions displayed on the FAQ page.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchFaqItems} className="p-2 text-gray-400 hover:text-[#007EA7] transition-colors">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setEditingItem({ title: '', content: '', category: 'General', is_active: true, sort_order: faqItems.length })}
                            className="bg-[#007F00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#006600] transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} /> Add FAQ Item
                        </button>
                    </div>
                </div>

                {/* Edit/Create Form */}
                {editingItem && (
                    <div className="p-6 bg-blue-50/50 border-b border-blue-100">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
                            {editingItem.id ? 'Edit FAQ Item' : 'New FAQ Item'}
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Title *</label>
                                <input
                                    value={editingItem.title || ''}
                                    onChange={e => setEditingItem(prev => ({ ...prev!, title: e.target.value, slug: prev?.id ? prev.slug : generateSlug(e.target.value) }))}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none"
                                    placeholder="e.g. What is a BER Certificate?"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Slug</label>
                                    <input
                                        value={editingItem.slug || ''}
                                        onChange={e => setEditingItem(prev => ({ ...prev!, slug: e.target.value }))}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#007F00]/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Category</label>
                                    <input
                                        value={editingItem.category || ''}
                                        onChange={e => setEditingItem(prev => ({ ...prev!, category: e.target.value }))}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#007F00]/20 outline-none"
                                        placeholder="General"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Content *</label>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <ReactQuill
                                        theme="snow"
                                        value={editingItem.content || ''}
                                        onChange={(content: string) => setEditingItem(prev => ({ ...prev!, content }))}
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [2, 3, false] }],
                                                ['bold', 'italic', 'underline'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link'],
                                                ['clean']
                                            ],
                                        }}
                                        className="min-h-[200px]"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={handleSave} disabled={isSaving} className="bg-[#007F00] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#006600] transition-colors flex items-center gap-2 disabled:opacity-50">
                                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-900 px-4 py-2.5 text-sm font-bold flex items-center gap-2">
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAQ Items List */}
                <div className="divide-y divide-gray-100">
                    {faqItems.map((item) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={() => { draggedId.current = item.id; }}
                            onDragOver={(e) => { e.preventDefault(); setDragOverId(item.id); }}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={() => { setDragOverId(null); handleDrop(item.id); }}
                            onDragEnd={() => { draggedId.current = null; setDragOverId(null); }}
                            className={`p-4 flex items-center gap-4 transition-colors ${!item.is_active ? 'opacity-50' : ''} ${dragOverId === item.id ? 'bg-green-50 border-t-2 border-[#007F00]' : ''}`}
                        >
                            <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                                <GripVertical size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 text-sm">{item.title}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{item.slug} &bull; {item.category}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => toggleActive(item)}
                                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {item.is_active ? 'Active' : 'Inactive'}
                                </button>
                                <button onClick={() => setEditingItem(item)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-[#007EA7]">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {faqItems.length === 0 && (
                        <div className="px-6 py-12 text-center text-gray-400 italic">
                            No FAQ items found. Click "Add FAQ Item" to create one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
