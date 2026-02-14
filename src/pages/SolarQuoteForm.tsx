import SolarQuoteFormModule from '../components/SolarQuoteFormModule';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SolarQuoteForm = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
                <div className="mb-12">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all group"
                    >
                        <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={16} />
                        Back to Home
                    </Link>
                </div>

                <div className="text-center mb-16">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-[10px] font-black tracking-widest uppercase border border-green-100">
                        Solar Power Assessment
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight uppercase tracking-tight">
                        Get Your Customized <br />
                        <span className="text-[#007F00]">Solar Panel Quote.</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Complete the assessment below to receive competitive solar installation quotes from certified specialists in your area.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <SolarQuoteFormModule />
                </div>
            </div>
        </div>
    );
};

export default SolarQuoteForm;
