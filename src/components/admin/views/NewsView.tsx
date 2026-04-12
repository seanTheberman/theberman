import React from 'react';
import { RefreshCw, Newspaper, Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NewsArticle } from '../../../types/admin';

interface Props {
    newsArticles: NewsArticle[];
    loading: boolean;
    fetchNewsArticles: () => void;
    handleDeleteNewsArticle: (id: string) => void;
}

export const NewsView = React.memo(({ newsArticles, loading, fetchNewsArticles, handleDeleteNewsArticle }: Props) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 gap-3">
                <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">Website News Articles</h3>
                    <p className="text-sm text-gray-500 hidden sm:block">Manage the content appearing on the News page.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={fetchNewsArticles}
                        className="p-2 text-gray-400 hover:text-[#007EA7] transition-colors"
                        title="Refresh news"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => navigate('/admin/news/new')}
                        className="bg-[#007F00] text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#006600] transition-colors flex items-center gap-2"
                    >
                        <Newspaper size={16} />
                        <span className="hidden sm:inline">Add New Article</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
                {newsArticles.map((article) => (
                    <div
                        key={article.id}
                        onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                        className="p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        {article.image_url && (
                            <img
                                src={article.image_url}
                                alt=""
                                className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-gray-900 text-sm line-clamp-1">{article.title}</div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${article.is_live ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {article.is_live ? 'Live' : 'Draft'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 line-clamp-2 mt-0.5">{article.excerpt}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{article.author} &bull; {article.category}</div>
                            <div className="text-xs text-gray-400">{new Date(article.published_at).toLocaleDateString()}</div>
                            <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                                    className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-[#007EA7]"
                                    title="Edit Article"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => handleDeleteNewsArticle(article.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Article"
                                >
                                    <Trash2 size={15} />
                                </button>
                                <a
                                    href="/news"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
                                    title="View on site"
                                >
                                    <Eye size={15} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
                {newsArticles.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-400 italic">No news articles found.</div>
                )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
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
                        {newsArticles.map((article) => (
                            <tr
                                key={article.id}
                                onClick={() => navigate(`/admin/news/edit/${article.id}`)}
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
                                            <div className="text-xs text-gray-400 line-clamp-2 mt-0.5">{article.excerpt}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-700">{article.author}</div>
                                    <div className="text-xs text-gray-500 capitalize">{article.category} • {article.read_time}</div>
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
                                            onClick={() => navigate(`/admin/news/edit/${article.id}`)}
                                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Article"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNewsArticle(article.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Article"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <a
                                            href="/news"
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
                        {newsArticles.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                    No news articles found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
