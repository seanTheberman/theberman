import { Check, Mail, Clock, Home, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobConfirmationProps {
    customerName: string;
    county: string;
    email: string;
    emailError?: string | null;
    hideNavigation?: boolean;
    jobType?: 'BER' | 'Solar';
}

const JobConfirmation = ({ customerName, county, email, emailError, hideNavigation, jobType = 'BER' }: JobConfirmationProps) => {
    const isSolar = jobType === 'Solar';
    const professionalTitle = isSolar ? 'Solar Installers' : 'BER Assessors';
    const professionalSingular = isSolar ? 'Installer' : 'Assessor';
    const jobTitle = isSolar ? 'Solar quote request' : 'BER assessment request';

    return (
        <div className="space-y-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                    <Check size={48} className="text-green-600" />
                </div>
            </div>

            {/* Main Heading */}
            <div>
                <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
                    Your Job is Live!
                </h1>
                <p className="text-xl text-gray-600 max-w-lg mx-auto">
                    Hi {customerName}, your {jobTitle} is now live on TheBerman.eu
                </p>
            </div>

            {/* Email Error Alert (if failed) */}
            {emailError && (
                <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-amber-800">Email Notification Pending</h4>
                        <p className="text-amber-700 text-sm">
                            We couldn't send the confirmation email right now: <span className="font-mono">{emailError}</span>.
                            Don't worry, your job is active and {professionalTitle.toLowerCase()} can still see it.
                        </p>
                    </div>
                </div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
                {/* Professionals Notified */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Mail size={24} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{isSolar ? 'Installers' : 'Assessors'} Notified</h3>
                    <p className="text-gray-500 text-sm">
                        We've notified all registered {professionalTitle} in <span className="font-semibold text-gray-700">{county}</span>
                    </p>
                </div>

                {/* Quotes Coming */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Clock size={24} className="text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Quotes Incoming</h3>
                    <p className="text-gray-500 text-sm">
                        {professionalTitle} can now submit quotes. We'll email you when quotes arrive.
                    </p>
                </div>

                {/* Check Email */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className={`w-12 h-12 rounded-full ${emailError ? 'bg-amber-100' : 'bg-purple-100'} flex items-center justify-center mx-auto mb-4`}>
                        <Mail size={24} className={emailError ? 'text-amber-600' : 'text-purple-600'} />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                        {emailError ? 'Email Issues' : 'Check Your Email'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {emailError ? (
                            `Failed to send to ${email}`
                        ) : (
                            <>Confirmation sent to <span className="font-semibold text-gray-700">{email}</span></>
                        )}
                    </p>
                </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-green-50 rounded-xl p-8 max-w-2xl mx-auto">
                <h3 className="font-semibold text-green-800 text-lg mb-4">What Happens Next?</h3>
                <ol className="text-left text-green-700 space-y-3">
                    <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold">1</span>
                        <span>{professionalTitle} in your area will review your job and submit quotes</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold">2</span>
                        <span>You'll receive an email when each quote arrives</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold">3</span>
                        <span>Compare quotes and choose the best {professionalSingular.toLowerCase()} for you</span>
                    </li>
                </ol>
            </div>

            {/* Return Home Button */}
            {!hideNavigation && (
                <>
                    <div className="pt-4">
                        <Link to="/dashboard/user">
                            <button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
                                <Home size={20} />
                                Return to Dashboard
                            </button>
                        </Link>
                    </div>

                    {/* Footer Note */}
                    <p className="text-gray-400 text-sm">
                        Thanks for using TheBerman.eu — Ireland's largest BER website
                    </p>
                </>
            )}
        </div>
    );
};

export default JobConfirmation;
