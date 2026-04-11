
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, User, Clock, ChevronLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ArticleSocialShare from '../components/ArticleSocialShare';
import ArticleCTABanner from '../components/ArticleCTABanner';
import ArticleNewsletter from '../components/ArticleNewsletter';

interface NewsArticle {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    image_url: string;
    category: string;
    published_at: string;
    read_time: string;
    content: string;
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
            <SEOHead
                title={`${article.title} | The Berman News`}
                description={article.excerpt || article.title}
                canonical={`/news/${id}`}
                ogType="article"
                ogImage={article.image_url || undefined}
            />

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

                    <div
                        className="text-gray-800 leading-relaxed space-y-6 news-content-body"
                        dangerouslySetInnerHTML={{ __html: article.content || article.excerpt }}
                    />

                    <style>{`
                        .news-content-body h1, 
                        .news-content-body h2, 
                        .news-content-body h3 {
                            font-weight: 800;
                            margin-top: 2rem;
                            margin-bottom: 1rem;
                            color: #111827;
                        }
                        .news-content-body p {
                            margin-bottom: 1.5rem;
                        }
                        .news-content-body ul, 
                        .news-content-body ol {
                            margin-bottom: 1.5rem;
                            padding-left: 1.5rem;
                        }
                        .news-content-body ul {
                            list-style-type: disc;
                        }
                        .news-content-body ol {
                            list-style-type: decimal;
                        }
                        .news-content-body blockquote {
                            border-left: 4px solid #007F00;
                            padding-left: 1.5rem;
                            font-style: italic;
                            color: #4b5563;
                            margin: 2rem 0;
                        }
                    `}</style>

                    <ArticleSocialShare title={article.title} label="Share this story" />
                </div>
            </article>

            <ArticleCTABanner />
            <ArticleNewsletter />
        </div>
    );
};

export default NewsDetail;
