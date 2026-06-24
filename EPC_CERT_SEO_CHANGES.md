# EPC Cert England — SEO Implementation Plan

All changes below apply to the **England tenant** (`isEngland = tenant === 'england'`) only,
unless noted otherwise. Other tenants (Ireland, Spain, France, Portugal) are unaffected.

---

## Routing Changes (`src/App.tsx`)

| Change | Detail |
|---|---|
| `/faq` redirect | Make tenant-aware: England → `/epc-faq`, others → `/ber-faqs/` |
| Add route `epc-faq` | Render `<FAQ />` component |
| Add route `catalogue/epc-assessors` | Render `<Catalogue />` component |
| Add route `catalogue/epc-businesses` | Render `<Catalogue />` component |

---

## Homepage (`src/pages/Home.tsx`)

**Meta**
- Title: `EPC Certificate England | Domestic & Commercial EPC`
- Description: `Book Accredited EPC Assessments Across England. Fast Domestic and Commercial EPC Certificates with Competitive Pricing and Nationwide Coverage`
- Canonical: `/` (no change)

**Section 1 – Hero**
- H1: `EPC Certificates Across England for Homes & Businesses`
- Sub-heading: `Need an Energy Performance Certificate for a residential or commercial property? EPC Cert helps homeowners, landlords, estate agents, and businesses compare quotes from accredited assessors across England. Arrange a fast EPC assessment, choose a convenient appointment time, and receive a compliant certificate from an accredited assessor.`
- CTA line: `Arrange Your EPC Assessment with Accredited Assessors Across England`
- Benefit 1: `100+ EPC Assessors Across England`
- Benefit 2: `Accredited Domestic & Commercial Assessors`
- Benefit 3: `Flexible Appointment Times Available`

**Section 2 – How It Works**
- H2: `How to Arrange an EPC Assessment in England`
- Step 1 title: `Choose Your EPC Assessment Date`
- Step 1 desc: `Select a convenient date and time for your EPC assessment with an accredited assessor.`
- Step 2 title: `Provide Property Details`
- Step 2 desc: `Enter key details about your residential or commercial property to receive relevant EPC quotes.`
- Step 3 title: `Compare Accredited EPC Quotes`
- Step 3 desc: `Compare quotes from accredited EPC assessors serving your area across England.`
- Step 4 title: `Confirm Your EPC Appointment`
- Step 4 desc: `Select your preferred assessor and book your EPC assessment online in minutes.`

**Section 3 – Why Trust EPC Cert**
- H2: `Why Property Owners Across England Trust EPC Cert`
- Benefit 1 title: `Compare Multiple Quotes and Save`
- Benefit 1 desc: `Compare quotes from accredited EPC assessors and choose the service that best fits your property and budget.`
- Benefit 2 title: `Accredited EPC Assessors Only`
- Benefit 2 desc: `Every assessor is accredited, vetted and qualified to carry out EPC assessments in England.`
- Benefit 3 title: `Local Assessors, National Coverage`
- Benefit 3 desc: `Access a network of accredited EPC assessors serving homeowners, landlords and businesses across England.`
- Benefit 4 title: `Book Your EPC Assessment Online`
- Benefit 4 desc: `Request quotes, compare assessors and confirm your EPC assessment online at a time that suits you.`
- Stat 1 label: `Property Owners Served`
- Stat 2 label: `Accredited EPC Assessors`
- Stat 3 label: `Average Customer Rating`
- Stat 4 label: `Fast Assessment Turnaround Times`

**Section 4 – Reviews**
- Heading: `Trusted by Property Owners Across England`
- Sub: `Based on verified reviews from homeowners, landlords and property professionals.`

**Assessor CTA (between reviews and catalogue)**
- H3: `Join Our Network of Accredited EPC Assessors`
- Sub: `Expand your reach by joining our network of accredited EPC assessors. Receive local assessment opportunities and connect with property owners across England.`
- CTA Button: `Join Now` (no change)

**Section 5 – Catalogue/Partners**
- H2: `Improve Your EPC Rating with Trusted Energy Efficiency Specialists`
- Sub: `Access our curated network of trusted home energy specialists. From solar panel installers to insulation experts, find the right partner to improve your property's energy efficiency and support better EPC performance.`
- Buttons: keep as-is
- Image alt: `Residential EPC assessment showing energy efficiency rating recommendations for a property owner - EPC Cert`

