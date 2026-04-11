import { Link } from 'react-router-dom';

const ArticleCTABanner = () => (
    <section className="mt-20 py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="group">
                    <Link to="/get-quote" className="block">
                        <span className="text-[10px] font-black text-[#007F00] uppercase tracking-[0.2em] block mb-4">BER Quotes</span>
                        <h3 className="text-xl font-bold group-hover:underline decoration-1 underline-offset-4">Secure Your BER Quote Today – It's Fast and Easy</h3>
                        <p className="text-gray-500 text-sm mt-3 leading-relaxed">Getting your BER quote is quick, easy, and tailored to your domestic or commercial property. Our nationwide team is here to help you today.</p>
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
);

export default ArticleCTABanner;
