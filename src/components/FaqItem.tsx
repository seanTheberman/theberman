
import React from 'react';

interface FaqItemProps {
    question: string;
    answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#007F00] transition duration-300 cursor-pointer">
            <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">{question}</h3>
            <p className="text-gray-600">{answer}</p>
        </div>
    );
};

export default FaqItem;