**Section 6 – FAQs**
- Heading: `Frequently Asked Questions` (no change)
- FAQ 1 Q: `What is an EPC Certificate?`
- FAQ 1 A: `An EPC Certificate measures a property's energy efficiency and provides a rating from A to G. It also includes recommendations that may help improve energy performance.`
- FAQ 2 Q: `When Do I Need an EPC Certificate in England?`
- FAQ 2 A: `An EPC is usually required when selling, renting or building a property in England. Property owners and landlords generally need a valid certificate before marketing a property.`
- FAQ 3 Q: `How Much Does an EPC Assessment Cost?`
- FAQ 3 A: `EPC assessment costs vary depending on the property's size, type and location. Comparing quotes from accredited assessors can help you find the most suitable option.`
- FAQ 4 Q: `How Quickly Can I Get an EPC Certificate?`
- FAQ 4 A: `Many EPC assessments can be arranged within a few days. Once the assessment is completed, the certificate is typically issued shortly afterwards.`
- "View All FAQs" link → `/epc-faq`

**Section 7 – Why Choose (NEW SECTION for England)**
- H2: `Why Arrange Your EPC Assessment Through EPC Cert?`
- 6 cards with H3s:
  1. `Compare Multiple EPC Quotes` (💬)
  2. `Fast Assessment` (📅)
  3. `Accredited EPC Assessors` (✅)
  4. `Simple Online Booking` (💻)
  5. `Trusted by Property Owners` (⭐)
  6. `Flexible Appointment Times` (🗓️)

**Section 8 – Locations (England)**
- H2: `EPC Assessments Across England`
- Sub: `Compare quotes from accredited EPC assessors serving homeowners, landlords and businesses across England.`
- H3: `Popular Locations` (show city cards)
- Cities: London, Manchester, Birmingham, Leeds, Liverpool, Bristol, Sheffield, Nottingham, Leicester, Newcastle, Southampton, Oxford
- City URLs: `/epc-assessment-london/` etc.
- CTA: `View All Locations We Cover` → `/locations/`
- Map: Keep

**Section 9 – Newsletter**
- REMOVE for England tenant (hide with `{!isEngland && <section>...</section>}`)

---

## FAQ Page (`src/pages/FAQ.tsx`)

- Canonical: `/epc-faq` (England), `/ber-faqs/` (others)
- Meta title: `EPC Certificate FAQ England | EPC Assessor`
- Meta description: `Find Answers to Common EPC Certificate Questions, Including Costs, Timelines, and Legal`
- H1: `Frequently Asked Questions About EPC Certificates` (England)
- H2: `Frequently Asked Questions About EPC Certificates` (England)
- Breadcrumb: Home → EPC Certificate FAQs → `https://www.epccert.com/epc-faq`
- 6 FAQ items (seeded in DB; the text shown on page comes from DB)

---

## About Page (`src/pages/About.tsx`)

- Meta title: `About EPC Cert | Energy Performance Certificate Experts`
- Meta description: `Learn about EPC Cert, trusted Energy Performance Certificate experts helping property owners across England arrange EPC assessments`
- H1 line1: `Helping Property Owners`
- H1 line2: `Arrange EPC Assessments Across England`
- Hero sub-text: `Expand to homeowners, landlords and businesses`
- Story (3 paragraphs): EPC Cert was established... (see request)
- Stats:
  - `1k+` / `Completed EPC Assessments` (keep)
  - `100+` / `Accredited EPC Assessors Across England`
  - `EPC` / `Level 3 Qualified Energy Assessors` (keep)
- Values:
  - `Professional Service` / `Accredited assessors deliver reliable EPC assessments with clear reporting and efficient turnaround times.`
  - `Accredited Assessors` / `We work with qualified EPC assessors committed to professional standards and impartial assessments.`
  - `Energy Efficiency Focus` / `EPC assessments help property owners understand energy performance and identify improvement opportunities.`
- CTA heading: `Need an EPC Certificate?`
- CTA sub: `Compare quotes from accredited EPC assessors serving homeowners, landlords and businesses across England.`
- CTA button text: `Get a Free Quote` → `/contact-us`

