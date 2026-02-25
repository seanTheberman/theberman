
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { LogOut, RefreshCw, MessageSquare, Trash2, Eye, X, Mail, Phone, MapPin, Home, Calendar, ChevronDown, Loader2, AlertTriangle, TrendingUp, Briefcase, Menu, Pencil, CheckCircle2, Search, Newspaper, Plus, Star, Check, Edit2, ExternalLink, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TOWNS_BY_COUNTY } from '../data/irishTowns';
import { geocodeAddress, COUNTY_COORDINATES } from '../lib/geocoding';
import { REGISTRATION_PRICES } from '../constants/pricing';

const IRISH_COUNTIES = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway',
    'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick',
    'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly',
    'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath',
    'Wexford', 'Wicklow'
];

interface Lead {
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

interface Profile {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    role: 'admin' | 'contractor' | 'user' | 'homeowner' | 'business';
    is_active?: boolean;
    registration_status?: 'pending' | 'active' | 'rejected';
    subscription_status?: string;
    subscription_end_date?: string;
    manual_override_reason?: string;
    phone?: string;
    county?: string;
    town?: string;
    seai_number?: string;
    assessor_type?: string;
    company_name?: string;
    business_address?: string;
    website?: string;
    description?: string;
    company_number?: string;
    vat_number?: string;
}

interface Assessment {
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
    };
    referred_by_listing_id?: string | null;
    referred_by?: {
        name: string;
        company_name: string;
    } | null;
}

interface Sponsor {
    id: string;
    name: string;
    headline: string;
    sub_text: string;
    image_url: string;
    destination_url: string;
    is_active: boolean;
}

