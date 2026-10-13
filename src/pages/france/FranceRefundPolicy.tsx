import LegalDoc from '../../components/legal/LegalDoc';
import type { LegalSection } from '../../components/legal/LegalDoc';
import { getTenantFromDomain } from '../../lib/tenant';
import NotFound from '../NotFound';

const sections: LegalSection[] = [
    {
        heading: '1. Role of DPECERT and the Surveyor',
        paragraphs: [
            'DPECERT operates an online intermediation platform. It helps Customers identify, select and engage independent professional surveyors or diagnostiqueurs.',
            'DPECERT provides the Platform service: intermediation, booking and related administrative support. The Surveyor provides the regulated professional DPE service.',
            'The Customer therefore enters into two distinct relationships: a Platform relationship with DPECERT and a professional-service relationship with the selected Surveyor. DPECERT does not perform, certify, validate or determine the technical DPE.',
        ],
    },
    {
        heading: '2. Two Separate Prices',
        paragraphs: [
            'The Customer’s payment obligations are kept separate.',
            'DPECERT may charge a Platform Fee for its own intermediation, booking and administrative service. The Platform Fee is DPECERT’s remuneration and is not the professional price of the DPE.',
            'The Surveyor independently quotes and charges the Professional DPE Price. Unless a separate lawful payment structure is expressly introduced, that professional price is paid directly between the Customer and the Surveyor.',
            'Neither the Platform Fee nor the Professional DPE Price should be described in a way that suggests DPECERT itself is supplying the regulated DPE.',
        ],
    },
    {
        heading: '3. Information Before Payment',
        paragraphs: ['Before the Customer becomes bound by a booking, DPECERT will present the information required by applicable law and the customer journey, including:'],
        bullets: [
            'the identity of DPECERT and the relevant Surveyor;',
            'the nature and principal characteristics of the Platform service and the professional service;',
            'the applicable Platform Fee and the Professional DPE Price or the basis on which the latter is determined;',
            'applicable taxes and mandatory charges;',
            'payment arrangements;',
            'cancellation terms and statutory withdrawal rights; and',
            'the identity of the party responsible for each service.',
        ],
    },
    {
        heading: '4. Payment Processing',
        paragraphs: [
            'DPECERT may use an authorised payment-service provider for the Platform Fee and other payments that DPECERT is lawfully entitled to process.',
            'DPECERT will not knowingly provide a regulated payment service requiring authorisation unless it holds the required authorisation, exemption or authorised-provider arrangement.',
            'Payment providers may authenticate transactions, process payments, perform fraud and compliance checks, settle funds and process lawful refunds.',
        ],
    },
    {
        heading: '5. Booking Confirmation',
        paragraphs: [
            'A booking is confirmed only when the applicable payment process has successfully completed and the booking has been accepted through the Platform.',
            'A pending, declined or unsuccessful transaction does not by itself create a confirmed booking.',
            'DPECERT may delay or decline a transaction where reasonably necessary to address suspected fraud, unlawful use, security risk or payment-provider requirements.',
        ],
    },
    {
        heading: '6. Right of Withdrawal',
        paragraphs: [
            'Where a distance contract falls within the French statutory withdrawal regime and no statutory exception applies, the consumer generally has a 14-day withdrawal period beginning on conclusion of the service contract.',
            'Where the Customer requests performance before expiry of that period, the legally required express request and acknowledgements must be obtained separately from general acceptance of terms.',
            'Where a service has begun following a valid express request and the Customer withdraws, the Customer may owe the proportionate amount for the service actually supplied, where the statutory conditions are satisfied.',
            'Where the relevant service has been fully performed following the required express request and acknowledgement, the right of withdrawal may cease where the statutory conditions are satisfied. The Platform and Surveyor must not represent that a statutory right has been lost unless the legal conditions have actually been met.',
        ],
    },
    {
        heading: '7. Cancellation and Refunds',
        paragraphs: [
            'After any applicable statutory withdrawal period, cancellation is governed by the terms disclosed before booking, subject always to mandatory consumer law and the prohibition of unfair terms.',
            'Where DPECERT is legally required to refund a Platform Fee, it will arrange the refund without undue delay and within the statutory period.',
            'Unless another lawful method is agreed without imposing a cost on the Customer, refunds will ordinarily be made using the same payment method used for the original transaction.',
            'Where a Surveyor cancels a confirmed appointment or fails to provide the contracted professional service for a reason attributable to the Surveyor, the Customer retains all remedies available against the responsible professional and under applicable law. DPECERT may assist in arranging an alternative Surveyor.',
        ],
    },
    {
        heading: '8. Complaints and Mediation',
        paragraphs: [
            'Complaints about the professional DPE should ordinarily be addressed to the Surveyor responsible for that service. Complaints about DPECERT’s Platform service, booking administration or Platform Fee should be addressed to DPECERT.',
            'Where a matter concerns both services, DPECERT and the Surveyor will cooperate reasonably while preserving the distinction between their respective responsibilities.',
            'Where French consumer-mediation rules apply, DPECERT will identify its appointed mediator and provide the information required by law before or at the point required.',
        ],
    },
    {
        heading: '9. Fraud, Chargebacks and Payment Disputes',
        paragraphs: [
            'DPECERT and its payment provider may investigate, suspend or decline transactions where there are reasonable grounds to suspect fraud, identity misuse, unlawful use, chargeback abuse or a security risk.',
            'Nothing in this Policy limits mandatory consumer rights, lawful payment-service rights or remedies that cannot be excluded.',
            'The Customer must not use a chargeback or payment dispute mechanism fraudulently or to obtain a duplicate refund.',
        ],
    },
    {
        heading: '10. Preservation of Mandatory Rights',
        paragraphs: [
            'Nothing in this Policy excludes, limits or waives a statutory right, remedy or protection that cannot lawfully be excluded or restricted under French or European Union law.',
            'If a provision of this Policy conflicts with a mandatory legal rule, the mandatory rule prevails to the extent of the conflict.',
        ],
    },
    {
        heading: '11. Changes and Contact',
        paragraphs: [
            'DPECERT may update this Policy when its services, payment arrangements, technology or legal obligations change. The current version and effective date will be published on the website.',
            'Legal entity: [FULL LEGAL NAME]. Registered office: [REGISTERED OFFICE]. RCS/SIREN: [●]. Contact: [CONTACT EMAIL].',
        ],
    },
];

const FranceRefundPolicy = () => {
    const tenant = getTenantFromDomain();
    if (tenant !== 'france') return <NotFound />;

    return (
        <LegalDoc
            seoTitle="Payment, Cancellation and Refund Policy"
            seoDesc="DPECERT Payment, Cancellation and Refund Policy — how payments, cancellations, withdrawal rights and refunds work on www.dpecert.fr"
            canonical="/refund-policy"
            badge="Refunds"
            title="Payment, Cancellation and Refund Policy"
            subtitle="Effective date: 28 August 2026 — Website: www.dpecert.fr"
            callout={{
                title: 'Purpose',
                text: 'This Policy explains how payments, bookings, cancellations, withdrawal rights and refunds operate when a Customer uses DPECERT. It is designed to keep the Platform service and the Surveyor’s regulated professional service clearly separate.',
            }}
            sections={sections}
        />
    );
};

export default FranceRefundPolicy;
