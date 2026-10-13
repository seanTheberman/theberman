import { Link } from 'react-router-dom';
import LegalDoc from '../../components/legal/LegalDoc';
import type { LegalSection } from '../../components/legal/LegalDoc';
import { getTenantFromDomain } from '../../lib/tenant';
import NotFound from '../NotFound';

const sections: LegalSection[] = [
    {
        heading: 'Article 1 — Purpose and Scope',
        paragraphs: [
            '1.1. These general terms and conditions (the "T&Cs") govern access to and use of the Platform and the DPECERT Service described in Article 4.',
            '1.2. They apply to Users acting as consumers or non-professionals. [Professionals wishing to order a diagnostic for the purposes of their business are subject to separate terms, available on request.]',
            '1.3. The T&Cs do not govern the DPE Service Contract concluded between the User and the Surveyor. That contract is subject to the Surveyor\'s terms, provided before any Booking, and to mandatory legal provisions. For your information, however, the T&Cs describe the framework within which that contract is concluded through the Platform.',
            '1.4. The User accepts the T&Cs by ticking the box provided for that purpose when creating an Account and before any Booking. The T&Cs are available on the Platform at all times and may be downloaded and printed. They are attached to the confirmation email for each Booking.',
            '1.5. The T&Cs are supplemented by the Payment, Cancellation and Refund Policy, the Privacy and Data Protection Policy, the Cookie and Tracking Technology Policy and the Legal Notice (Mentions légales), all accessible from every page of the Platform. If those documents conflict with the T&Cs, the provision most favourable to the User applies.',
        ],
    },
    {
        heading: 'Article 2 — Definitions',
        paragraphs: ['In the T&Cs, the following terms have the meanings set out below:'],
        bullets: [
            'Account: the User\'s personal area on the Platform.',
            'Booking: an appointment request confirmed in accordance with Article 7.',
            'DPE Service: the energy performance diagnostic (diagnostic de performance énergétique, "DPE") and any related regulated professional service, carried out by the Surveyor.',
            'DPE Service Contract: the contract concluded directly between the User and the Surveyor for the performance of the DPE Service.',
            'DPECERT Service: the intermediation and booking-management service described in Article 4.',
            'Payment Service Provider: the authorised payment service provider used by DPECERT to collect the Platform Fee.',
            'Platform: the website www.dpecert.fr and any related online service.',
            'Platform Fee: the price of the DPECERT Service paid by the User to DPECERT.',
            'Professional DPE Price: the professional price of the DPE Service, set or determined by the Surveyor and paid directly to the Surveyor.',
            'Surveyor: the independent professional (diagnostiqueur), whether an individual or a legal entity, certified to perform the DPE Service and listed on the Platform.',
        ],
    },
    {
        heading: 'Article 3 — Who Operates the Platform?',
        paragraphs: [
            '3.1. The Platform is operated by [COMPANY NAME], [legal form] with share capital of [●], registered with the [registry] under number [●], whose registered office is at [address], intra-EU VAT number [●] ("DPECERT").',
            '3.2. Customer service: [email address] — [contact form] — [telephone number, call cost] — [days and hours].',
            '3.3. The publication director and the Platform host are identified in the Legal Notice (Mentions légales).',
        ],
    },
    {
        heading: 'Article 4 — DPECERT\'s Role: an Intermediary',
        paragraphs: [
            '4.1. DPECERT is an online platform operator within the meaning of Article L. 111-7 of the French Consumer Code. It connects Users with independent Surveyors.',
            '4.2. The DPECERT Service includes:',
        ],
        bullets: [
            'presentation of Surveyors and their offers;',
            'a search and comparison tool;',
            'transmission of your request to the chosen Surveyor and reservation of a time slot according to the availability the Surveyor has declared;',
            'confirmation of the Booking and sending of relevant notifications;',
            'a messaging service between you and the Surveyor [where applicable];',
            'collection of the Platform Fee through the Payment Service Provider;',
            'the online withdrawal function (Article 10);',
            'the checks described in Article 5.3;',
            'a customer service for any question about the Platform.',
        ],
    },
    {
        heading: '',
        paragraphs: [
            '4.3. DPECERT does not perform any DPE Service. In particular, DPECERT does not carry out any visit, survey, measurement or calculation. DPECERT does not determine the energy or climate rating, does not draft the report, does not submit it to ADEME and does not give any technical advice. DPECERT does not set the Professional DPE Price and can neither request nor influence any result.',
            '4.4. The DPE Service Contract is concluded directly between you and the Surveyor. DPECERT is not a party to that contract and does not act as your agent.',
            '4.5. Surveyors act entirely independently. There is no relationship of employment, agency or partnership between them and DPECERT. DPECERT receives no remuneration from Surveyors. DPECERT\'s remuneration for the DPECERT Service consists of the Platform Fee.',
            '4.6. You remain free to use the Surveyor of your choice in future, either directly or through the Platform.',
        ],
    },
    {
        heading: 'Article 5 — Information on How the Platform Works',
        paragraphs: [
            'The information in this Article is also available, without creating an Account, from the "How DPECERT works" section accessible from every page of the Platform.',
            '5.1. Status of providers. Only professionals carrying on business as property surveyors (diagnostiqueurs immobiliers) may offer their services on the Platform. No private individual may post an offer.',
            '5.2. Information displayed for each Surveyor. Before any Booking, the Surveyor\'s profile shows in particular:',
        ],
        bullets: [
            'the Surveyor\'s name or company name, legal form, address, SIREN number and contact details;',
            'the body that issued the Surveyor\'s certification, and the number, scope and expiry date of that certification;',
            'the insurer of the Surveyor\'s professional liability;',
            'the Professional DPE Price including all taxes (or a statement that the Surveyor is not subject to VAT), and payment terms;',
            'the Surveyor\'s own cancellation terms;',
            'the consumer mediator to which the Surveyor belongs;',
            'the Surveyor\'s service area and availability.',
        ],
    },
    {
        heading: '',
        paragraphs: [
            'This information is supplied by the Surveyor, who warrants its accuracy.',
            '5.3. Checks carried out by DPECERT. Before listing a Surveyor, and thereafter [at each certification or insurance renewal date and at least once a year], DPECERT checks proof of identity, registration, certification and insurance. Where possible, DPECERT consults the official directory of certified property surveyors. If a document is missing, expired or inconsistent, DPECERT suspends the Surveyor\'s profile. These checks are carried out with due diligence. They do not constitute certification or a guarantee of the quality of the DPE Service. You can check a Surveyor\'s certification yourself in the official directory.',
            '5.4. Ranking of offers. The Surveyors shown in response to your search are selected and ranked according to the following main parameters, in decreasing order of importance: [1) coverage of the property address by the service area, and geographical proximity; 2) match between the certification scope and the requested DPE Service; 3) availability for the requested time slot; 4) the Surveyor\'s reliability, assessed in particular by response time, acceptances, cancellations and completed services; 5) User reviews; 6) the Professional DPE Price, where you choose to sort by price]. Only Surveyors whose certification and insurance have been verified are shown. You can change the ranking using the filters and sorting options provided. When DPECERT changes these parameters, this section is updated.',
            '5.5. Price of the DPECERT Service. The Platform Fee is [●] € including VAT per Booking [or: calculation method]. DPECERT charges no other fees.',
            '5.6. Payment. The Platform Fee is collected by DPECERT through the Payment Service Provider. The Professional DPE Price is paid directly to the Surveyor; DPECERT plays no part in that transaction.',
            '5.7. Insurance and guarantees. DPECERT offers no insurance or guarantee in respect of the DPE Service. The Surveyor is required to hold professional liability insurance.',
            '5.8. Dispute resolution. The dispute resolution arrangements and DPECERT\'s role are described in Articles 19 to 21.',
        ],
    },
    {
        heading: 'Article 6 — Access to the Platform and Account',
        paragraphs: [
            '6.1. Browsing the Platform is free of charge. Internet connection costs are your responsibility.',
            '6.2. An Account is required to make a Booking. Accounts are available only to adult individuals with full legal capacity.',
            '6.3. You agree to provide accurate and up-to-date information. Your login details are personal and confidential. Inform DPECERT promptly of any unauthorised use of your Account.',
            '6.4. You may delete your Account at any time, free of charge and without giving reasons, from the [« Mon compte — Supprimer mon compte » ("My account — Delete my account")] section. Deletion does not affect Bookings in progress, which remain subject to Articles 10 to 13.',
            '6.5. DPECERT uses reasonable means to ensure access to the Platform. Access may be interrupted for maintenance, updates or security reasons. Where possible, DPECERT endeavours to inform Users in advance.',
        ],
    },
    {
        heading: 'Article 7 — Booking a Surveyor',
        paragraphs: ['7.1. To make a Booking, you:'],
        bullets: [
            'enter the property details (address, type, floor area, year of construction, use);',
            'review the list of available Surveyors and their profiles;',
            'select a Surveyor and a time slot and, where applicable, review the Surveyor\'s quote;',
            'review the summary, which shows: the Surveyor\'s identity, the main characteristics of the DPE Service, the Professional DPE Price including VAT (or, where it cannot reasonably be calculated in advance, the method of calculation) and payment terms, the Platform Fee including VAT, the total cost, the appointment date, the cancellation terms, the existence of the right of withdrawal and the location of the withdrawal function;',
            'check your Booking and correct any input errors;',
            'accept the T&Cs and the Surveyor\'s terms;',
            'if the appointment is to take place before the end of the withdrawal period, tick the express-request box provided for in Article 10.4;',
            'click the « Commande avec obligation de paiement » ("Order with obligation to pay") button;',
            'pay the Platform Fee.',
        ],
    },
    {
        heading: '',
        paragraphs: [
            '7.2. Your request is sent to the Surveyor, who accepts or declines it. The Booking is confirmed only when (i) the Payment Service Provider has confirmed payment of the Platform Fee and (ii) the Surveyor has accepted the request through the Platform. A declined or pending payment does not constitute confirmation.',
            '7.3. If the Surveyor declines the request or does not respond within [24] hours, no contract is concluded. DPECERT informs you, [cancels the payment authorisation or] refunds the Platform Fee in full, and may suggest another Surveyor.',
            '7.4. On confirmation, the contract for the DPECERT Service is concluded between you and DPECERT, and the DPE Service Contract is concluded between you and the Surveyor.',
            '7.5. You promptly receive a confirmation email containing the summary information, the T&Cs, the Surveyor\'s terms, the withdrawal form and a link to the withdrawal function.',
            '7.6. The information you provide about the property determines the Professional DPE Price and how the visit is conducted. If the Surveyor finds that the information is inaccurate and proposes a different price, the Surveyor must obtain your prior agreement. If you do not agree, you may cancel the Booking at no cost and the Platform Fee is refunded to you.',
        ],
    },
    {
        heading: 'Article 8 — Prices',
        paragraphs: [
            '8.1. Professional DPE Price. The Surveyor sets the Professional DPE Price freely. Before any Booking, that price is provided to you including all taxes (or with a statement that the Surveyor is not subject to VAT), travel costs included, in the form of a displayed price or a quote. Where the price cannot reasonably be calculated in advance, you are told how it will be calculated. DPECERT neither sets nor alters that price.',
            '8.2. Platform Fee. The Platform Fee is the price of the DPECERT Service. It is displayed separately, including all taxes, before any Booking. It is neither an advance payment (acompte) nor a deposit (arrhes) towards the Professional DPE Price, and it does not remunerate the Surveyor.',
            '8.3. Total cost. The summary shows the total cost of the Booking: the Professional DPE Price (or its method of calculation) and the Platform Fee.',
            '8.4. The applicable prices are those displayed when the Booking is confirmed. No charge that is not shown in the summary may be claimed from you.',
        ],
    },
    {
        heading: 'Article 9 — Payment',
        paragraphs: [
            '9.1. The Platform Fee is payable online at the time of Booking, by [bank card / other means], through [NAME OF PAYMENT SERVICE PROVIDER], [authorisation status and supervisory authority].',
            '9.2. Your payment data is processed by the Payment Service Provider. DPECERT has no access to it. Payment may require strong customer authentication.',
            '9.3. The Professional DPE Price is paid directly to the Surveyor, according to the terms shown on the Surveyor\'s profile and in the summary. DPECERT never collects, holds or transfers the Professional DPE Price.',
            '9.4. Warning. DPECERT will never ask you to pay it the Professional DPE Price, or to pay into any account other than the Surveyor\'s account shown on the Surveyor\'s invoice. Please report any such request to us.',
            '9.5. DPECERT issues you an invoice for the Platform Fee. The Surveyor issues you its own invoice for the DPE Service.',
            '9.6. DPECERT or the Payment Service Provider may review, suspend or decline a transaction, or delay the confirmation or transmission of a Booking for as long as strictly necessary to carry out a check, where there are reasonable grounds to suspect fraud, identity theft, unlawful use, abuse of payment disputes (chargebacks) or a security risk. You will be informed. These measures do not affect your statutory rights, including your right to dispute a payment transaction.',
        ],
    },
    {
        heading: 'Article 10 — Right of Withdrawal',
        paragraphs: [
            '10.1. Principle. You have fourteen (14) days from confirmation of the Booking to withdraw from the DPECERT Service and from the DPE Service Contract, without giving any reason and without bearing any costs other than those provided for in Article 10.6.',
            '10.2. How to withdraw. You may exercise your right of withdrawal before the period expires:',
        ],
        bullets: [
            'online and free of charge, using the « Renoncer au contrat ici » ("Withdraw from the contract here") function, available throughout the withdrawal period from [your Account, the Booking page and the link in the confirmation email]. Once you have validated your declaration using the « Confirmer la rétractation » ("Confirm withdrawal") button, you receive an acknowledgement on a durable medium stating the content of your declaration and the date and time it was sent;',
            'by sending the form in Annex 1;',
            'by any other unequivocal statement sent to [email address] or [postal address].',
        ],
    },
    {
        heading: '',
        paragraphs: [
            '10.3. Scope. Unless you state otherwise, your withdrawal applies to both the DPECERT Service and the DPE Service Contract. DPECERT forwards it to the Surveyor without delay. If you withdraw only from the DPE Service Contract before the appointment, DPECERT also refunds the Platform Fee.',
            '10.4. Appointment before the end of the withdrawal period. If you want the DPE Service to take place before the end of the withdrawal period, you must expressly request this by ticking a separate box when making the Booking. You then acknowledge that you will lose your right of withdrawal once the DPE Service has been fully performed. Without that request, no appointment can be set before the end of the period.',
            '10.5. Consequences for the Platform Fee. If you withdraw before the date of the DPE Service, DPECERT refunds the Platform Fee in full. Where the DPE Service has been fully performed before the end of the withdrawal period, following your express request and your acknowledgement that you would lose this right, the right of withdrawal can no longer be exercised, either for the DPE Service Contract or for the DPECERT Service (Article L. 221-28, 1° of the French Consumer Code).',
            '10.6. Consequences for the Professional DPE Price. If you withdraw after the DPE Service has begun at your express request, the Surveyor may ask you to pay an amount proportionate to the service provided up to the time you communicated your decision, under the conditions of Article L. 221-25 of the French Consumer Code. No amount is payable if those conditions are not met.',
            '10.7. Refund. DPECERT refunds the Platform Fee no later than fourteen (14) days after being informed of your decision, using the payment method used for the Booking, unless you agree to another method at no cost to you. Within the same period, the Surveyor refunds any amount you paid that is not owed to the Surveyor.',
        ],
    },
    {
        heading: 'Article 11 — Changes and Cancellation by the User',
        paragraphs: [
            'This Article applies outside the exercise of the right of withdrawal.',
            '11.1. Changes. You may change the time slot free of charge from your Account up to [48] hours before the appointment, subject to the Surveyor\'s availability.',
            '11.2. Cancellation.',
        ],
        bullets: [
            'Cancellation up to [48] hours before the appointment: the Platform Fee is refunded in full.',
            'Cancellation less than [48] hours before the appointment, failure to attend the appointment, or inability to access the property for reasons attributable to you: since the DPECERT Service has been provided, DPECERT retains the Platform Fee.',
        ],
    },
    {
        heading: '',
        paragraphs: ['11.3. The consequences of cancellation for the Professional DPE Price are governed by the Surveyor\'s terms, provided to you before the Booking.'],
    },
    {
        heading: 'Article 12 — Cancellation by DPECERT or Surveyor Default',
        paragraphs: [
            '12.1. Cancellation by DPECERT. If DPECERT cancels a confirmed Booking for a reason that is not attributable to you and is neither force majeure nor a Surveyor default, DPECERT refunds the Platform Fee in full and pays you compensation of an equal amount.',
            '12.2. Surveyor default. If the Surveyor cancels the appointment, fails to attend, arrives more than [60] minutes late without your agreement, or can no longer practise (in particular if the Surveyor\'s certification is suspended), DPECERT informs you as soon as it becomes aware. You may then choose:',
        ],
        bullets: [
            'another Surveyor proposed by DPECERT, with no new Platform Fee; the new Surveyor\'s Professional DPE Price is shown to you before any confirmation; or',
            'cancellation of the Booking, with a full refund of the Platform Fee.',
        ],
    },
    {
        heading: '',
        paragraphs: ['12.3. If you have paid all or part of the Professional DPE Price to the defaulting Surveyor, the Surveyor must refund it. DPECERT assists you in this (Article 20). You retain all your rights against the Surveyor.'],
    },
    {
        heading: 'Article 13 — Refunds',
        paragraphs: [
            '13.1. Unless a shorter statutory period applies, DPECERT refunds any Platform Fee due no later than fourteen (14) days after the event giving rise to the refund, using the original payment method, unless you agree to another method at no cost to you.',
            '13.2. As DPECERT does not collect the Professional DPE Price, any refund of it is the Surveyor\'s responsibility.',
            '13.3. Nothing in the T&Cs deprives the User of any right to a refund provided by law.',
        ],
    },
    {
        heading: 'Article 14 — User Obligations',
        paragraphs: ['14.1. You agree:'],
        bullets: [
            'to use the Platform in accordance with the law and the T&Cs;',
            'to provide accurate information about the property and your capacity (owner, or person duly authorised by the owner);',
            'to give the Surveyor access to the whole property on the day of the appointment and to provide the documents reasonably required for the DPE Service;',
            'to be present or represented at the appointment;',
            'not to request or seek to obtain a particular rating or result, and not to put any pressure on the Surveyor;',
            'to treat the Surveyor with respect and ensure the Surveyor\'s safety during the visit;',
            'not to publish any unlawful or misleading content, including fake reviews;',
            'not to make fictitious Bookings, or fraudulently use a payment dispute procedure, in particular to obtain a double refund;',
            'not to interfere with the operation or security of the Platform (automated extraction, intrusion, malicious code).',
        ],
    },
    {
        heading: '',
        paragraphs: ['14.2. Any breach may lead to the measures set out in Article 24.'],
    },
    {
        heading: 'Article 15 — Surveyor Commitments',
        paragraphs: ['For your information, each Surveyor has undertaken to DPECERT:'],
        bullets: [
            'to hold a valid certification covering the DPE Service offered;',
            'to hold professional liability insurance;',
            'to comply with the independence and impartiality requirements of Article L. 271-6 of the French Construction and Housing Code (Code de la construction et de l\'habitation);',
            'to perform the DPE Service in accordance with the regulations, submit it to ADEME where required, and provide you with the report bearing its identification number;',
            'to provide you with the legally required information before the DPE Service Contract is concluded;',
            'to honour confirmed Bookings and respect your withdrawal;',
            'to inform DPECERT promptly of any event affecting its certification or insurance.',
        ],
    },
    {
        heading: '',
        paragraphs: ['These commitments bind the Surveyor. They do not constitute a guarantee by DPECERT of the quality of the DPE Service.'],
    },
    {
        heading: 'Article 16 — Liability',
        paragraphs: [
            '16.1. Surveyor liability. The Surveyor is solely responsible for the DPE Service: its performance, content and accuracy, the rating assigned, the recommendations, submission to ADEME and compliance with deadlines. Any claim in that respect is to be made against the Surveyor and, where applicable, the Surveyor\'s insurer.',
            '16.2. DPECERT liability. DPECERT is responsible for the proper performance of the DPECERT Service, in accordance with general law and the mandatory provisions of the French Consumer Code. This covers in particular: the accuracy of information DPECERT publishes on its own initiative, the diligent performance of the checks described in Article 5.3, the handling of the Platform Fee, the operation of the withdrawal function and the protection of your personal data.',
            '16.3. As DPECERT is not a party to the DPE Service Contract, DPECERT is not responsible for its performance and is not liable for the Surveyor\'s professional faults, unless the damage results from DPECERT\'s breach of its own obligations.',
            '16.4. Profile information is supplied by Surveyors. When DPECERT becomes aware of inaccurate information, it has it corrected or suspends the relevant profile without delay.',
            '16.5. DPECERT is not liable where the failure is attributable to the User, to the unforeseeable and insurmountable act of a third party unconnected with the provision of the DPECERT Service, or to force majeure.',
            '16.6. With regard to the technical availability of the Platform, DPECERT is under an obligation of means (best endeavours).',
            '16.7. Nothing in the T&Cs is intended to, or has the effect of, removing or reducing your right to compensation if DPECERT breaches any of its obligations, or excluding DPECERT\'s liability for personal injury, gross negligence or wilful misconduct.',
        ],
    },
    {
        heading: 'Article 17 — Online Reviews',
        paragraphs: [
            '17.1. Only Users whose DPE Service has taken place may publish a review of the Surveyor concerned, within [●] months after the appointment. DPECERT verifies that the corresponding Booking exists before publication.',
            '17.2. Reviews are published [within ● days], with their date and rating, [in chronological order]. They remain online for [●]. No incentive is offered for a review. Negative reviews are not excluded because they are negative.',
            '17.3. The Surveyor may respond publicly to a review.',
            '17.4. DPECERT may refuse or remove a review that is unlawful, abusive, defamatory, unrelated to the DPE Service, contains third parties\' personal data, or is written with a conflict of interest. The author is informed of the refusal or removal and the reason for it.',
        ],
    },
    {
        heading: 'Article 18 — Content, Notices and Moderation',
        paragraphs: [
            '18.1. Your content. You grant DPECERT, free of charge and on a non-exclusive basis, the right to host, reproduce and display your reviews and messages on the Platform, solely for the purposes of its operation and for as long as they are published.',
            '18.2. Prohibited content. Content that is unlawful, defamatory, abusive, discriminatory, misleading, promotional or infringes third-party rights is prohibited.',
            '18.3. Reporting content. Anyone may report content they consider unlawful using [the "Report" link on each item of content] or by writing to [email address]. The notice states the reasons, the exact location of the content, the name and email address of the person reporting it (save for exceptions provided by law) and a statement of good faith. DPECERT acknowledges receipt and informs the person reporting of its decision.',
            '18.4. Moderation decisions. DPECERT may remove content, restrict its visibility or suspend an Account. Every decision states its reasons and the available means of redress. [DPECERT does not use automated moderation tools.] The automated tools used to present or suggest Surveyors (Article 5.4) do not give rise to any decision based solely on automated processing that produces legal effects concerning you or similarly significantly affects you, except in the cases and with the safeguards provided for by the GDPR.',
            '18.5. Challenging a decision. You may challenge a moderation decision free of charge within six (6) months of being notified of it, at [email address / form]. Your complaint is reviewed by a person within a reasonable time. You retain the right to go to court.',
            '18.6. The Account of a User who frequently publishes manifestly unlawful content, or frequently submits manifestly unfounded notices, may be suspended for a reasonable period after prior warning.',
        ],
    },
    {
        heading: 'Article 19 — Complaints',
        paragraphs: [
            '19.1. DPECERT Service. Any complaint about the DPECERT Service may be sent to [email address / form / postal address]. DPECERT acknowledges receipt within [●] business days and responds within [●] days.',
            '19.2. DPE Service. Any complaint about the DPE Service must first be sent to the Surveyor, whose contact details are in the confirmation email. This does not affect your rights against DPECERT.',
            '19.3. Where a complaint concerns both the DPECERT Service and the DPE Service, DPECERT and the Surveyor cooperate to handle it, each within the limits of its own responsibilities.',
        ],
    },
    {
        heading: 'Article 20 — Disputes with a Surveyor: DPECERT\'s Role',
        paragraphs: [
            '20.1. A dispute about the DPE Service is between the User and the Surveyor. DPECERT is neither judge nor arbitrator of that dispute and makes no decision binding on the parties.',
            '20.2. At your request, DPECERT may nevertheless: forward your complaint to the Surveyor; provide you with the information it holds about the Booking (date, confirmation, payment of the Platform Fee); remind the Surveyor of its commitments; suspend the Surveyor\'s profile in the event of a serious breach; and suggest another Surveyor.',
            '20.3. This assistance does not constitute an admission of liability by DPECERT or the Surveyor.',
            '20.4. For a dispute about the DPE Service, you may refer the matter to the consumer mediator to which the Surveyor belongs (shown on its profile), report the facts to the body that certified the Surveyor or to the DGCCRF (via SignalConso), or bring proceedings before the competent court.',
        ],
    },
    {
        heading: 'Article 21 — Consumer Mediation',
        paragraphs: [
            '21.1. If your written complaint to DPECERT has not been resolved, you may refer the matter free of charge to the consumer mediator to which DPECERT belongs: [NAME OF MEDIATOR], [postal address], [website].',
            '21.2. The referral must be made within one year of your written complaint to DPECERT.',
            '21.3. Mediation is optional. It is not a mandatory step before going to court.',
        ],
    },
    {
        heading: 'Article 22 — Intellectual Property',
        paragraphs: [
            '22.1. The Platform and its components (trade marks, logos, text, graphics, software, databases) are protected. DPECERT grants you a personal, non-exclusive and non-transferable right to use them solely for the purposes of the DPECERT Service.',
            '22.2. Any unauthorised reproduction, extraction or re-use, including extraction of all or a substantial part of the databases, is prohibited.',
            '22.3. The DPE report is provided by the Surveyor; you may use it for all purposes permitted by the regulations.',
        ],
    },
    {
        heading: 'Article 23 — Personal Data and Cookies',
        paragraphs: [
            '23.1. DPECERT processes your personal data as a data controller, as described in the Privacy and Data Protection Policy.',
            '23.2. DPECERT provides the chosen Surveyor only with the data reasonably necessary to identify you, arrange the appointment, communicate with you and perform the DPE Service. The Surveyor processes that data under its own responsibility, in particular to prepare the DPE and submit it to ADEME where the regulations require.',
            '23.3. Subject to the conditions laid down by law, you have rights of access, rectification, erasure, restriction, objection and portability. You may withdraw any consent at any time and object at any time to direct marketing. These rights may be exercised at [data protection email address]; DPECERT may verify your identity before acting on a request. You may lodge a complaint with the CNIL.',
            '23.4. Cookies and other tracking technologies are described in the Cookie and Tracking Technology Policy. Trackers that are not strictly necessary are activated only with your consent, which you may change or withdraw at any time through the cookie settings tool.',
        ],
    },
    {
        heading: 'Article 24 — Suspension and Termination',
        paragraphs: [
            '24.1. By the User. You may delete your Account at any time (Article 6.4).',
            '24.2. By DPECERT, without fault. DPECERT may close your Account on [thirty (30)] days\' notice sent by email. Confirmed Bookings are honoured or, failing that, the Platform Fee is refunded and Article 12.1 applies.',
            '24.3. For breach. In the event of a serious breach of the T&Cs (fraud, false information, fictitious Bookings, threatening behaviour towards a Surveyor, attempts to obtain a particular result, unlawful content), DPECERT may suspend your Account after a formal notice that has remained unheeded for [eight (8)] days. Suspension may be immediate in an emergency or where the seriousness of the breach requires it. The decision states its reasons and may be challenged under Article 18.5. Platform Fees for Bookings not performed are refunded, without prejudice to any damages.',
        ],
    },
    {
        heading: 'Article 25 — Force Majeure',
        paragraphs: [
            '25.1. Neither party is liable for a failure caused by an event of force majeure within the meaning of Article 1218 of the French Civil Code (Code civil).',
            '25.2. If the impediment lasts more than [thirty (30)] days, either party may terminate the Booking concerned. Platform Fees for any service not provided are refunded.',
        ],
    },
    {
        heading: 'Article 26 — Changes to the T&Cs',
        paragraphs: [
            '26.1. DPECERT may amend the T&Cs to reflect legal or regulatory changes, security requirements or changes to the Platform. An amendment cannot alter the essential characteristics or price of a Booking already confirmed.',
            '26.2. You will be informed by email and on the Platform at least [thirty (30)] days before the amendment takes effect, unless a legal obligation requires a shorter period.',
            '26.3. If you do not accept the amendment, you may delete your Account free of charge before it takes effect. The new T&Cs will be submitted to you for acceptance when you make your next Booking.',
            '26.4. Each Booking remains governed by the version of the T&Cs accepted when it was confirmed.',
        ],
    },
    {
        heading: 'Article 27 — Miscellaneous',
        paragraphs: [
            '27.1. Language. The T&Cs are drafted in French. This English translation is provided for information only; in the event of any discrepancy, the French version prevails.',
            '27.2. Evidence. Electronic records kept by DPECERT under reasonable security conditions may be produced as evidence of communications and Bookings, unless proven otherwise.',
            '27.3. Archiving. Where the order amount is 120 euros or more, DPECERT keeps the written record of the contract for ten years and guarantees you access to it at any time (Articles L. 213-1 and D. 213-1 of the French Consumer Code).',
            '27.4. Severability. If any provision is declared void or deemed unwritten, the remaining provisions continue to apply.',
            '27.5. No waiver. DPECERT\'s failure to rely on a provision does not constitute a waiver of its right to rely on it later.',
            '27.6. Transfer. DPECERT may transfer the T&Cs to an entity taking over operation of the Platform, provided the transfer does not reduce your rights. You will be informed and may delete your Account free of charge.',
        ],
    },
    {
        heading: 'Article 28 — Governing Law and Jurisdiction',
        paragraphs: [
            '28.1. The T&Cs are governed by French law. This choice does not deprive you of the protection of the mandatory provisions of the law of your country of habitual residence.',
            '28.2. In the event of a dispute, we invite you to contact our customer service first (Article 19). This step is optional.',
            '28.3. You may bring proceedings, at your option, before the court of the place where you lived when the contract was concluded or when the harmful event occurred, or before any other court having jurisdiction under the law.',
        ],
    },
    {
        heading: 'Annex 1 — Withdrawal Form',
        paragraphs: ['[Insert the model form annexed to Article R. 221-3 of the French Consumer Code, in the version in force on the date of publication (as amended by Decree No. 2026-3 of 5 January 2026), completed with DPECERT\'s name, postal address and email address.]'],
    },
];

