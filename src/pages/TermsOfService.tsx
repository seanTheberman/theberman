
import { Gavel, FileCheck, AlertCircle, Info, Bookmark } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const TermsOfService = () => {
    const lastUpdated = "February 2, 2026";

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <SEOHead
                title="Terms of Service"
                description="Terms and Conditions of Service for The Berman. Our agreement for building energy rating assessments in Ireland."
                canonical="/terms-of-service"
            />

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-green-50 text-[#007F00] text-xs font-black tracking-widest uppercase border border-green-100">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Terms of <span className="text-[#007F00]">Service.</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Last Updated: {lastUpdated}. Please read these terms carefully before using our platform or booking an assessment.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="space-y-16">

                        {/* 1. Agreement */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Gavel className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">The Agreement</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 leading-relaxed font-medium">
                                <p>By accessing or using the theberman.eu website, you agree to be bound by these Terms of Service and all applicable laws and regulations in Ireland. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
                            </div>
                        </div>

                        {/* 2. Service Description */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Info className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Our Services</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>The Berman acts as a platform connecting homeowners and property managers with SEAI-registered BER assessors. We facilitate quote comparisons and booking management.</p>
                                <p>Note: While we vet all assessors for SEAI registration, the actual assessment contract is between the user and the chosen assessor.</p>
                            </div>
                        </div>

                        {/* 3. Booking and Payments */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileCheck className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Bookings</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Quotes provided on the platform are based on the information supplied by the user.</li>
                                    <li>Assessors reserve the right to adjust pricing if the property details provided are significantly inaccurate.</li>
                                    <li>Cancellations should be made at least 24 hours prior to the scheduled assessment time.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 4. Limitations of Liability */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Liability</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>The Berman is not responsible for the accuracy of individual BER certificates. BER certificates are issued under the assessor's SEAI registration. We shall not be liable for any direct, indirect, or consequential loss arising from the use of our platform or services.</p>
                            </div>
                        </div>

                        {/* 5. Governing Law */}
                        <div className="flex flex-col md:flex-row gap-8 pt-16 border-t border-gray-100">
                            <div className="md:w-1/3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Bookmark className="text-[#007F00]" size={24} />
                                    <h2 className="text-xl font-black uppercase tracking-tight">Governing Law</h2>
                                </div>
                            </div>
                            <div className="md:w-2/3 text-gray-600 space-y-4 font-medium">
                                <p>These terms and conditions are governed by and construed in accordance with the laws of Ireland. You irrevocably submit to the exclusive jurisdiction of the courts in Ireland for any dispute related to these terms.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsOfService;
