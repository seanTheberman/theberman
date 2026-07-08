export const PHONE_FORMATS: Record<string, { countryCode: string; placeholder: string; whatsappPlaceholder: string; example: string }> = {
    spain: {
        countryCode: '+34',
        placeholder: '+34 612 345 678',
        whatsappPlaceholder: '+34 612 345 678',
        example: '612 345 678',
    },
    england: {
        countryCode: '+44',
        placeholder: '+44 20 7946 0958',
        whatsappPlaceholder: '+44 7700 900123',
        example: '7700 900123',
    },
    france: {
        countryCode: '+33',
        placeholder: '+33 1 23 45 67 89',
        whatsappPlaceholder: '+33 6 12 34 56 78',
        example: '6 12 34 56 78',
    },
    portugal: {
        countryCode: '+351',
        placeholder: '+351 912 345 678',
        whatsappPlaceholder: '+351 912 345 678',
        example: '912 345 678',
    },
    ireland: {
        countryCode: '+353',
        placeholder: '+353 87 123 4567',
        whatsappPlaceholder: '+353 87 123 4567',
        example: '087 123 4567',
    },
};

export function getPhoneFormat(tenant: string) {
    return PHONE_FORMATS[tenant] || PHONE_FORMATS.ireland;
}

export function getPhonePlaceholder(tenant: string): string {
    return getPhoneFormat(tenant).placeholder;
}

export function getWhatsAppPlaceholder(tenant: string): string {
    return getPhoneFormat(tenant).whatsappPlaceholder;
}

export function getCountryCode(tenant: string): string {
    return getPhoneFormat(tenant).countryCode;
}

export function getPhoneExample(tenant: string): string {
    return getPhoneFormat(tenant).example;
}
