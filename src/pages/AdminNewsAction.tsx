
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Save, X, Loader2, Newspaper, Eye, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface NewsArticle {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    image_url: string;
    category: string;
    published_at: string;
    is_live: boolean;
    show_badge: boolean;
    read_time: string;
    content: string;
}

const AdminNewsAction = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [article, setArticle] = useState<Partial<NewsArticle>>({
        author: 'The Berman Team',
        category: 'Company News',
        read_time: '3 min read',
        is_live: true,
        show_badge: false,
        published_at: new Date().toISOString().slice(0, 16),
        content: ''
    });

    useEffect(() => {
        if (id) {
            fetchArticle();
        }
    }, [id]);

    const fetchArticle = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('news_articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setArticle({
                    ...data,
                    published_at: new Date(data.published_at).toISOString().slice(0, 16)
                });
            }
        } catch (error: any) {
            console.error('Error fetching article:', error);
            toast.error('Failed to load article');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `news-articles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(filePath);

            setArticle(prev => ({ ...prev, image_url: publicUrl }));
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error(`Error uploading image: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!article.image_url) {
            toast.error('Please upload a featured image');
            return;
        }

        const formData = new FormData(e.target as HTMLFormElement);
        const updates = {
            title: formData.get('title') as string,
            excerpt: formData.get('excerpt') as string,
            author: formData.get('author') as string,
            image_url: article.image_url,
            category: formData.get('category') as string,
            read_time: formData.get('read_time') as string,
            is_live: formData.get('is_live') === 'true',
            show_badge: formData.get('show_badge') === 'true',
            published_at: new Date(formData.get('published_at') as string).toISOString(),
            content: article.content || ''
        };

        setIsSaving(true);
        try {
            let error;
            if (id) {
                const result = await supabase
                    .from('news_articles')
                    .update(updates)
                    .eq('id', id);
                error = result.error;
            } else {
                const result = await supabase
                    .from('news_articles')
                    .insert(updates);
                error = result.error;
            }

            if (error) throw error;

            toast.success(id ? 'Article updated successfully' : 'Article published successfully');
            navigate('/admin');
        } catch (error: any) {
            console.error('Error saving article:', error);
            toast.error(`Failed to save article: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={40} className="animate-spin text-[#007F00]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4 group">
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Newspaper className="text-[#007F00]" />
                            {id ? 'Edit News Article' : 'Create New Article'}
                        </h1>
                    </div>
                    {id && (
                        <Link
                            to={`/news/${id}`}
                            target="_blank"
                            className="bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Eye size={18} />
                            View Public Page
                        </Link>
                    )}
                </div>

                {/* Main Content Card */}
                <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Article Title *</label>
                                <input
                                    name="title"
                                    required
                                    defaultValue={article.title}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-lg font-bold focus:ring-2 focus:ring-[#007F00]/20 transition-all outline-none"
                                    placeholder="e.g. New Government Grants for Home Retrofitting"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Excerpt & Summary *</label>
                                <textarea
                                    name="excerpt"
                                    required
                                    defaultValue={article.excerpt}
                                    rows={4}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-700 leading-relaxed focus:ring-2 focus:ring-[#007F00]/20 transition-all outline-none"
                                    placeholder="Write a brief summary of the article..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Article Body & Full Content *</label>
                                <div className="quill-container bg-white border border-gray-100 rounded-2xl overflow-hidden min-h-[400px]">
                                    <ReactQuill
                                        theme="snow"
                                        value={article.content}
                                        onChange={(content: string) => setArticle(prev => ({ ...prev, content }))}
                                        placeholder="Start writing your article here..."
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link', 'blockquote', 'code-block'],
                                                ['clean']
                                            ],
                                        }}
                                        className="h-[350px] mb-12"
                                    />
                                </div>
                                <style>{`
                                    .quill-container .ql-toolbar.ql-snow {
                                        border: none;
                                        border-bottom: 1px solid #f3f4f6;
                                        padding: 1rem;
                                        background: #f9fafb;
                                    }
                                    .quill-container .ql-container.ql-snow {
                                        border: none;
                                        padding: 0.5rem;
                                        font-family: inherit;
                                        font-size: 1rem;
                                    }
                                    .quill-container .ql-editor {
                                        min-height: 350px;
                                        line-height: 1.6;
                                        color: #374151;
                                    }
                                    .quill-container .ql-editor.ql-blank::before {
                                        color: #9ca3af;
                                        font-style: normal;
                                    }
                                    .quill-container .ql-editor h1,
                                    .quill-container .ql-editor h2,
                                    .quill-container .ql-editor h3 {
                                        font-weight: 800;
                                        margin-top: 1.5rem;
                                        margin-bottom: 0.75rem;
                                        color: #111827;
                                    }
                                `}</style>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Author Name *</label>
                                <input
                                    name="author"
                                    required
                                    defaultValue={article.author}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-[#007F00]/20 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Article Category *</label>
                                <select
                                    name="category"
                                    required
                                    defaultValue={article.category}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-[#007F00]/20 transition-all outline-none"
                                >
                                    <option value="Company News">Company News</option>
                                    <option value="Solar Energy">Solar Energy</option>
                                    <option value="Industry Updates">Industry Updates</option>
                                    <option value="Sustainability">Sustainability</option>
                                    <option value="Community">Community</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Read Time</label>
                                <input
                                    name="read_time"
                                    defaultValue={article.read_time}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-[#007F00]/20 transition-all outline-none"
                                    placeholder="e.g. 5 min read"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Published Date</label>
                                <input
                                    name="published_at"
                                    type="datetime-local"
                                    defaultValue={article.published_at}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-[#007F00]/20 transition-all outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Featured Image *</label>
                                <div className="flex flex-col gap-4">
                                    {article.image_url ? (
                                        <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50 h-64">
                                            <img src={article.image_url} alt="Preview" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <label className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
                                                    <Upload size={16} />
                                                    Change Image
                                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setArticle(prev => ({ ...prev, image_url: '' }))}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                                                >
                                                    <X size={16} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 hover:border-[#007F00] hover:bg-green-50/30 transition-all cursor-pointer group">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#007F00] transition-colors">
                                                {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-gray-900">{isUploading ? 'Uploading...' : 'Click to upload image'}</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (Max. 5MB)</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="p-6 bg-[#007F00]/5 border border-[#007F00]/10 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[#007F00]">
                                        <div className="bg-[#007F00] p-2 rounded-lg">
                                            <Newspaper size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black uppercase tracking-wider">Publish article immediately</span>
                                            <p className="text-xs text-green-700/70 font-medium">This will make the article visible on the public news feed.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_live"
                                            value="true"
                                            className="sr-only peer"
                                            defaultChecked={article.is_live}
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#007F00]"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-blue-600">
                                        <div className="bg-blue-600 p-2 rounded-lg">
                                            <Eye size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black uppercase tracking-wider">Show "NEW" Badge</span>
                                            <p className="text-xs text-blue-700/70 font-medium">This will display a prominent "NEW" badge on the article card.</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="show_badge"
                                            value="true"
                                            className="sr-only peer"
                                            defaultChecked={article.show_badge}
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <Link
                                to="/admin"
                                className="text-gray-400 hover:text-gray-900 font-bold text-sm uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                                <X size={20} />
                                Discard Changes
                            </Link>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full md:w-auto bg-[#007F00] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl shadow-green-900/20 hover:shadow-green-900/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {id ? 'Update Article' : 'Publish Article'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminNewsAction;
