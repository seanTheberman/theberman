
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Catalogue from './pages/NewCatalogue';
import ListingDetail from './pages/ListingDetail';
import Admin from './pages/Admin';
import AdminNewsAction from './pages/AdminNewsAction';
import AdminBlogAction from './pages/AdminBlogAction';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import SignUp from './pages/SignUp';
import ContractorOnboarding from './pages/ContractorOnboarding';
import BusinessOnboarding from './pages/BusinessOnboarding';
import RegistrationPending from './pages/RegistrationPending';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import AuthError from './pages/AuthError';
import NotFound from './pages/NotFound';
import QuoteForm from './pages/QuoteForm';
import QuickQuotePage from './pages/QuickQuotePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import FranceTermsEnglish from './pages/france/FranceTermsEnglish';
import FranceRefundPolicy from './pages/france/FranceRefundPolicy';
import FAQ from './pages/FAQ';
import PublicAssessorProfile from './pages/PublicAssessorProfile';
import AssessorTerms from './pages/AssessorTerms';
import RegionPage from './pages/RegionPage';
import Locations from './pages/Locations';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import HireAgent from './pages/HireAgent';
import Subscribe from './pages/Subscribe';
import MembershipPayment from './pages/MembershipPayment';
import LocationPage from './pages/LocationPage';
import ThankYou from './pages/ThankYou';
import ReferralTracker from './components/ReferralTracker';
import ScrollToTop from './components/ScrollToTop';
import { getTenantFromDomain } from './lib/tenant';

const FaqRedirect = () => {
    const tenant = getTenantFromDomain();
    if (tenant === 'england') {
        return <Navigate to={{ pathname: '/epc-faq', search: window.location.search }} replace />;
    }
    return <FAQ />;
};

// Tenant-specific routes that should redirect to the equivalent on the current tenant
const TENANT_ROUTE_MAP: Record<string, string> = {
    '/sobre-nosotros': '/about-us',
    '/servicios': '/services',
    '/precios': '/pricing',
    '/asesor-energetico': '/energy-advisor',
    '/ubicaciones': '/locations',
    '/tecnicos': '/catalogue',
    '/pedir-presupuesto': '/get-quote',
    '/registrate-tecnico': '/hire-agent',
    '/directorio': '/catalogue',
    '/preguntas-frecuentes': '/faq',
    '/epc-faq': '/faq',
    '/sobre-nos': '/about-us',
    '/servicos': '/services',
    '/precos': '/pricing',
    '/catalogo': '/catalogue',
    '/consultor-energetico': '/energy-advisor',
    '/localizacoes': '/locations',
    '/noticias': '/news',
    '/faqs': '/faq',
    '/contacto': '/contact-us',
};

// Routes that are ONLY valid on specific tenants
const TENANT_SPECIFIC_ROUTES: Record<string, string[]> = {
    '/sobre-nosotros': ['spain'],
    '/servicios': ['spain'],
    '/precios': ['spain'],
    '/asesor-energetico': ['spain'],
    '/ubicaciones': ['spain'],
    '/tecnicos': ['spain'],
    '/pedir-presupuesto': ['spain'],
    '/registrate-tecnico': ['spain'],
    '/directorio': ['spain'],
    '/preguntas-frecuentes': ['spain'],
    '/contacto': ['spain', 'portugal'],
    '/epc-faq': ['england'],
    '/sobre-nos': ['portugal'],
    '/servicos': ['portugal'],
    '/precos': ['portugal'],
    '/catalogo': ['portugal'],
    '/consultor-energetico': ['portugal'],
    '/localizacoes': ['portugal'],
    '/noticias': ['portugal'],
    '/faqs': ['portugal'],
};

const TenantRouteGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const tenant = getTenantFromDomain();
    const pathname = window.location.pathname;

    // Check if this is a tenant-specific route that shouldn't exist on the current tenant
    const allowedTenants = TENANT_SPECIFIC_ROUTES[pathname];
    if (allowedTenants && !allowedTenants.includes(tenant)) {
        const redirect = TENANT_ROUTE_MAP[pathname] || '/';
        return <Navigate to={{ pathname: redirect, search: window.location.search }} replace />;
    }

    // Check for Spain location prefix on non-Spain tenants
    if (pathname.startsWith('/certificado-energetico-') && tenant !== 'spain') {
        return <Navigate to="/locations" replace />;
    }

    // Check for England location prefix on non-England tenants
    if (pathname.startsWith('/epc-assessment-') && tenant !== 'england') {
        return <Navigate to="/locations" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Toaster
                position="top-center"
                reverseOrder={false}
                containerStyle={{ zIndex: 99999 }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                    },
                }}
            />
            <BrowserRouter>
                <ReferralTracker />
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="about" element={<Navigate to={{ pathname: '/about-us', search: window.location.search }} replace />} />
                        <Route path="about-us" element={<About />} />
                        <Route path="services" element={<Services />} />
                        <Route path="pricing" element={<Pricing />} />
                        <Route path="contact-us" element={<Contact />} />
                        <Route path="catalogue" element={<Catalogue />} />
                        <Route path="catalogue/businesses" element={<Catalogue />} />
                        <Route path="catalogue/ber-assessors" element={<Catalogue />} />
                        <Route path="catalogue/epc-assessors" element={<Catalogue />} />
                        <Route path="catalogue/epc-businesses" element={<Catalogue />} />
                        <Route path="catalogue/:slug" element={<ListingDetail />} />
                        <Route path="locations" element={<Locations />} />
                        <Route path="region" element={<RegionPage />} />
                        {/* Spain localized routes — must be before :county catch-all */}
                        <Route path="sobre-nosotros" element={<TenantRouteGuard><About /></TenantRouteGuard>} />
                        <Route path="preguntas-frecuentes" element={<TenantRouteGuard><FAQ /></TenantRouteGuard>} />
                        <Route path="preguntas-frecuentes/*" element={<TenantRouteGuard><FAQ /></TenantRouteGuard>} />
                        <Route path="directorio" element={<TenantRouteGuard><Catalogue /></TenantRouteGuard>} />
                        <Route path="directorio/businesses" element={<TenantRouteGuard><Catalogue /></TenantRouteGuard>} />
                        <Route path="directorio/:slug" element={<TenantRouteGuard><ListingDetail /></TenantRouteGuard>} />
                        <Route path="contacto" element={<TenantRouteGuard><Contact /></TenantRouteGuard>} />
                        <Route path="asesor-energetico" element={<TenantRouteGuard><HireAgent /></TenantRouteGuard>} />
                        <Route path="ubicaciones" element={<TenantRouteGuard><Locations /></TenantRouteGuard>} />
                        <Route path="servicios" element={<TenantRouteGuard><Services /></TenantRouteGuard>} />
                        <Route path="precios" element={<TenantRouteGuard><Pricing /></TenantRouteGuard>} />
                        <Route path="tecnicos" element={<TenantRouteGuard><Catalogue /></TenantRouteGuard>} />
                        <Route path="pedir-presupuesto" element={<TenantRouteGuard><QuoteForm /></TenantRouteGuard>} />
                        <Route path="registrate-tecnico" element={<TenantRouteGuard><HireAgent /></TenantRouteGuard>} />
                        <Route path="certificado-energetico-:county" element={<TenantRouteGuard><LocationPage /></TenantRouteGuard>} />
                        <Route path="certificado-energetico-:county/:town" element={<TenantRouteGuard><LocationPage /></TenantRouteGuard>} />
                        {/* England location routes */}
                        <Route path="epc-assessment-:county" element={<TenantRouteGuard><LocationPage /></TenantRouteGuard>} />
                        <Route path="epc-assessment-:county/:town" element={<TenantRouteGuard><LocationPage /></TenantRouteGuard>} />
                        {/* Portugal localized routes */}
                        <Route path="sobre-nos" element={<TenantRouteGuard><About /></TenantRouteGuard>} />
                        <Route path="servicos" element={<TenantRouteGuard><Services /></TenantRouteGuard>} />
                        <Route path="precos" element={<TenantRouteGuard><Pricing /></TenantRouteGuard>} />
                        <Route path="catalogo" element={<TenantRouteGuard><Catalogue /></TenantRouteGuard>} />
                        <Route path="consultor-energetico" element={<TenantRouteGuard><HireAgent /></TenantRouteGuard>} />
                        <Route path="localizacoes" element={<TenantRouteGuard><Locations /></TenantRouteGuard>} />
                        <Route path="noticias" element={<TenantRouteGuard><News /></TenantRouteGuard>} />
                        <Route path="faqs" element={<TenantRouteGuard><FAQ /></TenantRouteGuard>} />
                        <Route path="faqs/*" element={<TenantRouteGuard><FAQ /></TenantRouteGuard>} />
                        <Route path=":county" element={<LocationPage />} />
                        <Route path=":county/:town" element={<LocationPage />} />
                        <Route path="privacy" element={<PrivacyPolicy />} />
                        <Route path="terms" element={<TermsOfService />} />
                        <Route path="cookie-policy" element={<CookiePolicy />} />
                        <Route path="terms-english" element={<FranceTermsEnglish />} />
                        <Route path="refund-policy" element={<FranceRefundPolicy />} />
                        <Route path="assessor-terms" element={<AssessorTerms />} />
                        <Route path="login" element={<Login />} />
                        <Route path="secure-admin-login" element={<AdminLogin />} />
                        <Route path="signup" element={<SignUp />} />
                        <Route path="faq" element={<FaqRedirect />} />
                        <Route path="epc-faq" element={<FAQ />} />
                        <Route path="epc-faq/*" element={<FAQ />} />
                        <Route path="news" element={<News />} />
                        <Route path="news/:id" element={<NewsDetail />} />
                        <Route path="blog" element={<Blog />} />
                        <Route path="blog/:slug" element={<BlogDetail />} />
                        <Route path="hire-agent" element={<HireAgent />} />
                        <Route path="energy-advisor" element={<HireAgent />} />
                        <Route path="subscribe" element={<Subscribe />} />
                        <Route path="registration-pending" element={<RegistrationPending />} />
                    </Route>

                    {/* No Layout wrapper for cleaner UX */}
                    <Route path="/membership-payment" element={<MembershipPayment />} />
                    <Route path="/get-quote" element={<QuoteForm />} />
                    <Route path="/quote/:id" element={<QuickQuotePage />} />
                    <Route path="/thank-you" element={<ThankYou />} />

                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/auth/error" element={<AuthError />} />

                    {/* Old admin route redirect to main login */}
                    <Route path="/admin" element={<Navigate to="/login" replace />} />

                    {/* Admin Dashboard - New secure path */}
                    <Route
                        path="/secure-admin-portal"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/secure-admin-portal/news/new"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminNewsAction />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/secure-admin-portal/news/edit/:id"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminNewsAction />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/secure-admin-portal/blog/new"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminBlogAction />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/secure-admin-portal/blog/edit/:id"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminBlogAction />
                            </ProtectedRoute>
                        }
                    />

                    {/* BER Assessor Dashboard */}
                    <Route
                        path="/assessor-onboarding"
                        element={
                            <ProtectedRoute allowedRoles={['contractor']}>
                                <ContractorOnboarding />
                            </ProtectedRoute>
                        }
                    />

                    {/* Business Onboarding */}
                    <Route
                        path="/business-onboarding"
                        element={
                            <ProtectedRoute allowedRoles={['business', 'admin']}>
                                <BusinessOnboarding />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/ber-assessor"
                        element={
                            <ProtectedRoute allowedRoles={['contractor']}>
                                <ContractorDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* User Dashboard */}
                    <Route
                        path="/dashboard/user"
                        element={
                            <ProtectedRoute allowedRoles={['user', 'homeowner']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Business Dashboard */}
                    <Route
                        path="/dashboard/business"
                        element={
                            <ProtectedRoute allowedRoles={['business', 'contractor', 'admin']}>
                                <BusinessDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Public Assessor Profile */}
                    <Route path="/profiles/:id" element={<PublicAssessorProfile />} />

                    {/* 404 Catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
