import SEOHead from '../components/SEOHead';
import { getTenantFromDomain } from '../lib/tenant';

const AssessorTerms = () => {
    const isEngland = getTenantFromDomain() === 'england';
    const certName = isEngland ? 'EPC' : 'BER';
    const assessorLabel = isEngland ? 'EPC Assessor' : 'BER Assessor';
    const brand = isEngland ? 'epccert.com' : 'theberman.eu';
    const body = isEngland ? 'a UK accredited body' : 'the Sustainable Energy Authority of Ireland (SEAI)';
    const currency = isEngland ? '£25' : '€25';

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-24 pb-16">
            <SEOHead
                title="Assessor Terms of Use"
                description={`Terms of Use for ${assessorLabel}s registered on the ${isEngland ? 'EPC Cert' : 'The Berman'} platform.`}
                canonical="/assessor-terms"
            />

            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-normal text-[#4CAF50] mb-8">
                    {assessorLabel}s Terms of Use
                </h1>

                <div className="text-gray-800 space-y-6 leading-relaxed">
                    <p>
                        You are responsible for keeping up to date with these Terms of Use. By continuing to use this website, you agree to be bound by these terms. If you do not agree, you must stop using the platform immediately.
                    </p>

                    <p>
                        To register as a {assessorLabel} on this website, you must be a qualified and registered {assessorLabel} with {body}. By registering, you confirm that your registration is current and valid. You also agree to notify {brand} immediately via email if your registration status changes or if you cease to be a registered {assessorLabel}.
                    </p>

                    <p>
                        While {brand} aims to offer opportunities to all Assessors on the platform, there is no guarantee or commitment to provide a specific number of job referrals. The acceptance of any quotes submitted by Assessors is solely at the discretion of the client (homeowner), and {brand} has no influence over their decision.
                    </p>

                    <p>
                        By using {brand}, you agree to contact any clients obtained through {brand} within one business day of receiving a job referral.
                    </p>

                    <p>
                        By using {brand}, you agree to complete {certName} Assessments and issue the associated {certName} Certificates within a reasonable timeframe, ensuring prompt service delivery to your clients.
                    </p>

                    <p>
                        When submitting quotes through {brand}, you agree to include all applicable fees in your total quoted price. This includes all applicable accreditation fees, VAT (if applicable), and the {brand} referral fee.
                    </p>

                    <p>
                        By using {brand}, you understand and agree that the {brand} fee of {currency} is a referral fee for providing you with a confirmed job. You should incorporate this fee into all quotes you submit via the {brand} platform. This fee is not charged to you directly; instead, it is paid directly to {brand} by the client upon accepting a quote.
                    </p>

                    <p>
                        By using {brand}, you agree to accept payment directly from your client on the day of the survey, or as you may agree directly with your client.
                    </p>

                    <p>
                        By using {brand}, you acknowledge that in addition to the {brand} referral fee, {brand} may also charge website users an additional administration fee for using the platform.
                    </p>

                    <p>
                        By using {brand}, you understand that you and you alone are responsible for producing and delivering the {certName} Certificate and rating to your client. You understand that {brand} does not verify, endorse, or guarantee the accuracy of your {certName} ratings or services.
                    </p>

                    <p>
                        By using {brand}, you agree not to subcontract any jobs acquired through {brand} to third parties. All work must be performed and completed by you, the {assessorLabel} registered with {brand}.
                    </p>

                    <p>
                        By using {brand}, you understand and agree that your quotes may be seen anonymously by other Assessors registered on the platform (you will not be identified). You will also have access to view other Assessors' quotes.
                    </p>

                    <p>
                        You agree that no claims or legal action can be brought against {brand} or its team by you, the Assessor. {brand} is not liable for any potential loss of business or earnings resulting from the use of the platform.
                    </p>

                    <p>
                        Failure to comply with these Terms of Use may result in immediate suspension or permanent removal of your account from the {brand} platform.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AssessorTerms;