const FranceTermsEnglish = () => {
    const tenant = getTenantFromDomain();
    if (tenant !== 'france') return <NotFound />;

    return (
        <LegalDoc
            seoTitle="Terms and Conditions (English Translation)"
            seoDesc="English translation of the DPECERT General Terms and Conditions — provided for information only. The French version prevails."
            canonical="/terms-english"
            badge="T&Cs"
            title="General Terms and Conditions of Use and Service of the DPECERT Platform"
            subtitle="Version in force — Website: www.dpecert.fr"
            notice={
                <>
                    <strong>English translation provided for information only.</strong> The French version
                    (Conditions générales d'utilisation et de service) is the binding version; in the event of
                    any discrepancy, the French version prevails.{' '}
                    <Link to="/terms" className="font-bold underline hover:text-blue-700">Consulter la version française</Link>.
                </>
            }
            callout={{
                title: 'Key points at a glance',
                bullets: [
                    'DPECERT is an intermediation platform. DPECERT does not carry out diagnostics: every energy performance diagnostic (DPE) is carried out by the independent Surveyor you choose, under that Surveyor\'s sole professional responsibility.',
                    'You enter into two separate contracts: one with DPECERT for the platform service, and one with the Surveyor for the diagnostic.',
                    'You pay DPECERT a Platform Fee online. The price of the diagnostic is paid directly to the Surveyor. DPECERT never collects it.',
                    'You have a 14-day right of withdrawal, which you can exercise online using the « Renoncer au contrat ici » ("Withdraw from the contract here") button (Article 10).',
                    'If you have a problem, contact our customer service; you may then refer the matter, free of charge, to a consumer mediator (Articles 19 to 21).',
                ],
                text: 'This summary does not replace the Articles below, which alone are authoritative.',
            }}
            sections={sections}
        />
    );
};

export default FranceTermsEnglish;
