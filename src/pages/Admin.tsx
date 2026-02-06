
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { LogOut, RefreshCw, MessageSquare, Trash2, Eye, X, Mail, Phone, MapPin, Home, Calendar, ChevronDown, Loader2, AlertTriangle, TrendingUp, Briefcase, Menu, Pencil, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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
    role: 'admin' | 'contractor' | 'user' | 'homeowner';
    is_active?: boolean;
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
    vat_rate: number;
    company_name: string;
    support_email: string;
}

interface CatalogueListing {
    id: string;
    name: string;
    company_name: string;
    email: string;
    phone: string;
    description: string;
    address: string;
    website: string;
    logo_url: string;
    features: string[];
    is_verified: boolean;
    featured: boolean;
    is_active: boolean;
    created_at: string;
    images?: { id: string, url: string, display_order: number }[];
    social_media?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
    };
}

interface CatalogueCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
}

const Admin = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [users_list, setUsersList] = useState<Profile[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
    const [view, setView] = useState<'stats' | 'leads' | 'assessments' | 'users' | 'payments' | 'settings' | 'catalogue'>('stats');
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAssessmentForAssignment, setSelectedAssessmentForAssignment] = useState<Assessment | null>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAssessmentDetailModal, setShowAssessmentDetailModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'lead' | 'sponsor' | 'assessment' } | null>(null);
    const [itemToSuspend, setItemToSuspend] = useState<{ id: string, name: string, currentStatus: boolean } | null>(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);

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

    // Catalogue Management State
    const [catalogueTab, setCatalogueTab] = useState<'listings' | 'categories'>('listings');
    const [catalogueListings, setCatalogueListings] = useState<CatalogueListing[]>([]);
    const [catalogueCategories, setCatalogueCategories] = useState<CatalogueCategory[]>([]);
    const [showListingModal, setShowListingModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingListing, setEditingListing] = useState<CatalogueListing | null>(null);
    const [editingCategory, setEditingCategory] = useState<CatalogueCategory | null>(null);
    const [isSavingCatalogue, setIsSavingCatalogue] = useState(false);
    const [listingImages, setListingImages] = useState<string[]>(['', '', '']); // State for multiple images

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

            if (error) throw error;
            setUsersList(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select(`
                    *,
                    profiles:user_id (full_name, email)
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

    // Catalogue Fetch Functions
    const fetchCatalogueListings = async () => {
        try {
            const { data, error } = await supabase
                .from('catalogue_listings')
                .select(`
                    *,
                    images:catalogue_listing_images(id, url, display_order)
                `)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setCatalogueListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast.error('Failed to load listings');
        }
    };

    const fetchCatalogueCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('catalogue_categories')
                .select('*')
                .order('name');
            if (error) throw error;
            setCatalogueCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const handleSaveListing = async (listingData: Partial<CatalogueListing>) => {
        setIsSavingCatalogue(true);
        try {
            let listingId = editingListing?.id;

            if (editingListing) {
                const { error } = await supabase
                    .from('catalogue_listings')
                    .update(listingData)
                    .eq('id', editingListing.id);
                if (error) throw error;
                toast.success('Listing updated successfully');
            } else {
                const { data, error } = await supabase
                    .from('catalogue_listings')
                    .insert(listingData)
                    .select()
                    .single();
                if (error) throw error;
                listingId = data.id;
                toast.success('Listing created successfully');
            }

            // Handle Images
            if (listingId) {
                // Delete existing images first (simple replacement strategy)
                await supabase.from('catalogue_listing_images').delete().eq('listing_id', listingId);

                // Insert new images
                const imagesToInsert = listingImages
                    .filter(url => url && url.trim() !== '')
                    .map((url, index) => ({
                        listing_id: listingId,
                        url,
                        display_order: index
                    }));

                if (imagesToInsert.length > 0) {
                    const { error: imgError } = await supabase.from('catalogue_listing_images').insert(imagesToInsert);
                    if (imgError) throw imgError;
                }
            }

            setShowListingModal(false);
            setEditingListing(null);
            setListingImages(['', '', '']);
            fetchCatalogueListings();
        } catch (error) {
            console.error('Error saving listing:', error);
            toast.error('Failed to save listing');
        } finally {
            setIsSavingCatalogue(false);
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            const { error } = await supabase.from('catalogue_listings').delete().eq('id', id);
            if (error) throw error;
            toast.success('Listing deleted');
            fetchCatalogueListings();
        } catch (error) {
            console.error('Error deleting listing:', error);
            toast.error('Failed to delete listing');
        }
    };

    const handleSaveCategory = async (categoryData: Partial<CatalogueCategory>) => {
        setIsSavingCatalogue(true);
        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('catalogue_categories')
                    .update(categoryData)
                    .eq('id', editingCategory.id);
                if (error) throw error;
                toast.success('Category updated successfully');
            } else {
                const { error } = await supabase
                    .from('catalogue_categories')
                    .insert(categoryData);
                if (error) throw error;
                toast.success('Category created successfully');
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
            fetchCatalogueCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        } finally {
            setIsSavingCatalogue(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const { error } = await supabase.from('catalogue_categories').delete().eq('id', id);
            if (error) throw error;
            toast.success('Category deleted');
            fetchCatalogueCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
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

    const handleDeleteClick = (id: string, type: 'lead' | 'sponsor' | 'assessment') => {
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
                else if (view === 'users') await fetchUsers();
                else if (view === 'payments') await fetchPayments();
                else if (view === 'settings') {
                    await fetchAppSettings();
                    await fetchPromoSettings();
                    await fetchSponsors();
                }
                else if (view === 'stats') {
                    // Fetch everything for stats
                    await Promise.all([fetchLeads(), fetchAssessments(), fetchUsers(), fetchPayments()]);
                }
                else if (view === 'catalogue') {
                    await Promise.all([fetchCatalogueListings(), fetchCatalogueCategories()]);
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'catalogue_listings' }, () => fetchCatalogueListings())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'catalogue_categories' }, () => fetchCatalogueCategories())
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

            // 3. Log Audit
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
            const { error } = await supabase
                .from('assessments')
                .update({
                    status: 'scheduled',
                    scheduled_date: selectedDate
                })
                .eq('id', selectedAssessment.id);

            if (error) throw error;

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
                .select('id, full_name')
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
                    status: 'submitted'
                })
                .select()
                .single();

            if (assessmentError) throw assessmentError;

            const { error: leadUpdateError } = await supabase
                .from('leads')
                .update({ status: 'contacted' })
                .eq('id', selectedLead.id);

            if (leadUpdateError) throw leadUpdateError;

            toast.success('Lead converted successfully!');
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
                                        {(['stats', 'leads', 'assessments', 'users', 'payments', 'catalogue', 'settings'] as const).map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => { setView(v); setIsMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-200 ${view === v ? 'bg-[#5CB85C]/10 text-[#5CB85C]' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {v === 'stats' ? 'Overview' : v}
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
                                            view === 'users' ? 'User Management' :
                                                view === 'payments' ? 'Financials' :
                                                    view === 'settings' ? 'System Settings' : 'Admin'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {view === 'stats' ? 'Key metrics and business performance.' :
                                    view === 'leads' ? 'Manage your website submissions.' :
                                        view === 'assessments' ? 'Manage homeowner assessment requests.' :
                                            view === 'users' ? 'Manage homeowners and BER Assessors.' :
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
                ) : view === 'stats' ? (
                    <div className="space-y-8">
                        {/* Stats Cards Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
                                    <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                        {stats.homeowners} Users / {stats.contractors} Assessors
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
                                    onClick={() => setView('users')}
                                    className="mt-6 w-full bg-white text-[#007F00] font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Manage Users
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (view === 'leads' ? leads : view === 'assessments' ? assessments : users_list).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            {view === 'leads' ? <MessageSquare size={32} /> : view === 'users' ? <Briefcase size={32} /> : <Home size={32} />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No {view} yet</h3>
                        <p className="text-gray-500">{view === 'leads' ? 'New form submissions will appear here.' : 'New records will appear here.'}</p>
                    </div>
                ) : view === 'users' ? (
                    /* USERS VIEW */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">User Details</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Activity</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users_list.map((u) => (
                                        <tr key={u.id} className="hover:bg-green-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${u.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span className="text-xs font-bold uppercase tracking-tight text-gray-500">
                                                        {u.is_active !== false ? 'Active' : 'Suspended'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {u.full_name}
                                                <div className="text-xs text-gray-400 font-normal">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${u.role === 'admin' ? 'bg-red-50 text-red-700' :
                                                    u.role === 'contractor' ? 'bg-blue-50 text-blue-700' :
                                                        'bg-gray-50 text-gray-700'
                                                    }`}>
                                                    {u.role === 'contractor' ? 'BER Assessor' : u.role}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                {u.role === 'contractor' ? (
                                                    <div className="flex items-center gap-1 text-blue-600">
                                                        <Briefcase size={14} />
                                                        <span>{assessments.filter(a => a.contractor_id === u.id).length} Jobs</span>
                                                    </div>
                                                ) : u.role === 'homeowner' || u.role === 'user' ? (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <Home size={14} />
                                                        <span>{assessments.filter(a => a.user_id === u.id).length} Requests</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedUser(u)}
                                                        className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all"
                                                        title="View User Details"
                                                    >
                                                        <Eye size={16} />
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
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : view === 'leads' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Mobile View: Cards */}
                        <div className="md:hidden">
                            {leads.map((lead) => (
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
                            ))}
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
                                    {leads.map((lead) => (
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
                                                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Lead"
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
                                    {assessments.map((assessment) => (
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
                                    onClick={() => toast('Exporting CSV...', { icon: '📄' })}
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
                ) : view === 'settings' ? (
                    /* SETTINGS VIEW */
                    <div className="space-y-6">
                        {/* Global Settings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#007F00]" />
                                Global Pricing & Config
                            </h3>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    try {
                                        setIsSavingSettings(true);
                                        const { error } = await supabase.from('app_settings').update({
                                            default_quote_price: parseFloat(formData.get('default_quote_price') as string),
                                            vat_rate: parseFloat(formData.get('vat_rate') as string),
                                            company_name: formData.get('company_name') as string,
                                            support_email: formData.get('support_email') as string
                                        }).eq('id', appSettings?.id);
                                        if (error) throw error;
                                        toast.success('Settings updated!');
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
                                        {isSavingSettings ? 'Saving...' : 'Save Configuration'}
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
                ) : view === 'catalogue' ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Manage Catalogue</h3>
                                <Link
                                    to="/catalogue"
                                    className="text-[#007F00] text-sm font-bold hover:underline flex items-center gap-1"
                                >
                                    <Eye size={16} />
                                    View Public Catalogue
                                </Link>
                            </div>

                            {/* Sub-Tabs */}
                            <div className="flex gap-2 border-b border-gray-200">
                                {(['listings', 'categories'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setCatalogueTab(tab);
                                            if (tab === 'listings') fetchCatalogueListings();
                                            if (tab === 'categories') fetchCatalogueCategories();
                                        }}
                                        className={`px-4 py-2 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${catalogueTab === tab
                                            ? 'border-[#007F00] text-[#007F00]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Listings Tab */}
                        {catalogueTab === 'listings' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800">Listings ({catalogueListings.length})</h4>
                                    <button
                                        onClick={() => { setEditingListing(null); setShowListingModal(true); }}
                                        className="bg-[#007F00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#006600] transition-colors"
                                    >
                                        + Add Listing
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-bold text-gray-600">Name</th>
                                                <th className="px-4 py-3 text-left font-bold text-gray-600">Company</th>
                                                <th className="px-4 py-3 text-left font-bold text-gray-600">Email</th>
                                                <th className="px-4 py-3 text-left font-bold text-gray-600">Status</th>
                                                <th className="px-4 py-3 text-right font-bold text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {catalogueListings.map((listing) => (
                                                <tr key={listing.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{listing.name}</td>
                                                    <td className="px-4 py-3 text-gray-600">{listing.company_name}</td>
                                                    <td className="px-4 py-3 text-gray-600">{listing.email}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${listing.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {listing.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingListing(listing);
                                                                    // Load images
                                                                    const urls = listing.images?.sort((a, b) => a.display_order - b.display_order).map(i => i.url) || [];
                                                                    // Pad to 3
                                                                    while (urls.length < 3) urls.push('');
                                                                    setListingImages(urls.slice(0, 3));
                                                                    setShowListingModal(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit Listing"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteListing(listing.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Listing"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {catalogueListings.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                                                        No listings found. Click "Add Listing" to create one.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Categories Tab */}
                        {catalogueTab === 'categories' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800">Categories ({catalogueCategories.length})</h4>
                                    <button
                                        onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                                        className="bg-[#007F00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#006600] transition-colors"
                                    >
                                        + Add Category
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {catalogueCategories.map((category) => (
                                        <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-bold text-gray-900">{category.name}</h5>
                                                    <p className="text-xs text-gray-500 mt-1">{category.description || 'No description'}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => { setEditingCategory(category); setShowCategoryModal(true); }}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Edit Category"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {catalogueCategories.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-gray-500 italic">
                                            No categories found. Click "Add Category" to create one.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedLead.email}&su=${encodeURIComponent('Re: Your inquiry to The Berman')}&body=${encodeURIComponent(`Hi ${selectedLead.name},\n\nThank you for reaching out regarding your property in ${selectedLead.town || 'your area'}.\n\n`)}`}
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

            {/* USER DETAILS MODAL */}
            {
                selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-green-50 text-[#007F00] flex items-center justify-center font-bold text-2xl border border-green-100">
                                            {selectedUser.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{selectedUser.full_name}</h3>
                                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account Role</p>
                                            <p className="text-sm font-bold text-gray-900 capitalize">{selectedUser.role}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className={`text-sm font-bold capitalize ${selectedUser.is_active !== false ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedUser.is_active !== false ? 'Active Account' : 'Suspended'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">User ID</p>
                                        <p className="text-xs font-mono text-gray-600 break-all">{selectedUser.id}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                                        <p className="text-sm font-bold text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                        onClick={() => setSelectedUser(null)}
                                    >
                                        Close
                                    </button>
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
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

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

            {/* LISTING MODAL */}
            {showListingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{editingListing ? 'Edit Listing' : 'Add New Listing'}</h3>
                            <button onClick={() => { setShowListingModal(false); setEditingListing(null); setListingImages(['', '', '']); }} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            handleSaveListing({
                                name: formData.get('name') as string,
                                company_name: formData.get('company_name') as string,
                                email: formData.get('email') as string,
                                phone: formData.get('phone') as string,
                                description: formData.get('description') as string,
                                address: formData.get('address') as string,
                                website: formData.get('website') as string,
                                logo_url: formData.get('logo_url') as string,
                                is_active: formData.get('is_active') === 'on',
                                featured: formData.get('is_featured') === 'on',
                                is_verified: formData.get('is_verified') === 'on',
                                features: formData.get('features') ? (formData.get('features') as string).split(',').map(s => s.trim()).filter(s => s) : [],
                                social_media: {
                                    facebook: formData.get('social_facebook') as string || undefined,
                                    instagram: formData.get('social_instagram') as string || undefined,
                                    linkedin: formData.get('social_linkedin') as string || undefined,
                                    twitter: formData.get('social_twitter') as string || undefined,
                                }
                            });
                        }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Name *</label>
                                    <input name="name" defaultValue={editingListing?.name || ''} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Company Name *</label>
                                    <input name="company_name" defaultValue={editingListing?.company_name || ''} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                                    <input name="email" type="email" defaultValue={editingListing?.email || ''} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label>
                                    <input name="phone" defaultValue={editingListing?.phone || ''} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                    <textarea name="description" defaultValue={editingListing?.description || ''} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Address *</label>
                                    <input name="address" defaultValue={editingListing?.address || ''} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Website</label>
                                    <input name="website" defaultValue={editingListing?.website || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Logo URL</label>
                                    <input name="logo_url" defaultValue={editingListing?.logo_url || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Features (comma separated)</label>
                                    <textarea
                                        name="features"
                                        defaultValue={editingListing?.features?.join(', ') || ''}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        placeholder="e.g. Free Quote, 24/7 Support, SEAI Registered"
                                    />
                                </div>

                                <div className="col-span-2 space-y-3 pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-widest">Social Media</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Facebook URL</label>
                                            <input name="social_facebook" defaultValue={editingListing?.social_media?.facebook || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="https://facebook.com/..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Instagram URL</label>
                                            <input name="social_instagram" defaultValue={editingListing?.social_media?.instagram || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="https://instagram.com/..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">LinkedIn URL</label>
                                            <input name="social_linkedin" defaultValue={editingListing?.social_media?.linkedin || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="https://linkedin.com/..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Twitter / X URL</label>
                                            <input name="social_twitter" defaultValue={editingListing?.social_media?.twitter || ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="https://twitter.com/..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-3 pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-widest">Hero Images (Carousel)</label>
                                    <p className="text-xs text-gray-500 mb-2">Add up to 3 images for the top carousel.</p>
                                    {listingImages.map((img, index) => (
                                        <div key={index}>
                                            <input
                                                value={img}
                                                onChange={(e) => {
                                                    const newImages = [...listingImages];
                                                    newImages[index] = e.target.value;
                                                    setListingImages(newImages);
                                                }}
                                                placeholder={`Image URL #${index + 1}`}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" name="is_active" defaultChecked={editingListing?.is_active ?? true} className="w-4 h-4 text-[#007F00]" />
                                    <span className="text-sm font-medium">Active</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" name="is_featured" defaultChecked={editingListing?.featured ?? false} className="w-4 h-4 text-[#007F00]" />
                                    <span className="text-sm font-medium">Featured</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" name="is_verified" defaultChecked={editingListing?.is_verified ?? false} className="w-4 h-4 text-[#007F00]" />
                                    <span className="text-sm font-medium">Verified</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => { setShowListingModal(false); setEditingListing(null); setListingImages(['', '', '']); }} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSavingCatalogue} className="bg-[#007F00] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
                                    {isSavingCatalogue ? <Loader2 size={18} className="animate-spin" /> : null}
                                    {editingListing ? 'Update Listing' : 'Create Listing'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CATEGORY MODAL */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                            <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            handleSaveCategory({
                                name: formData.get('name') as string,
                                icon: formData.get('icon') as string,
                                description: formData.get('description') as string,
                            });
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Name *</label>
                                <input name="name" defaultValue={editingCategory?.name || ''} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Icon (lucide name)</label>
                                <input name="icon" defaultValue={editingCategory?.icon || ''} placeholder="e.g., home, briefcase, zap" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea name="description" defaultValue={editingCategory?.description || ''} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSavingCatalogue} className="bg-[#007F00] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
                                    {isSavingCatalogue ? <Loader2 size={18} className="animate-spin" /> : null}
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div >
    );
};

export default Admin;
