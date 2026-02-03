import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItemProps {
    question: string;
    answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className={`bg-white border transition-all duration-300 cursor-pointer overflow-hidden rounded-xl md:rounded-2xl ${isOpen ? 'border-[#007F00] shadow-lg ring-1 ring-green-100' : 'border-gray-200 hover:border-[#007F00]'}`}
        >
            <div className="p-4 md:p-5 flex items-center justify-between gap-4">
                <h3 className="font-sans font-black text-sm md:text-base text-gray-900 group-hover:text-[#007F00] transition-colors uppercase tracking-tight">
                    {question}
                </h3>
                <div className={`shrink-0 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 transition-all duration-300 ${isOpen ? 'bg-[#007F00] text-white border-[#007F00] rotate-180' : ''}`}>
                    <ChevronDown size={18} />
                </div>
            </div>

            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 md:px-5 pb-4 md:pb-5">
                        <div className="pt-3 border-t border-gray-50">
                            <p className="text-gray-500 font-medium text-xs md:text-sm leading-relaxed">
                                {answer}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqItem;
