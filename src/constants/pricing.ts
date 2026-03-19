
export const REGISTRATION_PRICES = {
    DOMESTIC_ASSESSOR: 0,
    COMMERCIAL_ASSESSOR: 0,
    BUNDLE_ASSESSOR: 0,
    BUSINESS_REGISTRATION: 250,
} as const;

export const VAT_RATE = 0.23;

export type RegistrationType = keyof typeof REGISTRATION_PRICES;
