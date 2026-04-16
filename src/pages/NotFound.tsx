
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
            <div className="max-w-lg w-full text-center">
                <h1 className="text-[8rem] font-black text-gray-200 leading-none select-none">404</h1>

                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 -mt-6">
                    Page Not Found
                </h2>

                <p className="text-gray-500 mb-10 leading-relaxed max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-white bg-[#007F00] px-8 py-3.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-lg"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
