
import { Globe, ArrowRight, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import FaqItem from '../components/FaqItem';
import SEOHead from '../components/SEOHead';

const About = () => {
    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title="About Us - Expert BER Assessors"
                description="Learn about The Berman, Ireland's leading energy consultancy. Fast, accurate, and professional energy ratings."
                canonical="/about"
            />

            {/* 1. SIMPLE CENTERED HERO */}
            <section className="pt-32 pb-16 bg-white">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        Our Mission
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Precision in every <br className="hidden md:block" />
                        <span className="text-[#007F00]">Assessment.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Helping homeowners across Ireland understand, improve, and certify their property's energy efficiency since 2015.
                    </p>
                </div>
            </section>

            {/* 2. STRUCTURED STORY SECTION */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-12 gap-16 items-start">
                        {/* Left Side: Story Text */}
                        <div className="lg:col-span-8 space-y-8 text-gray-600 leading-relaxed font-sans text-lg text-left">
                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Our Story</h2>
                            </div>
                            <p>
                                The Berman was founded with a singular objective: to bring professional clarity and technical rigor to Ireland's energy rating industry. We recognized that homeowners and businesses weren't just looking for a certificate. They were looking for a roadmap to a more sustainable, cost-effective future.
                            </p>
                            <p>
                                What began as a specialized team in Dublin has grown into a nationwide network of SEAI-registered experts. Our growth has been fueled by a commitment to accuracy, integrity, and a deep understanding of the Irish building stock. We don't just measure energy performance; we interpret it, providing actionable insights that lead to real-world savings.
                            </p>
                            <p>
                                Today, The Berman stands as a benchmark for energy consultancy in Ireland. We have successfully completed over 10,000 assessments, helping families and enterprises navigate the complexities of BER ratings and SEAI grants. Our mission remains unchanged: to empower our clients with the knowledge they need to make informed decisions about their property's energy journey.
                            </p>
                            <p>
                                As we look toward the future, our focus continues to be on innovation and excellence. We are constantly refining our processes and staying at the forefront of energy technology to ensure our clients receive the highest standard of service. At The Berman, we believe that an energy-efficient home is the foundation of a modern, sustainable Ireland.
                            </p>
                        </div>

                        {/* Right Side: Stats / Impact */}
                        <div className="lg:col-span-4 lg:pl-12 lg:border-l border-gray-200">
                            <div className="sticky top-12 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-8 lg:space-y-12">
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-[#007F00] mb-2">1k+</p>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">Completed <br className="hidden lg:block" />BER Assessments</p>
                                </div>
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-[#007F00] mb-2">100+</p>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">Nationwide <br className="hidden lg:block" />Network Assessors</p>
                                </div>
                                <div>
                                    <p className="text-4xl md:text-5xl font-black text-[#007F00] mb-2">SEAI</p>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">Fully Registered <br className="hidden lg:block" />Energy Experts</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE VALUES GRID */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">How We Work</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">The Berman Principles</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ValueItem
                            icon={<Zap size={24} />}
                            title="Speed & Accuracy"
                            description="We understand your time is valuable. Our assessors provide precise ratings with a focus on fast turnaround."
                        />
                        <ValueItem
                            icon={<Shield size={24} />}
                            title="Expert Integrity"
                            description="All assessments are handled by fully insured and registered professionals committed to honest reporting."
                        />
                        <ValueItem
                            icon={<Globe size={24} />}
                            title="Green Future"
                            description="We provide recommendations aimed at long-term energy savings and environmental impact reduction."
                        />
                    </div>
                </div>
            </section>

            {/* 4. FAQ SECTION */}
            <section id="faq" className="py-24 bg-[#007F00]">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Frequently Asked Questions</h2>
                        <p className="text-green-50 text-xs font-black uppercase tracking-widest">Everything you need to know</p>
                    </div>
                    <div className="space-y-6">
                        <FaqItem
                            question="What is a BER Certificate?"
                            answer="A BER (Building Energy Rating) Certificate shows how energy efficient a property is. It rates buildings from A (most efficient) to G (least efficient), similar to appliance energy labels."
                        />
                        <FaqItem
                            question="Is a BER Certificate mandatory in Ireland?"
                            answer="Yes. A BER certificate is legally required when a property is sold, rented, or advertised for sale or rent, with limited exemptions."
                        />
                        <FaqItem
                            question="How much does a BER Certificate cost?"
                            answer="The cost depends on the size and type of the property. Prices vary, which is why comparing quotes from multiple assessors helps you get the best price."
                        />
                        <FaqItem
                            question="How long does a BER assessment take?"
                            answer="The on-site assessment usually takes 1–3 hours, depending on the property size."
                        />
                        <FaqItem
                            question="How long is a BER Certificate valid for?"
                            answer="A BER certificate is valid for 10 years, unless major changes are made to the property that affect energy performance."
                        />
                        <FaqItem
                            question="How do I get a BER Certificate?"
                            answer="You book a SEAI-registered BER assessor, they visit and assess your property, and your certificate is issued and registered with SEAI."
                        />
                        <FaqItem
                            question="Can I choose my assessment date and time?"
                            answer="Yes. You can select a preferred date and time when booking through the platform."
                        />
                        <FaqItem
                            question="Are BER assessors registered and trusted?"
                            answer="Yes. All BER assessments are carried out by SEAI-registered assessors who follow an official code of practice."
                        />
                        <FaqItem
                            question="What happens if I get a bad rating?"
                            answer="A bad rating does not prevent you from selling. It simply informs the buyer. Our advisory report will suggest ways to improve it."
                        />
                    </div>
                </div>
            </section>

            {/* 5. FINISH CTA SECTION */}
            <section className="py-2">
                <div className="container max-w-full">
                    <div className="bg-gray-50 p-12 md:p-20 text-center relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">Join the Berman <br />Family</h2>
                            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                                Ready for a professional BER assessment? Our nationwide team is here to help you today.
                            </p>
                            <Link to="/contact">
                                <button className="bg-[#007F00] text-white font-black px-12 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0">
                                    Get My Quote <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ValueItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
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

export default About;
