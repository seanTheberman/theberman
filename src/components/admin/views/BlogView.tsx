import React from 'react';
import { RefreshCw, BookOpen, Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BlogArticle } from '../../../types/admin';

interface Props {
    blogArticles: BlogArticle[];
    loading: boolean;
    fetchBlogArticles: () => void;
    handleDeleteBlogArticle: (id: string) => void;
}

export const BlogView = React.memo(({ blogArticles, loading, fetchBlogArticles, handleDeleteBlogArticle }: Props) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Blog Articles</h3>
                    <p className="text-sm text-gray-500">Manage blog posts visible on the Blog page.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchBlogArticles}
                        className="p-2 text-gray-400 hover:text-[#007EA7] transition-colors"
                        title="Refresh blog"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => navigate('/admin/blog/new')}
                        className="bg-[#007F00] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#006600] transition-colors flex items-center gap-2"
                    >
                        <BookOpen size={16} />
                        Add Blog Post
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/50 text-gray-900 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Article</th>
                            <th className="px-6 py-4">Author & Category</th>
                            <th className="px-6 py-4">Published Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {blogArticles.map((article) => (
                            <tr
                                key={article.id}
                                onClick={() => navigate(`/admin/blog/edit/${article.id}`)}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="flex items-center gap-4">
                                        {article.image_url && (
                                            <img
                                                src={article.image_url}
                                                alt=""
                                                className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                                            />
                                        )}
                                        <div>
                                            <div className="font-bold text-gray-900 line-clamp-1">{article.title}</div>
                                            {article.subtitle && <div className="text-xs text-gray-500 line-clamp-1">{article.subtitle}</div>}
                                            <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{article.excerpt}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-700">{article.author}</div>
                                    <div className="text-xs text-gray-500 capitalize">{article.category} &bull; {article.read_time}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(article.published_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${article.is_live ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {article.is_live ? 'Live' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 text-[#007EA7]" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => navigate(`/admin/blog/edit/${article.id}`)}
                                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Post"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBlogArticle(article.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Post"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <a
                                            href={`/blog/${article.slug || article.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
                                            title="View on site"
                                        >
                                            <Eye size={16} />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {blogArticles.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                    No blog articles found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
