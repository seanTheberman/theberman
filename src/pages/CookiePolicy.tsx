import { HelpCircle, List, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const CookiePolicy = () => {
    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title="Cookie Policy"
                description="Cookie Policy for The Berman. Learn about how we use cookies on our website."
                canonical="/cookie-policy"
            />

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Cookie <span className="text-[#007F00]">Policy.</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        We use cookies to make this website better for you and your continued use of this website implies that you agree to our use of cookies.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="space-y-16">

                        {/* 1. What is a cookie? */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <HelpCircle className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">What is a Cookie?</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 leading-relaxed font-medium">
                                <p>A cookie is a small piece of data sent from a website and stored on your computer via your web browser, while you are browsing our website. Cookies were designed to be a reliable mechanism for websites to remember stateful information (such as items added in the shopping cart in an online store) or to record the user's browsing activity (including clicking particular buttons, logging in, or recording which pages were visited in the past). They can also be used to remember arbitrary pieces of information that the user previously entered into form fields such as names, addresses, passwords, and credit card numbers.</p>
                            </div>
                        </div>

                        {/* 2. Cookies We Use */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <List className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Cookies We Use</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>We may use the following cookies among others from time to time on our website:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>tawkuuid</strong> — for support chat app</li>
                                    <li><strong>utma / utmz</strong> — for Google Analytics</li>
                                    <li><strong>cfclient cookies</strong> — for ColdFusion client/session/server cookies</li>
                                    <li><strong>adNetwork</strong> — adNetwork tracking</li>
                                    <li><strong>Cookies for advertising and remarketing</strong></li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. Opt Out */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <LogOut className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Opt Out</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>
                                    If you don't agree to our use of cookies, please leave this website by{' '}
                                    <Link to="/" className="text-[#007F00] font-bold hover:underline">
                                        clicking here
                                    </Link>.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default CookiePolicy;
