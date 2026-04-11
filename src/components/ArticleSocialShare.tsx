import { Facebook, Linkedin, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const XIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

interface Props {
    title: string;
    label?: string;
}

const PRODUCTION_URL = 'https://www.theberman.eu';

const ArticleSocialShare = ({ title, label = 'Share this blog post' }: Props) => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const url = `${PRODUCTION_URL}${path}`;

    return (
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-center gap-2">
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-blue-600"
                        title="Share on Facebook"
                    >
                        <Facebook size={20} />
                    </a>
                    <a
                        href={`https://www.instagram.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-pink-600"
                        title="Follow on Instagram"
                    >
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                    </a>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-blue-700"
                        title="Share on LinkedIn"
                    >
                        <Linkedin size={20} />
                    </a>
                    <a
                        href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                        title="Share on X"
                    >
                        <XIcon size={20} />
                    </a>
                </div>
            </div>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard');
                }}
                className="flex items-center gap-2 px-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
                <Share2 size={16} />
                Copy Link
            </button>
        </div>
    );
};

export default ArticleSocialShare;
