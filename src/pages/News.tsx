import { } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

interface NewsArticle {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    image_url: string;
    category: string;
    published_at: string;
    is_live: boolean;
    show_badge: boolean;
    read_time: string;
}

const NewsPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Company News', 'Solar Energy', 'Industry Updates', 'Sustainability', 'Community'];

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('news_articles')
                .select('*')
                .eq('is_live', true)
                .order('published_at', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setArticles(data || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
            // Don't show toast error for public news fetch unless it's critical
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32 bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#007F00]/20 border-t-[#007F00] rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading latest news...</p>
                </div>
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="min-h-screen pt-32 bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight italic">Coming Soon</h1>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    We're currently preparing the latest updates on energy grants and sustainability. Check back shortly for fresh content.
                </p>
                <Link to="/" className="mt-8 bg-gray-900 text-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">
                    Return Home
                </Link>
            </div>
        );
    }

    const filteredArticles = selectedCategory === 'All'
        ? articles
        : articles.filter(a => a.category === selectedCategory);

    const featuredArticle = filteredArticles[0];
    const gridArticles = filteredArticles.slice(1);

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-32">
            <SEOHead
                title="News"
                description="Stay updated with the latest energy efficiency news, BER tips, and sustainability insights from The Berman."
                canonical="/news"
            />



            {/* News Header & Categories */}
            <section className="bg-white pt-8 pb-4">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter italic mb-2">
                                News & Updates
                            </h1>
                            <p className="text-gray-500 font-medium tracking-wide text-sm">
                                Latest from The Berman on Energy, Grants and community
                            </p>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat
                                        ? 'bg-[#007F00] text-white shadow-lg shadow-[#007F00]/20'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* RTÉ Style Hero - 50/50 Split */}
            {featuredArticle ? (
                <section className="bg-[#f2f2f2] border-b border-gray-200">
                    <div className="container mx-auto px-0 lg:px-6">
                        <Link to={`/news/${featuredArticle.id}`} className="flex flex-col lg:flex-row group overflow-hidden">
                            {/* Hero Text */}
                            <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight group-hover:underline decoration-2 underline-offset-4">
                                    {featuredArticle.title}
                                </h1>
                                <span className="text-gray-500 text-sm mb-6 block font-medium">
                                    {featuredArticle.category}
                                </span>
                                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                                    {featuredArticle.excerpt}
                                </p>
                            </div>
                            {/* Hero Image */}
                            <div className="w-full lg:w-1/2 relative min-h-[300px] md:min-h-[400px] order-1 lg:order-2">
                                <img
                                    src={featuredArticle.image_url}
                                    alt={featuredArticle.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                {featuredArticle.show_badge && (
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#007F00] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                        <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                                        New
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                </section>
            ) : (
                <section className="py-20 text-center">
                    <div className="container mx-auto px-6">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No articles found in this category.</p>
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className="mt-4 text-[#007F00] font-bold text-xs uppercase tracking-widest hover:underline cursor-pointer"
                        >
                            View All News
                        </button>
                    </div>
                </section>
            )}

            {/* RTÉ Style 4-Column Grid */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {gridArticles.map((article) => (
                            <Link key={article.id} to={`/news/${article.id}`} className="group flex flex-col">
                                <div className="relative aspect-[16/10] overflow-hidden mb-4 bg-gray-100">
                                    <img
                                        src={article.image_url}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:underline decoration-1 underline-offset-2">
                                    {article.title}
                                </h3>
                                <div className="mt-auto">
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                        {article.category}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Regional / Flash Offers - Low key RT style */}
            <section className="py-12 border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="bg-[#f9f9f9] border-l-4 border-[#007F00] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h4 className="text-gray-900 text-xl font-bold mb-2">Active Retrofit Offers</h4>
                            <p className="text-gray-600 text-sm">Munster, Leinster, Connacht - View latest grant updates and flash sales.</p>
                        </div>
                        <Link to="/catalogue" className="bg-white border border-gray-200 text-gray-900 px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                            View Offers
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter - Minimalist Brand Version */}
            <section className="py-20 bg-[#1a1a1a] text-white">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tight">Stay Informed</h2>
                    <p className="text-gray-400 mb-12 text-lg">
                        Subscribe to all the new updates including energy grants, flash sales, and technical guides.
                    </p>
                    <form
                        className="flex flex-col sm:flex-row gap-0 border border-white/20"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const emailInput = (e.target as HTMLFormElement).querySelector('input[type="email"]') as HTMLInputElement;
                            const email = emailInput?.value;

                            if (!email) return;

                            setIsSubmitting(true);
                            try {
                                const { error } = await supabase
                                    .from('leads')
                                    .insert([{
                                        name: 'News Subscriber',
                                        email: email,
                                        message: 'Requested push emails regarding special offers and energy upgrades via RT News Mode',
                                        status: 'new',
                                        purpose: 'News Subscription'
                                    }]);

                                if (error) throw error;

                                toast.success('Subscription confirmed.', {
                                    icon: '✅',
                                });
                                (e.target as HTMLFormElement).reset();
                            } catch (err: any) {
                                toast.error('Check your internet or email.');
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="flex-grow bg-transparent px-6 py-4 text-white placeholder:text-gray-500 outline-none font-bold text-xs tracking-widest"
                            required
                            disabled={isSubmitting}
                        />
                        <button
                            disabled={isSubmitting}
                            className="bg-[#007F00] text-white font-black px-12 py-4 hover:bg-[#006400] transition-colors uppercase tracking-widest text-[10px] cursor-pointer disabled:opacity-70 whitespace-nowrap"
                        >
                            {isSubmitting ? 'SENDING...' : 'Subscribe to news'}
                        </button>
                    </form>
                </div>
            </section>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default NewsPage;
