
import { Shield, Lock, Eye, FileText, Scale } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const PrivacyPolicy = () => {
    const lastUpdated = "February 2, 2026";

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title="Privacy Policy"
                description="Privacy Policy for The Berman. We are committed to protecting your personal data in accordance with Irish law and GDPR."
                canonical="/privacy-policy"
            />

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Privacy <span className="text-[#007F00]">Policy.</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Last Updated: {lastUpdated}. Your privacy is critical to us. We've designed our policy to be transparent and compliant with GDPR.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="space-y-16">

                        {/* 1. Introduction */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Introduction</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 leading-relaxed font-medium">
                                <p>Welcome to The Berman ("we," "our," or "us"). We are committed to protecting your personal data and your right to privacy. This Privacy Policy explains how we collect, use, and share information when you use our website (theberman.eu) and our services in Ireland.</p>
                            </div>
                        </div>

                        {/* 2. Data We Collect */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Eye className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Information We Collect</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>When you request a BER quote or use our platform, we collect information that identifies you, such as:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Contact details (Name, email address, phone number).</li>
                                    <li>Property details (Eircode, address, property type).</li>
                                    <li>Account information (if you register as a user or assessor).</li>
                                    <li>Technical data (IP address, browser type, usage patterns).</li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. How We Use Data */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">How We Use Data</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, and compliance with our legal obligations.</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>To facilitate quote generation and booking with assessors.</li>
                                    <li>To communicate with you regarding your assessment.</li>
                                    <li>To improve our website functionality and user experience.</li>
                                    <li>To comply with SEAI regulations and Irish building laws.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 4. Your Rights (GDPR) */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Scale className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Your Rights</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>Under GDPR and the Irish Data Protection Acts, you have rights including:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>The right to access the personal data we hold about you.</li>
                                    <li>The right to request correction of inaccurate data.</li>
                                    <li>The right to request deletion of your data (right to be forgotten).</li>
                                    <li>The right to object to processing or request restriction of processing.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 5. Contact Information */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Contact Us</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer at:</p>
                                <p className="font-black text-gray-900">
                                    Email: info@theberman.eu<br />
                                    Address: Dublin 4, Ireland
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
