
import { Truck, BarChart3, Cpu, Globe2, AlertTriangle, ArrowRight, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <title>Our Services | The Berman - Expert BER Assessments</title>
            <meta name="description" content="Comprehensive energy rating services including BER certificates, provisional ratings, and energy audits." />

            {/* 1. COMPACT HERO SECTION */}
            <section className="pt-32 pb-16 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        What We Do
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Precision Energy <br className="hidden md:block" />
                        <span className="text-[#007F00]">Solutions.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Comprehensive assessments and expert advice to help you meet regulations and improve efficiency.
                    </p>
                </div>
            </section>

            {/* 2. COMPLIANCE INFO SECTION */}
            <section className="py-12 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0">
                            <AlertTriangle size={32} className="text-[#007F00]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Do I need a BER Certificate?</h3>
                            <p className="text-gray-500 font-bold text-sm leading-relaxed max-w-2xl">
                                Required by law for selling, renting, or SEAI grant applications. We provide the certification you need with fast turnaround and expert accuracy.
                            </p>
                        </div>
                        <div className="w-full md:w-auto mt-4 md:mt-0">
                            <Link to="/contact">
                                <button className="w-full md:w-auto bg-white text-[#007F00] font-black px-8 py-4 rounded-xl border border-green-100 hover:bg-green-50 transition-all text-xs uppercase tracking-widest shadow-sm cursor-pointer active:scale-95">
                                    Book Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE SERVICES GRID */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Our Core Offerings</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Expertise Across All Sectors</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ServiceItem
                            icon={<Zap size={24} />}
                            title="Domestic BER"
                            description="Full SEAI registered assessments for homeowners and landlords. Required for all sales, rentals, and grant applications."
                        />
                        <ServiceItem
                            icon={<Shield size={24} />}
                            title="Commercial BER"
                            description="Non-Domestic energy ratings for businesses and retail units. Ensure compliance and optimize operational costs."
                        />
                        <ServiceItem
                            icon={<BarChart3 size={24} />}
                            title="Energy Audits"
                            description="Detailed analysis of energy usage with actionable insights on where to save and how to modernize your property."
                        />
                        <ServiceItem
                            icon={<Globe2 size={24} />}
                            title="Grant Advisory"
                            description="Navigate the SEAI grant system with expert guidance. We help you qualify for the maximum funding available."
                        />
                        <ServiceItem
                            icon={<Cpu size={24} />}
                            title="Technical Analysis"
                            description="Specialized surveys for heat pump suitability, insulation upgrades, and solar PV potential calculations."
                        />
                        <ServiceItem
                            icon={<Truck size={24} />}
                            title="Support Services"
                            description="Continuous advisory for property portfolios, new build provisional ratings, and final compliance checks."
                        />
                    </div>
                </div>
            </section>

            {/* 4. STRUCTURED PROCESS */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">How It Works</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">A simple 3-step process</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <ProcessStep
                            number="01"
                            title="Schedule"
                            description="Contact us to book your on-site assessment at a time that suits you."
                        />
                        <ProcessStep
                            number="02"
                            title="Survey"
                            description="Our registered assessor visits your property for a comprehensive technical survey."
                        />
                        <ProcessStep
                            number="03"
                            title="Finalize"
                            description="Receive your BER certificate and detailed advisory report within 48 hours."
                        />
                    </div>
                </div>
            </section>

            {/* 5. FINISH CTA SECTION */}
            <section className="py-2">
                <div className="container max-w-full">
                    <div className="bg-gray-50 p-12 md:p-20 text-center relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">Need expert energy <br />advice?</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                                Our team is ready to help you optimize your property and ensure full regulatory compliance.
                            </p>
                            <Link to="/contact">
                                <button className="bg-[#007F00] text-white font-black px-12 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0 cursor-pointer">
                                    Get Started <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ServiceItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:border-green-100 transition-all hover:shadow-lg group cursor-pointer">
        <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#007F00] flex items-center justify-center group-hover:bg-[#007F00] group-hover:text-white transition-all transform group-hover:scale-110 mb-8 shadow-sm">
            {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-bold text-sm">
            {description}
        </p>
    </div>
);

const ProcessStep = ({ number, title, description }: { number: string, title: string, description: string }) => (
    <div className="text-center group cursor-pointer">
        <div className="w-20 h-20 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:border-[#007F00] transition-all group-hover:shadow-lg transform group-hover:-translate-y-1">
            <span className="text-2xl font-black text-[#007F00]">{number}</span>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">{title}</h3>
        <p className="text-gray-500 font-bold text-sm leading-relaxed">
            {description}
        </p>
    </div>
);

export default Services;
