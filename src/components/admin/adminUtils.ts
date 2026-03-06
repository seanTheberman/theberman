export const formatLastLogin = (date?: string): string => {
    if (!date) return 'Never';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'new':
        case 'pending': return 'bg-blue-100 text-blue-800';
        case 'contacted':
        case 'pending_quote': return 'bg-yellow-100 text-yellow-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'scheduled': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
