
export const REGISTRATION_PRICES = {
    DOMESTIC_ASSESSOR: 250,
    COMMERCIAL_ASSESSOR: 250,
    BUNDLE_ASSESSOR: 350,
    BUSINESS_REGISTRATION: 300,
} as const;

export const VAT_RATE = 0.23;

export type RegistrationType = keyof typeof REGISTRATION_PRICES;
