import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, X } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ArticleNewsletter from '../components/ArticleNewsletter';

interface BlogArticle {
    id: string;
    title: string;
    subtitle?: string;
    excerpt: string;
    author: string;
    image_url: string;
    category: string;
    published_at: string;
    is_live: boolean;
    show_badge: boolean;
    read_time: string;
    slug?: string;
}

const BLOG_CATEGORIES = [
    'All Posts',
    'BER Explained',
    'Costs & Grants',
    'Home Upgrades',
    'Selling & Renting',
    'Green Mortgages & Finance',
    'Regulations',
    'Success Stories',
    'How-to & Guides',
    'FAQs',
];

const BlogPage = () => {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Posts');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('blog_articles')
                    .select('*')
                    .eq('is_live', true)
                    .order('published_at', { ascending: false });
                if (error) throw error;
                setArticles(data || []);
            } catch (error) {
                console.error('Error fetching blog articles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32 bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#007F00]/20 border-t-[#007F00] rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading blog...</p>
                </div>
            </div>
        );
    }

    // Filter by category
    const categoryFiltered = selectedCategory === 'All Posts'
        ? articles
        : articles.filter(a => a.category === selectedCategory);

    // Filter by search term
    const filteredArticles = searchTerm.trim()
        ? categoryFiltered.filter(a =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.author.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : categoryFiltered;

    // Count articles per category
    const categoryCounts: Record<string, number> = { 'All Posts': articles.length };
    for (const a of articles) {
        categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    }

    // Featured article (first one if no search active)
    const featuredArticle = !searchTerm.trim() && selectedCategory === 'All Posts' && filteredArticles.length > 0
        ? filteredArticles[0]
        : null;
    const gridArticles = featuredArticle ? filteredArticles.slice(1) : filteredArticles;

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-32">
            <SEOHead
                title="Blog"
                description="Expert guides on BER certificates, energy grants, home upgrades, and more from The Berman."
                canonical="/blog"
            />

            {/* Header */}
            <section className="bg-white pt-8 pb-4">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter italic mb-2">
                                Latest Articles
                            </h1>
                            <p className="text-gray-500 font-medium tracking-wide text-sm">
                                Showing {filteredArticles.length} of {articles.length} articles
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-80">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] outline-none transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Article Hero (only when no search/filter) */}
            {featuredArticle && (
                <section className="bg-[#f2f2f2] border-b border-gray-200">
                    <div className="container mx-auto px-0 lg:px-6">
                        <Link to={`/blog/${featuredArticle.slug || featuredArticle.id}`} className="flex flex-col lg:flex-row group overflow-hidden">
                            <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                                <span className="text-[10px] font-bold text-[#007F00] uppercase tracking-widest mb-4">{featuredArticle.category}</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-[1.1] tracking-tight group-hover:underline decoration-2 underline-offset-4">
                                    {featuredArticle.title}
                                </h2>
                                {featuredArticle.subtitle && (
                                    <p className="text-gray-500 mb-4">{featuredArticle.subtitle}</p>
                                )}
                                <p className="text-gray-700 leading-relaxed mb-6 line-clamp-3">{featuredArticle.excerpt}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="font-bold text-gray-600">{featuredArticle.author}</span>
                                    <span>&bull;</span>
                                    <span>{featuredArticle.read_time}</span>
                                    <span>&bull;</span>
                                    <span>{new Date(featuredArticle.published_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
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
            )}

            {/* Main Content: Sidebar + Articles */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Category Sidebar */}
                        <aside className="lg:w-64 shrink-0">
                            <div className="sticky top-32">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Categories</h3>
                                <ul className="space-y-1">
                                    {BLOG_CATEGORIES.map((cat) => (
                                        <li key={cat}>
                                            <button
                                                onClick={() => { setSelectedCategory(cat); setSearchTerm(''); }}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                                                    ? 'bg-[#007F00] text-white'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span>{cat}</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {categoryCounts[cat] || 0}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* Quick Quote CTA */}
                                <div className="mt-8 p-6 bg-[#007F00]/5 border border-[#007F00]/10 rounded-2xl">
                                    <h4 className="text-sm font-black text-[#007F00] uppercase tracking-widest mb-2">Quick Quote</h4>
                                    <p className="text-xs text-gray-500 mb-4">Get BER quotes while you read.</p>
                                    <Link
                                        to="/get-quote"
                                        className="block w-full bg-[#007F00] text-white text-center px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-800 transition-colors"
                                    >
                                        Get Quotes
                                    </Link>
                                </div>
                            </div>
                        </aside>

                        {/* Articles Grid */}
                        <div className="flex-1">
                            {filteredArticles.length === 0 ? (
                                <div className="py-20 text-center">
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                                        {searchTerm ? `No articles found for "${searchTerm}"` : 'No articles found in this category.'}
                                    </p>
                                    <button
                                        onClick={() => { setSelectedCategory('All Posts'); setSearchTerm(''); }}
                                        className="mt-4 text-[#007F00] font-bold text-xs uppercase tracking-widest hover:underline cursor-pointer"
                                    >
                                        View All Posts
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {gridArticles.map((article) => (
                                        <Link key={article.id} to={`/blog/${article.slug || article.id}`} className="group flex flex-col">
                                            <div className="relative aspect-[16/10] overflow-hidden rounded-lg mb-4 bg-gray-100">
                                                <img
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {article.show_badge && (
                                                    <div className="absolute top-3 left-3 bg-[#007F00] text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded">
                                                        New
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-[#007F00] uppercase tracking-widest mb-2">{article.category}</span>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:underline decoration-1 underline-offset-2 line-clamp-2">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
                                            <div className="mt-auto flex items-center gap-3 text-xs text-gray-400">
                                                <span>{article.author}</span>
                                                <span>&bull;</span>
                                                <span>{article.read_time}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <ArticleNewsletter />
        </div>
    );
};

export default BlogPage;
