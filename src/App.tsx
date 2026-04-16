
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import FAQ from './pages/FAQ';
import PublicAssessorProfile from './pages/PublicAssessorProfile';
import AssessorTerms from './pages/AssessorTerms';
import RegionPage from './pages/RegionPage';
import Locations from './pages/Locations';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import HireAgent from './pages/HireAgent';
import MembershipPayment from './pages/MembershipPayment';
import ReferralTracker from './components/ReferralTracker';


import ScrollToTop from './components/ScrollToTop';

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
                        <Route path="about" element={<About />} />
                        <Route path="services" element={<Services />} />
                        <Route path="pricing" element={<Pricing />} />
                        <Route path="contact-us" element={<Contact />} />
                        <Route path="catalogue" element={<Catalogue />} />
                        <Route path="catalogue/:slug" element={<ListingDetail />} />
                        <Route path="locations" element={<Locations />} />
                        <Route path="region" element={<RegionPage />} />
                        <Route path="privacy" element={<PrivacyPolicy />} />
                        <Route path="terms" element={<TermsOfService />} />
                        <Route path="cookie-policy" element={<CookiePolicy />} />
                        <Route path="assessor-terms" element={<AssessorTerms />} />
                        <Route path="login" element={<Login />} />
                        <Route path="login/admin" element={<AdminLogin />} />
                        <Route path="signup" element={<SignUp />} />
                        <Route path="faq" element={<FAQ />} />
                        <Route path="news" element={<News />} />
                        <Route path="news/:id" element={<NewsDetail />} />
                        <Route path="blog" element={<Blog />} />
                        <Route path="blog/:slug" element={<BlogDetail />} />
                        <Route path="hire-agent" element={<HireAgent />} />
                        <Route path="registration-pending" element={<RegistrationPending />} />
                    </Route>

                    {/* No Layout wrapper for cleaner UX */}
                    <Route path="/membership-payment" element={<MembershipPayment />} />
                    <Route path="/get-quote" element={<QuoteForm />} />
                    <Route path="/quote/:id" element={<QuickQuotePage />} />

                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/auth/error" element={<AuthError />} />

                    {/* Admin Dashboard */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/news/new"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminNewsAction />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/news/edit/:id"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminNewsAction />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/blog/new"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminBlogAction />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/blog/edit/:id"
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
