import {
    ArrowRight, CheckCircle2, Star, Clock,
    Zap as ZapIcon, ShieldCheck, TrendingUp,
    Users, Shield, ClipboardList, X, Search, ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

interface PromoSettings {
    is_enabled: boolean;
    headline: string;
    sub_text: string;
    image_url: string;
    destination_url: string;
}

const HomePage = () => {
    const [promo, setPromo] = useState<PromoSettings | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPromo = async () => {
            const { data } = await supabase
                .from('promo_settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle();

            if (data) setPromo(data);
        };
        fetchPromo();
    }, []);

    return (
        <div className="font-sans text-gray-900 overflow-x-hidden">
            <SEOHead
                title="Home | Berman Building Energy Ratings"
                description="Ireland's largest BER website. Fast, reliable, and hassle-free BER assessments. Get competitive quotes from local assessors today."
                canonical="/"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'The Berman',
                        url: 'https://theberman.eu',
                        logo: 'https://theberman.eu/logo.png',
                        sameAs: ['https://www.facebook.com/theberman', 'https://www.instagram.com/theberman'],
                        contactPoint: { '@type': 'ContactPoint', email: 'info@theberman.eu', contactType: 'customer service', areaServed: 'IE' }
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'LocalBusiness',
                        name: 'The Berman',
                        description: "Ireland's largest BER website. Fast, reliable, and hassle-free BER assessments.",
                        url: 'https://theberman.eu',
                        address: { '@type': 'PostalAddress', addressCountry: 'IE', addressLocality: 'Dublin' },
                        priceRange: '€€'
                    }
                ]}
            />

            {/* 1. HERO SECTION - BERcert Conversion Style */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-white overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-green-50/50 blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-green-50/50 blur-3xl -z-0"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full mb-8 animate-fade-in">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-bold text-green-700">Ireland's Largest BER Website</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 md:mb-8 leading-[1.1] tracking-tight">
                            Need a <span className="text-[#007F00]">BER Cert?</span>
                        </h1>

                        <p className="text-lg md:text-2xl text-gray-600 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                            The fastest, most reliable way to get your Building Energy Rating. Guaranteed lowest prices from 100+ assessors nationwide.
                        </p>

                        <p className="text-[#007F00] font-bold my-6 animate-fade-in text-2xl md:text-3xl">
                            Get the Best Quotes from local BER Assessors today.
                        </p>
                        {/* Dual Primary CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto mb-16 px-4">
                            <Link to="/get-quote" className="w-full sm:w-auto">
                                <button className="w-full sm:px-16 py-8 bg-[#007F00] hover:bg-[#006400] text-white text-2xl md:text-3xl font-black rounded-[2rem] shadow-2xl shadow-green-100 transition-all transform hover:-translate-y-2 hover:scale-105 flex items-center justify-center gap-4 cursor-pointer border-4 border-white/10">
                                    Get Quotes
                                    <ArrowRight size={32} strokeWidth={3} />
                                </button>
                            </Link>
                        </div>

                        {/* Fast Benefits Row */}
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                            {[
                                { icon: <Users size={20} />, text: "100+ Assessors Nationwide" },
                                { icon: <ShieldCheck size={20} />, text: "SEAI REGISTERED ASSESSORS ONLY" },
                                { icon: <Clock size={20} />, text: "Choose Your Date & Time" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-gray-500 font-bold text-sm tracking-wide uppercase">
                                    <span className="text-[#007F00]">{item.icon}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. HOW IT WORKS - 4 Step Linear Flow */}
            <section className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-4 block">Simple Process</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900">How It Works</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-0"></div>

                        {[
                            {
                                step: "01",
                                icon: <Clock size={32} />,
                                title: "Select Date",
                                desc: "Tell us your preferred date & time for assessment."
                            },
                            {
                                step: "02",
                                icon: <ClipboardList size={32} />,
                                title: "Post Details",
                                desc: "Share your property info in less than 1 minute."
                            },
                            {
                                step: "03",
                                icon: <TrendingUp size={32} />,
                                title: "Get Quotes",
                                desc: "Receive competitive prices from local assessors."
                            },
                            {
                                step: "04",
                                icon: <CheckCircle2 size={32} />,
                                title: "Book Online",
                                desc: "Choose your favorite quote and confirm instantly."
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden cursor-pointer">
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 text-6xl md:text-7xl font-black text-gray-50 group-hover:text-green-50 transition-colors -z-0">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-green-50 text-[#007F00] rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#007F00] group-hover:text-white transition-all relative z-10">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-3 relative z-10">{item.title}</h3>
                                <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed relative z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. BENEFITS / WHY CHOOSE US */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-4 block">The Advantage</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
                                Why Homeowners Trust <br /> <span className="text-[#007F00]">The BER Man</span>
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { title: "Lowest Prices Guaranteed", desc: "Our network competes for your job, driving prices down for you." },
                                    { title: "BER Registered Assessors Only", desc: "Every assessor is fully certified and vetted for quality." },
                                    { title: "Money-Back Guarantee", desc: "We ensure you get a professional service or your money back." },
                                    { title: "Instant Online Booking", desc: "No back-and-forth phone calls. Book everything in real-time." }
                                ].map((benefit, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[#007F00]">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{benefit.title}</h4>
                                            <p className="text-gray-500 font-medium">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-8">
                                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                        <div className="text-4xl font-black text-[#007F00] mb-2">1k+</div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Users Served</div>
                                    </div>
                                    <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
                                        <div className="text-4xl font-black text-[#007F00] mb-2">100+</div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Assessors</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-[#007F00] p-8 rounded-3xl text-white shadow-xl shadow-green-100">
                                        <div className="text-4xl font-black mb-2">4.9/5</div>
                                        <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Average Rating</div>
                                        <div className="flex gap-1 mt-4">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="white" />)}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                        <div className="text-4xl font-black text-gray-900 mb-2">Fast</div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Turnaround</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. TRUSTPILOT STYLE REVIEWS */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Star className="text-green-500 fill-green-500" size={32} />
                            <span className="text-3xl font-black">Excellent</span>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Based on 1,000 Verified Customer Ratings</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                        {[
                            {
                                author: "Michael Byrne",
                                location: "Dublin",
                                quote: "Used the platform twice now. Both times I got several quotes within an hour and the assessor was super professional. Saved about €30 vs other sites.",
                                rating: 5
                            },
                            {
                                author: "Sarah O'Toole",
                                location: "Cork",
                                quote: "Extremely easy to use. I loved that I could see the SEAI registration numbers and reviews for the assessors before booking. Highly recommended for landlords.",
                                rating: 5
                            },
                            {
                                author: "James Murphy",
                                location: "Galway",
                                quote: "Fast turnaround and competitive pricing. The portal makes it very simple to manage everything and the certificate was issued within 24 hours of inspection.",
                                rating: 5
                            }
                        ].map((testi, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden flex flex-col h-full cursor-pointer">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="text-green-500 fill-green-500" />)}
                                </div>
                                <p className="text-gray-700 italic mb-6 font-medium leading-relaxed flex-1">"{testi.quote}"</p>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#007F00] font-black">
                                        {testi.author[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 leading-none">{testi.author}</p>
                                        <p className="text-xs text-gray-500 mt-1">{testi.location}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ASSESSOR CTA SECTION */}
            <section className="py-20 bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-[#007F00] mb-4">Are You a BER Assessor?</h2>
                    <p className="text-gray-600 font-medium mb-8 max-w-2xl mx-auto">
                        Register with theberman.eu and receive local job leads, straight to your phone.
                    </p>
                    <Link to="/signup?role=contractor">
                        <button className="px-12 py-4 border-2 border-[#007F00] text-[#007F00] hover:bg-[#007F00] hover:text-white font-black rounded-xl transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer">
                            Join Now
                        </button>
                    </Link>
                </div>
            </section>

            {/* Solar Panel Promotion */}
            <section className="py-24 bg-gray-900 border-t border-green-900 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 blur-3xl rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#9ACD32]/10 blur-3xl rounded-full -ml-48 -mb-48"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-green-500/10 text-[#9ACD32] text-xs font-black tracking-widest uppercase border border-green-500/20">
                                Eco-Friendly Savings
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                                Compare Solar Deals
                            </h2>
                            <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-xl">
                                Reduce your electricity bills and carbon footprint with customized solar solutions. Our partners provide expert installation and the latest technology tailored for your home.
                            </p>
                            <a
                                href="https://solarquotesireland.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-[#007F00] hover:bg-[#006400] text-white px-10 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,127,0,0.3)] group"
                            >
                                Compare Solar Deals
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                            </a>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl skew-x-1">
                                <img
                                    src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1000"
                                    alt="Solar Panels installation"
                                    className="w-full h-[500px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                            </div>
                            {/* Floating Stats */}
                            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 hidden md:block animate-bounce-slow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#007F00]">
                                        <Star fill="currentColor" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-gray-900">Up to 60%</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bill Reduction</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Selling Home Promotion */}
            {/* <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="bg-gray-50 rounded-[3rem] p-8 md:p-16 border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-[#007EF0]/5 rounded-full blur-3xl"></div>

                        <div className="md:w-3/5 relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight uppercase tracking-tight">
                                Considering selling <br /> your home?
                            </h2>
                            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                                We've partnered with <span className="font-bold text-[#007F00]">Berman Property</span> to provide you with seamless property services. Get a professional valuation and expert advice on how to maximize your home's value before you sell.
                            </p>
                            <a
                                href="https://bermanproperty.ie"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl"
                            >
                                Visit Property Partner
                                <ChevronRight size={18} />
                            </a>
                        </div>

                        <div className="md:w-2/5">
                            <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-gray-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600"
                                    alt="Modern Home Interior"
                                    className="rounded-[1.5rem] w-full h-[300px] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* 6. HOME ENERGY CATALOG SECTION */}
            <section className="py-24 bg-gray-50 overflow-hidden relative border-t border-gray-100">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#007F00]/10 text-[#007F00] text-xs font-black uppercase tracking-widest mb-6">Explore Our Network</span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-tight">
                                Find the Best <br />
                                <span className="text-[#007F00]">Home Energy</span> Partners.
                            </h2>
                            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-10 max-w-2xl">
                                Access our curated catalogue of certified home energy businesses. From solar panel installers to insulation specialists, find the right partner for your home's journey to efficiency.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/catalogue">
                                    <button className="px-10 py-5 bg-[#007F00] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#006400] transition-all shadow-xl shadow-green-100 flex items-center gap-3 active:scale-95 cursor-pointer">
                                        Browse Catalogue
                                        <ArrowRight size={18} />
                                    </button>
                                </Link>
                                <Link to="/signup?role=business">
                                    <button className="px-10 py-5 bg-white text-gray-900 border-2 border-[#007F00] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-green-50 transition-all flex items-center gap-3 active:scale-95 cursor-pointer">
                                        Register your Business
                                    </button>
                                </Link>
                                <Link to="/hire-agent">
                                    <button className="px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 font-black text-xs uppercase tracking-widest rounded-2xl hover:border-[#007F00] transition-all flex items-center gap-3 active:scale-95 cursor-pointer">
                                        Speak to Advisor
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1 relative w-full max-w-xl mx-auto">
                            <div className="relative aspect-square bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 group">
                                <img
                                    src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800"
                                    alt="Home Energy Upgrades"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-10 left-10 right-10">
                                    <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/20">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#007F00]">
                                                <Search size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900 leading-none">Smart Search</h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">By County & Service Type</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#007F00] w-2/3 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. FAQ / EDUCATION SECTION */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                    <div>
                        <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-4 block">Knowledge Base</span>
                        <h2 className="text-4xl font-black mb-8 text-gray-900 leading-tight">Frequently Asked <br /> Questions</h2>
                        <div className="space-y-6">
                            {[
                                { q: "What is a BER Certificate?", a: "A Building Energy Rating (BER) tells you how energy efficient your home is, rated from A (most efficient) to G (least efficient)." },
                                { q: "Why do I need a BER?", a: "It's legally required to sell or rent a property. It's also needed for SEAI energy upgrade grants." },
                                { q: "How much does it cost?", a: "Prices vary based on property size. Our platform ensures you get the most competitive quotes from local assessors." },
                                { q: "How long is it valid for?", a: "A BER certificate is valid for up to 10 years, unless there are major changes to the property's energy performance." }
                            ].map((faq, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#007F00] transition-colors">{faq.q}</h4>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                        <Link to="/faq">
                            <button className="mt-12 text-[#007F00] font-black border-b-2 border-[#007F00] pb-1 hover:text-[#006400] transition-all flex items-center gap-2 group cursor-pointer">
                                View all FAQs
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>

                    <div className="bg-gray-900 text-white p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                        <h3 className="text-3xl font-black mb-6">Ready to get your <br /> BER Certificate?</h3>
                        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                            Join over 1,000 satisfied homeowners. Get competitive quotes from trusted local assessors in seconds.
                        </p>
                        <div className="space-y-6 mb-12">

                        </div>
                        <Link to="/get-quote">
                            <button className="w-full bg-[#007F00] hover:bg-green-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-900/40 transform hover:-translate-y-1 cursor-pointer">
                                Get a Quote Online
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE THE BERMAN */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-[#007F00] mb-14">
                        Why Choose The Berman?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto mb-14">
                        {[
                            { icon: '€', title: 'Best Value Rates', color: 'text-[#007F00]' },
                            { icon: <ZapIcon size={28} />, title: 'Quick Results', color: 'text-[#007F00]' },
                            { icon: <ShieldCheck size={28} />, title: 'SEAI Certified Experts', color: 'text-[#007F00]' },
                            { icon: <CheckCircle2 size={28} />, title: 'Smooth & Stress-Free', color: 'text-[#007F00]' },
                            { icon: <Shield size={28} />, title: 'Satisfaction Guaranteed', color: 'text-[#007F00]' },
                            { icon: <Clock size={28} />, title: 'Pick Your Schedule', color: 'text-[#007F00]' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center gap-3 group">
                                <div className={`${item.color} text-3xl font-black group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{item.title}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <Link to="/get-quote">
                            <button className="px-12 py-5 bg-[#007F00] hover:bg-[#006400] text-white text-lg font-black rounded-full shadow-xl shadow-green-100 transition-all transform hover:-translate-y-1 hover:scale-105 cursor-pointer">
                                Get BER Quotes Now
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* WE COVER ALL COUNTIES */}
            <section className="py-20 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-[#007F00] mb-12">
                        We Cover All Counties
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-3 max-w-4xl mx-auto">
                        {[
                            'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin',
                            'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim',
                            'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan',
                            'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
                            'Wexford', 'Wicklow'
                        ].map((county) => (
                            <Link
                                key={county}
                                to="/get-quote"
                                className="text-gray-600 hover:text-[#007F00] transition-colors text-sm font-semibold py-1 text-center"
                            >
                                BER Cert {county}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. FINAL CTA / NEWSLETTER */}
            <section id="newsletter" className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="p-16 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[#007F00] font-bold uppercase tracking-widest text-sm mb-6 block">Premium Resources</span>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-gray-900">Get Our Complete Home <br /> Energy Upgrade Guide</h2>
                            <p className="text-gray-600 mb-12 text-xl font-medium leading-relaxed">
                                Join 5,000+ homeowners receiving our weekly energy updates, flash sales, and exclusive energy upgrade offers.
                            </p>

                            <form
                                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const emailInput = (e.target as HTMLFormElement).querySelector('input[type="email"]') as HTMLInputElement;
                                    const email = emailInput?.value;

                                    if (!email) return;

                                    setIsSubmitting(true);
                                    try {
                                        const { error } = await supabase
                                            .from('leads')
                                            .insert([{
                                                name: 'Guide Subscriber',
                                                email: email,
                                                message: 'Requested Complete Home Energy Upgrade Guide via Home Page Newsletter',
                                                status: 'new',
                                                purpose: 'Home Energy Guide'
                                            }]);

                                        if (error) throw error;

                                        toast.success('Subscribed! Check your email soon.', {
                                            icon: '✅',
                                            duration: 5000
                                        });
                                        (e.target as HTMLFormElement).reset();
                                    } catch (err: any) {
                                        console.error('Newsletter error:', err);
                                        toast.error(err.message || 'Failed to subscribe');
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-grow bg-white border border-gray-200 rounded-2xl px-6 py-5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#007F00] transition-all font-bold text-lg"
                                    required
                                    disabled={isSubmitting}
                                />
                                <button
                                    disabled={isSubmitting}
                                    className="bg-[#007F00] text-white font-black px-10 py-5 rounded-2xl hover:bg-[#006400] transition-all shadow-xl shadow-green-100 whitespace-nowrap text-lg cursor-pointer disabled:opacity-70 flex items-center justify-center min-w-[200px]"
                                >
                                    {isSubmitting ? 'Sending...' : 'Subscribe to news'}
                                </button>
                            </form>

                            <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-[#007F00]" />
                                    No Spam Ever
                                </div>
                                <div className="flex items-center gap-2">
                                    <ZapIcon size={14} className="text-[#007F00]" />
                                    Instant Download
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Promo Banner (Sticky Bottom) */}
            {promo?.is_enabled && !isDismissed && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#007F00] text-white py-4 px-6 text-center z-[100] group overflow-hidden border-t border-white/10 shadow-[0_-10px_40px_rgba(0,127,0,0.2)] animate-slide-up">
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-[-45deg]"></div>

                    <div className="container mx-auto relative">
                        <a
                            href='https://solarquotesireland.com/'
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap pr-8"
                        >
                            <span className="bg-white text-[#007F00] px-2 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider">Promo</span>
                            <span className="font-bold text-base sm:text-lg">{promo.headline}</span>
                            <span className="hidden md:inline-block opacity-80 text-sm">—</span>
                            <span className="text-sm sm:text-base font-medium opacity-90">{promo.sub_text}</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        <button
                            onClick={() => setIsDismissed(true)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default HomePage;
