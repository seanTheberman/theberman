import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { LogOut, RefreshCw, BarChart2, Building2, BookOpen, ClipboardList, HardHat, Home, Inbox, DollarSign, Newspaper, Settings as SettingsIcon, Users, Layers, Menu, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { geocodeAddress, COUNTY_COORDINATES } from '../lib/geocoding';

// Types
import type { Lead, Assessment, Profile, Payment, Sponsor, AppSettings, NewsArticle, CatalogueFormData, AdminView, DeletedItem } from '../types/admin';

// Views
import { StatsView } from '../components/admin/views/StatsView';
import { LeadsView } from '../components/admin/views/LeadsView';
import { AssessmentsView } from '../components/admin/views/AssessmentsView';
import { UsersView } from '../components/admin/views/UsersView';
import { BusinessesView } from '../components/admin/views/BusinessesView';
import { CatalogueView } from '../components/admin/views/CatalogueView';
import { AddToCatalogueView } from '../components/admin/views/AddToCatalogueView';
import { PaymentsView } from '../components/admin/views/PaymentsView';
import { NewsView } from '../components/admin/views/NewsView';
import { SettingsView } from '../components/admin/views/SettingsView';
import { RecentlyDeletedView } from '../components/admin/views/RecentlyDeletedView';

// Modals
import { LeadDetailsModal } from '../components/admin/modals/LeadDetailsModal';
import { GenerateQuoteModal } from '../components/admin/modals/GenerateQuoteModal';
import { MessageModal } from '../components/admin/modals/MessageModal';
import { ScheduleModal } from '../components/admin/modals/ScheduleModal';
import { CompleteModal } from '../components/admin/modals/CompleteModal';
import { AssessmentDetailModal } from '../components/admin/modals/AssessmentDetailModal';
import { AssignAssessorModal } from '../components/admin/modals/AssignAssessorModal';
import { SponsorModal } from '../components/admin/modals/SponsorModal';
import { DeleteConfirmModal } from '../components/admin/modals/DeleteConfirmModal';
import { UserDetailsModal } from '../components/admin/modals/UserDetailsModal';
import { SuspendUserModal } from '../components/admin/modals/SuspendUserModal';
import { AddUserModal } from '../components/admin/modals/AddUserModal';

const Admin = () => {
    // ─── State ──────────────────────────────────────────────────────────────────
    const [leads, setLeads] = useState<Lead[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [users_list, setUsersList] = useState<Profile[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
    const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [catalogueCategories, setCatalogueCategories] = useState<{ id: string; name: string }[]>([]);
    const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);

    const [view, setView] = useState<AdminView>('stats');
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [isSavingRegistrationFees, setIsSavingRegistrationFees] = useState(false);
    const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);
    const [isSavingCatalogue, setIsSavingCatalogue] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState<{ [key: number]: boolean }>({});
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [customMonths, setCustomMonths] = useState<number>(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopExpanded, setDesktopExpanded] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Selected items
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [selectedAssessmentForAssignment, setSelectedAssessmentForAssignment] = useState<Assessment | null>(null);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [editForm, setEditForm] = useState<Partial<Profile>>({});
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'lead' | 'sponsor' | 'assessment' | 'user' } | null>(null);
    const [itemToSuspend, setItemToSuspend] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);

    // Modal visibility
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAssessmentDetailModal, setShowAssessmentDetailModal] = useState(false);
    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    // Form state for modals
    const [quoteData, setQuoteData] = useState({ price: '', estimated_date: '', notes: '' });
    const [messageContent, setMessageContent] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [certUrl, setCertUrl] = useState('');

    // New user form
    const [newUserRole, setNewUserRole] = useState<'contractor' | 'business'>('contractor');
    const [newUserFormData, setNewUserFormData] = useState({
        fullName: '', email: '', password: '', phone: '', county: '', town: '',
        seaiNumber: '', assessorType: 'Domestic Assessor', companyName: '',
        businessAddress: '', website: '', description: '', companyNumber: '', vatNumber: '',
    });

    // Catalogue form
    const [selectedBusinessForCatalogue, setSelectedBusinessForCatalogue] = useState<Profile | null>(null);
    const [selectedListingForEdit, setSelectedListingForEdit] = useState<any | null>(null);
    const [catalogueFormData, setCatalogueFormData] = useState<CatalogueFormData>({
        companyName: '', description: '', email: '', phone: '', address: '', county: '',
        website: '', logoUrl: '', featured: false, selectedCategories: [],
        additionalAddresses: [], companyNumber: '', registrationNo: '', vatNumber: '',
        bannerUrl: '', socialFacebook: '', socialInstagram: '', socialLinkedin: '', socialTwitter: '',
        socialWhatsapp: '', socialYoutube: '', socialSnapchat: '', socialTiktok: '',
        galleryImages: Array(10).fill(null).map(() => ({ url: '', description: '' })),
        features: [],
    });

    // Promo settings
    const [promoSettings, setPromoSettings] = useState({
        id: 1, is_enabled: false, headline: '', sub_text: '', image_url: '', destination_url: ''
    });

    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    // ─── Derived state ───────────────────────────────────────────────────────────
    // Only show counties where that specific role actually has users
    const uniqueUserLocations = Array.from(
        new Set(users_list.filter(u => u.role === 'user' || u.role === 'homeowner').map(u => u.county || u.home_county).filter(Boolean))
    ).sort() as string[];
    const uniqueAssessorLocations = Array.from(
        new Set(users_list.filter(u => u.role === 'contractor').flatMap(u => [u.home_county, u.county, ...(u.preferred_counties || [])]).filter(Boolean))
    ).sort() as string[];
    const uniqueBusinessLocations = Array.from(
        new Set(users_list.filter(u => u.role === 'business').map(u => u.county || u.home_county).filter(Boolean))
    ).sort() as string[];

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

    const filteredBusinessLeads = users_list.filter(u => u.role === 'business').filter(u => {
        const query = searchTerm.toLowerCase();
        const matchSearch =
            u.full_name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.company_name?.toLowerCase().includes(query) ||
            u.business_address?.toLowerCase().includes(query) ||
            u.county?.toLowerCase().includes(query) ||
            u.town?.toLowerCase().includes(query);
        const matchLocation = !locationFilter || u.county === locationFilter || (u as any).home_county === locationFilter;
        return matchSearch && matchLocation;
    });

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
        pendingOnboarding: users_list.filter(u => u.role === 'business' && !listings.some(l => l.user_id === u.id || l.owner_id === u.id)).length,
    };

    // ─── Helpers ─────────────────────────────────────────────────────────────────
    const getFallbackPhone = (profile: Profile) => {
        if (profile.phone && profile.phone !== 'N/A') return profile.phone;
        const linked = assessments.find(a => a.user_id === profile.id && (a.contact_phone || a.profiles?.phone));
        return linked?.contact_phone || linked?.profiles?.phone || 'N/A';
    };

    const logAudit = async (action: string, entityType: string, entityId: string, details: any) => {
        try {
            await supabase.from('audit_logs').insert({
                user_id: user?.id, action, entity_type: entityType, entity_id: entityId, details
            });
        } catch (error) {
            console.error('Audit log error:', error);
        }
    };

    // ─── Effects ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        setSearchTerm('');
        setLocationFilter('');
    }, [view]);

    useEffect(() => {
        if (selectedUser) {
            setEditForm({
                full_name: selectedUser.full_name || '',
                email: selectedUser.email || '',
                phone: getFallbackPhone(selectedUser) === 'N/A' ? '' : getFallbackPhone(selectedUser),
                subscription_status: selectedUser.subscription_status || 'inactive',
                subscription_start_date: selectedUser.subscription_start_date,
                subscription_end_date: selectedUser.subscription_end_date,
                manual_override_reason: selectedUser.manual_override_reason || '',
                stripe_payment_id: selectedUser.stripe_payment_id || '',
                role: selectedUser.role,
                assessor_type: selectedUser.assessor_type || ''
            });
        } else {
            setEditForm({});
        }
    }, [selectedUser]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

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
                } else if (view === 'catalogue') {
                    await fetchListings();
                    await fetchCatalogueCategories();
                } else if (view === 'add-to-catalogue') {
                    await fetchCatalogueCategories();
                } else if (view === 'assessors') await fetchUsers();
                else if (view === 'payments') await fetchPayments();
                else if (view === 'settings') {
                    await fetchAppSettings();
                    await fetchPromoSettings();
                    await fetchSponsors();
                } else if (view === 'stats') {
                    await Promise.all([fetchLeads(), fetchAssessments(), fetchUsers(), fetchPayments()]);
                } else if (view === 'news') {
                    await fetchNewsArticles();
                } else if (view === 'recently-deleted') {
                    await fetchDeletedItems();
                }
            } finally {
                setIsUpdating(false);
            }
        };

        fetchViewData();
        fetchPromoSettings();

        const channel = supabase
            .channel('admin-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments' }, () => fetchAssessments())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchUsers())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchPayments())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => fetchAppSettings())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [view]);

    // ─── Data Fetching ────────────────────────────────────────────────────────────
    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setLeads((data || []).filter((r: any) => !r.deleted_at));
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAndDisableExpiredSubscriptions = async (users: Profile[]) => {
        const now = new Date();
        const expiredUserIds = users
            .filter(u => (u.role === 'business' || u.role === 'contractor') &&
                u.is_active !== false &&
                u.subscription_end_date &&
                new Date(u.subscription_end_date) < now)
            .map(u => u.id);

        if (expiredUserIds.length > 0) {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: false, subscription_status: 'expired' })
                .in('id', expiredUserIds);
            if (!error) {
                toast(`Auto-disabled ${expiredUserIds.length} expired accounts.`, { icon: 'ℹ️' });
            }
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) {
                if (error.message?.includes('column "registration_status" does not exist')) {
                    toast.error('Registration status column missing. Please run the SQL migration.');
                } else throw error;
            }
            const users = (data || []).filter((r: any) => !r.deleted_at);
            setUsersList(users);
            checkAndDisableExpiredSubscriptions(users);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast.error(error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchListings = async () => {
        try {
            const { data, error } = await supabase.from('catalogue_listings').select('*');
            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    };

    const fetchCatalogueCategories = async () => {
        try {
            const { data, error } = await supabase.from('catalogue_categories').select('id, name').order('name');
            if (error) throw error;
            setCatalogueCategories(data || []);
        } catch (error) {
            console.error('Error fetching catalogue categories:', error);
        }
    };

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*, profiles:user_id (full_name, email, phone), referred_by:referred_by_listing_id (name, company_name)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAssessments((data || []).filter((r: any) => !r.deleted_at));
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
                .select('*, profiles (full_name, email)')
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
            const { data, error } = await supabase.from('app_settings').select('*').single();
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

    const fetchSponsors = async () => {
        try {
            const { data, error } = await supabase.from('sponsors').select('*').order('created_at', { ascending: true });
            if (error) throw error;
            setSponsors(data || []);
        } catch (error) {
            console.error('Error fetching sponsors:', error);
        }
    };

    const fetchDeletedItems = async () => {
        try {
            const [leadsRes, assessmentsRes, profilesRes] = await Promise.all([
                supabase.from('leads').select('id, name, email, deleted_at, message').not('deleted_at', 'is', null).order('deleted_at', { ascending: false }).then(r => r.error?.code === '42703' ? { data: [], error: null } : r),
                supabase.from('assessments').select('id, property_address, deleted_at, status, profiles:user_id(email)').not('deleted_at', 'is', null).order('deleted_at', { ascending: false }).then(r => r.error?.code === '42703' ? { data: [], error: null } : r),
                supabase.from('profiles').select('id, full_name, email, deleted_at, role').not('deleted_at', 'is', null).order('deleted_at', { ascending: false }).then(r => r.error?.code === '42703' ? { data: [], error: null } : r),
            ]);

            const items: DeletedItem[] = [
                ...(leadsRes.data || []).map((l: any) => ({
                    id: l.id, type: 'lead' as const,
                    deleted_at: l.deleted_at,
                    label: l.name || 'Unnamed Lead',
                    email: l.email,
                    details: l.message ? l.message.slice(0, 60) + (l.message.length > 60 ? '...' : '') : undefined,
                })),
                ...(assessmentsRes.data || []).map((a: any) => ({
                    id: a.id, type: 'assessment' as const,
                    deleted_at: a.deleted_at,
                    label: a.property_address || 'Unknown Address',
                    email: a.profiles?.email,
                    details: a.status,
                })),
                ...(profilesRes.data || []).map((p: any) => ({
                    id: p.id, type: 'user' as const,
                    deleted_at: p.deleted_at,
                    label: p.full_name || 'Unknown User',
                    email: p.email,
                    details: p.role,
                })),
            ].sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());

            setDeletedItems(items);
        } catch (error) {
            console.error('Error fetching deleted items:', error);
        }
    };

    const fetchPromoSettings = async () => {
        try {
            const { data } = await supabase.from('promo_settings').select('*').eq('id', 1).maybeSingle();
            if (data) {
                setPromoSettings(data);
            } else {
                setPromoSettings({ id: 1, is_enabled: false, headline: 'Considering Solar Panels?', sub_text: 'Compare the Best Solar Deals', image_url: '', destination_url: '' });
            }
        } catch (error) {
            console.error('Error fetching promo settings:', error);
        }
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────────
    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const updateStatus = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
            if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status: newStatus });
            toast.success('Status updated');
        } catch (error: any) {
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
            if (itemToDelete.type === 'sponsor') {
                // Sponsors are permanently deleted immediately (no soft delete needed)
                const { error } = await supabase.from('sponsors').delete().eq('id', itemToDelete.id);
                if (error) throw error;
                setSponsors(sponsors.filter(s => s.id !== itemToDelete.id));
                toast.success('Sponsor deleted successfully');
            } else {
                // Soft delete: set deleted_at, move to "Recently Deleted"
                const tableMap = { lead: 'leads', assessment: 'assessments', user: 'profiles' } as const;
                const table = tableMap[itemToDelete.type as keyof typeof tableMap];
                const deletedAt = new Date().toISOString();
                const { error } = await supabase.from(table).update({ deleted_at: deletedAt }).eq('id', itemToDelete.id);
                if (error?.code === '42703') {
                    // Column not yet migrated — run the SQL migration in Supabase dashboard first
                    throw new Error('Please run the soft-delete SQL migration in your Supabase dashboard first (supabase/migrations/20260307_add_soft_delete.sql)');
                }
                if (error) throw error;

                if (itemToDelete.type === 'lead') {
                    setLeads(leads.filter(l => l.id !== itemToDelete.id));
                    if (selectedLead?.id === itemToDelete.id) setSelectedLead(null);
                } else if (itemToDelete.type === 'assessment') {
                    setAssessments(assessments.filter(a => a.id !== itemToDelete.id));
                    if (selectedAssessment?.id === itemToDelete.id) setSelectedAssessment(null);
                } else if (itemToDelete.type === 'user') {
                    setUsersList(users_list.filter(u => u.id !== itemToDelete.id));
                    if (selectedUser?.id === itemToDelete.id) setSelectedUser(null);
                }
                toast.success('Moved to Recently Deleted. You can restore or permanently delete from there.');
            }
            setShowDeleteModal(false);
        } catch (error: any) {
            toast.error(error.message || `Failed to delete ${itemToDelete.type}`);
        } finally {
            setIsDeleting(false);
            setItemToDelete(null);
        }
    };

    const handleRestoreItem = async (id: string, type: 'lead' | 'assessment' | 'user') => {
        try {
            const tableMap = { lead: 'leads', assessment: 'assessments', user: 'profiles' } as const;
            const { error } = await supabase.from(tableMap[type]).update({ deleted_at: null }).eq('id', id);
            if (error) throw error;
            setDeletedItems(prev => prev.filter(i => !(i.id === id && i.type === type)));
            toast.success('Item restored successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to restore item');
        }
    };

    const handlePermanentDelete = async (id: string, type: 'lead' | 'assessment' | 'user') => {
        if (!confirm('This will permanently delete the item from the database. This cannot be undone. Continue?')) return;
        setIsDeleting(true);
        try {
            const tableMap = { lead: 'leads', assessment: 'assessments', user: 'profiles' } as const;
            const { error } = await supabase.from(tableMap[type]).delete().eq('id', id);
            if (error) throw error;
            setDeletedItems(prev => prev.filter(i => !(i.id === id && i.type === type)));
            toast.success('Permanently deleted from database');
        } catch (error: any) {
            toast.error(error.message || 'Failed to permanently delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkRestore = async (items: {id: string, type: 'lead' | 'assessment' | 'user'}[]) => {
        try {
            const tableMap = { lead: 'leads', assessment: 'assessments', user: 'profiles' } as const;
            for (const item of items) {
                const { error } = await supabase.from(tableMap[item.type]).update({ deleted_at: null }).eq('id', item.id);
                if (error) throw error;
            }
            setDeletedItems(prev => prev.filter(i => !items.some(item => item.id === i.id && item.type === i.type)));
            toast.success(`${items.length} items restored successfully`);
        } catch (error: any) {
             toast.error(error.message || 'Failed to restore some items');
        }
    };

    const handleBulkPermanentDelete = async (items: {id: string, type: 'lead' | 'assessment' | 'user'}[]) => {
        if (!confirm(`This will permanently delete ${items.length} items from the database. This cannot be undone. Continue?`)) return;
        setIsDeleting(true);
        try {
            const tableMap = { lead: 'leads', assessment: 'assessments', user: 'profiles' } as const;
            for (const item of items) {
                const { error } = await supabase.from(tableMap[item.type]).delete().eq('id', item.id);
                if (error) throw error;
            }
            setDeletedItems(prev => prev.filter(i => !items.some(item => item.id === i.id && item.type === i.type)));
            toast.success(`${items.length} items permanently deleted`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete some items');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
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
            if (fnError) throw new Error(fnError.message || 'Edge function failed');
            if (!fnData?.success) throw new Error(fnData?.error || 'Failed to create user');

            try {
                const { data: emailData } = await supabase.functions.invoke('send-onboarding-link', {
                    body: {
                        fullName: newUserFormData.fullName,
                        email: newUserFormData.email,
                        password: newUserFormData.password,
                        town: newUserFormData.town || '',
                        onboardingUrl: fnData.magicLink,
                        role: newUserRole,
                        userId: fnData.user.id
                    }
                });
                if (emailData?.success) {
                    toast.success(`${newUserRole === 'contractor' ? 'Assessor' : 'Business'} created & login link sent via email!`);
                } else {
                    toast.success('User created but email failed. Please share the login link manually.');
                }
            } catch {
                toast.success('User created but email failed. Please share the login link manually.');
            }

            if (fnData?.user) {
                setUsersList([fnData.user, ...users_list]);
                logAudit('create_user', 'user', fnData.user.id, { role: newUserRole });
            }
            setShowAddUserModal(false);
            setNewUserFormData({
                fullName: '', email: '', password: '', phone: '', county: '', town: '',
                seaiNumber: '', assessorType: 'Domestic Assessor', companyName: '',
                businessAddress: '', website: '', description: '', companyNumber: '', vatNumber: '',
            });
        } catch (error: any) {
            toast.error(error.message || 'Failed to add user');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        try {
            const finalStripeId = (editForm.subscription_status === 'active' && !editForm.stripe_payment_id)
                ? 'MANUAL_BY_ADMIN'
                : (editForm.stripe_payment_id || undefined);

            const { error } = await supabase.from('profiles').update({
                subscription_status: editForm.subscription_status,
                subscription_start_date: editForm.subscription_start_date,
                subscription_end_date: editForm.subscription_end_date,
                manual_override_reason: editForm.manual_override_reason,
                stripe_payment_id: finalStripeId,
                role: editForm.role,
                assessor_type: editForm.assessor_type || undefined
            }).eq('id', selectedUser.id);
            if (error) throw error;

            const updates = {
                subscription_status: editForm.subscription_status,
                subscription_start_date: editForm.subscription_start_date,
                subscription_end_date: editForm.subscription_end_date,
                manual_override_reason: editForm.manual_override_reason,
                stripe_payment_id: finalStripeId,
                role: editForm.role as any,
                assessor_type: editForm.assessor_type || undefined
            };
            setUsersList(users_list.map(u => u.id === selectedUser.id ? { ...u, ...updates } : u));
            setSelectedUser({ ...selectedUser, ...updates });
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error('Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleManualRenewal = async (userId: string, monthsToAdd: number = 12) => {
        setIsUpdating(true);
        try {
            const userToUpdate = users_list.find(u => u.id === userId);
            const now = new Date();
            let startDate = new Date();
            let endDate = new Date();

            if (userToUpdate?.subscription_end_date) {
                const currentEnd = new Date(userToUpdate.subscription_end_date);
                if (currentEnd > now) {
                    startDate = userToUpdate.subscription_start_date ? new Date(userToUpdate.subscription_start_date) : now;
                    endDate = new Date(currentEnd);
                    endDate.setMonth(endDate.getMonth() + monthsToAdd);
                } else {
                    endDate.setMonth(endDate.getMonth() + monthsToAdd);
                }
            } else {
                endDate.setMonth(endDate.getMonth() + monthsToAdd);
            }

            const updateData: Partial<Profile> = {
                subscription_status: 'active',
                subscription_start_date: startDate.toISOString(),
                subscription_end_date: endDate.toISOString(),
                is_active: true,
                registration_status: 'active',
                stripe_payment_id: userToUpdate?.stripe_payment_id || 'MANUAL_BY_ADMIN'
            };

            const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
            if (error) throw error;

            setUsersList(users_list.map(u => u.id === userId ? { ...u, ...updateData } : u));
            if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, ...updateData } as Profile);
            toast.success(`Subscription updated for ${monthsToAdd} months & account activated!`);
            fetchUsers();
        } catch (error: any) {
            toast.error('Failed to renew subscription');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelSubscription = async (userId: string) => {
        if (!confirm('Are you sure you want to cancel this subscription? The user will be instantly disabled.')) return;
        setIsUpdating(true);
        try {
            const updates = { subscription_status: 'cancelled', is_active: false, stripe_payment_id: 'CANCELLED', registration_status: 'pending' as const };
            const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
            if (error) throw error;
            setUsersList(users_list.map(u => u.id === userId ? { ...u, ...updates } : u));
            if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, ...updates });
            toast.success('Subscription cancelled and status updated.');
            fetchUsers();
        } catch (error: any) {
            toast.error('Failed to cancel subscription');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendRenewalReminder = async (u: any) => {
        setSendingEmailId(u.id);
        try {
            const expiryDate = u.subscription_end_date ? new Date(u.subscription_end_date).toLocaleDateString('en-GB') : 'Soon';
            const subject = encodeURIComponent(`Your Subscription Expiry - The Berman`);
            const body = encodeURIComponent(`Hi ${u.full_name || 'there'},\n\nYour subscription with The Berman has expired/is about to expire on ${expiryDate}.\n\nTo continue your membership and keep your listing active, please login and renew your subscription.\n\nBest regards,\nThe Berman Team`);
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${u.email}&su=${subject}&body=${body}`, '_blank');
            toast.success('Opening Gmail with renewal reminder...');
        } catch (error: any) {
            toast.error('Failed to send renewal reminder');
        } finally {
            setSendingEmailId(null);
        }
    };

    const toggleUserStatus = async () => {
        if (!itemToSuspend) return;
        setIsUpdating(true);
        try {
            const isSuspending = itemToSuspend.currentStatus === true;
            const updateData: any = { is_active: !itemToSuspend.currentStatus };
            if (isSuspending) {
                updateData.stripe_payment_id = 'SUSPENDED';
                updateData.registration_status = 'pending';
            } else {
                updateData.stripe_payment_id = 'MANUAL_BY_ADMIN';
                updateData.registration_status = 'active';
            }

            const { error } = await supabase.from('profiles').update(updateData).eq('id', itemToSuspend.id);
            if (error) throw error;

            await supabase.from('catalogue_listings').update({ is_active: !itemToSuspend.currentStatus })
                .eq('owner_id', itemToSuspend.id);

            const profileUpdates = {
                is_active: !itemToSuspend.currentStatus,
                stripe_payment_id: isSuspending ? 'SUSPENDED' : 'MANUAL_BY_ADMIN',
                registration_status: (isSuspending ? 'pending' : 'active') as 'pending' | 'active',
            };
            setUsersList(users_list.map(u => u.id === itemToSuspend.id ? { ...u, ...profileUpdates } : u));
            setListings(prev => prev.map(l => (l.user_id === itemToSuspend.id || l.owner_id === itemToSuspend.id) ? { ...l, is_active: !itemToSuspend.currentStatus } : l));
            if (selectedUser?.id === itemToSuspend.id) setSelectedUser({ ...selectedUser, ...profileUpdates });

            toast.success(`User ${isSuspending ? 'suspended' : 'activated'} successfully`);
            setShowSuspendModal(false);
            setItemToSuspend(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user status');
        } finally {
            setIsUpdating(false);
        }
    };

    const updateRegistrationStatus = async (userId: string, status: 'active' | 'rejected') => {
        setIsUpdating(true);
        const previousUsers = [...users_list];
        const targetUser = users_list.find(u => u.id === userId);
        const isAssessor = targetUser?.role === 'contractor';

        // When approving, also activate subscription (assessors get free membership, businesses paid via Stripe)
        const updateData: Partial<Profile> = { registration_status: status };
        if (status === 'active') {
            updateData.is_active = true;
            if (isAssessor) {
                updateData.subscription_status = 'active';
                updateData.stripe_payment_id = 'FREE_ASSESSOR';
            }
        }

        setUsersList(users_list.map(u => u.id === userId ? { ...u, ...updateData } : u));
        try {
            const { data, error } = await supabase.from('profiles').update(updateData).eq('id', userId).select();
            if (error) throw error;
            if (!data || data.length === 0) throw new Error('Update failed: No rows were changed.');
            toast.success(`${isAssessor ? 'Assessor' : 'Business'} account ${status === 'active' ? 'approved & activated' : 'rejected'} successfully`);
            fetchUsers();
        } catch (error: any) {
            setUsersList(previousUsers);
            toast.error(error.message || 'Failed to update registration status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendOnboardingEmail = async (u: any) => {
        setSendingEmailId(u.id);
        try {
            const { error } = await supabase.functions.invoke('send-onboarding-link', {
                body: { fullName: u.full_name, email: u.email, town: u.company_name || u.town || 'Your Business Profile', userId: u.id, role: 'business' }
            });
            if (error) throw error;
            toast.success('Onboarding email sent successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send onboarding email');
        } finally {
            setSendingEmailId(null);
        }
    };

    const handleAssignContractor = async (contractorId: string) => {
        if (!selectedAssessmentForAssignment) return;
        setIsUpdating(true);
        try {
            const { error } = await supabase.from('assessments').update({ contractor_id: contractorId, status: 'assigned' }).eq('id', selectedAssessmentForAssignment.id);
            if (error) throw error;
            await logAudit('assign_contractor', 'assessment', selectedAssessmentForAssignment.id, { contractor_id: contractorId, previous_status: selectedAssessmentForAssignment.status });
            toast.success('Assessor assigned successfully');
            setShowAssignModal(false);
            setSelectedAssessmentForAssignment(null);
            fetchAssessments();
        } catch (error: any) {
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
            const { data: quote, error: quoteError } = await supabase.from('quotes').insert({
                assessment_id: selectedAssessment.id,
                price: parseFloat(quoteData.price),
                estimated_date: quoteData.estimated_date || null,
                notes: quoteData.notes,
                created_by: user?.id
            }).select().single();
            if (quoteError) throw quoteError;

            const { error: updateError } = await supabase.from('assessments').update({ status: 'pending_quote' }).eq('id', selectedAssessment.id);
            if (updateError) throw updateError;

            supabase.functions.invoke('send-quote-notification', { body: { assessmentId: selectedAssessment.id } })
                .catch(err => console.error('Failed to trigger homeowner notification:', err));

            await logAudit('generate_quote', 'assessment', selectedAssessment.id, { quote_id: quote.id, price: quoteData.price });
            toast.success('Quote generated successfully!');
            setShowQuoteModal(false);
            setQuoteData({ price: '', estimated_date: '', notes: '' });
            fetchAssessments();
        } catch (error: any) {
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
            const isRescheduled = selectedAssessment.status === 'scheduled' && selectedAssessment.scheduled_date !== selectedDate;
            const { error } = await supabase.from('assessments').update({ status: 'scheduled', scheduled_date: selectedDate }).eq('id', selectedAssessment.id);
            if (error) throw error;

            supabase.functions.invoke('send-job-status-notification', {
                body: { assessmentId: selectedAssessment.id, status: isRescheduled ? 'rescheduled' : 'scheduled', details: { inspectionDate: selectedDate, contractorName: 'The Berman Team' } }
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
            const { error } = await supabase.from('assessments').update({ status: 'completed', certificate_url: certUrl, completed_at: new Date().toISOString() }).eq('id', selectedAssessment.id);
            if (error) throw error;

            supabase.functions.invoke('send-job-status-notification', {
                body: { assessmentId: selectedAssessment.id, status: 'completed', details: { certificateUrl: certUrl, contractorName: 'The Berman Team' } }
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
            if (!clientEmail) { toast.error('Client email not found'); return; }
            const subject = encodeURIComponent(`Update regarding your BER Assessment - ${selectedAssessment.property_address}`);
            const body = encodeURIComponent(messageContent);
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${clientEmail}&su=${subject}&body=${body}`, '_blank');
            toast.success('Opening Gmail...');
            setShowMessageModal(false);
            setMessageContent('');
            await logAudit('open_gmail_compose', 'assessment', selectedAssessment.id, { recipient: clientEmail });
        } catch (error: any) {
            toast.error('Failed to open Gmail');
        } finally {
            setIsUpdating(false);
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
            is_active: true,
            updated_at: new Date().toISOString()
        };
        setIsUpdating(true);
        try {
            if (editingSponsor) {
                const { data, error } = await supabase.from('sponsors').update(updates).eq('id', editingSponsor.id).select().single();
                if (error) throw error;
                setSponsors(sponsors.map(s => s.id === editingSponsor.id ? data : s));
                toast.success(`Sponsor "${data.name}" updated successfully!`);
            } else {
                const { data, error } = await supabase.from('sponsors').insert(updates).select().single();
                if (error) throw error;
                setSponsors([...sponsors, data]);
                toast.success(`Sponsor "${data.name}" added successfully!`);
            }
            setShowSponsorModal(false);
            setEditingSponsor(null);
        } catch (error: any) {
            toast.error(`Failed to save sponsor: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteSponsor = (id: string) => handleDeleteClick(id, 'sponsor');

    const savePromoSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingBanner(true);
        try {
            const { error } = await supabase.from('promo_settings').update({
                headline: promoSettings.headline,
                sub_text: promoSettings.sub_text,
                image_url: promoSettings.image_url,
                destination_url: promoSettings.destination_url,
                is_enabled: promoSettings.is_enabled,
                updated_at: new Date().toISOString()
            }).eq('id', promoSettings.id);
            if (error) throw error;
            toast.success('Promo settings updated!');
            fetchPromoSettings();
        } catch (error: any) {
            toast.error(`Failed to update settings: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUpdatingBanner(false);
        }
    };

    const handleExportPayments = () => {
        if (payments.length === 0) { toast.error('No payments to export'); return; }
        const headers = ['ID', 'Amount', 'Currency', 'Status', 'User', 'Email', 'Date', 'Assessment ID'];
        const csvRows = [
            headers.join(','),
            ...payments.map(p => [p.id, p.amount, p.currency, p.status, `"${p.profiles?.full_name || 'Unknown'}"`, p.profiles?.email || 'N/A', new Date(p.created_at).toLocaleDateString(), p.assessment_id].join(','))
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `berman_payments_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Payments report exported successfully');
    };

    const handleDeleteNewsArticle = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        setIsUpdating(true);
        try {
            const { error } = await supabase.from('news_articles').delete().eq('id', id);
            if (error) throw error;
            setNewsArticles(newsArticles.filter(a => a.id !== id));
            toast.success('Article deleted successfully');
        } catch (error: any) {
            toast.error('Failed to delete article');
        } finally {
            setIsUpdating(false);
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
                additionalAddresses: (existingListing.additional_addresses || []).map((a: string) => a.includes('|||') ? a.split('|||')[1] : a),
                companyNumber: existingListing.company_number || '',
                registrationNo: existingListing.registration_no || '',
                vatNumber: existingListing.vat_number || '',
                bannerUrl: existingListing.banner_url || '',
                socialFacebook: existingListing.social_media?.facebook || '',
                socialInstagram: existingListing.social_media?.instagram || '',
                socialLinkedin: existingListing.social_media?.linkedin || '',
                socialTwitter: existingListing.social_media?.twitter || '',
                socialWhatsapp: existingListing.social_media?.whatsapp || '',
                socialYoutube: existingListing.social_media?.youtube || '',
                socialSnapchat: existingListing.social_media?.snapchat || '',
                socialTiktok: existingListing.social_media?.tiktok || '',
                galleryImages: Array(10).fill(null).map(() => ({ url: '', description: '' })),
                features: existingListing.features || [],
            });
            (async () => {
                const { data: catData } = await supabase.from('catalogue_listing_categories').select('category_id').eq('listing_id', existingListing.id);
                const { data: imgData } = await supabase.from('catalogue_listing_images').select('*').eq('listing_id', existingListing.id);
                setCatalogueFormData(prev => {
                    const newImages = Array(10).fill(null).map(() => ({ url: '', description: '' }));
                    if (imgData) imgData.forEach((img: any) => { if (img.display_order < 10) newImages[img.display_order] = { url: img.url, description: img.description || '' }; });
                    return { ...prev, selectedCategories: catData ? catData.map(c => c.category_id) : [], galleryImages: newImages, features: existingListing.features || [] };
                });
            })();
        } else {
            setCatalogueFormData({
                companyName: business ? ((business as any).company_name || business.full_name || '') : '',
                description: '',
                email: business?.email || '',
                phone: business ? ((business as any).phone || '') : '',
                address: business ? ((business as any).business_address || '') : '',
                county: business ? ((business as any).county || '') : '',
                website: business ? ((business as any).website || '') : '',
                logoUrl: '', featured: false, selectedCategories: [], additionalAddresses: [],
                companyNumber: '', registrationNo: '', vatNumber: '', bannerUrl: '',
                socialFacebook: '', socialInstagram: '', socialLinkedin: '', socialTwitter: '',
                socialWhatsapp: '', socialYoutube: '', socialSnapchat: '', socialTiktok: '',
                galleryImages: Array(10).fill(null).map(() => ({ url: '', description: '' })),
                features: [],
            });
        }
        setView('add-to-catalogue');
    };

    const toggleCatalogueCategory = (categoryId: string) => {
        setCatalogueFormData(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(categoryId)
                ? prev.selectedCategories.filter(id => id !== categoryId)
                : [...prev.selectedCategories, categoryId]
        }));
    };

    const toggleCatalogueStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase.from('catalogue_listings').update({ is_active: !currentStatus }).eq('id', id);
            if (error) throw error;
            setListings(prev => prev.map(l => l.id === id ? { ...l, is_active: !currentStatus } : l));
            toast.success(`Listing ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const toggleCatalogueFeatured = async (id: string, currentFeatured: boolean) => {
        try {
            const { error } = await supabase.from('catalogue_listings').update({ featured: !currentFeatured }).eq('id', id);
            if (error) throw error;
            setListings(prev => prev.map(l => l.id === id ? { ...l, featured: !currentFeatured } : l));
            toast.success(`Listing ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
        } catch (error) {
            toast.error('Failed to update featured status');
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
        setIsSavingCatalogue(true);
        try {
            await supabase.from('catalogue_listing_categories').delete().eq('listing_id', id);
            await supabase.from('catalogue_listing_locations').delete().eq('listing_id', id);
            const { error } = await supabase.from('catalogue_listings').delete().eq('id', id);
            if (error) throw error;
            setListings(prev => prev.filter(l => l.id !== id));
            toast.success('Listing deleted successfully');
        } catch (error) {
            toast.error('Failed to delete listing');
        } finally {
            setIsSavingCatalogue(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('Image must be less than 2MB'); return; }
        try {
            setIsUploadingLogo(true);
            const { uploadImageToCloudinary } = await import('../lib/cloudinary');
            const publicUrl = await uploadImageToCloudinary(file);
            setCatalogueFormData(prev => ({ ...prev, logoUrl: publicUrl }));
            toast.success('Logo uploaded successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload logo');
        } finally {
            setIsUploadingLogo(false);
            e.target.value = '';
        }
    };


    const handleGalleryUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') { toast.error('Please upload a JPG or PNG image file'); return; }
        try {
            setIsUploadingGallery(prev => ({ ...prev, [index]: true }));
            toast.loading('Uploading gallery image...', { id: 'gallery-upload' });
            const { uploadImageToCloudinary } = await import('../lib/cloudinary');
            const publicUrl = await uploadImageToCloudinary(file);
            setCatalogueFormData(prev => {
                const newImages = [...prev.galleryImages];
                newImages[index].url = publicUrl;
                return { ...prev, galleryImages: newImages };
            });
            toast.success('Gallery image uploaded successfully', { id: 'gallery-upload' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload gallery image', { id: 'gallery-upload' });
        } finally {
            setIsUploadingGallery(prev => ({ ...prev, [index]: false }));
            e.target.value = '';
        }
    };

    const handleSaveCatalogueEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catalogueFormData.companyName.trim() || !catalogueFormData.email.trim()) { toast.error('Company name and email are required'); return; }
        if (catalogueFormData.selectedCategories.length === 0) { toast.error('Please select at least one category'); return; }

        setIsSavingCatalogue(true);
        try {
            const slug = selectedListingForEdit
                ? selectedListingForEdit.slug
                : catalogueFormData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

            const fullAddress = catalogueFormData.address.trim() + (
                catalogueFormData.county && !catalogueFormData.address.includes(catalogueFormData.county)
                    ? `, Co. ${catalogueFormData.county}` : ''
            );

            let latitude = null, longitude = null;
            if (catalogueFormData.address) {
                const coords = await geocodeAddress(fullAddress);
                if (coords) { latitude = coords.latitude; longitude = coords.longitude; }
            }
            if (!latitude && catalogueFormData.county) {
                const countyCoords = COUNTY_COORDINATES[catalogueFormData.county];
                if (countyCoords) { latitude = countyCoords.latitude; longitude = countyCoords.longitude; }
            }

            const listingData = {
                name: catalogueFormData.companyName, slug, company_name: catalogueFormData.companyName,
                description: catalogueFormData.description || `${catalogueFormData.companyName} - Professional services provider.`,
                email: catalogueFormData.email, phone: catalogueFormData.phone || null,
                address: fullAddress || null, website: catalogueFormData.website || null,
                logo_url: catalogueFormData.logoUrl || null,
                owner_id: selectedBusinessForCatalogue?.id || selectedListingForEdit?.owner_id || null,
                is_active: true, featured: catalogueFormData.featured, latitude, longitude,
                company_number: catalogueFormData.companyNumber || null,
                registration_no: catalogueFormData.registrationNo || null,
                vat_number: catalogueFormData.vatNumber || null,
                banner_url: catalogueFormData.bannerUrl || null,
                social_media: {
                    facebook: catalogueFormData.socialFacebook || undefined,
                    instagram: catalogueFormData.socialInstagram || undefined,
                    linkedin: catalogueFormData.socialLinkedin || undefined,
                    twitter: catalogueFormData.socialTwitter || undefined,
                    whatsapp: catalogueFormData.socialWhatsapp || undefined,
                    youtube: catalogueFormData.socialYoutube || undefined,
                    snapchat: catalogueFormData.socialSnapchat || undefined,
                    tiktok: catalogueFormData.socialTiktok || undefined,
                },
                additional_addresses: catalogueFormData.additionalAddresses.filter(a => a.trim() !== ''),
                features: catalogueFormData.features.filter(f => f.trim() !== ''),
            };

            let listingId = selectedListingForEdit?.id;
            if (selectedListingForEdit) {
                const { error } = await supabase.from('catalogue_listings').update(listingData).eq('id', selectedListingForEdit.id);
                if (error) throw error;
            } else {
                const { data: newListing, error } = await supabase.from('catalogue_listings').insert(listingData).select('id').single();
                if (error) throw error;
                listingId = newListing.id;
            }

            if (listingId) {
                if (selectedListingForEdit) {
                    await supabase.from('catalogue_listing_categories').delete().eq('listing_id', listingId);
                    await supabase.from('catalogue_listing_locations').delete().eq('listing_id', listingId);
                }
                if (catalogueFormData.selectedCategories.length > 0) {
                    await supabase.from('catalogue_listing_categories').insert(
                        catalogueFormData.selectedCategories.map(categoryId => ({ listing_id: listingId, category_id: categoryId }))
                    );
                }

                const allCounties = Array.from(new Set([catalogueFormData.county, ...catalogueFormData.additionalAddresses])).filter(Boolean);
                if (allCounties.length > 0) {
                    const { data: locsData } = await supabase.from('catalogue_locations').select('id').in('name', allCounties);
                    if (locsData && locsData.length > 0) {
                        await supabase.from('catalogue_listing_locations').insert(locsData.map(loc => ({ listing_id: listingId, location_id: loc.id })));
                    }
                }

                if (selectedListingForEdit) await supabase.from('catalogue_listing_images').delete().eq('listing_id', listingId);
                const validImages = catalogueFormData.galleryImages
                    .map((img, index) => ({ listing_id: listingId, url: img.url.trim(), description: img.description.trim(), display_order: index }))
                    .filter(img => img.url);
                if (validImages.length > 0) await supabase.from('catalogue_listing_images').insert(validImages);
            }

            toast.success(selectedListingForEdit ? 'Listing updated successfully!' : 'Business added to catalogue successfully!');
            setView('catalogue');
            setSelectedListingForEdit(null);
            await fetchListings();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add business to catalogue');
        } finally {
            setIsSavingCatalogue(false);
        }
    };

    // ─── View title helpers ───────────────────────────────────────────────────────
    const getViewTitle = () => {
        const titles: Record<string, string> = {
            stats: 'System Overview', leads: 'Leads & Inquiries', assessments: 'BER Assessments',
            businesses: 'Business Directory', catalogue: 'Business Catalogue', assessors: 'BER Assessors',
            homeowners: 'Homeowners', payments: 'Financials', news: 'News & Updates', settings: 'Settings',
            'recently-deleted': 'Recently Deleted',
        };
        return titles[view] || 'Admin';
    };

    const getViewSubtitle = () => {
        const subs: Record<string, string> = {
            stats: 'Key metrics and business performance.', leads: 'Manage your website submissions.',
            assessments: 'Manage homeowner assessment requests.', businesses: 'Review business interest and send onboarding links.',
            catalogue: 'Manage and edit business catalogue listings.', assessors: 'Manage BER Assessors and their jobs.',
            homeowners: 'Manage homeowners.', payments: 'View and export payment records.',
            settings: 'Configure global platform settings.',
            'recently-deleted': 'Restore items or permanently delete them from the database.',
        };
        return subs[view] || '';
    };

    // ─── Render ───────────────────────────────────────────────────────────────────
    const pendingAssessors = users_list.filter(u => u.role === 'contractor' && u.registration_status === 'pending' && !listings.some(l => l.user_id === u.id || l.owner_id === u.id)).length;
    const pendingBusinesses = users_list.filter(u => u.role === 'business' && u.registration_status === 'pending' && !listings.some(l => l.user_id === u.id || l.owner_id === u.id)).length;

    const NAV_ITEMS: { id: string; label: string; icon: React.ElementType; badge: number }[] = [
        { id: 'stats',            label: 'Overview',         icon: BarChart2,     badge: 0 },
        { id: 'leads',            label: 'Leads',            icon: Inbox,         badge: 0 },
        { id: 'assessments',      label: 'Assessments',      icon: ClipboardList, badge: 0 },
        { id: 'assessors',        label: 'BER Assessors',    icon: HardHat,       badge: pendingAssessors },
        { id: 'businesses',       label: 'Businesses',       icon: Building2,     badge: pendingBusinesses },
        { id: 'catalogue',        label: 'Catalogue',        icon: BookOpen,      badge: 0 },
        { id: 'homeowners',       label: 'Homeowners',       icon: Home,          badge: 0 },
        { id: 'payments',         label: 'Payments',         icon: DollarSign,    badge: 0 },
        { id: 'news',             label: 'News',             icon: Newspaper,     badge: 0 },
        { id: 'recently-deleted', label: 'Recently Deleted', icon: Trash2,        badge: deletedItems.length },
        { id: 'settings',         label: 'Settings',         icon: SettingsIcon,  badge: 0 },
    ];

    const navClick = (id: string) => { setView(id as AdminView); setLocationFilter(''); setSearchTerm(''); setSidebarOpen(false); };

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex">

            {/* ── Mobile overlay backdrop ──────────────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <aside className={`
                fixed top-0 left-0 h-full bg-[#0c121d] flex flex-col z-50 shadow-2xl
                transition-all duration-300 ease-in-out
                w-56
                md:translate-x-0 lg:w-56
                ${desktopExpanded ? 'md:w-56' : 'md:w-14'}
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
                    <Link to="/" className={`block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>
                        <img src="/logo.svg" alt="The Berman" className="h-7 w-auto" />
                    </Link>
                    <div className={`flex items-center justify-center ${desktopExpanded ? 'md:hidden' : 'md:flex'} lg:hidden`}>
                        <img src="/logo.svg" alt="The Berman" className="h-7 w-auto" />
                    </div>
                    {/* Close on mobile */}
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white p-1">
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
                    {/* Expand/collapse toggle — only on md (laptop icon-only mode) */}
                    <div className={`hidden md:flex lg:hidden mb-1 ${desktopExpanded ? 'px-4 justify-end' : 'justify-center'}`}>
                        <button
                            onClick={() => setDesktopExpanded(!desktopExpanded)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            title={desktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                        >
                            {desktopExpanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                        </button>
                    </div>
                    <p className={`text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-4 mb-2 block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>Navigation</p>
                    {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
                        const isActive = view === id;
                        return (
                            <button
                                key={id}
                                onClick={() => navClick(id)}
                                title={label}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-[12px] font-semibold transition-all duration-150 relative group ${
                                    isActive ? 'bg-[#007F00] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                                    <span className={`truncate block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>{label}</span>
                                </div>
                                {badge > 0 && (
                                    <span className={`flex-shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-full flex ${desktopExpanded ? 'md:flex' : 'md:hidden'} lg:flex ${isActive ? 'bg-white text-[#007F00]' : 'bg-amber-500 text-white'}`}>
                                        {badge}
                                    </span>
                                )}
                                {/* Badge dot on tablet icon-only mode */}
                                {badge > 0 && !desktopExpanded && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 hidden md:block lg:hidden" />
                                )}
                                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-l-full" />}
                            </button>
                        );
                    })}
                    <div className="mx-4 my-3 border-t border-white/10" />
                    <button
                        onClick={() => { setShowSponsorModal(true); fetchSponsors(); setSidebarOpen(false); }}
                        title="Partners"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Layers size={16} className="flex-shrink-0 text-white/70" />
                        <span className={`block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>Partners</span>
                    </button>
                </nav>

                <div className="p-3 border-t border-white/10 flex-shrink-0">
                    <div className={`flex items-center gap-2.5 mb-2 px-1 ${desktopExpanded ? 'md:flex' : 'md:hidden'} lg:flex`}>
                        <div className="w-7 h-7 rounded-full bg-[#007F00]/80 flex items-center justify-center flex-shrink-0">
                            <Users size={13} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-white/80 truncate">Admin</p>
                            <p className="text-[9px] text-white/40 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        title="Sign Out"
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all justify-center ${desktopExpanded ? 'md:justify-start' : 'md:justify-center'} lg:justify-start`}
                    >
                        <LogOut size={14} className="flex-shrink-0" />
                        <span className={`block ${desktopExpanded ? 'md:block' : 'md:hidden'} lg:block`}>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main area ────────────────────────────────────────────────────── */}
            <div className={`${desktopExpanded ? 'md:ml-56' : 'md:ml-14'} lg:ml-56 flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300`}>

                {/* Page Header */}
                <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                                <span className="truncate">{getViewTitle()}</span>
                                {view === 'assessors' && pendingAssessors > 0 && (
                                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">{pendingAssessors} pending</span>
                                )}
                                {view === 'businesses' && pendingBusinesses > 0 && (
                                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">{pendingBusinesses} pending</span>
                                )}
                            </h1>
                            <p className="text-xs text-gray-400 truncate">{getViewSubtitle()}</p>
                        </div>
                    </div>
                    <button
                        onClick={view === 'leads' ? fetchLeads : fetchAssessments}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-[#007F00] hover:border-[#007F00] transition-all"
                    >
                        <RefreshCw className={loading ? 'animate-spin text-[#007F00]' : ''} size={13} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>

                {/* Content */}
                <main className="flex-1 p-3 md:p-5 min-w-0 overflow-x-hidden">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <RefreshCw className="animate-spin text-[#007F00] mb-4" size={32} />
                        <p className="text-gray-500 font-medium">Loading {view}...</p>
                    </div>
                ) : view === 'stats' ? (
                    <StatsView
                        stats={stats} users_list={users_list} listings={listings}
                        assessments={assessments} payments={payments}
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        locationFilter={locationFilter} setLocationFilter={setLocationFilter}
                        uniqueUserLocations={uniqueUserLocations}
                        uniqueAssessorLocations={uniqueAssessorLocations}
                        uniqueBusinessLocations={uniqueBusinessLocations}
                        handleOpenCatalogueView={handleOpenCatalogueView}
                        setSelectedUser={setSelectedUser}
                        setItemToSuspend={setItemToSuspend} setShowSuspendModal={setShowSuspendModal}
                        setView={setView}
                        handleDeleteClick={handleDeleteClick}
                    />
                ) : view === 'leads' ? (
                    <LeadsView
                        leads={leads} filteredLeads={filteredLeads}
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        setSelectedLead={setSelectedLead} handleDeleteClick={handleDeleteClick}
                    />
                ) : view === 'assessments' ? (
                    <AssessmentsView
                        filteredAssessments={filteredAssessments} users_list={users_list}
                        setSelectedAssessment={setSelectedAssessment}
                        setShowAssessmentDetailModal={setShowAssessmentDetailModal}
                        handleDeleteClick={handleDeleteClick}
                    />
                ) : view === 'homeowners' || view === 'assessors' ? (
                    <UsersView
                        view={view} users_list={users_list} assessments={assessments} listings={listings}
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        locationFilter={locationFilter} setLocationFilter={setLocationFilter}
                        isUpdating={isUpdating}
                        handleSendRenewalReminder={handleSendRenewalReminder}
                        handleOpenCatalogueView={handleOpenCatalogueView}
                        updateRegistrationStatus={updateRegistrationStatus}
                        setSelectedUser={setSelectedUser}
                        setItemToSuspend={setItemToSuspend} setShowSuspendModal={setShowSuspendModal}
                        setNewUserRole={setNewUserRole} setShowAddUserModal={setShowAddUserModal}
                        handleDeleteClick={handleDeleteClick}
                    />
                ) : view === 'businesses' ? (
                    <BusinessesView
                        filteredBusinessLeads={filteredBusinessLeads} users_list={users_list} listings={listings}
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        locationFilter={locationFilter} setLocationFilter={setLocationFilter}
                        uniqueUserLocations={uniqueBusinessLocations}
                        isUpdating={isUpdating} sendingEmailId={sendingEmailId}
                        handleManualRenewal={handleManualRenewal}
                        handleSendRenewalReminder={handleSendRenewalReminder}
                        handleCancelSubscription={handleCancelSubscription}
                        handleSendOnboardingEmail={handleSendOnboardingEmail}
                        handleOpenCatalogueView={handleOpenCatalogueView}
                        setSelectedUser={setSelectedUser} setEditForm={setEditForm}
                        setItemToSuspend={setItemToSuspend} setShowSuspendModal={setShowSuspendModal}
                        updateRegistrationStatus={updateRegistrationStatus}
                        setNewUserRole={setNewUserRole} setShowAddUserModal={setShowAddUserModal}
                    />
                ) : view === 'catalogue' ? (
                    <CatalogueView
                        listings={listings} users_list={users_list}
                        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                        handleOpenCatalogueView={handleOpenCatalogueView}
                        toggleCatalogueStatus={toggleCatalogueStatus}
                        toggleCatalogueFeatured={toggleCatalogueFeatured}
                        handleDeleteListing={handleDeleteListing}
                    />
                ) : view === 'add-to-catalogue' ? (
                    <AddToCatalogueView
                        catalogueFormData={catalogueFormData} setCatalogueFormData={setCatalogueFormData}
                        catalogueCategories={catalogueCategories}
                        selectedBusinessForCatalogue={selectedBusinessForCatalogue}
                        selectedListingForEdit={selectedListingForEdit}
                        isSavingCatalogue={isSavingCatalogue} isUploadingLogo={isUploadingLogo}
                        isUpdatingBanner={isUpdatingBanner} isUploadingGallery={isUploadingGallery}
                        handleSaveCatalogueEntry={handleSaveCatalogueEntry}
                        handleLogoUpload={handleLogoUpload}
                        handleGalleryUpload={handleGalleryUpload}
                        toggleCatalogueCategory={toggleCatalogueCategory}
                        setView={setView}
                    />
                ) : view === 'payments' ? (
                    <PaymentsView payments={payments} handleExportPayments={handleExportPayments} />
                ) : view === 'news' ? (
                    <NewsView
                        newsArticles={newsArticles} loading={loading}
                        fetchNewsArticles={fetchNewsArticles}
                        handleDeleteNewsArticle={handleDeleteNewsArticle}
                    />
                ) : view === 'settings' ? (
                    <SettingsView
                        appSettings={appSettings}
                        promoSettings={promoSettings} setPromoSettings={setPromoSettings}
                        isSavingSettings={isSavingSettings} setIsSavingSettings={setIsSavingSettings}
                        isSavingRegistrationFees={isSavingRegistrationFees} setIsSavingRegistrationFees={setIsSavingRegistrationFees}
                        isUpdatingBanner={isUpdatingBanner}
                        fetchAppSettings={fetchAppSettings}
                        savePromoSettings={savePromoSettings}
                    />
                ) : view === 'recently-deleted' ? (
                    <RecentlyDeletedView
                        deletedItems={deletedItems}
                        loading={loading}
                        isDeleting={isDeleting}
                        onRestore={handleRestoreItem}
                        onPermanentDelete={handlePermanentDelete}
                        onBulkRestore={handleBulkRestore}
                        onBulkPermanentDelete={handleBulkPermanentDelete}
                    />
                ) : null}
                </main>
            </div>

            {/* ─── Modals ─────────────────────────────────────────────────────────── */}
            {selectedLead && (
                <LeadDetailsModal
                    lead={selectedLead} isUpdating={isUpdating}
                    onClose={() => setSelectedLead(null)}
                    updateStatus={updateStatus}
                />
            )}

            {showQuoteModal && selectedAssessment && (
                <GenerateQuoteModal
                    assessment={selectedAssessment}
                    quoteData={quoteData} setQuoteData={setQuoteData}
                    isUpdating={isUpdating}
                    onClose={() => { setShowQuoteModal(false); setQuoteData({ price: '', estimated_date: '', notes: '' }); }}
                    onSubmit={handleGenerateQuote}
                />
            )}

            {showMessageModal && selectedAssessment && (
                <MessageModal
                    messageContent={messageContent} setMessageContent={setMessageContent}
                    isUpdating={isUpdating}
                    onClose={() => { setShowMessageModal(false); setMessageContent(''); }}
                    onSubmit={handleSendMessage}
                />
            )}

            {showScheduleModal && selectedAssessment && (
                <ScheduleModal
                    selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                    isUpdating={isUpdating}
                    onClose={() => setShowScheduleModal(false)}
                    onSubmit={handleSchedule}
                />
            )}

            {showCompleteModal && selectedAssessment && (
                <CompleteModal
                    certUrl={certUrl} setCertUrl={setCertUrl}
                    isUpdating={isUpdating}
                    onClose={() => { setShowCompleteModal(false); setCertUrl(''); }}
                    onSubmit={handleComplete}
                />
            )}

            {showAssessmentDetailModal && selectedAssessment && (
                <AssessmentDetailModal
                    assessment={selectedAssessment}
                    onClose={() => setShowAssessmentDetailModal(false)}
                    onGenerateQuote={() => { setShowQuoteModal(true); setShowAssessmentDetailModal(false); }}
                    onAssignAssessor={() => { setSelectedAssessmentForAssignment(selectedAssessment); setShowAssignModal(true); setShowAssessmentDetailModal(false); }}
                    onSchedule={() => { setShowScheduleModal(true); setShowAssessmentDetailModal(false); }}
                    onComplete={() => { setShowCompleteModal(true); setShowAssessmentDetailModal(false); }}
                    onMessage={(content) => { setMessageContent(content); setShowMessageModal(true); setShowAssessmentDetailModal(false); }}
                />
            )}

            {showAssignModal && selectedAssessmentForAssignment && (
                <AssignAssessorModal
                    assessment={selectedAssessmentForAssignment}
                    contractors={users_list.filter(u => u.role === 'contractor')}
                    isUpdating={isUpdating}
                    onClose={() => { setShowAssignModal(false); setSelectedAssessmentForAssignment(null); }}
                    onAssign={handleAssignContractor}
                />
            )}

            {showSponsorModal && (
                <SponsorModal
                    sponsors={sponsors} editingSponsor={editingSponsor} setEditingSponsor={setEditingSponsor}
                    isUpdating={isUpdating}
                    onClose={() => { setShowSponsorModal(false); setEditingSponsor(null); }}
                    onSave={handleSaveSponsor}
                    onDelete={handleDeleteSponsor}
                />
            )}

            {showDeleteModal && itemToDelete && (
                <DeleteConfirmModal
                    itemType={itemToDelete.type}
                    isDeleting={isDeleting}
                    onCancel={() => { setShowDeleteModal(false); setItemToDelete(null); }}
                    onConfirm={confirmDelete}
                />
            )}

            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    currentUser={user}
                    editForm={editForm} setEditForm={setEditForm}
                    customMonths={customMonths} setCustomMonths={setCustomMonths}
                    listings={listings}
                    isUpdating={isUpdating}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={handleUpdateProfile}
                    onSuspend={() => {
                        setItemToSuspend({ id: selectedUser.id, name: selectedUser.full_name, currentStatus: selectedUser.is_active !== false });
                        setShowSuspendModal(true);
                    }}
                    onManualRenewal={handleManualRenewal}
                    onSendRenewalReminder={handleSendRenewalReminder}
                    onCancelSubscription={handleCancelSubscription}
                    onOpenCatalogue={(u, listing) => { handleOpenCatalogueView(u, listing); setSelectedUser(null); }}
                    onUpdateRegistrationStatus={updateRegistrationStatus}
                    getFallbackPhone={getFallbackPhone}
                />
            )}

            {showSuspendModal && itemToSuspend && (
                <SuspendUserModal
                    item={itemToSuspend}
                    isUpdating={isUpdating}
                    onClose={() => { setShowSuspendModal(false); setItemToSuspend(null); }}
                    onConfirm={toggleUserStatus}
                />
            )}

            {showAddUserModal && (
                <AddUserModal
                    newUserRole={newUserRole}
                    newUserFormData={newUserFormData} setNewUserFormData={setNewUserFormData}
                    isUpdating={isUpdating}
                    onClose={() => { setShowAddUserModal(false); setNewUserFormData({ fullName: '', email: '', password: '', phone: '', county: '', town: '', seaiNumber: '', assessorType: 'Domestic Assessor', companyName: '', businessAddress: '', website: '', description: '', companyNumber: '', vatNumber: '' }); }}
                    onSubmit={handleAddUser}
                />
            )}
        </div>
    );
};

export default Admin;
