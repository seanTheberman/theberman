export interface Lead {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    county?: string;
    town?: string;
    property_type?: string;
    purpose?: string;
}

export interface Profile {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    role: 'admin' | 'contractor' | 'user' | 'homeowner' | 'business';
    is_active?: boolean;
    registration_status?: 'pending' | 'active' | 'rejected';
    subscription_status?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    manual_override_reason?: string;
    phone?: string;
    county?: string;
    home_county?: string;
    town?: string;
    seai_number?: string;
    assessor_type?: string;
    company_name?: string;
    business_address?: string;
    website?: string;
    description?: string;
    company_number?: string;
    vat_number?: string;
    stripe_payment_id?: string;
    is_admin_created?: boolean;
    last_login?: string;
}

export interface Assessment {
    id: string;
    created_at: string;
    property_address: string;
    status: 'draft' | 'submitted' | 'pending' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed' | 'assigned';
    scheduled_date: string | null;
    completed_at?: string | null;
    certificate_url: string | null;
    eircode?: string;
    town?: string;
    county?: string;
    property_type?: string;
    user_id: string;
    contractor_id?: string | null;
    payment_status?: 'unpaid' | 'paid' | 'refunded';
    property_size?: string;
    bedrooms?: number;
    additional_features?: string[];
    heat_pump?: string;
    ber_purpose?: string;
    preferred_date?: string;
    preferred_time?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    profiles?: {
        full_name: string;
        email: string;
        phone: string;
    };
    referred_by_listing_id?: string | null;
    referred_by?: {
        name: string;
        company_name: string;
    } | null;
}

export interface Sponsor {
    id: string;
    name: string;
    headline: string;
    sub_text: string;
    image_url: string;
    destination_url: string;
    is_active: boolean;
}

export interface Payment {
    id: string;
    created_at: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    assessment_id: string;
    user_id: string;
    metadata?: any;
    profiles?: {
        full_name: string;
        email: string;
    };
}

export interface AppSettings {
    id: string;
    default_quote_price: number;
    solar_quote_price: number;
    vat_rate: number;
    company_name: string;
    support_email: string;
    domestic_assessor_price: number;
    commercial_assessor_price: number;
    bundle_assessor_price: number;
    business_registration_price: number;
}

export interface NewsArticle {
    id: string;
    created_at: string;
    published_at: string;
    title: string;
    excerpt: string;
    author: string;
    image_url: string;
    category: string;
    is_live: boolean;
    read_time: string;
}

export interface CatalogueFormData {
    companyName: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    county: string;
    website: string;
    logoUrl: string;
    featured: boolean;
    selectedCategories: string[];
    additionalAddresses: string[];
    companyNumber: string;
    registrationNo: string;
    vatNumber: string;
    bannerUrl: string;
    socialFacebook: string;
    socialInstagram: string;
    socialLinkedin: string;
    socialTwitter: string;
    socialWhatsapp: string;
    socialYoutube: string;
    socialSnapchat: string;
    socialTiktok: string;
    galleryImages: { url: string; description: string }[];
    features: string[];
}

export type AdminView =
    | 'stats'
    | 'leads'
    | 'assessments'
    | 'homeowners'
    | 'businesses'
    | 'assessors'
    | 'payments'
    | 'settings'
    | 'news'
    | 'add-to-catalogue'
    | 'catalogue'
    | 'recently-deleted';

export interface DeletedItem {
    id: string;
    type: 'lead' | 'assessment' | 'user';
    deleted_at: string;
    label: string;
    email?: string;
    details?: string;
}
