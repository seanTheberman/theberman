import LegalDoc from '../../components/legal/LegalDoc';
import type { LegalSection } from '../../components/legal/LegalDoc';

const sections: LegalSection[] = [
    {
        heading: '1. Purpose and Scope',
        paragraphs: [
            'This Policy explains when DPECERT places, reads or otherwise uses cookies and similar tracking technologies on www.dpecert.fr and related Platform interfaces.',
            'It should be read with the Privacy and Data Protection Policy and applies subject to French and European data-protection and electronic-communications law.',
        ],
    },
    {
        heading: '2. Strictly Necessary Technologies',
        paragraphs: [
            'DPECERT may use technologies that are strictly necessary to provide a service expressly requested by the user, maintain a secure session, authenticate an account, preserve requested settings, complete a transaction, prevent fraud, protect the Platform or comply with a legal obligation.',
            'Where a technology falls within a legal exemption from consent, it will be used only within the scope of that exemption.',
        ],
    },
    {
        heading: '3. Technologies Requiring Consent',
        paragraphs: [
            'Analytics, advertising, behavioural profiling, personalised content and other non-exempt tracking technologies will be activated only after valid consent has been obtained.',
            'Consent must be freely given, specific, informed and unambiguous. Continued browsing or silence is not treated as consent.',
            'Refusing non-essential technologies must be no harder than accepting them. DPECERT will not use interface design intended to steer users unfairly toward acceptance.',
        ],
    },
    {
        heading: '4. Cookie Choice and Withdrawal',
        paragraphs: [
            'Users may change or withdraw their consent through DPECERT’s cookie settings mechanism.',
            'Withdrawal must be as simple as giving consent and must take effect for future processing without affecting processing that was lawful before withdrawal.',
            'DPECERT will maintain appropriate records of cookie choices where necessary to demonstrate compliance.',
        ],
    },
    {
        heading: '5. Third-Party Technologies',
        paragraphs: [
            'DPECERT may use payment, hosting, security, communications, analytics and other technical providers.',
            'Where a provider places or accesses a technology on DPECERT’s behalf, DPECERT will apply the contractual and legal safeguards appropriate to the provider’s role.',
            'A provider will not be authorised to use personal data obtained through DPECERT for unrelated purposes unless it has its own lawful basis and legally appropriate role.',
        ],
    },
    {
        heading: '6. Payment and Security Technologies',
        paragraphs: [
            'Payment pages may be operated or supported by DPECERT’s authorised payment-service provider.',
            'Technologies used in this context may be necessary for payment authentication, transaction security, fraud prevention and regulatory compliance and will be governed by the legal framework applicable to the relevant service.',
        ],
    },
    {
        heading: '7. Cookies Containing Personal Data',
        paragraphs: ['Information stored in or obtained from a cookie or similar technology may constitute personal data. Where it does, the processing is also governed by DPECERT’s Privacy and Data Protection Policy and the GDPR.'],
    },
    {
        heading: '8. International Transfers',
        paragraphs: ['Where a cookie or related service results in a transfer of personal data outside the European Economic Area, DPECERT will use a lawful transfer mechanism and the safeguards required by applicable law.'],
    },
    {
        heading: '9. Security and User Protection',
        paragraphs: [
            'DPECERT will take reasonable technical and organisational measures to protect cookie identifiers and related information against unauthorised access, misuse or loss.',
            'DPECERT will not use tracking technologies to misrepresent a user’s choices, circumvent a refusal or undermine a withdrawal of consent.',
        ],
    },
    {
        heading: '10. Changes and Contact',
        paragraphs: [
            'DPECERT may amend this Policy when its technologies, services or legal obligations change. The current version and effective date will be published on the website.',
            'Privacy contact: [PRIVACY EMAIL]. Legal entity: [FULL LEGAL NAME]. Registered office: [REGISTERED OFFICE]. RCS/SIREN: [●].',
        ],
    },
];

const FranceCookies = () => (
    <LegalDoc
        seoTitle="Cookie and Tracking Technology Policy"
        seoDesc="DPECERT Cookie and Tracking Technology Policy — how cookies and tracking technologies are used on www.dpecert.fr"
        canonical="/cookie-policy"
        badge="Cookies"
        title="Cookie and Tracking Technology Policy"
        subtitle="Effective date: 28 August 2026 — Website: www.dpecert.fr"
        callout={{
            title: 'At a glance',
            text: 'DPECERT uses strictly necessary technologies to operate the Platform. Other analytics, advertising, profiling or similar technologies are used only where the law requires consent and after valid consent has been obtained.',
        }}
        sections={sections}
    />
);

export default FranceCookies;
