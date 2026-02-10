
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
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import SignUp from './pages/SignUp';
import ContractorOnboarding from './pages/ContractorOnboarding';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import QuoteForm from './pages/QuoteForm';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQ from './pages/FAQ';
import PublicAssessorProfile from './pages/PublicAssessorProfile';
import AssessorTerms from './pages/AssessorTerms';
import RegionPage from './pages/RegionPage';
import Locations from './pages/Locations';
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
                        <Route path="contact" element={<Contact />} />
                        <Route path="catalogue" element={<Catalogue />} />
                        <Route path="catalogue/:slug" element={<ListingDetail />} />
                        <Route path="locations" element={<Locations />} />
                        <Route path="region/:slug" element={<RegionPage />} />
                        <Route path="privacy" element={<PrivacyPolicy />} />
                        <Route path="terms" element={<TermsOfService />} />
                        <Route path="assessor-terms" element={<AssessorTerms />} />
                        <Route path="login" element={<Login />} />
                        <Route path="signup" element={<SignUp />} />
                        <Route path="faq" element={<FAQ />} />
                    </Route>

                    {/* Quote Form - No Layout wrapper for cleaner UX */}
                    <Route path="/get-quote" element={<QuoteForm />} />

                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />

                    {/* Admin Dashboard */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Admin />
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

                    {/* Public Assessor Profile */}
                    <Route path="/profiles/:id" element={<PublicAssessorProfile />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
