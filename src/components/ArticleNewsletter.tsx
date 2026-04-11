import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const ArticleNewsletter = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <section className="py-20 bg-[#1a1a1a] text-white">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tight">Stay Informed</h2>
                <p className="text-gray-400 mb-12 text-lg">
                    Subscribe to all the new updates including energy grants, flash sales, and technical guides.
                </p>
                <form
                    className="flex flex-col sm:flex-row gap-0 border border-white/20"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const emailInput = (e.target as HTMLFormElement).querySelector('input[type="email"]') as HTMLInputElement;
                        const email = emailInput?.value;
                        if (!email) return;

                        setIsSubmitting(true);
                        try {
                            const { error } = await supabase
                                .from('leads')
                                .insert([{
                                    name: 'Blog Subscriber',
                                    email: email,
                                    message: 'Subscribed via article page newsletter',
                                    status: 'new',
                                    purpose: 'Blog Subscription'
                                }]);
                            if (error) throw error;
                            toast.success('Subscription confirmed.');
                            (e.target as HTMLFormElement).reset();
                        } catch {
                            toast.error('Something went wrong. Please try again.');
                        } finally {
                            setIsSubmitting(false);
                        }
                    }}
                >
                    <input
                        type="email"
                        placeholder="EMAIL ADDRESS"
                        className="flex-grow bg-transparent px-6 py-4 text-white placeholder:text-gray-500 outline-none font-bold text-xs tracking-widest"
                        required
                        disabled={isSubmitting}
                    />
                    <button
                        disabled={isSubmitting}
                        className="bg-[#007F00] text-white font-black px-12 py-4 hover:bg-[#006400] transition-colors uppercase tracking-widest text-[10px] cursor-pointer disabled:opacity-70 whitespace-nowrap"
                    >
                        {isSubmitting ? 'SENDING...' : 'Subscribe to news'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ArticleNewsletter;
