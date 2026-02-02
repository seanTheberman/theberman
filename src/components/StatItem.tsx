
import React from 'react';

interface StatItemProps {
    number: string;
    label: string;
    icon: React.ReactNode;
    textColor?: string;
    labelColor?: string;
}

const StatItem: React.FC<StatItemProps> = ({ number, label, icon, textColor = "text-white", labelColor = "text-green-100" }) => {
    return (
        <div className="flex flex-col items-center group">
            <div className="w-14 h-14 bg-[#9ACD32] rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition duration-300">
                {icon}
            </div>
            <div className={`text-4xl font-bold font-serif mb-1 ${textColor}`}>{number}</div>
            <div className={`text-sm font-bold uppercase tracking-wider opacity-80 ${labelColor}`}>{label}</div>
        </div>
    );
};

export default StatItem;
