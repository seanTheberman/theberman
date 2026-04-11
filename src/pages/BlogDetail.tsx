import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, User, Clock, ChevronLeft, ChevronRight, List } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ArticleSocialShare from '../components/ArticleSocialShare';
import ArticleCTABanner from '../components/ArticleCTABanner';
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
    read_time: string;
    content: string;
    slug?: string;
}

interface TocItem {
    id: string;
    text: string;
    level: number;
}

const BlogDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<BlogArticle | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
    const [prevNext, setPrevNext] = useState<{ prev: BlogArticle | null; next: BlogArticle | null }>({ prev: null, next: null });
    const [loading, setLoading] = useState(true);
    const [readProgress, setReadProgress] = useState(0);
    const [tocOpen, setTocOpen] = useState(false);

    // Reading progress bar
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setReadProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // Try slug first, then id
                let { data, error } = await supabase
                    .from('blog_articles')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error || !data) {
                    const result = await supabase
                        .from('blog_articles')
                        .select('*')
                        .eq('id', slug)
                        .single();
                    data = result.data;
                    error = result.error;
                }

                if (error) throw error;
                setArticle(data);

                // Fetch related articles (same category, excluding current)
                if (data) {
                    const { data: related } = await supabase
                        .from('blog_articles')
                        .select('id, title, excerpt, image_url, category, author, read_time, slug, published_at')
                        .eq('is_live', true)
                        .eq('category', data.category)
                        .neq('id', data.id)
                        .order('published_at', { ascending: false })
                        .limit(3);
                    setRelatedArticles((related as BlogArticle[]) || []);

                    // Fetch previous and next articles (by published_at)
                    const { data: prevData } = await supabase
                        .from('blog_articles')
                        .select('id, title, slug, image_url')
                        .eq('is_live', true)
                        .lt('published_at', data.published_at)
                        .order('published_at', { ascending: false })
                        .limit(1);

                    const { data: nextData } = await supabase
                        .from('blog_articles')
                        .select('id, title, slug, image_url')
                        .eq('is_live', true)
                        .gt('published_at', data.published_at)
                        .order('published_at', { ascending: true })
                        .limit(1);

                    setPrevNext({
                        prev: (prevData?.[0] as BlogArticle) || null,
                        next: (nextData?.[0] as BlogArticle) || null,
                    });
                }
            } catch (error) {
                console.error('Error fetching blog article:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    // Auto-generate table of contents from content headings
    const tableOfContents = useMemo<TocItem[]>(() => {
        if (!article?.content) return [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(article.content, 'text/html');
        const headings = doc.querySelectorAll('h2, h3');
        return Array.from(headings).map((h, i) => ({
            id: `heading-${i}`,
            text: h.textContent || '',
            level: h.tagName === 'H2' ? 2 : 3,
        }));
    }, [article?.content]);

    // Inject IDs into content headings for scroll-to
    const contentWithIds = useMemo(() => {
        if (!article?.content) return '';
        let idx = 0;
        return article.content.replace(/<(h[23])>/gi, (match, tag) => {
            return `<${tag} id="heading-${idx++}">`;
        });
    }, [article?.content]);

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
                    The blog post you are looking for might have been moved or deleted.
                </p>
                <Link to="/blog" className="mt-8 bg-gray-900 text-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-32 pb-0">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-gray-100">
                <div
                    className="h-full bg-[#007F00] transition-all duration-150 ease-out"
                    style={{ width: `${readProgress}%` }}
                />
            </div>

            <SEOHead
                title={`${article.title} | The Berman Blog`}
                description={article.excerpt || article.title}
                canonical={`/blog/${article.slug || article.id}`}
                ogType="article"
                ogImage={article.image_url || undefined}
            />

            <article className="container mx-auto px-6 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Blog</span>
                </Link>

                <header className="mb-12">
                    <div className="flex items-center gap-3 text-[#007F00] font-bold text-xs uppercase tracking-widest mb-6">
                        <Link to="/blog" onClick={() => {}} className="bg-[#007F00]/10 px-3 py-1 rounded-sm hover:bg-[#007F00]/20 transition-colors">
                            {article.category}
                        </Link>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 leading-[1.1] tracking-tight italic">
                        {article.title}
                    </h1>

                    {article.subtitle && (
                        <p className="text-xl text-gray-500 mb-8">{article.subtitle}</p>
                    )}

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

                <div className="aspect-[21/9] mb-12 rounded-sm overflow-hidden bg-gray-100 border border-gray-100">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                </div>

                {/* Table of Contents */}
                {tableOfContents.length > 1 && (
                    <div className="mb-12 border border-gray-100 rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setTocOpen(!tocOpen)}
                            className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <List size={18} className="text-[#007F00]" />
                                <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Table of Contents</span>
                            </div>
                            <ChevronRight size={16} className={`text-gray-400 transition-transform ${tocOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {tocOpen && (
                            <nav className="px-6 py-4 space-y-2">
                                {tableOfContents.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`block text-sm font-medium hover:text-[#007F00] transition-colors ${item.level === 3 ? 'pl-6 text-gray-400' : 'text-gray-700'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }}
                                    >
                                        {item.text}
                                    </a>
                                ))}
                            </nav>
                        )}
                    </div>
                )}

                <div className="prose prose-lg prose-green max-w-none">
                    <div className="text-xl text-gray-600 leading-relaxed font-medium mb-10 pb-8 border-b border-gray-100">
                        {article.excerpt}
                    </div>

                    <div
                        className="text-gray-800 leading-relaxed space-y-6 blog-content-body"
                        dangerouslySetInnerHTML={{ __html: contentWithIds || article.excerpt }}
                    />

                    <style>{`
                        .blog-content-body h1, .blog-content-body h2, .blog-content-body h3 { font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; color: #111827; scroll-margin-top: 100px; }
                        .blog-content-body p { margin-bottom: 1.5rem; }
                        .blog-content-body ul, .blog-content-body ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                        .blog-content-body ul { list-style-type: disc; }
                        .blog-content-body ol { list-style-type: decimal; }
                        .blog-content-body blockquote { border-left: 4px solid #007F00; padding-left: 1.5rem; font-style: italic; color: #4b5563; margin: 2rem 0; }
                    `}</style>

                    <ArticleSocialShare title={article.title} label="Share this blog post" />
                </div>
            </article>

            {/* Previous / Next Article Navigation */}
            {(prevNext.prev || prevNext.next) && (
                <section className="mt-16 border-t border-gray-100">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            {prevNext.prev ? (
                                <Link
                                    to={`/blog/${prevNext.prev.slug || prevNext.prev.id}`}
                                    className="group py-8 pr-8 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                                >
                                    <ChevronLeft size={20} className="text-gray-300 group-hover:text-[#007F00] transition-colors shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Previous</span>
                                        <span className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-[#007F00] transition-colors">{prevNext.prev.title}</span>
                                    </div>
                                </Link>
                            ) : <div className="py-8" />}
                            {prevNext.next ? (
                                <Link
                                    to={`/blog/${prevNext.next.slug || prevNext.next.id}`}
                                    className="group py-8 pl-8 flex items-center gap-4 justify-end text-right hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Next</span>
                                        <span className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-[#007F00] transition-colors">{prevNext.next.title}</span>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-[#007F00] transition-colors shrink-0" />
                                </Link>
                            ) : <div className="py-8" />}
                        </div>
                    </div>
                </section>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <section className="py-16 bg-gray-50 border-t border-gray-100">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-10 uppercase tracking-tight italic">More in {article.category}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedArticles.map((related) => (
                                <Link key={related.id} to={`/blog/${related.slug || related.id}`} className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                                        <img
                                            src={related.image_url}
                                            alt={related.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <span className="text-[10px] font-bold text-[#007F00] uppercase tracking-widest mb-2">{related.category}</span>
                                        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#007F00] transition-colors line-clamp-2">{related.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{related.excerpt}</p>
                                        <div className="mt-auto flex items-center gap-3 text-xs text-gray-400">
                                            <span>{related.author}</span>
                                            <span>&bull;</span>
                                            <span>{related.read_time}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <ArticleCTABanner />
            <ArticleNewsletter />
        </div>
    );
};

export default BlogDetail;
