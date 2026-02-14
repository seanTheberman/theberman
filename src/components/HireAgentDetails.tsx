import { useState } from 'react';
import { ChevronDown, Star, CheckCircle2, Info } from 'lucide-react';

const HireAgentDetails = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-8 overflow-hidden rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-6 bg-white transition-colors text-left ${isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Star size={24} className="text-[#007F00]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                            Speak to an Energy Advisor
                        </h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">
                            Impartial guidance & Verified technical input
                        </p>
                    </div>
                </div>
                <div className={`p-2 rounded-full bg-gray-100 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-green-100 text-[#007F00]' : 'text-gray-400'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>

            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-6 md:p-8 bg-white border-t border-gray-100 space-y-6">
                    <p className="text-sm md:text-base font-medium text-gray-600 leading-relaxed">
                        Your energy agent will organise and work directly with a BER assessor to ensure all advice and upgrade recommendations are technically accurate and based on your existing BER certificate and advisory report.
                    </p>

                    <div className="space-y-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">The agent will then:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Identify the most cost-effective and efficient upgrade options",
                                "Advise on which measures deliver the best BER improvement",
                                "Source and compare quotes from suitable contractors",
                                "Help negotiate and select the best-value options",
                                "Assist with SEAI grant guidance and paperwork",
                                "Help avoid unnecessary, overpriced, or poorly targeted works"
                            ].map((text, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-[#007F00]">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 leading-tight">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <p className="text-sm font-bold text-gray-900 leading-relaxed">
                            The goal is to provide clear, impartial guidance, verified technical input, and access to competitive pricing, ensuring upgrades are completed in the smartest and most economical way possible.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                        <div className="mt-0.5 text-[#007EA7]">
                            <Info size={16} />
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed">
                            Energy agents do not carry out works and are independent from contractors. BER assessors provide technical input and certification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HireAgentDetails;
