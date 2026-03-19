/**
 * Database Schema Documentation for Theberman Project
 * 
 * This file provides a complete overview of the database structure,
 * relationships, and business logic for the Theberman platform.
 */

// ===========================================
// TABLE DEFINITIONS
// ===========================================

/**
 * Core user profile table that extends auth.users
 * Contains all user information including contractors, homeowners, and businesses
 */
export interface Profile {
  id: string; // UUID - Primary Key, links to auth.users.id
  email?: string;
  role: 'admin' | 'contractor' | 'user' | 'business' | 'homeowner';
  full_name?: string;
  created_at: string; // timestamp with time zone
  phone?: string;
  home_county?: string;
  seai_number?: string; // SEAI registration number for contractors
  seai_since_year?: number; // Year when SEAI registration started
  insurance_holder?: boolean; // Whether contractor has insurance
  vat_registered?: boolean; // VAT registration status
  assessor_type?: string; // Type of assessor (e.g., BER, etc.)
  service_areas?: string[]; // Array of service area counties
  is_active?: boolean; // Account active status (default: true)
  about_me?: string; // Professional bio/description
  website_url?: string; // Business website
  company_name?: string; // Registered company name
  sms_notifications_enabled?: boolean; // SMS notification preferences
  preferred_counties?: string[]; // Preferred work counties
  registration_status?: string; // 'active', 'inactive', etc.
  subscription_status?: string; // Subscription status
  subscription_end_date?: string; // Subscription expiry
  manual_override_reason?: string; // Admin notes for manual changes
  county?: string; // Business location county
  town?: string; // Business location town
  business_address?: string; // Full business address
  website?: string; // Alternative website field
  description?: string; // Business description
  company_number?: string; // Company registration number
  vat_number?: string; // VAT registration number
  subscription_start_date?: string; // Subscription start date
  stripe_payment_id?: string; // Stripe payment intent ID
  last_login?: string; // Last login timestamp
  deleted_at?: string; // Soft delete timestamp
  referral_code?: string; // Unique referral code
  referred_by?: string; // UUID of referring user
  referral_link_disabled?: boolean; // Whether referral link is disabled
}

/**
 * BER Assessment requests and management
 * Core business logic for energy assessments
 */
export interface Assessment {
  id: string; // UUID - Primary Key
  user_id?: string; // UUID - Foreign key to profiles.id (homeowner)
  property_address: string; // Full property address
  status: 'draft' | 'submitted' | 'pending' | 'pending_quote' | 'quote_accepted' | 'scheduled' | 'completed' | 'assigned';
  scheduled_date?: string; // Assessment appointment date
  created_at: string; // timestamp with time zone
  certificate_url?: string; // URL to completed BER certificate
  eircode?: string; // Irish postal code
  town?: string; // Property town
  county?: string; // Property county
  property_type?: string; // House type (detached, semi-detached, etc.)
  contractor_id?: string; // UUID - Assigned contractor
  preferred_date?: string; // Preferred assessment date
  preferred_time?: string; // Preferred assessment time
  property_size?: string; // Property size category
  bedrooms?: number; // Number of bedrooms
  additional_features?: string[]; // Property features array
  heat_pump?: string; // Heat pump information
  ber_purpose?: string; // Purpose of BER assessment
  contact_name?: string; // Contact person name
  contact_email?: string; // Contact email
  contact_phone?: string; // Contact phone
  job_type?: string; // Type of job/assessment
  notes?: string; // Additional notes
  quote_amount?: number; // Quoted price
  quote_status?: string; // Quote status
  assigned_at?: string; // When contractor was assigned
  completed_at?: string; // When assessment was completed
  referred_by_listing_id?: string; // UUID - If from catalogue listing
}

/**
 * Quotes for assessments
 * Pricing and proposal management
 */
export interface Quote {
  id: string; // UUID - Primary Key
  assessment_id: string; // UUID - Foreign key to assessments.id
  contractor_id: string; // UUID - Foreign key to profiles.id
  amount: number; // Quote amount in cents
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string; // Additional message to client
  valid_until?: string; // Quote expiry date
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  created_by: string; // UUID - Who created the quote
}

/**
 * Payment processing and tracking
 */
