import LegalDoc from '../../components/legal/LegalDoc';
import type { LegalSection } from '../../components/legal/LegalDoc';

const sections: LegalSection[] = [
    {
        heading: '1. Scope',
        paragraphs: [
            'This Policy explains how DPECERT collects, uses, discloses, retains and protects personal data in connection with www.dpecert.fr and the services operated through it.',
            'DPECERT operates an online intermediation Platform through which Customers may identify and engage independent professional surveyors or diagnostiqueurs. DPECERT does not itself carry out the underlying DPE.',
        ],
    },
    {
        heading: '2. Identity of the Controller',
        paragraphs: [
            'The controller responsible for processing carried out by DPECERT is [DPECERT FULL LEGAL NAME], [LEGAL FORM], having its registered office at [REGISTERED OFFICE], registered with the [RCS] under number [●] and identified by SIREN number [●].',
            'Contact: [EMAIL]. Privacy requests: [PRIVACY EMAIL].',
            'Where another organisation determines the purposes and means of a particular processing operation, that organisation may act as an independent or joint controller where required by law.',
        ],
    },
    {
        heading: '3. Data We Collect',
        paragraphs: ['DPECERT collects only data reasonably necessary for its Platform functions, legal obligations and legitimate operational needs. Depending on the service, this may include:'],
        bullets: [
            'name and contact details;',
            'account and authentication information;',
            'service requests, booking and appointment information;',
            'property or service information needed to arrange the requested appointment;',
            'payment and transaction references, without ordinarily retaining full card details where the payment provider processes them directly;',
            'communications with DPECERT or the selected Surveyor;',
            'technical, device, security and log information;',
            'cookie and tracking information according to the Cookie Policy; and',
            'records required for legal, accounting, fraud-prevention, compliance or dispute-management purposes.',
        ],
    },
    {
        heading: '4. Purposes and Legal Bases',
        paragraphs: [
            'DPECERT processes personal data only for defined and lawful purposes.',
            'When a person creates an account, submits a request or makes a booking, DPECERT uses necessary information to identify the person, communicate with the selected Surveyor, arrange and administer the requested Platform service, issue confirmations, manage changes and cancellations and maintain contractual records. The legal basis is performance of the contract or taking steps requested before entering into a contract, as applicable.',
            'DPECERT uses payment and transaction information to process or confirm Platform payments, administer refunds, maintain accounting records, prevent payment abuse and comply with legal obligations. The applicable legal basis depends on the particular processing.',
            'DPECERT may process information to maintain the security, reliability and functionality of the Platform where necessary for its legitimate interests and where appropriate safeguards are applied.',
            'Consent is used where the law requires it, including for non-essential cookies and certain promotional communications. Consent may be withdrawn at any time.',
        ],
    },
    {
        heading: '5. Sharing Data with the Selected Surveyor',
        paragraphs: [
            'When a Customer requests a professional service through DPECERT, DPECERT may provide the selected Surveyor with personal data reasonably necessary to identify the Customer, arrange the appointment, communicate about the service and perform the requested professional service.',
            'The Surveyor is independently responsible for its own professional-service processing and must comply with applicable data-protection law.',
            'DPECERT will not disclose more personal data than reasonably necessary for the relevant purpose.',
        ],
    },
    {
        heading: '6. Service Providers and Processors',
        paragraphs: [
            'DPECERT may use providers for hosting, cloud infrastructure, cybersecurity, payment processing, communications, customer support, analytics, fraud prevention, accounting and other operational functions.',
            'Where a provider processes personal data on DPECERT’s behalf, DPECERT will implement the contractual protections required by Article 28 GDPR where the provider acts as a processor.',
        ],
    },
    {
        heading: '7. International Transfers',
        paragraphs: ['Where personal data is transferred outside the European Economic Area, DPECERT will rely on a lawful mechanism under Chapter V of the GDPR and implement the safeguards required by law.'],
    },
    {
        heading: '8. Retention',
        paragraphs: [
            'DPECERT retains personal data only for as long as necessary for the relevant purpose or for the period required by law.',
            'Accounting and business records will be retained for applicable statutory periods. Marketing information will be retained only for the period permitted by law.',
            'Where necessary, DPECERT may retain records of objections, withdrawn consent, complaints, disputes, fraud investigations and legal requests to demonstrate compliance and protect its rights.',
        ],
    },
    {
        heading: '9. Promotional Communications',
        paragraphs: [
            'DPECERT distinguishes service communications from promotional communications.',
            'Service communications necessary to administer a booking or provide a requested Platform service may be sent where legally permitted.',
            'Promotional communications will be sent only where a lawful basis exists. Where consent is required, it will be obtained before sending. Every promotional communication will provide a simple means to object or unsubscribe.',
        ],
    },
    {
        heading: '10. Automated Decision-Making and Platform Matching',
        paragraphs: [
            'DPECERT may use operational systems to match or present Surveyors based on factors such as service area, certification scope, availability, response time, reliability, customer requirements and other objectively relevant operational criteria.',
            'DPECERT will not subject an individual to a decision based solely on automated processing that produces legal effects or similarly significant effects unless permitted by the GDPR and the required safeguards are provided.',
            'Where applicable, information concerning ranking or matching is addressed in DPECERT’s Platform terms and business-user documentation.',
        ],
    },
    {
        heading: '11. Security and Data Breaches',
        paragraphs: [
            'DPECERT maintains technical and organisational measures appropriate to the nature of the personal data processed and the risks involved.',
            'If a personal-data breach occurs, DPECERT will assess it and take the measures required by the GDPR, including notification to the supervisory authority and communication to affected individuals where legally required.',
        ],
    },
    {
        heading: '12. Data Subject Rights',
        paragraphs: [
            'Subject to applicable legal conditions and limitations, individuals may request access, rectification, erasure, restriction of processing, objection and portability where applicable.',
            'Individuals may withdraw consent where processing is based on consent and may object at any time to direct marketing.',
            'Requests should be sent to [PRIVACY EMAIL]. DPECERT may need to verify identity before acting on a request.',
        ],
    },
    {
        heading: '13. Complaints',
        paragraphs: [
            'Individuals may raise privacy concerns with DPECERT using [PRIVACY EMAIL].',
            'Individuals also have the right to lodge a complaint with the Commission Nationale de l’Informatique et des Libertés (CNIL) in accordance with the applicable procedure.',
        ],
    },
    {
        heading: '14. Children',
        paragraphs: [
            'DPECERT’s services are intended for adults and are not knowingly directed to children.',
            'DPECERT will not knowingly process a child’s personal data in circumstances where such processing is prohibited by applicable law.',
        ],
    },
    {
        heading: '15. Changes and Contact',
        paragraphs: [
            'DPECERT may amend this Policy where its processing activities, services or legal obligations change. The current version and effective date will be published on the website.',
            'Legal entity: [FULL LEGAL NAME]. Registered office: [REGISTERED OFFICE]. RCS/SIREN: [●]. General contact: [EMAIL]. Privacy contact: [PRIVACY EMAIL].',
        ],
    },
];

const FrancePrivacy = () => (
    <LegalDoc
        seoTitle="Privacy and Data Protection Policy"
        seoDesc="DPECERT Privacy and Data Protection Policy — how personal data is collected, used and protected on www.dpecert.fr"
        canonical="/privacy"
        badge="Privacy"
        title="Privacy and Data Protection Policy"
        subtitle="Effective date: 28 August 2026 — Website: www.dpecert.fr"
        callout={{
            title: 'Privacy commitment',
            text: 'DPECERT collects and uses personal data only for defined, lawful purposes. Data needed to arrange the professional service is shared with the selected Surveyor only to the extent reasonably necessary. DPECERT does not itself perform the underlying diagnostic service.',
        }}
        sections={sections}
    />
);

export default FrancePrivacy;
