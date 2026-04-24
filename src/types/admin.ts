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
    tenant?: string;
}

export interface Profile {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    role: 'admin' | 'contractor' | 'user' | 'homeowner' | 'business';
    is_active?: boolean;
    registration_status?: 'pending' | 'active' | 'rejected' | 'completed';
    subscription_status?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    manual_override_reason?: string;
    phone?: string;
    county?: string;
    home_county?: string;
    preferred_counties?: string[];
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
    registration_amount?: number;
    tenant?: string;
    preferred_towns?: string[];
}

export interface Quote {
    id: string;
    price: number;
    notes?: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    created_by: string;
    contractor?: {
        full_name: string;
        email: string;
        phone?: string;
        seai_number?: string;
        assessor_type?: string;
        company_name?: string;
        county?: string;
    };
}

export interface Assessment {
    id: string;
    created_at: string;
    property_address: string;
    status: 'draft' | 'submitted' | 'pending' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed' | 'assigned' | 'live';
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
    job_type?: 'domestic' | 'commercial';
    user?: {
        full_name: string;
        email: string;
        phone?: string;
        county?: string;
        town?: string;
        registration_status?: string;
        is_active?: boolean;
        created_at?: string;
    };
    quotes?: Quote[];
    referred_by_listing_id?: string | null;
    referred_by?: {
        name: string;
        company_name: string;
    } | null;
    job_live_email_sent?: boolean | null;
    job_live_sms_sent?: boolean | null;
    job_live_notified_at?: string | null;
    tenant?: string;
}

export interface Sponsor {
    id: string;
    name: string;
    headline: string;
    sub_text: string;
    image_url: string;
    destination_url: string;
    is_active: boolean;
    tenant?: string;
}

export interface Payment {
    id: string;
    created_at: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    assessment_id: string;
    user_id: string;
    metadata?: Record<string, unknown>;
    profiles?: {
        full_name: string;
        email: string;
    };
    tenant?: string;
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
    business_subscription_amount: number;
    tenant?: string;
}

export interface NewsArticle {
    id: string;
    created_at: string;
    published_at: string;
    title: string;
    excerpt: string;
    content?: string;
    author: string;
    image_url: string;
    category: string;
    is_live: boolean;
    show_badge?: boolean;
    read_time: string;
    tenant?: string;
}

export interface BlogArticle {
    id: string;
    created_at: string;
    published_at: string;
    title: string;
    subtitle?: string;
    excerpt: string;
    content: string;
    author: string;
    image_url: string;
    category: string;
    is_live: boolean;
    show_badge?: boolean;
    read_time: string;
    slug?: string;
    tenant?: string;
}

export interface FaqItem {
    id: string;
    slug: string;
    title: string;
    content: string;
    category: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    tenant?: string;
}

export interface PageContent {
    id: string;
    page: string;
    section: string;
    content: Record<string, any>;
    sort_order: number;
    is_active: boolean;
    updated_at: string;
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
    registrationAmount: number;
}

export type AdminView =
    | 'stats'
    | 'leads'
    | 'assessments'
    | 'jobs'
    | 'homeowners'
    | 'businesses'
    | 'assessors'
    | 'payments'
    | 'settings'
    | 'news'
    | 'blog'
    | 'faq-management'
    | 'page-content'
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

export interface CatalogueListing {
    id: string;
    name: string;
    slug: string;
    company_name: string;
    description: string;
    email: string;
    phone: string | null;
    address: string | null;
    county: string;
    town?: string;
    website: string | null;
    logo_url: string | null;
    owner_id: string | null;
    user_id?: string;
    is_active: boolean;
    featured: boolean;
    latitude: number | null;
    longitude: number | null;
    company_number: string | null;
    registration_no: string | null;
    vat_number: string | null;
    banner_url: string | null;
    social_media?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
        whatsapp?: string;
        youtube?: string;
        snapchat?: string;
        tiktok?: string;
    };
    additional_addresses?: string[];
    features?: string[];
    tenant?: string;
}
