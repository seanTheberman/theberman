
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';

interface FaqItem {
    id: string;
    slug: string;
    title: string;
    content: string;
    category: string;
    sort_order: number;
}

const FAQ = () => {
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFaq = async () => {
            try {
                const { data, error } = await supabase
                    .from('faq_items')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order');
                if (error) throw error;
                setFaqItems(data || []);
                if (data && data.length > 0) {
                    const hash = location.hash.replace('#', '');
                    const found = data.find(item => item.slug === hash);
                    setActiveId(found ? found.slug : data[0].slug);
                }
            } catch (error) {
                console.error('Error fetching FAQ:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaq();
    }, []);

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash && faqItems.find(item => item.slug === hash)) {
            setActiveId(hash);
        }
    }, [location, faqItems]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32 bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#007F00]/20 border-t-[#007F00] rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading FAQ...</p>
                </div>
            </div>
        );
    }

    if (faqItems.length === 0) {
        return (
            <div className="min-h-screen pt-40 bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">FAQ Coming Soon</h1>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    We're currently preparing our frequently asked questions. Check back shortly.
                </p>
            </div>
        );
    }

    const activeItem = faqItems.find(item => item.slug === activeId) || faqItems[0];

    return (
        <div className="bg-white min-h-screen pt-32 pb-24 font-sans">
            <SEOHead
                title="Frequently Asked Questions"
                description="Find answers to common questions about BER assessments, energy ratings, costs, and home energy upgrades in Ireland."
                canonical="/faq"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: faqItems.map(item => ({
                        '@type': 'Question',
                        name: item.title.charAt(0).toUpperCase() + item.title.slice(1),
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: item.title.charAt(0).toUpperCase() + item.title.slice(1)
                        }
                    }))
                }}
            />
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-16 items-start">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8 order-2 lg:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0 overflow-hidden">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-black text-[#007F00] mb-8 leading-tight uppercase tracking-tight">
                                {activeItem.title.charAt(0).toUpperCase() + activeItem.title.slice(1)}
                            </h2>
                            <div
                                className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-medium space-y-6 faq-content-body"
                                dangerouslySetInnerHTML={{ __html: activeItem.content }}
                            />
                            <style>{`
                                .faq-content-body p { margin-bottom: 1rem; }
                                .faq-content-body ul, .faq-content-body ol { margin-bottom: 1rem; padding-left: 1.5rem; }
                                .faq-content-body ul { list-style-type: disc; }
                                .faq-content-body ol { list-style-type: decimal; }
                                .faq-content-body a { color: #007F00; text-decoration: underline; }
                            `}</style>

                            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1 font-bold uppercase tracking-widest">Need immediate help?</p>
                                    <p className="text-xl font-black text-gray-900 tracking-tight">Email hello@theberman.eu</p>
                                </div>
                                <button onClick={() => navigate('/get-quote')} className="bg-[#007F00] text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-[#006400] transition-all shadow-lg hover:-translate-y-1">
                                    Get a Quote Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-4 order-1 lg:order-2 sticky top-32">
                        <div className="border-l border-gray-100 pl-8">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">BER FAQ</h3>
                            <nav className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                                {faqItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveId(item.slug);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-full text-left text-[13px] font-bold transition-all leading-normal py-1 cursor-pointer hover:text-[#007F00] ${activeId === item.slug
                                            ? 'text-[#007F00]'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-12 p-8 bg-green-50 rounded-[2rem] border border-green-100">
                                <p className="text-lg font-black text-[#007F00] mb-2 uppercase tracking-tight">Ireland's Leading BER Consultants</p>
                                <p className="text-sm text-green-700/80 mb-6 font-medium leading-relaxed">Trusted by 10,000+ homeowners across the country.</p>
                                <p className="text-sm text-green-700/80 mb-6 font-medium leading-relaxed">Email: hello@theberman.eu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