---

## Contact Page (`src/pages/Contact.tsx`)

- Meta title: `Book EPC Assessment England | Contact EPC Cert`
- Meta description: `Book an EPC assessment in England with accredited assessors. Contact EPC Cert to compare quotes and arrange your EPC today`
- H1: `Book an EPC Assessment in England`
- Sub-text: `Compare quotes from accredited EPC assessors across England and arrange your EPC assessment with confidence.`
- Form H2 (form column): `Request an EPC Assessment`
- Textarea placeholder: `Tell us about your property or EPC assessment requirements.`
- Submit button: `Submit Enquiry`

---

## Catalogue (`src/pages/NewCatalogue.tsx`)

**Main page `/catalogue`**
- Meta title: `EPC Assessors Directory England | EPC Cert`
- Meta description: `Browse accredited EPC assessors across England. Search by location, property type and assessment requirements to find qualified professional`
- H1: `England's EPC Assessors Directory`
- Intro para: `The EPC Cert Directory helps homeowners, landlords, estate agents, and businesses connect with accredited EPC assessors across England. Browse professionals providing domestic EPC certificates, commercial EPC assessments, and property energy performance services. Search by location, property type, or assessment requirement to find qualified assessors serving your area.`

**EPC Assessors sub-page `/catalogue/epc-assessors`**
- Meta title: `Find EPC Assessors Across England | EPC Cert`
- Meta description: `Directory of accredited EPC assessors across England covering residential and commercial Energy Performance Certificate assessments`
- H1/H2: `EPC Assessors Across England`

**EPC Businesses sub-page `/catalogue/epc-businesses`**
- Meta title: `Home Energy Professionals England | EPC Cert Directory`
- Meta description: `Connect with home energy professionals across England, including EPC assessors, energy consultants and property energy specialists`
- H1/H2: `Home Energy Service Providers England`

---

## Hire Agent (`src/pages/HireAgent.tsx`)

- Meta title: `Energy Advisor England | Independent Home Energy Advice`
- Meta description: `Receive independent energy advice, upgrade guidance and technical support to help improve your property's energy performance`
- H1: `Independent Energy Advice for Homeowners Across England`
- Sub-text: `Make informed home energy upgrades with EPC expert advice, technical insights, and support tailored to your property's needs.`
- H2: `SPEAK TO AN ENERGY ADVISOR`
- Sub: `Your Energy Advisor works alongside accredited EPC assessors to help you understand upgrade options, compare quotes and make informed decisions for your property.`
- New closing line: `The goal is to provide clear guidance, verified technical input, and access to competitive pricing, ensuring upgrades are completed as smartly and economically as possible.`

---

## Blog (`src/pages/Blog.tsx`)

- Meta title: `EPC Insights & Energy Efficiency Guides England | EPC Cert`
- Meta description: `Explore EPC guides, energy efficiency advice, property energy insights and expert resources to help homeowners, landlords and businesses across England`
- H1: `EPC Insights & Energy Efficiency Guides England`
- Sub-text: `Stay informed with expert insights on Energy Performance Certificates, energy efficiency, property energy ratings and home improvement opportunities across England. Explore practical guides, industry updates and professional advice designed to help homeowners, landlords and businesses make informed property energy decisions.`

---

## News (`src/pages/News.tsx`)

- Meta title: `EPC Regulation Updates England | Industry News & Changes`
- Meta description: `Follow the latest EPC regulation updates, compliance changes, government announcements and industry news across England`
- H1: `EPC Regulation Updates & Industry News England`

---

## Locations (`src/pages/Locations.tsx`)

- Meta title: `EPC Assessors Across England | Service Areas`
- Meta description: `Connect with accredited EPC assessors serving homeowners, landlords and businesses across England. View local service areas and coverage.`
- Canonical: `/locations`
- H1: `EPC Assessors Across England`
- Sub: `Compare quotes from accredited EPC assessors serving homeowners, landlords and businesses across England.`
- City links use slug: `/epc-assessment-[city]/`

---

## Notes

- Facebook/Instagram for EPC Cert: URLs TBC (placeholders used)
- Office address for LocalBusiness schema: TBC
- Core web vitals improvements: follow same pattern as The BER Man (WebP, preload, lazy load)
