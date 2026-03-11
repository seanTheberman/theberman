import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Loader2, User, ClipboardList, Inbox, CheckSquare, Square } from 'lucide-react';

interface DeletedRow {
    id: string;
    type: 'lead' | 'assessment' | 'user';
    deleted_at: string;
    label: string;
    email?: string;
    details?: string;
}

interface Props {
    deletedItems: DeletedRow[];
    loading: boolean;
    isDeleting: boolean;
    onRestore: (id: string, type: DeletedRow['type']) => void;
    onPermanentDelete: (id: string, type: DeletedRow['type']) => void;
    onBulkRestore: (items: { id: string, type: DeletedRow['type'] }[]) => void;
    onBulkPermanentDelete: (items: { id: string, type: DeletedRow['type'] }[]) => void;
}

const TYPE_ICONS: Record<DeletedRow['type'], React.ElementType> = {
    lead: Inbox,
    assessment: ClipboardList,
    user: User,
};

const TYPE_LABELS: Record<DeletedRow['type'], string> = {
    lead: 'Lead',
    assessment: 'Assessment',
    user: 'User',
};

const TYPE_COLORS: Record<DeletedRow['type'], string> = {
    lead: 'bg-blue-50 text-blue-600',
    assessment: 'bg-purple-50 text-purple-600',
    user: 'bg-amber-50 text-amber-600',
};

export const RecentlyDeletedView = ({ deletedItems, loading, isDeleting, onRestore, onPermanentDelete, onBulkRestore, onBulkPermanentDelete }: Props) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelectAll = () => {
        if (selectedIds.size === deletedItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(deletedItems.map(item => `${item.type}-${item.id}`)));
        }
    };

    const toggleSelect = (typeId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(typeId)) {
            newSelected.delete(typeId);
        } else {
            newSelected.add(typeId);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkRestore = () => {
        const itemsToRestore = deletedItems
            .filter(item => selectedIds.has(`${item.type}-${item.id}`))
            .map(item => ({ id: item.id, type: item.type }));
        onBulkRestore(itemsToRestore);
        setSelectedIds(new Set());
    };

    const handleBulkDelete = () => {
        const itemsToDelete = deletedItems
            .filter(item => selectedIds.has(`${item.type}-${item.id}`))
            .map(item => ({ id: item.id, type: item.type }));
        onBulkPermanentDelete(itemsToDelete);
        setSelectedIds(new Set());
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-[#007F00] mb-4" size={32} />
                <p className="text-gray-500 font-medium">Loading deleted items...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-amber-800">Soft-Deleted Items</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                        Items here have been removed from normal views but are NOT yet deleted from the database.
                        You can <strong>restore</strong> them or <strong>permanently delete</strong> them.
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Recently Deleted</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{deletedItems.length} item{deletedItems.length !== 1 ? 's' : ''} waiting for permanent deletion</p>
                    </div>
                    
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            <span className="text-xs font-bold text-gray-600 mr-2">{selectedIds.size} selected</span>
                            <button
                                onClick={handleBulkRestore}
                                disabled={isDeleting}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-700 bg-white hover:bg-green-50 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RotateCcw size={12} />
                                Restore
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Trash2 size={12} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {deletedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <Trash2 size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">No deleted items</p>
                        <p className="text-xs text-gray-400 mt-1">Items you delete will appear here before permanent removal.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-5 py-3 w-10">
                                        <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center">
                                            {selectedIds.size === deletedItems.length && deletedItems.length > 0 ? (
                                                <CheckSquare size={16} className="text-[#007F00]" />
                                            ) : (
                                                <Square size={16} />
                                            )}
                                        </button>
                                    </th>
                                    <th className="text-left px-2 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Name / Label</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Deleted At</th>
                                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {deletedItems.map((item) => {
                                    const Icon = TYPE_ICONS[item.type];
                                    const typeId = `${item.type}-${item.id}`;
                                    const isSelected = selectedIds.has(typeId);
                                    return (
                                        <tr key={typeId} className={`transition-colors ${isSelected ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
                                            <td className="px-5 py-3.5">
                                                <button onClick={() => toggleSelect(typeId)} className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center">
                                                    {isSelected ? <CheckSquare size={16} className="text-[#007F00]" /> : <Square size={16} />}
                                                </button>
                                            </td>
                                            <td className="px-2 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[item.type]}`}>
                                                    <Icon size={11} />
                                                    {TYPE_LABELS[item.type]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-gray-800 text-sm">{item.label || '—'}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 text-xs">{item.email || '—'}</td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs max-w-[200px] truncate">{item.details || '—'}</td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                                                {new Date(item.deleted_at).toLocaleString('en-IE', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => onRestore(item.id, item.type)}
                                                        disabled={isDeleting}
                                                        title="Restore"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <RotateCcw size={12} />
                                                        Restore
                                                    </button>
                                                    <button
                                                        onClick={() => onPermanentDelete(item.id, item.type)}
                                                        disabled={isDeleting}
                                                        title="Delete permanently"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Trash2 size={12} />
                                                        Delete Forever
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