interface Payment {
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

interface AppSettings {
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


interface NewsArticle {
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

const Admin = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [users_list, setUsersList] = useState<Profile[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
    const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
    const [view, setView] = useState<'stats' | 'leads' | 'assessments' | 'homeowners' | 'businesses' | 'assessors' | 'payments' | 'settings' | 'news' | 'add-to-catalogue' | 'catalogue'>('stats');
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Profile>>({});
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserRole, setNewUserRole] = useState<'contractor' | 'business'>('contractor');
    const [newUserFormData, setNewUserFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        county: '',
        town: '',
        // Assessor-specific
        seaiNumber: '',
        assessorType: 'Domestic Assessor',
        companyName: '',
        // Business-specific
        businessAddress: '',
        website: '',
        description: '',
        companyNumber: '',
        vatNumber: '',
    });
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false); const [vLabels] = useState<Record<string, string>>({
        stats: 'Overview',
        homeowners: 'Homeowners',
        businesses: 'Businesses',
        assessors: 'BER Assessors',
        leads: 'Leads',
        payments: 'Financials',
        news: 'News',
        settings: 'Settings'
    });
    const [selectedAssessmentForAssignment, setSelectedAssessmentForAssignment] = useState<Assessment | null>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAssessmentDetailModal, setShowAssessmentDetailModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = leads.filter(l =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.town?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.status || 'new').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredAssessments = assessments.filter(a =>
        a.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.town?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBusinessLeads = users_list.filter(u => u.role === 'business').filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setSearchTerm('');
    }, [view]);
    const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'lead' | 'sponsor' | 'assessment' | 'user' } | null>(null);
    const [itemToSuspend, setItemToSuspend] = useState<{ id: string, name: string, currentStatus: boolean } | null>(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
    // Catalogue page state
    const [catalogueCategories, setCatalogueCategories] = useState<{ id: string; name: string }[]>([]);
    const [isSavingCatalogue, setIsSavingCatalogue] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [selectedBusinessForCatalogue, setSelectedBusinessForCatalogue] = useState<Profile | null>(null);
    const [selectedListingForEdit, setSelectedListingForEdit] = useState<any | null>(null);
    const [catalogueFormData, setCatalogueFormData] = useState({
        companyName: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        county: '',
        website: '',
        logoUrl: '',
        featured: false,
        selectedCategories: [] as string[],
        companyNumber: '',
        registrationNo: '',
        vatNumber: '',
    });

    const handleExportPayments = () => {
        if (payments.length === 0) {
            toast.error("No payments to export");
            return;
        }

        const headers = ["ID", "Amount", "Currency", "Status", "User", "Email", "Date", "Assessment ID"];
        const csvRows = [
            headers.join(","),
            ...payments.map(p => [
                p.id,
                p.amount,
                p.currency,
                p.status,
                `"${p.profiles?.full_name || 'Unknown'}"`,
                p.profiles?.email || 'N/A',
                new Date(p.created_at).toLocaleDateString(),
                p.assessment_id
            ].join(","))
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `berman_payments_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Payments report exported successfully");
    };

    // Sponsor Modal State
    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

    const [selectedDate, setSelectedDate] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [certUrl, setCertUrl] = useState('');

    // Quote Form State
    const [quoteData, setQuoteData] = useState({
        price: '',
        estimated_date: '',
        notes: ''
    });

    // Message Form State
    const [messageContent, setMessageContent] = useState('');

    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                if (error.message?.includes('column "registration_status" does not exist')) {
                    toast.error('Registration status column missing. Please run the SQL migration.');
                } else {
                    throw error;
                }
            }
            setUsersList(data || []);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast.error(error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchListings = async () => {
        try {
            const { data, error } = await supabase
                .from('catalogue_listings')
                .select('*');

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    };

    const fetchCatalogueCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('catalogue_categories')
                .select('id, name')
                .order('name');
            if (error) throw error;
            setCatalogueCategories(data || []);
        } catch (error) {
            console.error('Error fetching catalogue categories:', error);
        }
    };

    const handleOpenCatalogueView = (business: Profile | null, existingListing?: any) => {
        setSelectedBusinessForCatalogue(business);
        setSelectedListingForEdit(existingListing || null);

        if (existingListing) {
            setCatalogueFormData({
                companyName: existingListing.name || '',
                description: existingListing.description || '',
                email: existingListing.email || '',
                phone: existingListing.phone || '',
                address: existingListing.address || '',
                county: existingListing.address?.split(', Co. ')[1] || '',
                website: existingListing.website || '',
                logoUrl: existingListing.logo_url || '',
                featured: existingListing.featured || false,
                selectedCategories: [],
                companyNumber: existingListing.company_number || '',
                registrationNo: existingListing.registration_no || '',
                vatNumber: existingListing.vat_number || '',
            });

            // Fetch categories for this listing
            const fetchExistingCategories = async () => {
                const { data } = await supabase
                    .from('catalogue_listing_categories')
                    .select('category_id')
                    .eq('listing_id', existingListing.id);

                if (data) {
                    setCatalogueFormData(prev => ({
                        ...prev,
                        selectedCategories: data.map(c => c.category_id)
                    }));
                }
            };
            fetchExistingCategories();
        } else {
            setCatalogueFormData({
                companyName: business ? ((business as any).company_name || business.full_name || '') : '',
                description: '',
                email: business?.email || '',
                phone: business ? ((business as any).phone || '') : '',
                address: business ? ((business as any).business_address || '') : '',
                county: business ? ((business as any).county || '') : '',
                website: business ? ((business as any).website || '') : '',
                logoUrl: '',
                featured: false,
                selectedCategories: [],
                companyNumber: '',
                registrationNo: '',
                vatNumber: '',
            });
        }
        setView('add-to-catalogue');
    };

    const toggleCatalogueStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('catalogue_listings')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            setListings(prev => prev.map(l => l.id === id ? { ...l, is_active: !currentStatus } : l));
            toast.success(`Listing ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error toggling listing status:', error);
            toast.error('Failed to update status');
        }
    };

    const toggleCatalogueFeatured = async (id: string, currentFeatured: boolean) => {
        try {
            const { error } = await supabase
                .from('catalogue_listings')
                .update({ featured: !currentFeatured })
                .eq('id', id);

            if (error) throw error;
            setListings(prev => prev.map(l => l.id === id ? { ...l, featured: !currentFeatured } : l));
            toast.success(`Listing ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
        } catch (error) {
            console.error('Error toggling featured status:', error);
            toast.error('Failed to update featured status');
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

        try {
            setIsSavingCatalogue(true);
            // Delete relationships first due to FK constraints if any, though Supabase cascading usually handles it
            await supabase.from('catalogue_listing_categories').delete().eq('listing_id', id);
            await supabase.from('catalogue_listing_locations').delete().eq('listing_id', id);

            const { error } = await supabase
                .from('catalogue_listings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setListings(prev => prev.filter(l => l.id !== id));
            toast.success('Listing deleted successfully');
        } catch (error) {
            console.error('Error deleting listing:', error);
            toast.error('Failed to delete listing');
        } finally {
            setIsSavingCatalogue(false);
        }
    };

    const toggleCatalogueCategory = (categoryId: string) => {
        setCatalogueFormData(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(categoryId)
                ? prev.selectedCategories.filter(id => id !== categoryId)
                : [...prev.selectedCategories, categoryId]
        }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        try {
            setIsUploadingLogo(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `logos/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName);

            setCatalogueFormData(prev => ({
                ...prev,
                logoUrl: publicUrl
            }));
            toast.success('Logo uploaded successfully');
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            toast.error(error.message || 'Failed to upload logo');
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleSaveCatalogueEntry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!catalogueFormData.companyName.trim() || !catalogueFormData.email.trim()) {
            toast.error('Company name and email are required');
            return;
        }
        if (catalogueFormData.selectedCategories.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        setIsSavingCatalogue(true);
        try {
            const slug = selectedListingForEdit
                ? selectedListingForEdit.slug
                : catalogueFormData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

            const fullAddress = catalogueFormData.address + (catalogueFormData.county ? `, Co. ${catalogueFormData.county}` : '');

            // Geocode address
            let latitude = null;
            let longitude = null;

            if (catalogueFormData.address) {
                const coords = await geocodeAddress(fullAddress);
                if (coords) {
                    latitude = coords.latitude;
                    longitude = coords.longitude;
                }
            }

            // Fallback to county center if geocoding fails or address is empty
            if (!latitude && catalogueFormData.county) {
                const countyCoords = COUNTY_COORDINATES[catalogueFormData.county];
                if (countyCoords) {
                    latitude = countyCoords.latitude;
                    longitude = countyCoords.longitude;
                }
            }

            const listingData = {
                name: catalogueFormData.companyName,
                slug,
                company_name: catalogueFormData.companyName,
                description: catalogueFormData.description || `${catalogueFormData.companyName} - Professional services provider.`,
                email: catalogueFormData.email,
                phone: catalogueFormData.phone || null,
                address: fullAddress || null,
                website: catalogueFormData.website || null,
                logo_url: catalogueFormData.logoUrl || null,
                owner_id: selectedBusinessForCatalogue?.id || selectedListingForEdit?.owner_id || null,
                is_active: true,
                featured: catalogueFormData.featured,
                latitude,
                longitude,
                company_number: catalogueFormData.companyNumber || null,
                registration_no: catalogueFormData.registrationNo || null,
                vat_number: catalogueFormData.vatNumber || null,
            };

            let listingId = selectedListingForEdit?.id;

            if (selectedListingForEdit) {
                const { error: updateError } = await supabase
                    .from('catalogue_listings')
                    .update(listingData)
                    .eq('id', selectedListingForEdit.id);
                if (updateError) throw updateError;
            } else {
                const { data: newListing, error: insertError } = await supabase
                    .from('catalogue_listings')
                    .insert(listingData)
                    .select('id')
                    .single();
                if (insertError) throw insertError;
                listingId = newListing.id;
            }

            if (listingId) {
                // For categories and locations, we clear and re-add if updating
                if (selectedListingForEdit) {
                    await supabase.from('catalogue_listing_categories').delete().eq('listing_id', listingId);
                    await supabase.from('catalogue_listing_locations').delete().eq('listing_id', listingId);
                }

                // Map categories
                if (catalogueFormData.selectedCategories.length > 0) {
                    const categoryMappings = catalogueFormData.selectedCategories.map(categoryId => ({
                        listing_id: listingId,
                        category_id: categoryId,
                    }));
                    await supabase.from('catalogue_listing_categories').insert(categoryMappings);
                }

                // Map location (County)
                if (catalogueFormData.county) {
                    const { data: locData } = await supabase
                        .from('catalogue_locations')
                        .select('id')
                        .eq('name', catalogueFormData.county)
                        .maybeSingle();

                    if (locData) {
                        await supabase.from('catalogue_listing_locations').insert({
                            listing_id: listingId,
                            location_id: locData.id
                        });
                    }
                }
            }

            toast.success(selectedListingForEdit ? 'Listing updated successfully!' : 'Business added to catalogue successfully!');
            setView('catalogue');
            setSelectedListingForEdit(null);
            await fetchListings();
        } catch (error: any) {
            console.error('Error saving catalogue entry:', error);
            toast.error(error.message || 'Failed to add business to catalogue');
        } finally {
            setIsSavingCatalogue(false);
        }
    };

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name, email),
                    referred_by:referred_by_listing_id (name, company_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAssessments(data || []);
        } catch (error) {
            console.error('Error fetching assessments:', error);
            toast.error('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    };

    const updateRegistrationStatus = async (userId: string, status: 'active' | 'rejected') => {
        setIsUpdating(true);
        // Optimistic update to UI
        const previousUsers = [...users_list];
        setUsersList(users_list.map(u => u.id === userId ? { ...u, registration_status: status } : u));

        try {
            console.log(`[Admin] Attempting to update user ${userId} to status ${status}`);

            const { data, error } = await supabase
                .from('profiles')
                .update({ registration_status: status })
                .eq('id', userId)
                .select();

            if (error) {
                console.error('[Admin] Database update error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn('[Admin] No rows updated. Check if registration_status column exists and RLS allows updates.');
                throw new Error('Update failed: No rows were changed. This usually means the "registration_status" column is missing from the database schema or an RLS policy is blocking the update.');
            }

            console.log('[Admin] Update successful:', data);
            toast.success(`Business registration ${status === 'active' ? 'approved' : 'rejected'} successfully`);
            fetchUsers(); // Refresh the list to sync with DB
        } catch (error: any) {
            console.error('Error updating registration status:', error);
            // Rollback optimistic update
            setUsersList(previousUsers);

            if (error.message?.includes('column "registration_status" does not exist')) {
                toast.error('Database Error: The "registration_status" column is missing. Please run the SQL migration I provided.');
            } else {
                toast.error(error.message || 'Failed to update registration status');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendOnboardingEmail = async (u: any) => {
        setSendingEmailId(u.id);
        try {
            console.log(`[Admin] Sending onboarding email to ${u.email}...`);
            const { error } = await supabase.functions.invoke('send-onboarding-link', {
                body: {
                    fullName: u.full_name,
                    email: u.email,
                    town: u.company_name || u.town || 'Your Business Profile',
                    userId: u.id,
                    role: 'business',
                }
            });

            if (error) throw error;
            toast.success('Onboarding email sent successfully!');
        } catch (error: any) {
            console.error('Error sending onboarding email:', error);
            toast.error(error.message || 'Failed to send onboarding email');
        } finally {
            setSendingEmailId(null);
        }
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    profiles (full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .single();

            if (error) throw error;
            setAppSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchNewsArticles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('news_articles')
                .select('*')
                .order('published_at', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNewsArticles(data || []);
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Failed to load news articles');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNewsArticle = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('news_articles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setNewsArticles(newsArticles.filter(a => a.id !== id));
            toast.success('Article deleted successfully');
        } catch (error: any) {
            console.error('Error deleting article:', error);
            toast.error('Failed to delete article');
        } finally {
            setIsUpdating(false);
        }
    };

    const logAudit = async (action: string, entityType: string, entityId: string, details: any) => {
        try {
            await supabase.from('audit_logs').insert({
                user_id: user?.id,
                action,
                entity_type: entityType,
                entity_id: entityId,
                details
            });
        } catch (error) {
            console.error('Audit log error:', error);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            // Optimistic update
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
            if (selectedLead?.id === id) {
                setSelectedLead({ ...selectedLead, status: newStatus });
            }
            toast.success('Status updated');
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (id: string, type: 'lead' | 'sponsor' | 'assessment' | 'user') => {
        setItemToDelete({ id, type });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            let table: 'leads' | 'sponsors' | 'assessments' = 'leads';
            if (itemToDelete.type === 'lead') table = 'leads';
            else if (itemToDelete.type === 'sponsor') table = 'sponsors';
            else if (itemToDelete.type === 'assessment') table = 'assessments';
            else if (itemToDelete.type === 'user') table = 'profiles' as any;

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', itemToDelete.id);

            if (error) throw error;

            if (itemToDelete.type === 'lead') {
                setLeads(leads.filter(lead => lead.id !== itemToDelete.id));
                if (selectedLead?.id === itemToDelete.id) setSelectedLead(null);
                toast.success('Lead deleted successfully');
            } else if (itemToDelete.type === 'sponsor') {
                setSponsors(sponsors.filter(s => s.id !== itemToDelete.id));
                toast.success('Sponsor deleted successfully');
            } else if (itemToDelete.type === 'assessment') {
                setAssessments(assessments.filter(a => a.id !== itemToDelete.id));
                if (selectedAssessment?.id === itemToDelete.id) setSelectedAssessment(null);
                toast.success('Assessment deleted successfully');
            } else if (itemToDelete.type === 'user') {
                setUsersList(users_list.filter(u => u.id !== itemToDelete.id));
                toast.success('User deleted successfully');
            }
            setShowDeleteModal(false);
        } catch (error: any) {
            console.error(`Error deleting ${itemToDelete.type}:`, error);
            toast.error(`Failed to delete ${itemToDelete.type}`);
        } finally {
            setIsDeleting(false);
            setItemToDelete(null);
        }
    };

    const fetchSponsors = async () => {
        try {
            const { data, error } = await supabase
                .from('sponsors')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setSponsors(data || []);
        } catch (error) {
            console.error('Error fetching sponsors:', error);
            toast.error('Failed to load sponsors');
        }
    };

    const handleSaveSponsor = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const updates = {
            name: formData.get('name') as string,
            headline: formData.get('headline') as string,
            sub_text: formData.get('sub_text') as string,
            image_url: formData.get('image_url') as string,
            destination_url: formData.get('destination_url') as string,
            is_active: true, // Default to true for now
            updated_at: new Date().toISOString()
        };

        setIsUpdating(true);
        try {
            let data, error;

            if (editingSponsor) {
                const result = await supabase
                    .from('sponsors')
                    .update(updates)
                    .eq('id', editingSponsor.id)
                    .select()
                    .single();
                data = result.data;
                error = result.error;
            } else {
                const result = await supabase
                    .from('sponsors')
                    .insert(updates)
                    .select()
                    .single();
                data = result.data;
                error = result.error;
            }

            if (error) throw error;

            if (editingSponsor) {
                setSponsors(sponsors.map(s => s.id === editingSponsor.id ? data : s));
                toast.success(`Sponsor "${data.name}" updated successfully!`);
            } else {
                setSponsors([...sponsors, data]);
                toast.success(`Sponsor "${data.name}" added successfully!`);
            }
            setShowSponsorModal(false);
            setEditingSponsor(null);
        } catch (error: any) {
            console.error('Error saving sponsor:', error);
            toast.error(`Failed to save sponsor: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteSponsor = async (id: string) => {
        handleDeleteClick(id, 'sponsor');
    };

    const [showPromoModal, setShowPromoModal] = useState(false);
    const [promoSettings, setPromoSettings] = useState({
        id: 1,
        is_enabled: false,
        headline: '',
        sub_text: '',
        image_url: '',
        destination_url: ''
    });

    const fetchPromoSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('promo_settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle();

            if (data) {
                setPromoSettings(data);
            } else if (!error) {
                // Initialize if not exists (though migration should handle this, doing it here too is safe)
                const defaultSettings = { id: 1, is_enabled: false, headline: 'Considering Solar Panels?', sub_text: 'Compare the Best Solar Deals', image_url: '', destination_url: '' };
                setPromoSettings(defaultSettings);
            }
        } catch (error) {
            console.error('Error fetching promo settings:', error);
        }
    };

    const savePromoSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingBanner(true);
        try {
            const { error } = await supabase
                .from('promo_settings')
                .update({
                    headline: promoSettings.headline,
                    sub_text: promoSettings.sub_text,
                    image_url: promoSettings.image_url,
                    destination_url: promoSettings.destination_url,
                    is_enabled: promoSettings.is_enabled,
                    updated_at: new Date().toISOString()
                })
                .eq('id', promoSettings.id);

            if (error) throw error;
            toast.success('Promo settings updated!');
            fetchPromoSettings();
            setShowPromoModal(false);
        } catch (error: any) {
            console.error('Error saving promo settings:', error);
            toast.error(`Failed to update settings: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUpdatingBanner(false);
        }
    };

    useEffect(() => {
        const fetchViewData = async () => {
            setIsUpdating(true);
            try {
                if (view === 'leads') await fetchLeads();
                else if (view === 'assessments') await fetchAssessments();
                else if (view === 'homeowners') await fetchUsers();
                else if (view === 'businesses') {
                    await fetchUsers();
                    await fetchListings();
                    await fetchCatalogueCategories();
                }
                else if (view === 'catalogue') {
                    await fetchListings();
                    await fetchCatalogueCategories();
                }
                else if (view === 'add-to-catalogue') {
                    await fetchCatalogueCategories();
                }
                else if (view === 'assessors') await fetchUsers();
                else if (view === 'payments') await fetchPayments();
                else if (view === 'settings') {
                    await fetchAppSettings();
                    await fetchPromoSettings();
                    await fetchSponsors();
                }
                else if (view === 'stats') {
                    // Fetch assessments and listings for referrals or stats
                    await Promise.all([
                        fetchLeads(),
                        fetchAssessments(),
                        fetchUsers(),
                        fetchPayments()
                    ]);
                }
                else if (view === 'news') {
                    await fetchNewsArticles();
                }
            } finally {
                setIsUpdating(false);
            }
        };

        fetchViewData();
        fetchPromoSettings(); // Always fetch this for initial state if needed

        // Real-time
        const channel = supabase
            .channel('admin-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchAssessments())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchUsers())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchPayments())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => fetchAppSettings())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [view]);

    // Stats Calculation
    const stats = {
        totalUsers: users_list.length,
        homeowners: users_list.filter(u => u.role === 'homeowner' || u.role === 'user').length,
        contractors: users_list.filter(u => u.role === 'contractor').length,
        totalLeads: leads.length,
        totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        activeAssessments: assessments.filter(a => a.status !== 'completed').length,
        completedAssessments: assessments.filter(a => a.status === 'completed').length,
        pendingQuotes: assessments.filter(a => a.status === 'submitted' || a.status === 'pending_quote').length,
        acceptedQuotes: assessments.filter(a => a.status === 'quote_accepted' || a.status === 'scheduled' || a.status === 'completed').length,
        businessLeads: users_list.filter(u => u.role === 'business').length,
        pendingOnboarding: users_list.filter(u => u.role === 'business' && !listings.some(l => l.user_id === u.id)).length,
    };

    const handleAssignContractor = async (contractorId: string) => {
        if (!selectedAssessmentForAssignment) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('assessments')
                .update({
                    contractor_id: contractorId,
                    status: 'assigned'
                })
                .eq('id', selectedAssessmentForAssignment.id);

            if (error) throw error;

            await logAudit('assign_contractor', 'assessment', selectedAssessmentForAssignment.id, {
                contractor_id: contractorId,
                previous_status: selectedAssessmentForAssignment.status
            });

            toast.success('Assessor assigned successfully');
            setShowAssignModal(false);
            setSelectedAssessmentForAssignment(null);
            fetchAssessments(); // Refresh list
        } catch (error: any) {
            console.error('Error assigning contractor:', error);
            toast.error('Failed to assign assessor');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleGenerateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssessment) return;

        setIsUpdating(true);
        try {
            // 1. Create Quote
            const { data: quote, error: quoteError } = await supabase.from('quotes').insert({
                assessment_id: selectedAssessment.id,
                price: parseFloat(quoteData.price),
                estimated_date: quoteData.estimated_date || null,
                notes: quoteData.notes,
                created_by: user?.id
            }).select().single();

            if (quoteError) throw quoteError;

            // 2. Update Assessment Status
            const { error: updateError } = await supabase
                .from('assessments')
                .update({ status: 'pending_quote' })
                .eq('id', selectedAssessment.id);

            if (updateError) throw updateError;

            // 3. Notify homeowner about the new quote
            supabase.functions.invoke('send-quote-notification', {
                body: { assessmentId: selectedAssessment.id }
            }).catch(err => console.error('Failed to trigger homeowner notification:', err));

            // 4. Log Audit
            await logAudit('generate_quote', 'assessment', selectedAssessment.id, {
                quote_id: quote.id,
                price: quoteData.price
            });

            toast.success('Quote generated successfully!');
            setShowQuoteModal(false);
            setQuoteData({ price: '', estimated_date: '', notes: '' });
            fetchAssessments();
        } catch (error: any) {
            console.error('Error generating quote:', error);
            toast.error(error.message || 'Failed to generate quote');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssessment || !selectedDate) return;

        setIsUpdating(true);
        try {
            // Check if rescheduling
            const isRescheduled = selectedAssessment.status === 'scheduled' && selectedAssessment.scheduled_date !== selectedDate;

            const { error } = await supabase
                .from('assessments')
                .update({
                    status: 'scheduled',
                    scheduled_date: selectedDate
                })
                .eq('id', selectedAssessment.id);

            if (error) throw error;

            // Trigger notification
            supabase.functions.invoke('send-job-status-notification', {
                body: {
                    assessmentId: selectedAssessment.id,
                    status: isRescheduled ? 'rescheduled' : 'scheduled',
                    details: {
                        inspectionDate: selectedDate,
                        contractorName: 'The Berman Team' // Admin action
                    }
                }
            }).catch(err => console.error('Failed to trigger status notification:', err));

            await logAudit('schedule_assessment', 'assessment', selectedAssessment.id, { scheduled_date: selectedDate });

            toast.success('Assessment scheduled!');
            setShowScheduleModal(false);
            fetchAssessments();
        } catch (error: any) {
            toast.error(error.message || 'Failed to schedule');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssessment) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('assessments')
                .update({
                    status: 'completed',
                    certificate_url: certUrl,
                    completed_at: new Date().toISOString()
                })
                .eq('id', selectedAssessment.id);

            if (error) throw error;

            // Trigger notification
            supabase.functions.invoke('send-job-status-notification', {
                body: {
                    assessmentId: selectedAssessment.id,
                    status: 'completed',
                    details: {
                        certificateUrl: certUrl,
                        contractorName: 'The Berman Team'
                    }
                }
            }).catch(err => console.error('Failed to trigger status notification:', err));

            await logAudit('complete_assessment', 'assessment', selectedAssessment.id, { certificate_url: certUrl });

            toast.success('Assessment marked as completed!');
            setShowCompleteModal(false);
            setCertUrl('');
            fetchAssessments();
        } catch (error: any) {
            toast.error(error.message || 'Failed to complete');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssessment || !messageContent.trim()) return;

        setIsUpdating(true);
        try {
            const clientEmail = selectedAssessment.profiles?.email;
            const propertyAddress = selectedAssessment.property_address;

            if (!clientEmail) {
                toast.error('Client email not found');
                return;
            }

            const subject = encodeURIComponent(`Update regarding your BER Assessment - ${propertyAddress}`);
            const body = encodeURIComponent(messageContent);

            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${clientEmail}&su=${subject}&body=${body}`;

            window.open(gmailUrl, '_blank');

            toast.success('Opening Gmail...');
            setShowMessageModal(false);
            setMessageContent('');

            await logAudit('open_gmail_compose', 'assessment', selectedAssessment.id, {
                recipient: clientEmail
            });

        } catch (error: any) {
            console.error('Error opening Gmail:', error);
            toast.error('Failed to open Gmail');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConvertLead = async (): Promise<string | null> => {
        if (!selectedLead) return null;

        setIsUpdating(true);
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('email', selectedLead.email)
                .maybeSingle();

            if (profileError) throw profileError;

            if (!profile) {
                toast.error(`${selectedLead.name} does not have an account yet. They must register using ${selectedLead.email} first.`);
                return null;
            }

            const { data: assessment, error: assessmentError } = await supabase
                .from('assessments')
                .insert({
                    user_id: profile.id,
                    property_address: selectedLead.town || 'Details pending',
                    town: selectedLead.town,
                    county: selectedLead.county,
                    property_type: selectedLead.property_type,
                    status: 'live' // Make it live immediately
                })
                .select()
                .single();

            if (assessmentError) throw assessmentError;

            // Trigger notification for converted lead
            try {
                await supabase.functions.invoke('send-job-live-email', {
                    body: {
                        email: profile.email,
                        customerName: profile.full_name,
                        county: selectedLead.county,
                        town: selectedLead.town,
                        assessmentId: assessment.id,
                        jobType: selectedLead.property_type?.toLowerCase().includes('commercial') ? 'commercial' : 'domestic'
                    }
                });
            } catch (emailErr) {
                console.error('Failed to trigger live email for converted lead:', emailErr);
            }

            const { error: leadUpdateError } = await supabase
                .from('leads')
                .update({ status: 'contacted' })
                .eq('id', selectedLead.id);

            if (leadUpdateError) throw leadUpdateError;

            toast.success('Lead converted and assessors notified!');
            fetchLeads();
            fetchAssessments();
            logAudit('convert_lead', 'lead', selectedLead.id, { assessmentId: assessment.id });

            return assessment.id;
        } catch (error: any) {
            toast.error(error.message || 'Failed to convert lead');
            return null;
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const handleSaveProfile = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update(editForm)
                .eq('id', selectedUser.id);

            if (error) throw error;

            setUsersList(users_list.map(u =>
                u.id === selectedUser.id ? { ...u, ...editForm } : u
            ));

            toast.success('Profile updated successfully');
            setIsEditingProfile(false);
            setSelectedUser({ ...selectedUser, ...editForm } as Profile);
        } catch (error: any) {
            console.error('Error saving profile:', error);
            toast.error(error.message || 'Failed to save profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const resetNewUserForm = () => {
        setNewUserFormData({
            fullName: '', email: '', password: '', phone: '', county: '', town: '',
            seaiNumber: '', assessorType: 'Domestic Assessor', companyName: '',
            businessAddress: '', website: '', description: '', companyNumber: '', vatNumber: '',
        });
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            // Use server-side edge function for ALL roles (contractor, business, homeowner, user)
            // This avoids replacing the admin's session with supabase.auth.signUp
            const { data: fnData, error: fnError } = await supabase.functions.invoke('create-admin-user', {
                body: {
                    fullName: newUserFormData.fullName,
                    email: newUserFormData.email,
                    password: newUserFormData.password,
                    phone: newUserFormData.phone || null,
                    county: newUserFormData.county || null,
                    town: newUserFormData.town || null,
                    assessorType: newUserFormData.assessorType || null,
                    companyName: newUserFormData.companyName || null,
                    businessAddress: newUserFormData.businessAddress || null,
                    website: newUserFormData.website || null,
                    description: newUserFormData.description || null,
                    companyNumber: newUserFormData.companyNumber || null,
                    vatNumber: newUserFormData.vatNumber || null,
                    role: newUserRole,
                }
            });

            console.log('[handleAddUser] Edge function response:', fnData, fnError);

            if (fnError) {
                console.error('[handleAddUser] Edge function error:', fnError);
                throw new Error(fnError.message || 'Edge function failed');
            }
            if (!fnData?.success) throw new Error(fnData?.error || 'Failed to create user');

            // Send welcome email with magic link (one-click login)
            try {
                const onboardingUrl = fnData.magicLink;
                const { data: emailData, error: emailError } = await supabase.functions.invoke('send-onboarding-link', {
                    body: {
                        fullName: newUserFormData.fullName,
                        email: newUserFormData.email,
                        town: newUserFormData.town || '',
                        onboardingUrl: onboardingUrl,
                        role: newUserRole,
                    }
                });

                console.log('[handleAddUser] Email function response:', emailData, emailError);

                if (emailData?.success) {
                    toast.success(`${newUserRole === 'contractor' ? 'Assessor' : 'Business'} created & login link sent via email!`);
                } else {
                    console.error('[handleAddUser] Email workflow failed:', emailData?.workflow);
                    toast.success('User created but email failed. Please share the login link manually.');
                }
            } catch (err: any) {
                console.error('Email send failed:', err);
                toast.success('User created but email failed. Please share the login link manually.');
            }

            if (fnData.user) {
                setUsersList([fnData.user, ...users_list]);
            }

            setShowAddUserModal(false);
            resetNewUserForm();
            logAudit('create_user', 'user', fnData.user.id, { role: newUserRole });
        } catch (error: any) {
            console.error('Error adding user:', error);
            toast.error(error.message || 'Failed to add user');
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleUserStatus = async () => {
        if (!itemToSuspend) return;
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !itemToSuspend.currentStatus })
                .eq('id', itemToSuspend.id);

            if (error) throw error;

            setUsersList(users_list.map(u =>
                u.id === itemToSuspend.id ? { ...u, is_active: !itemToSuspend.currentStatus } : u
            ));

            toast.success(`User ${!itemToSuspend.currentStatus ? 'activated' : 'suspended'} successfully`);
            setShowSuspendModal(false);
        } catch (error: any) {
            console.error('Error toggling user status:', error);
            toast.error('Failed to update user status');
        } finally {
            setIsUpdating(false);
            setItemToSuspend(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
            case 'pending': return 'bg-blue-100 text-blue-800';
            case 'contacted':
            case 'pending_quote': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'scheduled': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans relative">
            {/* Admin Header */}
            <header className="bg-[#0c121d] backdrop-blur-md border-b border-white/5 sticky top-0 z-[9999] shadow-lg transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="relative flex-shrink-0">
                            <img src="/logo.svg" alt="The Berman Logo" className="h-10 w-auto relative z-10" />
                        </Link>
                        <div className="hidden xl:block">
                            <h1 className="text-lg font-bold text-white leading-tight">Admin Dashboard</h1>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1.5 uppercase tracking-widest font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                Live Connection
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="bg-white/5 p-2.5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-2 text-white/70"
                            >
                                {isMenuOpen ? <X size={20} className="text-[#5CB85C]" /> : <Menu size={20} className="text-[#5CB85C]" />}
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] hidden sm:block">Menu</span>
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="p-2 space-y-1">
                                        {(['stats', 'leads', 'homeowners', 'businesses', 'catalogue', 'assessors', 'assessments', 'payments', 'settings', 'news'] as const).map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => { setView(v); setIsMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-200 ${view === v ? 'bg-[#5CB85C]/10 text-[#5CB85C]' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {v === 'stats' ? 'Overview' :
                                                    v === 'homeowners' ? 'Homeowners' :
                                                        v === 'businesses' ? 'Businesses' :
                                                            v === 'catalogue' ? 'Manage Catalogue' :
                                                                v === 'assessors' ? 'BER Assessors' : v}
                                                {view === v && <div className="w-1.5 h-1.5 rounded-full bg-[#5CB85C]"></div>}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-2 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-1">
                                        <button
                                            onClick={() => { setShowSponsorModal(true); fetchSponsors(); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                                        >
                                            Partners
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] text-red-500 hover:bg-red-50 flex items-center justify-between"
                                        >
                                            Sign Out
                                            <LogOut size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {view === 'stats' ? 'System Overview' :
                                    view === 'leads' ? 'Leads & Inquiries' :
                                        view === 'assessments' ? 'BER Assessments' :
                                            view === 'businesses' ? 'Business Directory' :
                                                view === 'catalogue' ? 'Business Catalogue' :
                                                    view === 'assessors' ? 'BER Assessors' :
                                                        view === 'homeowners' ? 'Homeowners' :
                                                            view === 'payments' ? 'Financials' :
                                                                view === 'news' ? 'News & Updates' : 'Admin'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {view === 'stats' ? 'Key metrics and business performance.' :
                                    view === 'leads' ? 'Manage your website submissions.' :
                                        view === 'assessments' ? 'Manage homeowner assessment requests.' :
                                            view === 'businesses' ? 'Review business interest and send onboarding links.' :
                                                view === 'catalogue' ? 'Manage and edit business catalogue listings.' :
                                                    view === 'assessors' ? 'Manage BER Assessors and their jobs.' :
                                                        view === 'homeowners' ? 'Manage homeowners.' :
                                                            view === 'payments' ? 'View and export payment records.' :
                                                                view === 'settings' ? 'Configure global platform settings.' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={view === 'leads' ? fetchLeads : fetchAssessments}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm text-gray-700 hover:text-[#007F00] hover:border-[#007F00]"
                    >
                        <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                        Refresh Data
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <RefreshCw className="animate-spin text-[#007F00] mb-4" size={32} />
                        <p className="text-gray-500 font-medium">Loading {view}...</p>
                    </div>
                ) : view === 'add-to-catalogue' ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                            <form onSubmit={handleSaveCatalogueEntry} className="flex flex-col">
                                {/* Header */}
                                <div className="flex items-center justify-between px-8 py-8 bg-gray-50/50 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Add to Catalogue</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {selectedBusinessForCatalogue ? (
                                                <>Create a listing for <span className="font-bold text-gray-700">{selectedBusinessForCatalogue.full_name}</span></>
                                            ) : 'Create a new standalone business listing'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setView(selectedListingForEdit ? 'catalogue' : 'businesses')}
                                        className="bg-white text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:border-gray-300 transition-all flex items-center gap-2"
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="px-8 py-10 space-y-8">
                                    {/* Business Details Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Briefcase size={18} />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">{selectedListingForEdit ? 'Edit Business Details' : 'Business Details'}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={catalogueFormData.companyName}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, companyName: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all"
                                                    placeholder="e.g. Acme Retrofitting Ltd"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={catalogueFormData.email}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, email: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all"
                                                    placeholder="info@business.ie"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone <span className="text-gray-300 font-medium">(Optional)</span></label>
                                                <input
                                                    type="tel"
                                                    value={catalogueFormData.phone}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, phone: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all"
                                                    placeholder="+353 1 234 5678"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Website <span className="text-gray-300 font-medium">(Optional)</span></label>
                                                <input
                                                    type="url"
                                                    value={catalogueFormData.website}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, website: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all"
                                                    placeholder="https://www.business.ie"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Number <span className="text-gray-300 font-medium">(Optional)</span></label>
                                                <input
                                                    type="text"
                                                    value={catalogueFormData.companyNumber}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, companyNumber: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all"
                                                    placeholder="e.g. 123456"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">BER Assessor Registration <span className="text-gray-300 font-medium">(Optional)</span></label>
                                                <input
                                                    type="text"
                                                    value={catalogueFormData.registrationNo}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, registrationNo: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all"
                                                    placeholder="e.g. BER-12345"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">VAT Number <span className="text-gray-300 font-medium">(Optional)</span></label>
                                                <input
                                                    type="text"
                                                    value={catalogueFormData.vatNumber}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, vatNumber: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all"
                                                    placeholder="e.g. IE1234567T"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Address <span className="text-gray-300 font-medium">(Optional)</span></label>
                                                <input
                                                    type="text"
                                                    value={catalogueFormData.address}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, address: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all"
                                                    placeholder="123 Industrial Estate, Dublin 12"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">County</label>
                                                <select
                                                    value={catalogueFormData.county}
                                                    onChange={(e) => setCatalogueFormData({ ...catalogueFormData, county: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all bg-white"
                                                >
                                                    <option value="">Select County</option>
                                                    {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo</label>
                                                <div className="mt-1 flex items-center gap-4">
                                                    {catalogueFormData.logoUrl ? (
                                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 group shadow-sm">
                                                            <img src={catalogueFormData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setCatalogueFormData(prev => ({ ...prev, logoUrl: '' }))}
                                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={20} className="text-white" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 bg-gray-50/50">
                                                            {isUploadingLogo ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
                                                        </div>
                                                    )}

                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="file"
                                                            id="catalogue-logo-upload"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleLogoUpload}
                                                            disabled={isUploadingLogo}
                                                        />
                                                        <label
                                                            htmlFor="catalogue-logo-upload"
                                                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm border ${isUploadingLogo ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                                                        >
                                                            {isUploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                                            {isUploadingLogo ? 'Uploading...' : 'Click to Upload Logo'}
                                                        </label>
                                                        <p className="text-[10px] text-gray-400 font-medium">Recommended: Square PNG or JPG. Max size 2MB.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {catalogueFormData.logoUrl && (
                                                <input type="hidden" value={catalogueFormData.logoUrl} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Newspaper size={18} />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">About the Business</h3>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Description</label>
                                            <textarea
                                                value={catalogueFormData.description}
                                                onChange={(e) => setCatalogueFormData({ ...catalogueFormData, description: e.target.value })}
                                                rows={4}
                                                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-[#007F00]/10 focus:border-[#007F00] transition-all resize-none"
                                                placeholder="Describe the services and expertise..."
                                            />
                                        </div>
                                    </div>

                                    {/* Categories Selection */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-green-50 text-[#007F00] flex items-center justify-center">
                                                <Plus size={18} />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">Service Categories *</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {catalogueCategories.map(cat => (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => toggleCatalogueCategory(cat.id)}
                                                    className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center justify-between transition-all select-none ${catalogueFormData.selectedCategories.includes(cat.id)
                                                        ? 'bg-green-50/50 border-[#007F00] text-[#007F00] shadow-sm'
                                                        : 'bg-white border-gray-100 hover:border-green-200 text-gray-600'
                                                        }`}
                                                >
                                                    <span className="text-xs font-bold leading-tight">{cat.name}</span>
                                                    {catalogueFormData.selectedCategories.includes(cat.id) && <Check size={16} className="text-[#007F00]" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Premium Options */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                                <Star size={18} />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">Premium Placement</h3>
                                        </div>
                                        <div
                                            onClick={() => setCatalogueFormData({ ...catalogueFormData, featured: !catalogueFormData.featured })}
                                            className={`cursor-pointer flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${catalogueFormData.featured
                                                ? 'bg-amber-50/50 border-amber-400'
                                                : 'bg-white border-gray-100 hover:border-amber-200'
                                                }`}
                                        >
                                            <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${catalogueFormData.featured ? 'bg-amber-500' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${catalogueFormData.featured ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-900">Feature this listing</span>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Featured businesses appear at the top of search results and in the spotlight carousel.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="px-8 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setView(selectedListingForEdit ? 'catalogue' : 'businesses')}
                                        className="px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingCatalogue}
                                        className="px-10 py-4 bg-[#007F00] text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingCatalogue ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                                        {isSavingCatalogue ? 'Saving Listing...' : (selectedListingForEdit ? 'Update Listing' : 'Add to Catalogue')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : view === 'catalogue' ? (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search catalogue by name or email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => handleOpenCatalogueView(null)}
                                className="flex items-center gap-2 bg-[#007F00] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md whitespace-nowrap"
                            >
                                <Plus size={18} />
                                Add New Listing
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <th className="px-6 py-4">Business</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Featured</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {listings.filter(l =>
                                            l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            l.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No listings found.</td>
                                            </tr>
                                        ) : (
                                            listings.filter(l =>
                                                l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                l.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                            ).map((l) => (
                                                <tr key={l.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {l.logo_url ? (
                                                                <img src={l.logo_url} className="w-10 h-10 rounded-lg object-cover border border-gray-100" alt="" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                                    <Briefcase size={20} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-bold text-gray-900 text-sm">{l.name}</div>
                                                                <div className="text-[10px] text-gray-400 font-medium">Added {new Date(l.created_at).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs text-gray-600 font-medium">{l.email}</div>
                                                        {l.phone && <div className="text-[10px] text-gray-400">{l.phone}</div>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => toggleCatalogueStatus(l.id, l.is_active)}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${l.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${l.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                                            {l.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => toggleCatalogueFeatured(l.id, l.featured)}
                                                            className={`p-2 rounded-lg transition-all ${l.featured ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-gray-400'
                                                                }`}
                                                            title={l.featured ? 'Unfeature Listing' : 'Feature Listing'}
                                                        >
                                                            <Star size={18} fill={l.featured ? 'currentColor' : 'none'} />
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleOpenCatalogueView(null, l)}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Edit Listing"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteListing(l.id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Delete Listing"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <a
                                                                href={`/catalogue?search=${encodeURIComponent(l.name)}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-2 text-gray-400 hover:text-[#007F00] hover:bg-green-50 rounded-lg transition-all"
                                                                title="View Publicly"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : view === 'stats' ? (
                    <div className="space-y-8">
                        {/* Stats Cards Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
                                    <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                        {stats.homeowners} Users / {stats.contractors} Assessors / {stats.businessLeads} Businesses
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-bold text-gray-900">
                                        {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
                                    </h3>
                                    <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                        <span className="font-bold text-xs">EUR</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Jobs</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.activeAssessments}</h3>
                                    <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        Pending Complete
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Business Leads</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.businessLeads}</h3>
                                    <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                        {stats.pendingOnboarding} Pending
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Conversion</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-bold text-gray-900">
                                        {stats.totalLeads > 0 ? Math.round((stats.acceptedQuotes / stats.totalLeads) * 100) : 0}%
                                    </h3>
                                    <TrendingUp size={20} className="text-green-600 mb-1" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Secondary Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Assessment Pipeline</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Unquoted Requests</span>
                                        <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">{stats.pendingQuotes}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-yellow-400 h-full"
                                            style={{ width: `${stats.totalLeads > 0 ? (stats.pendingQuotes / stats.totalLeads) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Completed Projects</span>
                                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{stats.completedAssessments}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full"
                                            style={{ width: `${assessments.length > 0 ? (stats.completedAssessments / assessments.length) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#007F00] rounded-2xl shadow-lg shadow-green-900/10 p-6 text-white flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-4">Quick View</h3>
                                    <p className="text-2xl font-bold leading-tight mb-2">Manage your BER Assessors and homeowners from one place.</p>
                                    <p className="text-sm opacity-70">Expand your system by adding new partners and tracking every step of the certification.</p>
                                </div>
                                <button
                                    onClick={() => setView('homeowners')}
                                    className="mt-6 w-full bg-white text-[#007F00] font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Manage Homeowners
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (view === 'settings' || view === 'payments' ? [1] : view === 'leads' ? leads : view === 'assessments' ? assessments : view === 'news' ? newsArticles : (view === 'homeowners' || view === 'assessors' || view === 'businesses') ? users_list.filter(u => u.role === (view === 'homeowners' ? 'user' : view === 'assessors' ? 'contractor' : 'business')) : []).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            {view === 'leads' ? <MessageSquare size={32} /> : view === 'news' ? <Newspaper size={32} /> : (view === 'businesses' || view === 'assessors') ? <Briefcase size={32} /> : <Home size={32} />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No {vLabels[view] || view} yet</h3>
                        <p className="text-gray-500 mb-6">{view === 'leads' ? 'New form submissions will appear here.' : view === 'news' ? 'New articles will appear here.' : 'New records will appear here.'}</p>
                        {view === 'businesses' && (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                    onClick={() => { setNewUserRole('business'); setShowAddUserModal(true); }}
                                    className="flex items-center gap-2 bg-[#007F00] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md whitespace-nowrap"
                                >
                                    <Briefcase size={18} />
                                    Create Business Account
                                </button>
                                <button
                                    onClick={() => handleOpenCatalogueView(null)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md whitespace-nowrap"
                                >
                                    <Plus size={18} />
                                    Add Direct to Catalogue
                                </button>
                            </div>
                        )}
                        {view === 'news' && (
                            <button
                                onClick={() => navigate('/admin/news/new')}
                                className="inline-flex items-center gap-2 bg-[#007F00] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md"
                            >
                                <Newspaper size={18} />
                                Add New Article
                            </button>
                        )}
                    </div>
                ) : view === 'homeowners' || view === 'assessors' ? (
                    /* HOMEOWNERS & ASSESSORS VIEW */
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={`Search by name or email...`}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {view === 'assessors' && (
                                    <button
                                        onClick={() => { setNewUserRole('contractor'); setShowAddUserModal(true); }}
                                        className="flex items-center gap-2 bg-[#007F00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-sm whitespace-nowrap"
                                    >
                                        <TrendingUp size={16} />
                                        Add BER Assessor
                                    </button>
                                )}
                                <div className="text-xs text-gray-400 font-medium hidden sm:block">
                                    Showing {users_list.filter(u => view === 'assessors' ? u.role === 'contractor' : (u.role === 'user' || u.role === 'homeowner')).filter(u => u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).length} users
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Details</th>
                                            <th className="px-6 py-4">Sign-Up Date</th>
                                            <th className="px-6 py-4">Activity</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users_list
                                            .filter(u => {
                                                const matchRole = view === 'assessors' ? u.role === 'contractor' : (u.role === 'user' || u.role === 'homeowner');
                                                const matchSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
                                                return matchRole && matchSearch;
                                            })
                                            .length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                                    No users found.
                                                </td>
                                            </tr>
                                        ) : (
                                            users_list
                                                .filter(u => {
                                                    const matchRole = view === 'assessors' ? u.role === 'contractor' : (u.role === 'user' || u.role === 'homeowner');
                                                    const matchSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
                                                    return matchRole && matchSearch;
                                                })
                                                .map((u) => {
                                                    const listing = listings.find(l => l.user_id === u.id || l.owner_id === u.id);
                                                    const hasListing = !!listing;

                                                    return (
                                                        <tr key={u.id} className="hover:bg-green-50/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${u.registration_status === 'pending' ? 'bg-orange-500 animate-pulse' : u.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                    <span className={`text-xs font-bold uppercase tracking-tight ${u.registration_status === 'pending' ? 'text-orange-600' : u.is_active !== false ? 'text-gray-500' : 'text-red-500'}`}>
                                                                        {u.registration_status === 'pending' ? 'Pending' : u.is_active !== false ? 'Active' : 'Suspended'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                                {u.full_name}
                                                                <div className="text-xs text-gray-400 font-normal">{u.email}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-500">
                                                                {new Date(u.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                                {u.role === 'contractor' ? (
                                                                    <div className="flex items-center gap-1 text-blue-600">
                                                                        <Briefcase size={14} />
                                                                        <span>{assessments.filter(a => a.contractor_id === u.id).length} Jobs</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1 text-green-600">
                                                                        <Home size={14} />
                                                                        <span>{assessments.filter(a => a.user_id === u.id).length} Requests</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {u.role === 'contractor' && (
                                                                        hasListing ? (
                                                                            <button
                                                                                onClick={() => handleOpenCatalogueView(u, listing)}
                                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                                title="Edit Catalogue Listing"
                                                                            >
                                                                                <Edit2 size={16} />
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleOpenCatalogueView(u)}
                                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                                title="Add to Catalogue"
                                                                            >
                                                                                <Plus size={16} />
                                                                            </button>
                                                                        )
                                                                    )}
                                                                    <button
                                                                        onClick={() => setSelectedUser(u)}
                                                                        className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all"
                                                                        title="View/Edit User Details"
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setItemToSuspend({
                                                                                id: u.id,
                                                                                name: u.full_name,
                                                                                currentStatus: u.is_active !== false
                                                                            });
                                                                            setShowSuspendModal(true);
                                                                        }}
                                                                        className={`p-2 rounded-lg transition-all ${u.is_active !== false
                                                                            ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                                                                            : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                                                                            }`}
                                                                        title={u.is_active !== false ? 'Suspend User' : 'Activate User'}
                                                                    >
                                                                        <AlertTriangle size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(u.id, 'user')}
                                                                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                                                                        title="Delete User"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : view === 'leads' ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, location, or status..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                                Showing {filteredLeads.length} of {leads.length} leads
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Mobile View: Cards */}
                            <div className="md:hidden">
                                {filteredLeads.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400 italic">No leads found.</div>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <div key={lead.id} className="p-4 border-b border-gray-100 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-gray-900">{lead.name}</p>
                                                    <p className="text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(lead.status || 'new')}`}>
                                                    {lead.status || 'new'}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <p>{lead.email}</p>
                                                <p className="mt-1">{lead.town}, {lead.county}</p>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="text-xs bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg font-bold text-gray-700"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(lead.id, 'lead')}
                                                    className="text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg font-bold text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Client Name</th>
                                            <th className="px-6 py-4">Location</th>
                                            <th className="px-6 py-4">Purpose</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredLeads.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                                    No leads found matching your search.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLeads.map((lead) => (
                                                <tr key={lead.id} className="hover:bg-green-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(lead.status || 'new')}`}>
                                                            {lead.status || 'new'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                        {new Date(lead.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {lead.name}
                                                        <div className="text-xs text-gray-400 font-normal">{lead.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {lead.town ? `${lead.town}, ${lead.county || ''} ` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {lead.purpose || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setSelectedLead(lead)}
                                                                className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 hover:text-[#007F00] hover:border-[#007F00] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                            >
                                                                <Eye size={14} />
                                                                View More
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(lead.id, 'lead')}
                                                                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                                                                title="Delete Lead"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : view === 'businesses' ? (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by business name or email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => { setNewUserRole('business'); setShowAddUserModal(true); }}
                                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                                >
                                    <Briefcase size={16} />
                                    Add Business
                                </button>
                                {/* <button
                                    onClick={() => handleOpenCatalogueView(null)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
                                >
                                    <Plus size={16} />
                                    Add to Catalogue
                                </button> */}
                                <div className="text-xs text-gray-400 font-medium hidden sm:block">
                                    Showing {filteredBusinessLeads.length} of {users_list.filter(u => u.role === 'business').length} businesses
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Business Details</th>
                                            <th className="px-6 py-4">Signup Date</th>
                                            <th className="px-6 py-4">Registration</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredBusinessLeads.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                                    No business leads found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBusinessLeads.map((u) => {
                                                const listing = listings.find(l => l.user_id === u.id || l.owner_id === u.id);
                                                const hasListing = !!listing;

                                                return (
                                                    <tr key={u.id} className="hover:bg-green-50/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${u.registration_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                    u.registration_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                                    }`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${u.registration_status === 'active' ? 'bg-green-500' :
                                                                        u.registration_status === 'rejected' ? 'bg-red-500' :
                                                                            'bg-amber-500'
                                                                        }`}></div>
                                                                    {u.registration_status || 'pending'}
                                                                </div>
                                                                {hasListing && (
                                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Listing Created</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {u.full_name}
                                                            <div className="text-xs text-gray-400 font-normal">{u.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500">
                                                            {new Date(u.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {u.registration_status === 'active' && u.subscription_status !== 'active' && !hasListing && (
                                                                <div className="flex flex-col gap-2">
                                                                    <button
                                                                        onClick={() => handleSendOnboardingEmail(u)}
                                                                        disabled={sendingEmailId === u.id}
                                                                        className="flex items-center gap-1.5 bg-[#007F00] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 w-fit animate-pulse hover:animate-none"
                                                                    >
                                                                        {sendingEmailId === u.id ? (
                                                                            <div className="w-14 h-4 flex items-center justify-center">
                                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <Mail size={14} />
                                                                                Send Form
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOpenCatalogueView(u)}
                                                                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm w-fit"
                                                                    >
                                                                        <Plus size={14} />
                                                                        Add to Catalogue
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {u.registration_status === 'active' && hasListing && (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                                                                        <CheckCircle2 size={14} />
                                                                        Registration Complete
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleOpenCatalogueView(u, listing)}
                                                                        className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm w-fit"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                        Edit Catalogue
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {u.registration_status === 'pending' && (
                                                                <span className="text-[10px] text-gray-400 font-medium italic">Pending Approval</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {u.registration_status !== 'active' && (
                                                                    <button
                                                                        onClick={() => updateRegistrationStatus(u.id, 'active')}
                                                                        disabled={isUpdating}
                                                                        className="flex items-center gap-1.5 bg-white border border-green-200 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                                                                    >
                                                                        <CheckCircle2 size={14} />
                                                                        Approve
                                                                    </button>
                                                                )}
                                                                {u.registration_status === 'pending' && (
                                                                    <button
                                                                        onClick={() => updateRegistrationStatus(u.id, 'rejected')}
                                                                        disabled={isUpdating}
                                                                        className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                                                                    >
                                                                        <X size={14} />
                                                                        Reject
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteClick(u.id, 'user')}
                                                                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                                                                    title="Delete Business"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : view === 'assessments' ? (
                    /* ASSESSMENTS VIEW */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Address</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Assessor</th>
                                        <th className="px-6 py-4">Scheduled</th>
                                        <th className="px-6 py-4">Payment</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredAssessments.map((assessment) => (
                                        <tr key={assessment.id} className="hover:bg-green-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(assessment.status)}`}>
                                                    {assessment.status.replace('_', ' ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {assessment.property_address}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{assessment.profiles?.full_name || 'Generic User'}</div>
                                                <div className="text-xs text-gray-400">{assessment.profiles?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {assessment.contractor_id ? (
                                                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                                        {users_list.find(u => u.id === assessment.contractor_id)?.full_name || 'Unknown'}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {assessment.scheduled_date ? new Date(assessment.scheduled_date).toLocaleDateString() : 'TBC'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${assessment.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    assessment.payment_status === 'refunded' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {assessment.payment_status ? assessment.payment_status.toUpperCase() : 'UNPAID'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAssessment(assessment);
                                                            setShowAssessmentDetailModal(true);
                                                        }}
                                                        className="bg-white border border-gray-200 text-gray-600 hover:text-[#007F00] hover:border-[#007F00] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                                    >
                                                        <Eye size={14} />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(assessment.id, 'assessment')}
                                                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Assessment"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : view === 'payments' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Recent Payments</h3>
                                <p className="text-sm text-gray-500">Track all financial transactions.</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportPayments}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Export Report
                                </button>
                            </div>
                        </div>

                        {payments.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <div className="font-bold text-2xl">€</div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No payments found</h3>
                                <p className="text-gray-500">Once payments are received, they will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-right">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-green-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {payment.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {new Intl.NumberFormat('en-IE', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{payment.profiles?.full_name || 'Unknown User'}</div>
                                                    <div className="text-xs text-gray-400">{payment.profiles?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">
                                                    {payment.id.substring(0, 8)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : view === 'news' ? (
                    /* NEWS MANAGEMENT VIEW */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Website News Articles</h3>
                                <p className="text-sm text-gray-500">Manage the content appearing on the News page.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchNewsArticles}
                                    className="p-2 text-gray-400 hover:text-[#007EA7] transition-colors"
                                    title="Refresh news"
                                >
                                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                </button>
                                <button
                                    onClick={() => navigate('/admin/news/new')}
                                    className="bg-[#007F00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#006600] transition-colors flex items-center gap-2"
                                >
                                    <Newspaper size={16} />
                                    Add New Article
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Article</th>
                                        <th className="px-6 py-4">Author & Category</th>
                                        <th className="px-6 py-4">Published Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {newsArticles.map((article) => (
                                        <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 max-w-sm">
                                                <div className="flex items-center gap-4">
                                                    {article.image_url && (
                                                        <img
                                                            src={article.image_url}
                                                            alt=""
                                                            className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900 line-clamp-1">{article.title}</div>
                                                        <div className="text-xs text-gray-400 line-clamp-2 mt-0.5">{article.excerpt}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-700">{article.author}</div>
                                                <div className="text-xs text-gray-500 capitalize">{article.category} • {article.read_time}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(article.published_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${article.is_live ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {article.is_live ? 'Live' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-[#007EA7]">
                                                    <button
                                                        onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                                                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Article"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNewsArticle(article.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Article"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <a
                                                        href="/news"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
                                                        title="View on site"
                                                    >
                                                        <Eye size={16} />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {newsArticles.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                                No news articles found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : view === 'settings' ? (
                    /* SETTINGS VIEW */
                    <div className="space-y-6">
                        {/* General Settings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#007F00]" />
                                Platform Config
                            </h3>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    try {
                                        setIsSavingSettings(true);
                                        const { error } = await supabase.from('app_settings').update({
                                            default_quote_price: parseFloat(formData.get('default_quote_price') as string),
                                            solar_quote_price: parseFloat(formData.get('solar_quote_price') as string),
                                            vat_rate: parseFloat(formData.get('vat_rate') as string),
                                            company_name: formData.get('company_name') as string,
                                            support_email: formData.get('support_email') as string,
                                        }).eq('id', appSettings?.id);
                                        if (error) throw error;
                                        toast.success('Platform settings updated!');
                                        fetchAppSettings();
                                    } catch (err: any) {
                                        toast.error(err.message);
                                    } finally {
                                        setIsSavingSettings(false);
                                    }
                                }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                                    <input name="company_name" defaultValue={appSettings?.company_name || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Support Email</label>
                                    <input name="support_email" defaultValue={appSettings?.support_email || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Default Quote Price (€)</label>
                                    <input name="default_quote_price" type="number" step="0.01" defaultValue={appSettings?.default_quote_price} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Solar Quote Default Price (€)</label>
                                    <input name="solar_quote_price" type="number" step="0.01" defaultValue={appSettings?.solar_quote_price} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">VAT Rate (%)</label>
                                    <input name="vat_rate" type="number" step="0.1" defaultValue={appSettings?.vat_rate} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSavingSettings}
                                        className="bg-[#007F00] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isSavingSettings ? <Loader2 className="animate-spin" size={18} /> : null}
                                        {isSavingSettings ? 'Saving...' : 'Save Config'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Registration Fees Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-blue-600" />
                                Membership Registration Fees
                            </h3>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    try {
                                        setIsSavingSettings(true);
                                        const { error } = await supabase.from('app_settings').update({
                                            domestic_assessor_price: parseFloat(formData.get('domestic_assessor_price') as string),
                                            commercial_assessor_price: parseFloat(formData.get('commercial_assessor_price') as string),
                                            bundle_assessor_price: parseFloat(formData.get('bundle_assessor_price') as string),
                                            business_registration_price: parseFloat(formData.get('business_registration_price') as string)
                                        }).eq('id', appSettings?.id);
                                        if (error) throw error;
                                        toast.success('Registration fees updated!');
                                        fetchAppSettings();
                                    } catch (err: any) {
                                        toast.error(err.message);
                                    } finally {
                                        setIsSavingSettings(false);
                                    }
                                }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Domestic Assessor (€)</label>
                                        <input name="domestic_assessor_price" type="number" step="1" defaultValue={appSettings?.domestic_assessor_price ?? REGISTRATION_PRICES.DOMESTIC_ASSESSOR} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commercial Assessor (€)</label>
                                        <input name="commercial_assessor_price" type="number" step="1" defaultValue={appSettings?.commercial_assessor_price ?? REGISTRATION_PRICES.COMMERCIAL_ASSESSOR} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bundle Assessor (€)</label>
                                        <input name="bundle_assessor_price" type="number" step="1" defaultValue={appSettings?.bundle_assessor_price ?? REGISTRATION_PRICES.BUNDLE_ASSESSOR} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Reg (€)</label>
                                        <input name="business_registration_price" type="number" step="1" defaultValue={appSettings?.business_registration_price ?? REGISTRATION_PRICES.BUSINESS_REGISTRATION} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSavingSettings}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:bg-blue-700"
                                    >
                                        {isSavingSettings ? <Loader2 className="animate-spin" size={18} /> : null}
                                        {isSavingSettings ? 'Saving...' : 'Update Registration Fees'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Promo Settings (Previously Modal) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Homepage Promo Banner</h3>
                            <form onSubmit={savePromoSettings} className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        type="checkbox"
                                        checked={promoSettings.is_enabled}
                                        onChange={(e) => setPromoSettings({ ...promoSettings, is_enabled: e.target.checked })}
                                        className="w-5 h-5 text-[#007F00] rounded focus:ring-[#007F00]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Enable Promo Banner</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                                        <input
                                            value={promoSettings.headline || ''}
                                            onChange={(e) => setPromoSettings({ ...promoSettings, headline: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Sub Text</label>
                                        <input
                                            value={promoSettings.sub_text || ''}
                                            onChange={(e) => setPromoSettings({ ...promoSettings, sub_text: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Destination URL</label>
                                        <input
                                            value={promoSettings.destination_url || ''}
                                            onChange={(e) => setPromoSettings({ ...promoSettings, destination_url: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUpdatingBanner}
                                        className="bg-[#007F00] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isUpdatingBanner ? <Loader2 className="animate-spin" size={18} /> : null}
                                        {isUpdatingBanner ? 'Updating...' : 'Update Banner'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : null}
            </main>

            {/* ASSIGN ASSESSOR MODAL */}
            {showAssignModal && selectedAssessmentForAssignment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Assign BER Assessor</h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">Select a certified BER Assessor for:</p>
                            <p className="font-bold text-gray-800 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                                {selectedAssessmentForAssignment.property_address}
                            </p>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {users_list.filter(u => u.role === 'contractor').length === 0 ? (
                                <p className="text-center text-gray-400 text-sm py-4">No Assessors found.</p>
                            ) : (
                                users_list.filter(u => u.role === 'contractor').map(contractor => (
                                    <button
                                        key={contractor.id}
                                        onClick={() => handleAssignContractor(contractor.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#007F00] hover:bg-green-50 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-white">
                                            {contractor.full_name.charAt(0)}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-900 text-sm">{contractor.full_name}</p>
                                            <p className="text-xs text-gray-500">{contractor.email}</p>
                                        </div>
                                        {isUpdating && selectedAssessmentForAssignment?.id && (
                                            <Loader2 size={16} className="animate-spin text-[#007F00]" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PROMO SETTINGS MODAL */}
            {showPromoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Partner Promo Settings</h3>
                            <button onClick={() => setShowPromoModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={savePromoSettings} className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="promo_enabled"
                                    checked={promoSettings.is_enabled}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, is_enabled: e.target.checked })}
                                    className="w-4 h-4 text-[#007F00] focus:ring-[#007F00] border-gray-300 rounded"
                                />
                                <label htmlFor="promo_enabled" className="text-sm font-medium text-gray-700">
                                    Enable Partner Promo in Emails
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                                <input
                                    type="text"
                                    value={promoSettings.headline || ''}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, headline: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="e.g. Considering Solar Panels?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Sub-text</label>
                                <input
                                    type="text"
                                    value={promoSettings.sub_text || ''}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, sub_text: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="e.g. Compare the Best Solar Deals"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={promoSettings.image_url || ''}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, image_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="https://example.com/banner.png"
                                />
                                {promoSettings.image_url && (
                                    <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                        <img src={promoSettings.image_url} alt="Preview" className="h-16 object-contain" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Destination URL</label>
                                <input
                                    type="text"
                                    value={promoSettings.destination_url || ''}
                                    onChange={(e) => setPromoSettings({ ...promoSettings, destination_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="https://partner-site.com"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPromoModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LEAL DETAILS MODAL */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-start shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Lead Details</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1.5 font-medium">
                                    <Calendar size={14} />
                                    Received: {new Date(selectedLead.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <select
                                        value={selectedLead.status || 'new'}
                                        disabled={isUpdating}
                                        onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                                        className={`appearance-none cursor-pointer pl-4 pr-9 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border-0 ring-1 ring-inset focus:ring-2 outline-none transition-all shadow-sm ${getStatusColor(selectedLead.status || 'new')} ring-black/5 hover:ring-black/10 disabled:opacity-50 disabled:cursor-wait`}
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    {isUpdating ? (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" size={14} />
                                    ) : (
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500/80 pointer-events-none group-hover:text-gray-700 transition-colors" size={14} />
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 pt-2 overflow-y-auto space-y-4 grow">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Client Info Card */}
                                <div className="border border-gray-100 rounded-2xl p-6 bg-white hover:border-[#007F00]/30 hover:shadow-md hover:shadow-green-500/5 transition-all duration-300 group">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-[11px] font-extrabold text-[#007F00] uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Client Information</h4>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-50 to-green-100 text-[#007F00] flex items-center justify-center font-bold text-xl shadow-sm border border-green-200/50">
                                            {selectedLead.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg break-words">{selectedLead.name}</p>
                                            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">Customer</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-dashed border-gray-200 my-5"></div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2 break-all">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#007F00]/10 group-hover:text-[#007F00] transition-colors shrink-0">
                                                <Mail size={16} />
                                            </div>
                                            {selectedLead.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#007F00]/10 group-hover:text-[#007F00] transition-colors shrink-0">
                                                <Phone size={16} />
                                            </div>
                                            {selectedLead.phone}
                                        </div>
                                    </div>
                                </div>

                                {/* Property Info Card */}
                                <div className="border border-gray-100 rounded-2xl p-6 bg-white hover:border-[#007EA7]/30 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 h-full flex flex-col justify-between group">
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-[11px] font-extrabold text-[#007EA7] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Property Details</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4 p-2 -mx-2">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#007EA7] flex items-center justify-center shrink-0 border border-blue-100">
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg leading-tight mb-1">{selectedLead.town || 'Not provided'}</p>
                                                    <p className="text-sm text-gray-500 font-medium">{selectedLead.county || 'County not provided'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-700 p-2 hover:bg-blue-50/50 rounded-lg transition-colors -mx-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#007EA7]/10 group-hover:text-[#007EA7] transition-colors shrink-0">
                                                    <Home size={18} />
                                                </div>
                                                <span className="font-medium text-gray-600">{selectedLead.property_type || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="inline-flex items-center px-4 py-1.5 bg-[#007EA7] text-white rounded-full text-xs font-bold shadow-sm">
                                            Purpose: {selectedLead.purpose || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">MESSAGE FROM CLIENT</h4>
                                <div className="bg-gray-50 rounded-xl p-6 text-gray-700 text-sm leading-relaxed border border-gray-100 font-medium">
                                    {selectedLead.message}
                                </div>
                            </div>

                            {/* Conversion Action */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900">Process as Official Assessment?</h4>
                                    <p className="text-xs text-blue-700 mt-1">Convert this lead into a trackable BER assessment with internal messaging and portal access.</p>
                                </div>
                                <button
                                    onClick={handleConvertLead}
                                    disabled={isUpdating}
                                    className="bg-[#007EA7] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all whitespace-nowrap active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                                    {isUpdating ? 'Converting...' : 'Convert to Assessment'}
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                    <button
                                        onClick={async () => {
                                            const id = await handleConvertLead();
                                            if (id) {
                                                setView('assessments');
                                                setSelectedLead(null);
                                                // Give a small delay for state update
                                                setTimeout(() => {
                                                    const newAsm = assessments.find(a => a.id === id);
                                                    if (newAsm) setSelectedAssessment(newAsm);
                                                    setShowQuoteModal(true);
                                                }, 500);
                                            }
                                        }}
                                        disabled={isUpdating}
                                        className="w-full bg-[#007F00] text-white font-bold text-sm py-4 rounded-2xl hover:bg-green-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
                                        {isUpdating ? 'Wait...' : 'Formal Quote (Portal)'}
                                    </button>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => toast.success('Opening Gmail...')}
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedLead.email}&su=${encodeURIComponent('Re: Your inquiry to The Berman')}&body=${encodeURIComponent(`Hi ${selectedLead.name},\n\nI'm writing to you regarding your BER assessment for ${selectedLead.town || 'your area'}.\n\n`)}`}
                                        className="w-full bg-white border-2 border-gray-900 text-gray-900 font-bold text-sm py-4 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg active:scale-[0.98] no-underline"
                                    >
                                        <Mail size={18} />
                                        Client Message
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GENERATE QUOTE MODAL */}
            {showQuoteModal && selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Generate Quote</h3>
                            <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mb-6 space-y-4">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-3">Target Property</h4>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="text-blue-500 mt-0.5" size={14} />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{selectedAssessment.property_address}</p>
                                            <p className="text-[11px] text-gray-500 font-medium">{selectedAssessment.town}, {selectedAssessment.county}</p>
                                            {selectedAssessment.eircode && (
                                                <p className="text-[11px] font-mono text-blue-600 mt-1">{selectedAssessment.eircode}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Home className="text-blue-400" size={14} />
                                        <p className="text-xs font-bold text-gray-700">{selectedAssessment.property_type || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/50">
                                <h4 className="text-[10px] font-bold text-[#007F00] uppercase tracking-widest mb-2">Client Information</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-[#007F00] flex items-center justify-center font-bold text-xs">
                                        {selectedAssessment.profiles?.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{selectedAssessment.profiles?.full_name}</p>
                                        <p className="text-[10px] text-gray-500">{selectedAssessment.profiles?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleGenerateQuote} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Quote Price (€)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={quoteData.price}
                                    onChange={(e) => setQuoteData({ ...quoteData, price: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="e.g. 250.00"
                                />
                                <p className="text-[10px] text-gray-400 font-medium italic mt-2">
                                    * Quote must include Berman's €30 service fee.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Date</label>
                                <input
                                    type="date"
                                    value={quoteData.estimated_date}
                                    onChange={(e) => setQuoteData({ ...quoteData, estimated_date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Internal Notes</label>
                                <textarea
                                    value={quoteData.notes}
                                    onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="Add any internal details or notes for the quote..."
                                    rows={3}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowQuoteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                                    {isUpdating ? 'Generating...' : 'Generate & Notify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MESSAGE CLIENT MODAL */}
            {showMessageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Message Client</h3>
                            <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
                                <textarea
                                    required
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00] min-h-[120px]"
                                    placeholder="Type your message..."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowMessageModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                                    {isUpdating ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SCHEDULE MODAL */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Schedule Assessment</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Assessment Date</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                                    {isUpdating ? 'Scheduling...' : 'Confirm Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* COMPLETE MODAL */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Complete Assessment</h3>
                            <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        </div>
                        <form onSubmit={handleComplete} className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                <p className="text-xs text-blue-800 font-medium">Finalizing this assessment will allow the homeowner to download their BER certificate.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Certificate URL (e.g. Google Drive/Dropbox/S3)</label>
                                <input
                                    type="url"
                                    required
                                    value={certUrl}
                                    onChange={(e) => setCertUrl(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#007F00]"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCompleteModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                                    {isUpdating ? 'Finalizing...' : 'Complete Assessment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* ASSESSMENT DETAILS MODAL */}
            {showAssessmentDetailModal && selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Assessment Details</h3>
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mt-2 ${getStatusColor(selectedAssessment.status)}`}>
                                    {selectedAssessment.status.replace('_', ' ')}
                                </div>
                            </div>
                            <button onClick={() => setShowAssessmentDetailModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Detailed Property Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Location</span>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="text-[#007EA7] shrink-0 mt-0.5" size={16} />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{selectedAssessment.town}, {selectedAssessment.county}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">{selectedAssessment.property_address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Property Type</span>
                                    <div className="flex items-center gap-2">
                                        <Home className="text-[#007EA7] shrink-0" size={16} />
                                        <p className="text-sm font-bold text-gray-900">{selectedAssessment.property_type || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Size</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedAssessment.property_size || 'N/A'}</p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Bedrooms</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedAssessment.bedrooms || 'N/A'}</p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Purpose</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedAssessment.ber_purpose || 'N/A'}</p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Heat Pump</span>
                                    <p className="text-sm font-bold text-gray-900">{selectedAssessment.heat_pump || 'No'}</p>
                                </div>
                            </div>

                            {/* Schedule & Features highlight */}
                            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-3">
                                    <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">
                                        {selectedAssessment.status === 'completed' ? 'Completed On' : 'Preferred Schedule'}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white rounded-xl text-[#007EA7] shadow-sm">
                                            {selectedAssessment.status === 'completed' ? <CheckCircle2 size={20} className="text-[#007F00]" /> : <Calendar size={20} />}
                                        </div>
                                        <p className="text-lg font-black text-gray-900">
                                            {selectedAssessment.status === 'completed' && selectedAssessment.completed_at ? (
                                                new Date(selectedAssessment.completed_at).toLocaleDateString('en-IE', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                            ) : selectedAssessment.preferred_date ? (
                                                `20${selectedAssessment.preferred_date.slice(2)} at ${selectedAssessment.preferred_time || 'anytime'}`
                                            ) : (
                                                'Not specified'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <span className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest block">Features</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAssessment.additional_features && selectedAssessment.additional_features.length > 0 ? (
                                            selectedAssessment.additional_features.map((feature, i) => (
                                                <span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full font-bold shadow-sm">
                                                    {feature}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 font-medium">Standard property features</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Client Summary card */}
                            <div className="bg-[#007F00]/5 border border-[#007F00]/10 rounded-2xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#007F00] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-green-900/10">
                                        {selectedAssessment.profiles?.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{selectedAssessment.profiles?.full_name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{selectedAssessment.profiles?.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a href={`mailto:${selectedAssessment.profiles?.email}`} className="p-2.5 bg-white border border-gray-100 text-[#007F00] rounded-xl hover:bg-green-50 transition-all shadow-sm">
                                        <Mail size={18} />
                                    </a>
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Required Actions</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {selectedAssessment.status === 'submitted' && (
                                        <button
                                            onClick={() => {
                                                setShowQuoteModal(true);
                                                setShowAssessmentDetailModal(false);
                                            }}
                                            className="bg-[#007F00] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <TrendingUp size={18} />
                                            Generate Quote
                                        </button>
                                    )}
                                    {!selectedAssessment.contractor_id && selectedAssessment.status !== 'completed' && (
                                        <button
                                            onClick={() => {
                                                setSelectedAssessmentForAssignment(selectedAssessment);
                                                setShowAssignModal(true);
                                                setShowAssessmentDetailModal(false);
                                            }}
                                            className="bg-[#007EA7] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <Briefcase size={18} />
                                            Assign Assessor
                                        </button>
                                    )}
                                    {selectedAssessment.status === 'quote_accepted' && (
                                        <button
                                            onClick={() => {
                                                setShowScheduleModal(true);
                                                setShowAssessmentDetailModal(false);
                                            }}
                                            className="bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <Calendar size={18} />
                                            Schedule
                                        </button>
                                    )}
                                    {selectedAssessment.status === 'scheduled' && (
                                        <button
                                            onClick={() => {
                                                setShowCompleteModal(true);
                                                setShowAssessmentDetailModal(false);
                                            }}
                                            className="bg-purple-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw size={18} />
                                            Complete
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            const name = selectedAssessment.profiles?.full_name || 'there';
                                            setMessageContent(`Hi ${name},\n\nI'm writing to you regarding your BER assessment for ${selectedAssessment.property_address}.\n\n[Type your message here]\n\nBest regards,\nThe Berman Team`);
                                            setShowMessageModal(true);
                                            setShowAssessmentDetailModal(false);
                                        }}
                                        className="bg-white border-2 border-gray-900 text-gray-900 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare size={18} />
                                        Message (Gmail)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* SPONSOR MODAL */}
            {showSponsorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Manage Sponsors</h3>
                            <button onClick={() => { setShowSponsorModal(false); setEditingSponsor(null); }} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        {/* List Sponsors */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Current Sponsors ({sponsors.length}/3)</h4>
                            <div className="space-y-3">
                                {sponsors.length === 0 && <p className="text-sm text-gray-500 italic">No sponsors added yet.</p>}
                                {sponsors.map(sponsor => (
                                    <div key={sponsor.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        {sponsor.image_url && <img src={sponsor.image_url} alt={sponsor.name} className="w-12 h-12 object-cover rounded-md" />}
                                        <div className="flex-grow">
                                            <p className="font-bold text-sm">{sponsor.headline}</p>
                                            <p className="text-xs text-gray-500">{sponsor.sub_text}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingSponsor(sponsor)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSponsor(sponsor.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add/Edit Form */}
                        {(sponsors.length < 3 || editingSponsor) && (
                            <form onSubmit={handleSaveSponsor} className="space-y-4 border-t border-gray-100 pt-6">
                                <h4 className="text-sm font-bold text-gray-900">{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Business Name</label>
                                        <input name="name" defaultValue={editingSponsor?.name} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Internal name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Headline</label>
                                        <input name="headline" defaultValue={editingSponsor?.headline} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Need Solar?" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Sub-text</label>
                                        <input name="sub_text" defaultValue={editingSponsor?.sub_text} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Short description" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Destination URL</label>
                                        <input name="destination_url" defaultValue={editingSponsor?.destination_url} required type="url" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Image URL</label>
                                    <input name="image_url" defaultValue={editingSponsor?.image_url} required type="url" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    {editingSponsor && (
                                        <button type="button" onClick={() => setEditingSponsor(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">Cancel Edit</button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="px-6 py-2 text-sm font-bold text-white bg-[#007F00] rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        {isUpdating ? <Loader2 className="animate-spin" size={16} /> : null}
                                        {editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {sponsors.length >= 3 && !editingSponsor && (
                            <div className="text-center p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg">
                                Maximum of 3 sponsors allowed. Delete one to add a new one.
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
                        <p className="text-gray-500 text-sm mb-8">
                            This action cannot be undone. This {itemToDelete?.type} will be permanently removed from our records.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setItemToDelete(null); }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Permanently'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* USER DETAILS / EDIT MODAL */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-8 overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-green-50 text-[#007F00] flex items-center justify-center font-bold text-2xl border border-green-100 uppercase">
                                        {selectedUser.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedUser.full_name}</h3>
                                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setSelectedUser(null); setIsEditingProfile(false); }} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            {!isEditingProfile ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account Role</p>
                                            <p className="text-sm font-bold text-gray-900 capitalize">{selectedUser.role}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className={`text-sm font-bold capitalize ${selectedUser.is_active !== false ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedUser.is_active !== false ? 'Active' : 'Suspended'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Subscription Section */}
                                    {(selectedUser.role === 'contractor' || selectedUser.role === 'business') && (
                                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-4">Subscription Management</h4>
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Status</p>
                                                    <p className="text-sm font-black text-blue-900 capitalize">{selectedUser.subscription_status || 'Inactive'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Ends On</p>
                                                    <p className="text-sm font-black text-blue-900">
                                                        {selectedUser.subscription_end_date ? new Date(selectedUser.subscription_end_date).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedUser.manual_override_reason && (
                                                <div className="mb-4 p-2 bg-white rounded-lg border border-blue-100">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Override Reason</p>
                                                    <p className="text-xs text-gray-600 italic">"{selectedUser.manual_override_reason}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">User ID</p>
                                            <p className="text-xs font-mono text-gray-600 break-all">{selectedUser.id}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                                            <p className="text-sm font-bold text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => {
                                                setEditForm({
                                                    full_name: selectedUser.full_name,
                                                    email: selectedUser.email,
                                                    subscription_status: selectedUser.subscription_status || 'inactive',
                                                    subscription_end_date: selectedUser.subscription_end_date,
                                                    manual_override_reason: selectedUser.manual_override_reason || ''
                                                });
                                                setIsEditingProfile(true);
                                            }}
                                            className="w-full py-4 bg-[#007F00] text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                                        >
                                            <Pencil size={18} />
                                            Edit Profile & Subscription
                                        </button>
                                        <div className="flex gap-3">
                                            <button
                                                className={`flex-1 py-3 font-bold rounded-xl transition-colors text-sm border ${selectedUser.is_active !== false
                                                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                                                    }`}
                                                onClick={() => {
                                                    setItemToSuspend({
                                                        id: selectedUser.id,
                                                        name: selectedUser.full_name,
                                                        currentStatus: selectedUser.is_active !== false
                                                    });
                                                    setShowSuspendModal(true);
                                                }}
                                            >
                                                {selectedUser.is_active !== false ? 'Suspend Account' : 'Activate Account'}
                                            </button>
                                            <button
                                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                                onClick={() => setSelectedUser(null)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editForm.full_name || ''}
                                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={editForm.email || ''}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                            />
                                        </div>

                                        {(selectedUser.role === 'contractor' || selectedUser.role === 'business') && (
                                            <>
                                                <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 space-y-4">
                                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Subscription Override</h4>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
                                                        <select
                                                            value={editForm.subscription_status || 'inactive'}
                                                            onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value })}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#007F00]/10"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                            <option value="trial">Trial Period</option>
                                                            <option value="lifetime">Lifetime Access</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="date"
                                                                value={editForm.subscription_end_date ? new Date(editForm.subscription_end_date).toISOString().split('T')[0] : ''}
                                                                onChange={(e) => setEditForm({ ...editForm, subscription_end_date: new Date(e.target.value).toISOString() })}
                                                                className="flex-grow border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const date = new Date();
                                                                    date.setMonth(date.getMonth() + 3);
                                                                    setEditForm({ ...editForm, subscription_end_date: date.toISOString(), subscription_status: 'active' });
                                                                }}
                                                                className="px-3 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 whitespace-nowrap"
                                                            >
                                                                +3 Months Free
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Reason for Adjustment</label>
                                                        <textarea
                                                            value={editForm.manual_override_reason || ''}
                                                            onChange={(e) => setEditForm({ ...editForm, manual_override_reason: e.target.value })}
                                                            placeholder="e.g., Manual upgrade for partnership..."
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20 focus:ring-2 focus:ring-[#007F00]/10"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            disabled={isUpdating}
                                            onClick={handleSaveProfile}
                                            className="flex-1 py-4 bg-[#007F00] text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                                        >
                                            {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                            {isUpdating ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            disabled={isUpdating}
                                            onClick={() => setIsEditingProfile(false)}
                                            className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SUSPEND USER MODAL */}
            {showSuspendModal && itemToSuspend && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6 text-amber-600">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {itemToSuspend.currentStatus ? 'Suspend User' : 'Activate User'}
                                </h3>
                                <p className="text-sm text-gray-500">Confirm account status change</p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-8">
                            Are you sure you want to {itemToSuspend.currentStatus ? <span className="text-red-600 font-bold">suspend</span> : <span className="text-green-600 font-bold">activate</span>} <strong>{itemToSuspend.name}</strong>?
                            {itemToSuspend.currentStatus && " The user will no longer be able to access their dashboard until reactivated."}
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setItemToSuspend(null);
                                }}
                                className="px-6 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={toggleUserStatus}
                                disabled={isUpdating}
                                className={`px-6 py-2 rounded-xl text-white font-bold transition-all shadow-lg flex items-center gap-2 ${itemToSuspend.currentStatus
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-100'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-100'
                                    }`}
                            >
                                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : null}
                                {itemToSuspend.currentStatus ? 'Suspend Account' : 'Activate Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD USER MODAL (MANUAL) — ENHANCED */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-8 pb-0 shrink-0">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Manual Registration</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Adding a new {newUserRole === 'contractor' ? 'Assessor' : 'Business'}</p>
                                </div>
                                <button onClick={() => { setShowAddUserModal(false); resetNewUserForm(); }} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleAddUser} className="flex flex-col flex-1 overflow-hidden">
                            <div className="px-8 pb-8 overflow-y-auto space-y-6 flex-1">
                                {/* SECTION: Personal Details */}
                                <div>
                                    <h4 className="text-[10px] font-black text-[#007F00] uppercase tracking-widest mb-4">Personal Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder={newUserRole === 'contractor' ? 'e.g. John Doe' : 'e.g. Acme Energy'}
                                                value={newUserFormData.fullName}
                                                onChange={(e) => setNewUserFormData({ ...newUserFormData, fullName: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email *</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                value={newUserFormData.email}
                                                onChange={(e) => setNewUserFormData({ ...newUserFormData, email: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Password *</label>
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                value={newUserFormData.password}
                                                onChange={(e) => setNewUserFormData({ ...newUserFormData, password: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                placeholder="+353 8X XXX XXXX"
                                                value={newUserFormData.phone}
                                                onChange={(e) => setNewUserFormData({ ...newUserFormData, phone: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                            />
                                        </div>
                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">County</label>
                                                <select
                                                    value={newUserFormData.county}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, county: e.target.value, town: '' })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white transition-all outline-none"
                                                >
                                                    <option value="">Select County</option>
                                                    {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            {newUserRole === 'contractor' && newUserFormData.county && (
                                                <div className="animate-in slide-in-from-top-2 duration-200">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Town</label>
                                                    <select
                                                        value={newUserFormData.town}
                                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, town: e.target.value })}
                                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white transition-all outline-none"
                                                    >
                                                        <option value="">Select Town</option>
                                                        {(TOWNS_BY_COUNTY[newUserFormData.county] || []).map((t: string) => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: Assessor-Specific Fields */}
                                {newUserRole === 'contractor' && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest mb-4">Assessor Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SEAI Registration #</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 10XXX"
                                                    value={newUserFormData.seaiNumber}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, seaiNumber: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assessor Type</label>
                                                <select
                                                    value={newUserFormData.assessorType}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, assessorType: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00] bg-white"
                                                >
                                                    <option value="Domestic Assessor">Domestic Assessor</option>
                                                    <option value="Commercial Assessor">Commercial Assessor</option>
                                                    <option value="Both">Both (Domestic & Commercial)</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Company Name <span className="text-gray-300">(optional)</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. ABC Energy Assessments"
                                                    value={newUserFormData.companyName}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, companyName: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007F00]/20 focus:border-[#007F00]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SECTION: Business-Specific Fields */}
                                {newUserRole === 'business' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <h4 className="text-[10px] font-black text-[#007EA7] uppercase tracking-widest mb-4">Business Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Business Address</label>
                                                <input
                                                    type="text"
                                                    placeholder="123 Main Street, Town"
                                                    value={newUserFormData.businessAddress}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, businessAddress: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Website <span className="text-gray-300 font-medium">(optional)</span></label>
                                                <input
                                                    type="url"
                                                    placeholder="https://www.example.ie"
                                                    value={newUserFormData.website}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, website: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Company Number <span className="text-gray-300 font-medium">(optional)</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="123456"
                                                    value={newUserFormData.companyNumber}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, companyNumber: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">VAT Number <span className="text-gray-300 font-medium">(optional)</span></label>
                                                <input
                                                    type="text"
                                                    placeholder="IE1234567A"
                                                    value={newUserFormData.vatNumber}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, vatNumber: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description <span className="text-gray-300 font-medium">(optional)</span></label>
                                                <textarea
                                                    placeholder="Describe the business and services..."
                                                    rows={3}
                                                    value={newUserFormData.description}
                                                    onChange={(e) => setNewUserFormData({ ...newUserFormData, description: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007EA7]/20 focus:border-[#007EA7] outline-none transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Banner */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                        <AlertTriangle size={12} className="inline mr-1 text-amber-500" />
                                        This will create a profile entry. If the user eventually signs up with this email, their dashboard will automatically link to this record.
                                    </p>
                                </div>
                            </div>

                            {/* Sticky footer */}
                            <div className="px-8 py-6 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50 rounded-b-3xl">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-[2] py-4 bg-[#007F00] text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    {isUpdating ? 'Adding...' : `Add ${newUserRole === 'contractor' ? 'Assessor' : 'Business'}`}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddUserModal(false); resetNewUserForm(); }}
                                    className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 hover:text-gray-700 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
