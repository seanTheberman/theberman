
import { ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const Pricing = () => {
    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title="Pricing - Transparent BER Rating Costs"
                description="Clear, upfront pricing for Building Energy Ratings. Plans for apartments, houses, and commercial units."
                canonical="/pricing"
            />

            {/* 1. COMPACT HERO SECTION */}
            <section className="pt-32 pb-12 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        Pricing
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Transparent <br className="hidden md:block" />
                        <span className="text-[#007F00]">Rates.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Choose the plan that fits your property type. No hidden fees, all assessments handled by registered experts.
                    </p>
                </div>
            </section>

            {/* 2. PRICING GRID */}
            <section className="pb-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-3 gap-8">
                        <PricingCard
                            title="Apartment / Flat"
                            price="€150-€250"
                            description="Ideal for 1-2 bed self-contained units or duplexes."
                            features={[
                                "Full SEAI Registered assessment",
                                "Advisory Report included",
                                "Cert published within 48h",
                                "VAT Included"
                            ]}
                        />
                        <PricingCard
                            title="Standard House"
                            price="€200-€400"
                            isPopular={true}
                            description="For 3-4 bed semi-detached or terraced homes."
                            features={[
                                "Full SEAI Registered assessment",
                                "Advisory Report included",
                                "Cert published within 48h",
                                "Grant eligibility check",
                                "VAT Included"
                            ]}
                        />
                        <PricingCard
                            title="Commercial"
                            price="Custom"
                            description="For offices, retail units, and industrial buildings."
                            features={[
                                "Non-Domestic Assessment (NDBER)",
                                "Detailed technical survey",
                                "Compliance Certification",
                                "Portfolio management",
                                "VAT Included"
                            ]}
                            ctaText="Request Quote"
                            ctaLink="/contact"
                        />
                    </div>
                </div>
            </section>

            {/* 3. COMPARISON TABLE */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Compare Features</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Detail-oriented services</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-left min-w-[500px] md:min-w-0">
                            <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-widest">Feature</th>
                                    <th className="p-4 md:p-6 text-center text-[10px] md:text-xs font-black uppercase tracking-widest">Standard</th>
                                    <th className="p-4 md:p-6 text-center text-[10px] md:text-xs font-black uppercase tracking-widest text-[#007F00]">Premium</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-bold text-xs md:text-sm">
                                <TableRow label="Official SEAI Cert" standard={true} premium={true} />
                                <TableRow label="Advisory Report" standard={true} premium={true} />
                                <TableRow label="Grant Advice" standard={true} premium={true} />
                                <TableRow label="Heat Loss Survey" standard={false} premium={true} />
                                <TableRow label="Retrofit ROI Calc" standard={false} premium={true} />
                                <TableRow label="Solar PV Simulation" standard={false} premium={true} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 4. FINISH CTA SECTION */}
            <section className="py-2">
                <div className="container max-w-full">
                    <div className="bg-gray-50 p-12 md:p-20 text-center relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">Need a custom <br />quote?</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                                For large portfolios or specialized industrial units, our team can provide a tailored proposal.
                            </p>
                            <Link to="/contact">
                                <button className="bg-[#007F00] text-white font-black px-12 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0 cursor-pointer">
                                    Contact Sales <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- SUBCOMPONENTS ---

const PricingCard = ({
    title,
    price,
    description,
    features,
    isPopular = false,
    ctaText = "Book Now",
    ctaLink = "/contact"
}: {
    title: string,
    price: string,
    description: string,
    features: string[],
    isPopular?: boolean,
    ctaText?: string,
    ctaLink?: string
}) => (
    <div className={`p-10 bg-white rounded-[2.5rem] border transition-all hover:shadow-lg flex flex-col cursor-pointer ${isPopular ? 'border-[#007F00] ring-1 ring-[#007F00]/10' : 'border-gray-100'}`}>
        {isPopular && (
            <div className="mb-6 self-start px-3 py-1 bg-green-50 text-[#007F00] rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                Most Popular
            </div>
        )}
        <h3 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">{title}</h3>
        <div className="flex items-baseline mb-6">
            <span className="text-4xl font-black text-gray-900">{price}</span>
            {price !== "Custom" && <span className="text-gray-400 ml-1 text-sm font-bold">/unit</span>}
        </div>
        <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8 flex-grow">
            {description}
        </p>

        <ul className="space-y-4 mb-10">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm font-bold text-gray-700">
                    <CheckCircle2 size={18} className="text-[#007F00] mr-3 flex-shrink-0 mt-0.5" />
                    {feature}
                </li>
            ))}
        </ul>

        <Link to={ctaLink}>
            <button className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${isPopular ? 'bg-[#007F00] text-white hover:bg-[#006400] shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100'}`}>
                {ctaText}
            </button>
        </Link>
    </div>
);

const TableRow = ({ label, standard, premium }: { label: string, standard: boolean, premium: boolean }) => (
    <tr className="hover:bg-gray-50/50 transition-colors">
        <td className="p-6 font-bold text-gray-700">{label}</td>
        <td className="p-6 text-center">
            {standard ? <CheckCircle2 className="mx-auto text-green-500" size={20} /> : <X className="mx-auto text-gray-300" size={20} />}
        </td>
        <td className="p-6 text-center">
            {premium ? <CheckCircle2 className="mx-auto text-[#007F00]" size={20} /> : <X className="mx-auto text-gray-300" size={20} />}
        </td>
    </tr>
);

export default Pricing;
