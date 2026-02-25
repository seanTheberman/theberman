
import { ArrowRight, Zap, Thermometer, Sun, Wind, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const CATEGORIES = [
    {
        title: 'Insulation',
        description: 'Keep your home warm and reduce heat loss with attic, wall, and floor insulation.',
        icon: <Thermometer size={24} />,
        items: ['Premium Attic Insulation', 'External Wall Systems', 'Internal Dry Lining', 'Cavity Wall Solutions']
    },
    {
        title: 'Heat Pumps',
        subtitle: 'Sustainable Heating',
        description: 'Transition away from fossil fuels with high-efficiency air-to-water systems.',
        icon: <Zap size={24} />,
        items: ['Air to Water Systems', 'Ground Source Pumps', 'Heat Pump Maintenance', 'Underfloor Heating']
    },
    {
        title: 'Solar Energy',
        subtitle: 'Renewable Power',
        description: 'Harness the sun to power your home with complete PV and battery solutions.',
        icon: <Sun size={24} />,
        items: ['Solar PV Installations', 'Battery Storage', 'Solar Thermal', 'Smart EV Charging']
    },
    {
        title: 'Ventilation',
        subtitle: 'Air Quality',
        description: 'Ensure a healthy living environment with modern fresh air ventilation systems.',
        icon: <Wind size={24} />,
        items: ['Mechanical Ventilation', 'Extract Systems', 'Air Filtration', 'Humidity Control']
    },
    {
        title: 'Windows & Doors',
        subtitle: 'The Draught Check',
        description: 'Eliminate cold spots with A-rated triple and double glazing solutions.',
        icon: <Droplets size={24} />,
        items: ['Triple Glazing', 'Double Glazing', 'Composite Doors', 'A-Rated Frames']
    }
];

const Catalogue = () => {
    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title="Energy Upgrade Catalogue"
                description="Explore our curated collection of home energy upgrades. Professional solutions for thermal comfort and efficiency."
                canonical="/catalogue"
            />

            {/* 1. SIMPLE CENTERED HERO */}
            <section className="pt-24 pb-16 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        The Catalogue
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Home Energy <br />
                        <span className="text-[#007F00]">Upgrades.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Explore the best solutions for a warmer home. We help you navigate grants, installers, and the latest technology.
                    </p>
                </div>
            </section>

            {/* 2. SIMPLE CATEGORY GRID */}
            <section className="pb-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CATEGORIES.map((category, idx) => (
                            <div key={idx} className="p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-green-100 transition-all hover:shadow-lg group flex flex-col cursor-pointer">
                                <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover:bg-[#007F00] group-hover:text-white transition-all transform group-hover:scale-110 mb-8 shadow-sm">
                                    {category.icon}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{category.title}</h3>
                                <p className="text-gray-500 font-bold text-sm leading-relaxed mb-6 flex-grow">
                                    {category.description}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {category.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 bg-[#007F00] rounded-full"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/contact">
                                    <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-50 text-gray-900 group-hover:bg-[#007F00] group-hover:text-white transition-all font-black text-xs uppercase tracking-widest border border-gray-100 group-hover:border-[#007F00] cursor-pointer">
                                        Enquire Now <ArrowRight size={16} />
                                    </button>
                                </Link>
                            </div>
                        ))}

                        {/* Special Custom Consultation Card */}
                        <div className="p-10 bg-[#007F00] rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden group cursor-pointer">
                            <div>
                                <h3 className="text-2xl font-black mb-6 uppercase tracking-tight leading-tight">Need a Custom <br />Consultation?</h3>
                                <p className="text-green-50 font-medium text-sm leading-relaxed mb-8">
                                    Our experts can help you design a complete energy upgrade plan tailored to your budget and property.
                                </p>
                            </div>
                            <div className="space-y-4">

                                <Link to="/contact">
                                    <button className="w-full bg-white text-[#007F00] py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-green-50 shadow-lg cursor-pointer">
                                        Book Assessment
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FINISH CTA SECTION (MATCHING ABOUT/SERVICES) */}
            <section className="py-2">
                <div className="container max-w-full">
                    <div className="bg-gray-50 p-12 md:p-20 text-center relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">Ready to start <br />your upgrade?</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                                Join thousands of homeowners who have significantly reduced their energy bills with our help.
                            </p>
                            <Link to="/contact">
                                <button className="bg-[#007F00] text-white font-black px-12 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0 text-xs uppercase tracking-widest cursor-pointer">
                                    Enquire Today
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Catalogue;
