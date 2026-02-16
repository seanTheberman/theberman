
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface FaqItem {
    id: string;
    title: string;
    content: React.ReactNode;
}

const FAQ_DATA: FaqItem[] = [
    {
        id: 'why-use-us',
        title: 'Why should I use theberman.eu?',
        content: (
            <div className="space-y-4">
                <p>We are Ireland's leading BER cert website. Our easy-to-use online service helps you quickly find a BER assessor and book the lowest priced BER assessment for your property.</p>
                <p>All of our 300+ BER assessors are SEAI registered and fully qualified BER assessors. All BER assessors utilise the latest property inspection tools and techniques to carry out an accurate survey and provide actionable recommendations to improve the energy efficiency of your property and reduce your energy costs.</p>
                <p>Whether you need a BER certificate for Selling or Renting your property, a BER cert for a Green mortgage application, or a BER rating for an SEAI grant or New Build, we've got you covered.</p>
                <p>Click below to get the best quotes from multiple BER assessors near you today (takes just 1-minute).</p>
            </div>
        )
    },
    {
        id: 'about-seai',
        title: 'About the SEAI',
        content: (
            <div className="space-y-4">
                <p>The Sustainable Energy Authority of Ireland (SEAI) was established as Ireland's national energy agency under the Sustainable Energy Act 2002. SEAI's mission is to play a leading role in transforming Ireland into a society based on sustainable energy structures, technologies and practices.</p>
                <p>SEAI is partly financed by Ireland's EU Structural Funds Programme co-funded by the Irish Government and the European Union.</p>
                <p>All of our 300+ BER assessors are SEAI registered and fully qualified, ensuring your BER assessment meets all national standards and regulatory requirements.</p>
            </div>
        )
    },
    {
        id: 'find-assessor-near-you',
        title: 'Find a BER Assessor Near You',
        content: (
            <div className="space-y-4">
                <p>Using theberman.eu to find a BER assessor near you is completely free, easy to use and will save you time and money.</p>
                <p>To get started, submit your property details via our website (takes less than 1-minute) and we'll contact all the registered BER assessors in your area.</p>
                <p>Each assessor will then have the opportunity to submit an all-inclusive quote for your BER cert. No hidden fees, ever. Whether you're in Dublin, Cork, Galway or any other county, our network of qualified assessors covers the entire country.</p>
            </div>
        )
    },
    {
        id: 'get-rating-near-you',
        title: 'Get a BER Rating Near You',
        content: (
            <div className="space-y-4">
                <p>Easy! Simply click the 'Get Quotes' button, fill out a few details, and we'll find a BER assessor near you for the best price!</p>
                <p>A BER Rating is a Building Energy Rating provided by a qualified BER Assessor, which shows how energy efficient a property is. The more efficient a home is, the less it costs to heat and the less fossil fuels are required to maintain it.</p>
                <p>By using theberman.eu, you can quickly find multiple local assessors, compare their quotes, and book your assessment with confidence.</p>
            </div>
        )
    },
    {
        id: 'cost',
        title: 'How much does a BER cert cost?',
        content: (
            <div className="space-y-4">
                <p>We offer the best prices for all residential BER assessments, with no hidden costs.</p>
                <p>The cost of a BER certificate depends on the size, location and unique features of your property.</p>
                <p>If you would like to find out how much a BER assessment will cost for your property, just click the 'Get Quotes' button below and submit your property details online (takes only 1-minute).</p>
            </div>
        )
    },
    {
        id: 'what-is-ber',
        title: 'What is a BER Certificate?',
        content: (
            <div className="space-y-4">
                <p>A BER Certificate, or BER Rating is a Building Energy Rating provided by a qualified BER Assessor, which shows how energy efficient a property is.</p>
                <p>Following the Kyoto Protocol in 1997, The Irish Government, along with many other countries, agreed to reduce its greenhouse gases and other harmful emissions. One way to achieve this has been to introduce the BER scheme, which will show prospective buyers and tenants how energy efficient a property is and therefore encouraging landlords and home owners to increase their properties' energy efficiency.</p>
                <p>The more efficient a home is, the less it costs to heat and the less fossil fuels are required to maintain it and in turn the more attractive it is to future tenants or owners.</p>
                <p>As a result, it is now compulsory in Ireland when offering a property for sale or rent, to show its energy efficiency rating, or BER Rating.</p>
            </div>
        )
    },
    {
        id: 'who-needs-ber',
        title: 'Who needs a BER Certificate?',
        content: (
            <div className="space-y-4">
                <p>If you are offering a property in Ireland for sale or rent, you must by law, provide a BER Certificate for potential buyers and tenants.</p>
                <p>This will allow prospective future occupiers of the property, to compare the building's energy efficiency, to other houses in the area, and in turn, better estimate the cost of future heating and energy bills.</p>
                <p>A BER must also be provided before a new home is first occupied.</p>
                <p>Commercial properties also require BER Certificates which can be provided by Commercial BER Assessors.</p>
            </div>
        )
    },
    {
        id: 'how-long-produce',
        title: 'How long does a BER take to produce?',
        content: (
            <div className="space-y-4">
                <p>A typical home survey takes approximately 30 minutes.</p>
                <p>After taking the necessary measurements and details about the property, the BER Assessor then has to complete the BER calculations which can take up to one day, depending on the size and details of the property.</p>
                <p>Once these are complete, the Assessor will register the BER survey with the SEAI and print the BER Certificate which they will deliver, or email to you. It can take up to a week for Assessors to produce your BER Certificate depending on many factors including the complexity of the BER and the Assessor's workload.</p>
            </div>
        )
    },
    {
        id: 'how-to-get',
        title: 'How do I get a BER Certificate?',
        content: (
            <div className="space-y-4">
                <p>Once you post your job on theberman.eu, BER Assessors will submit quotes to you. You can then select your preferred quote and pay a small booking deposit online (included in the quote). Once paid, the Assessor will contact you within one business day to arrange a home visit for the survey.</p>
                <p>Once your Assessor has completed the calculations and the BER is ready, they will send you the BER Certificate and advisory report.</p>
                <p>With theberman.eu, you pay a small booking deposit online, then the balance to the BER Assessor on the day of your assessment.</p>
            </div>
        )
    },
    {
        id: 'validity',
        title: 'How long is a BER Certificate valid for?',
        content: (
            <div className="space-y-4">
                <p>Typically a BER Certificate is valid for ten years, unless major work is carried out on a property, for example insulation work, extensions, demolition etc. A provisional BER Certificate, produced from the plans of a new build, is valid for a maximum of two years.</p>
                <p>If you require a new BER cert for your property, simply click on the 'Get Quotes' button and we'll request competitive quotes from local BER assessors in your county.</p>
            </div>
        )
    },
    {
        id: 'lost-cert',
        title: 'What if I lose my BER Cert?',
        content: (
            <div className="space-y-4">
                <p>If you can't find your BER Certificate and want to know what your BER rating is, you can check the National BER Register and enter your BER number or MPRN number from your electricity bill or meter. The database will then provide you with a copy of your BER and advisory report, not the actual certificate.</p>
                <p>To get a duplicate copy of your BER Certificate, you can contact the SEAI on 01 808 2100 or contact the original BER Assessor who provided it (their contact details are on the BER report).</p>
                <p>BER certificates are valid for 10 years. If you need a new BER certificate, we can find you the best quotes from local BER assessors near you.</p>
            </div>
        )
    },
    {
        id: 'exemptions',
        title: 'Who is exempted from BERs?',
        content: (
            <div className="space-y-4">
                <p>There are some exempted buildings and structures, which do not require a BER certificate when being offered for sale or rent.</p>
                <p>The following buildings are exempt from requiring BER Certificates:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Protected structures</li>
                    <li>National monuments</li>
                    <li>Places of worship</li>
                    <li>Non residential agricultural buildings</li>
                    <li>Stand alone buildings with total floor area less than 50 sq/m</li>
                    <li>Industrial buildings with an installed heat capacity that does not exceed 10W/m2.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'property-types',
        title: 'What property types do we cover?',
        content: (
            <div className="space-y-4">
                <p>Our BER assessors can assess all residential properties and provide you with a BER certificate.</p>
                <p>Common property types include:</p>
                <ul className="grid grid-cols-2 gap-2 text-sm md:text-base">
                    <li>Apartments</li>
                    <li>Terraced houses</li>
                    <li>Mid terrace houses</li>
                    <li>End of terrace houses</li>
                    <li>Duplex properties</li>
                    <li>Semi-detached houses</li>
                    <li>Detached houses</li>
                    <li>Bungalows</li>
                    <li>New builds</li>
                    <li>Multi-unit properties</li>
                </ul>
            </div>
        )
    },
    {
        id: 'grants',
        title: 'BER cert for SEAI and govt grants',
        content: (
            <div className="space-y-4">
                <p>If you need a BER certificate for an SEAI grant or other government grant, our BER assessors can help.</p>
                <p>Submit your property details by clicking the 'Get Quotes' button. Your local BER assessors will then send you their best quotes for your BER certificate.</p>
            </div>
        )
    },
    {
        id: 'prepare-survey',
        title: 'How to prepare for your BER survey',
        content: (
            <div className="space-y-4">
                <p>There are many things a homeowner can do that will make the process faster for both themselves and the Assessor.</p>
                <p>Having the following items ready for the Assessor when they arrive at your property for the BER inspection will greatly help:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>A recent electricity bill showing the Meter Point Reference Number (MPRN).</li>
                    <li>The year the property was built.</li>
                    <li>Copies of any previous BERs published for that property.</li>
                    <li>Drawings or architectural plans for the building.</li>
                    <li>Details or plans of any upgrades to the property (extensions, insulation, new windows, u-values, etc.).</li>
                    <li>The model and make of the heating boiler.</li>
                    <li>Ensuring the Assessor has safe access to all areas of the property.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'improve-rating',
        title: 'How to improve your BER rating',
        content: (
            <div className="space-y-6">
                <p>There are a few things you can do before your BER Assessor arrives to help improve your BER rating:</p>

                <div>
                    <h4 className="font-bold text-gray-900 border-l-4 border-[#007F00] pl-3 mb-2">1. Low Energy Bulbs</h4>
                    <p>Using low energy light bulbs throughout your whole house will increase your BER Rating. Low energy CFLs or LEDs use significantly less energy than traditional bulbs while supplying the same amount of light.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 border-l-4 border-[#007F00] pl-3 mb-2">2. Chimney Damper</h4>
                    <p>A chimney is a source of heat loss. If a fireplace is never used, a chimney damper can be fitted to ensure heat loss is minimised while still allowing for adequate ventilation for safety.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 border-l-4 border-[#007F00] pl-3 mb-2">3. Lagging Jacket</h4>
                    <p>Hot water cylinder insulation reduces heat loss by up to 75%. Using a modern lagging jacket is a cost-effective way to improve your BER Rating.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 border-l-4 border-[#007F00] pl-3 mb-2">4. Controllable Vent Covers</h4>
                    <p>Adequate ventilation is vital for safety, but having controllable vent covers allows you to manage air flow more effectively and improve your rating.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 border-l-4 border-[#007F00] pl-3 mb-2">5. Draught Stripping</h4>
                    <p>Gaps in windows or external doors are sources of heat loss. Draught stripping is one of the most cost-effective ways to reduce air infiltration.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 border-l-4 border-[#007F00] pl-3 mb-2">6. Attic Insulation</h4>
                    <p>Adequate attic insulation can prevent up to 30% heat loss. Ensure proper levels are installed to retain heat and improve comfort.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 border-l-4 border-[#007F00] pl-3 mb-2">7. Cylinder Timer & Thermostat</h4>
                    <p>A timer and thermostat for your hot water cylinder allow for better control and prevent unnecessary heat loss.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 border-l-4 border-[#007F00] pl-3 mb-2">8. Heating System Controls</h4>
                    <p>Fully zoned controls for time and temperature can greatly reduce energy requirements by optimizing usage in different areas of the home.</p>
                </div>
            </div>
        )
    },
    {
        id: 'solar-panels',
        title: 'Solar Panels & BER Rating',
        content: (
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-gray-900 mb-2">Will Solar Panels Improve My BER Rating?</h4>
                    <p>Solar panels generate electricity from a renewable source and are generally considered to increase a property's energy efficiency, positively impacting your BER rating.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-2">How Do Solar Panels Impact Your BER Rating?</h4>
                    <p>Factors include orientation (south facing is best), angle (30-40 degrees), and shading. South-facing roofs deliver the highest electricity generation.</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-2">SEAI Solar Panel Grant</h4>
                    <p>The Solar PV Grant helps offset installation costs. If you apply for this grant, you will need a new BER assessment after installation to reflect the updated rating.</p>
                </div>
            </div>
        )
    },
    {
        id: 'find-solar-installer',
        title: 'How Do I Find A Solar Installer?',
        content: (
            <div className="space-y-4">
                <p>Finding the best solar installer involves several steps. Ensure they are registered with the Sustainable Energy Authority of Ireland (SEAI) to be eligible for grants.</p>
                <p>We recommend checking reviews, credentials, experience, and getting multiple quotes. Our partners can help you find trusted installers near you.</p>
            </div>
        )
    },
    {
        id: 'qualifications',
        title: 'BER Assessor Qualifications',
        content: (
            <div className="space-y-4">
                <p>All BER Assessors are trained in accordance with the SEAI training guidelines and must pass an exam to attain the qualification of BER Assessor.</p>
                <p>Assessors are audited by SEAI and must keep proper records of all certificates, advisory reports, and supporting documentation.</p>
            </div>
        )
    },
    {
        id: 'payment',
        title: 'Paying for your BER Certificate',
        content: (
            <div className="space-y-4">
                <p>To secure a quote from a BER Assessor on theberman.eu, you pay a small booking deposit online.</p>
                <p>We use Stripe to securely process payments via SSL encryption. Once your booking deposit is paid, you receive the Assessor's contact details and pay the balance on the day of survey.</p>
            </div>
        )
    }
];

const FAQ = () => {
    const [activeId, setActiveId] = useState(FAQ_DATA[0].id);
    const location = useLocation();

    // Scroll to section if hash is present
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash && FAQ_DATA.find(item => item.id === hash)) {
            setActiveId(hash);
        }
    }, [location]);

    const activeItem = FAQ_DATA.find(item => item.id === activeId) || FAQ_DATA[0];

    return (
        <div className="bg-white min-h-screen pt-32 pb-24 font-sans">
            <div className="container mx-auto px-6 max-w-7xl">

                <div className="grid lg:grid-cols-12 gap-16 items-start">

                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8 order-2 lg:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-black text-[#007F00] mb-8 leading-tight uppercase tracking-tight">
                                {activeItem.title}
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-medium space-y-6">
                                {activeItem.content}
                            </div>

                            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1 font-bold uppercase tracking-widest">Need immediate help?</p>
                                    <p className="text-xl font-black text-gray-900 tracking-tight">Email info@theberman.eu</p>
                                </div>
                                <button className="bg-[#007F00] text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-[#006400] transition-all shadow-lg hover:-translate-y-1">
                                    Get a Quote Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-4 order-1 lg:order-2 sticky top-32">
                        <div className="border-l border-gray-100 pl-8">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">BER FAQ</h3>
                            <nav className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar cursor-pointer">
                                {FAQ_DATA.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveId(item.id);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-full text-left text-[13px] font-bold transition-all leading-tight cursor-pointer hover:text-[#007F00] ${activeId === item.id
                                            ? 'text-[#007F00]'
                                            : 'text-gray-500'
                                            }`}
                                    >
                                        {item.title}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-12 p-8 bg-green-50 rounded-[2rem] border border-green-100">
                                <p className="text-lg font-black text-[#007F00] mb-2 uppercase tracking-tight">Ireland's Leading BER Consultants</p>
                                <p className="text-sm text-green-700/80 mb-6 font-medium leading-relaxed">Trusted by 10,000+ homeowners across the country.</p>
                                <p className="text-sm text-green-700/80 mb-6 font-medium leading-relaxed">Email: info@theberman.eu</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FAQ;
