
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
import Catalogue from './pages/Catalogue';
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

import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="services" element={<Services />} />
                        <Route path="pricing" element={<Pricing />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="catalogue" element={<Catalogue />} />
                        <Route path="privacy" element={<PrivacyPolicy />} />
                        <Route path="terms" element={<TermsOfService />} />
                        <Route path="login" element={<Login />} />
                        <Route path="signup" element={<SignUp />} />
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

                    {/* Contractor Dashboard */}
                    <Route
                        path="/contractor-onboarding"
                        element={
                            <ProtectedRoute allowedRoles={['contractor']}>
                                <ContractorOnboarding />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/contractor"
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
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