export interface Payment {
  id: string; // UUID - Primary Key
  user_id: string; // UUID - Foreign key to profiles.id
  assessment_id?: string; // UUID - Related assessment
  amount: number; // Payment amount in cents
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string; // Stripe payment intent ID
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

/**
 * Contractor catalogue/business listings
 * Directory of service providers
 */
export interface CatalogueListing {
  id: string; // UUID - Primary Key
  name: string; // Business display name
  slug: string; // URL-friendly slug
  description: string; // Business description
  long_description?: string; // Detailed description
  logo_url?: string; // Business logo URL
  phone?: string; // Contact phone
  email?: string; // Contact email
  website?: string; // Business website
  featured?: boolean; // Featured listing status
  rating?: string; // Average rating
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  latitude?: number; // Geographic coordinates
  longitude?: number; // Geographic coordinates
  address?: string; // Business address
  status?: string; // Listing status (default: 'active')
  features?: string[]; // Business features/services
  social_media?: object; // Social media links
  company_name?: string; // Legal company name
  is_active?: boolean; // Active status (default: true)
  is_verified?: boolean; // Verification status
  owner_id?: string; // UUID - Listing owner
  trading_name?: string; // Trading name
  company_number?: string; // Company registration
  vat_number?: string; // VAT number
  insurance_expiry?: string; // Insurance expiry date
  certifications?: object; // Certifications array
  registration_no?: string; // Professional registration
  banner_url?: string; // Banner image URL
  additional_addresses?: string[]; // Service area locations
}

/**
 * Catalogue listing categories
 * Service categorization
 */
export interface CatalogueListingCategory {
  id: string; // UUID - Primary Key
  listing_id: string; // UUID - Foreign key to catalogue_listings.id
  category: string; // Category name
  subcategory?: string; // Subcategory
  created_at: string; // timestamp with time zone
}

/**
 * Catalogue listing service areas
 * Geographic service coverage
 */
export interface CatalogueListingLocation {
  id: string; // UUID - Primary Key
  listing_id: string; // UUID - Foreign key to catalogue_listings.id
  county: string; // Service county
  created_at: string; // timestamp with time zone
}

/**
 * Catalogue listing images
 * Photo gallery for listings
 */
export interface CatalogueListingImage {
  id: string; // UUID - Primary Key
  listing_id: string; // UUID - Foreign key to catalogue_listings.id
  url: string; // Image URL
  display_order?: number; // Display order (default: 0)
  created_at: string; // timestamp with time zone
  description?: string; // Image description
}

/**
 * Enquiries from catalogue listings
 * Lead generation from directory
 */
export interface CatalogueEnquiry {
  id: string; // UUID - Primary Key
  listing_id: string; // UUID - Foreign key to catalogue_listings.id
  name: string; // Enquirer name
  email: string; // Enquirer email
  phone?: string; // Enquirer phone
  message?: string; // Enquiry message
  created_at: string; // timestamp with time zone
}

/**
 * Lead generation from website
 * General contact forms
 */
export interface Lead {
  id: string; // UUID - Primary Key
  created_at: string; // timestamp with time zone
  name: string; // Lead name
  email: string; // Lead email
  phone?: string; // Lead phone
  message: string; // Lead message
  status?: string; // Lead status (default: 'new')
  county?: string; // Lead location
  town?: string; // Lead location
  property_type?: string; // Property type
  purpose?: string; // Purpose of enquiry
  deleted_at?: string; // Soft delete timestamp
}

/**
 * Referral program management
 * User referral system
 */
export interface Referral {
  id: string; // UUID - Primary Key
  referrer_id: string; // UUID - Foreign key to profiles.id
  referred_user_id?: string; // UUID - Foreign key to profiles.id
  referred_email?: string; // Email of referred person
  status: 'pending' | 'signed_up' | 'completed' | 'expired';
  points_awarded?: number; // Points awarded for referral
  created_at: string; // timestamp with time zone
  completed_at?: string; // timestamp with time zone
}

/**
 * Referral points tracking
 * Loyalty program points
 */
export interface ReferralPoint {
  id: string; // UUID - Primary Key
  user_id: string; // UUID - Foreign key to profiles.id
  points: number; // Points amount
  transaction_type: 'earned' | 'redeemed' | 'expired';
  description?: string; // Transaction description
  referral_id?: string; // UUID - Related referral
  created_at: string; // timestamp with time zone
}

/**
 * Referral redemption requests
 * Points redemption processing
 */
export interface ReferralRedemption {
  id: string; // UUID - Primary Key
  user_id: string; // UUID - Foreign key to profiles.id
  points_used: number; // Points redeemed (default: 300)
  status: 'pending' | 'approved' | 'rejected';
  notes?: string; // Admin notes
  created_at: string; // timestamp with time zone
  processed_at?: string; // timestamp with time zone
  processed_by?: string; // UUID - Admin who processed
}

/**
 * Referral program settings
 * System configuration
 */
export interface ReferralProgramSetting {
  id: number; // Integer (always 1)
  is_enabled: boolean; // Program active status
  required_referrals: number; // Referrals needed for reward (default: 30)
  points_per_referral: number; // Points per referral (default: 10)
  reward_type: 'subscription' | 'points'; // Reward type
  reward_months: number; // Free subscription months (default: 12)
  reward_points_threshold: number; // Points threshold (default: 300)
  reward_label: string; // Reward display label
  expiry_days?: number; // Points expiry days
  updated_at: string; // timestamp with time zone
  updated_by?: string; // UUID - Admin who updated
}

/**
 * Referral audit logging
 * Activity tracking
 */
export interface ReferralAuditLog {
  id: string; // UUID - Primary Key
  event_type: string; // Type of event
  referral_id?: string; // UUID - Related referral
  actor_id?: string; // UUID - User who performed action
  target_user_id?: string; // UUID - Target user
  metadata?: object; // Additional event data
  created_at: string; // timestamp with time zone
}

/**
 * News articles management
 * Content management system
 */
export interface NewsArticle {
  id: string; // UUID - Primary Key
  created_at: string; // timestamp with time zone
  published_at: string; // timestamp with time zone
  title: string; // Article title
  excerpt?: string; // Article excerpt
  author?: string; // Article author
  image_url?: string; // Featured image
  category?: string; // Article category
  is_live?: boolean; // Published status
  read_time?: string; // Estimated read time
  show_badge?: boolean; // Show article badge
  content: string; // Article content
}

/**
 * Email OTP verification
 * Two-factor authentication
 */
export interface EmailOtp {
  id: string; // UUID - Primary Key
  email: string; // Email address
  code: string; // OTP code
  expires_at: string; // Expiry timestamp
  created_at: string; // timestamp with time zone
  verified: boolean; // Verification status
}

/**
 * Promo banner settings
 * Homepage promotions
 */
export interface PromoSetting {
  id: number; // Integer (always 1)
  is_enabled: boolean; // Promo active status
  headline?: string; // Promo headline
  sub_text?: string; // Promo subtext
  image_url?: string; // Promo image
  destination_url?: string; // Click destination
  updated_at: string; // timestamp with time zone
}

// ===========================================
// KEY RELATIONSHIPS
// ===========================================

/**
 * Primary Foreign Key Relationships:
 * 
 * profiles.id -> auth.users.id (User authentication)
 * assessments.user_id -> profiles.id (Homeowner)
 * assessments.contractor_id -> profiles.id (Assigned contractor)
 * quotes.assessment_id -> assessments.id
 * quotes.contractor_id -> profiles.id
 * payments.user_id -> profiles.id
 * payments.assessment_id -> assessments.id
 * catalogue_listings.owner_id -> profiles.id
 * catalogue_*_tables.listing_id -> catalogue_listings.id
 * referrals.referrer_id -> profiles.id
 * referrals.referred_user_id -> profiles.id
 * referral_points.user_id -> profiles.id
 * referral_redemptions.user_id -> profiles.id
 * referral_redemptions.processed_by -> profiles.id
 */

// ===========================================
// BUSINESS LOGIC FLOW
// ===========================================

/**
 * Typical User Journey:
 * 
 * 1. User Registration -> profiles table
 * 2. BER Assessment Request -> assessments table
 * 3. Contractor Assignment -> assessments.contractor_id
 * 4. Quote Creation -> quotes table
 * 5. Quote Acceptance -> quotes.status = 'accepted'
 * 6. Payment Processing -> payments table
 * 7. Assessment Scheduling -> assessments.scheduled_date
 * 8. Assessment Completion -> assessments.status = 'completed'
 * 9. Certificate Generation -> assessments.certificate_url
 * 
 * Referral Program Flow:
 * 
 * 1. Referral Code Generation -> profiles.referral_code
 * 2. New User Signup -> referrals table
 * 3. Referral Completion -> referrals.status = 'completed'
 * 4. Points Awarding -> referral_points table
 * 5. Points Redemption -> referral_redemptions table
 */

// ===========================================
// RLS POLICIES SUMMARY
// ===========================================

/**
 * Row Level Security (RLS) is enabled on all tables
 * 
 * Key Policies:
 * - Admins have full access to all data
 * - Users can only see/edit their own records
 * - Contractors can manage their own listings and quotes
 * - Public users can see active catalogue listings
 * - Anonymous users can create leads and enquiries
 */

export default {
  // Export all interfaces for use in the application
  Profile,
  Assessment,
  Quote,
  Payment,
  CatalogueListing,
  CatalogueListingCategory,
  CatalogueListingLocation,
  CatalogueListingImage,
  CatalogueEnquiry,
  Lead,
  Referral,
  ReferralPoint,
  ReferralRedemption,
  ReferralProgramSetting,
  ReferralAuditLog,
  NewsArticle,
  EmailOtp,
  PromoSetting,
};
