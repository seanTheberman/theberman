
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, User, Clock, ChevronLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewsArticle {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    image_url: string;
    category: string;
    published_at: string;
    read_time: string;
}

const NewsDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('news_articles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setArticle(data);
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32 bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#007F00]/20 border-t-[#007F00] rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading article...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen pt-40 bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Article Not Found</h1>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    The news article you are looking for might have been moved or deleted.
                </p>
                <Link to="/news" className="mt-8 bg-gray-900 text-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">
                    Back to News
                </Link>
            </div>
        );
    }

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-32 pb-20">
            <title>{article.title} | The Berman News</title>

            <article className="container mx-auto px-6 max-w-4xl">
                {/* Back Link */}
                <Link to="/news" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to News</span>
                </Link>

                {/* Article Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-3 text-[#007F00] font-bold text-xs uppercase tracking-widest mb-6">
                        <span className="bg-[#007F00]/10 px-3 py-1 rounded-sm">{article.category}</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight italic">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-y border-gray-100 py-6">
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="font-bold text-gray-900">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{new Date(article.published_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span>{article.read_time}</span>
                        </div>
                    </div>
                </header>

                {/* Main Image */}
                <div className="aspect-[21/9] mb-12 rounded-sm overflow-hidden bg-gray-100 border border-gray-100">
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Article Content */}
                <div className="prose prose-lg prose-green max-w-none">
                    <div className="text-xl text-gray-600 leading-relaxed font-medium mb-10 pb-8 border-b border-gray-100">
                        {article.excerpt}
                    </div>

                    <div className="text-gray-800 leading-relaxed space-y-6">
                        {/* 
                            Note: For a real app, you'd likely have a 'content' field in Supabase 
                            supporting Markdown or HTML. For now, since the current schema only has excerpt,
                            we'll display the excerpt as the main content body or placeholders.
                        */}
                        <p>
                            {article.excerpt}
                        </p>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p>
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                    </div>

                    {/* Social Share */}
                    <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Share this story</span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-blue-600"
                                    title="Share on Facebook"
                                >
                                    <Facebook size={20} />
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-sky-500"
                                    title="Share on Twitter"
                                >
                                    <Twitter size={20} />
                                </a>
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-blue-700"
                                    title="Share on LinkedIn"
                                >
                                    <Linkedin size={20} />
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copied to clipboard');
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            <Share2 size={16} />
                            Copy Link
                        </button>
                    </div>
                </div>
            </article>

            {/* Related News Quick Grid */}
            <section className="mt-20 py-20 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-10 uppercase tracking-tight italic">More from The Berman</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* This would ideally fetch 2 other articles, excluding the current one */}
                        <div className="group">
                            <Link to="/news" className="block">
                                <span className="text-[10px] font-black text-[#007F00] uppercase tracking-[0.2em] block mb-4">Latest Update</span>
                                <h3 className="text-xl font-bold group-hover:underline decoration-1 underline-offset-4">Return to the Newsroom</h3>
                                <p className="text-gray-500 text-sm mt-3 leading-relaxed">Stay updated with the latest energy efficiency grants and sustainability news from across Ireland.</p>
                            </Link>
                        </div>
                        <div className="group">
                            <Link to="/catalogue" className="block">
                                <span className="text-[10px] font-black text-[#007F00] uppercase tracking-[0.2em] block mb-4">Marketplace</span>
                                <h3 className="text-xl font-bold group-hover:underline decoration-1 underline-offset-4">Browse our Specialist Catalogue</h3>
                                <p className="text-gray-500 text-sm mt-3 leading-relaxed">Find registered contractors and energy advisors for your next home upgrade project.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NewsDetail;
