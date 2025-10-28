import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Article } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, ArchiveBoxIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const ArticleFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    article: Article | null;
    onSave: (data: Article | Omit<Article, 'id' | 'author' | 'timestamp' | 'likes' | 'comments' | 'pollOptions'>) => void;
}> = ({ isOpen, onClose, article, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        category: '',
        status: 'Published' as 'Published' | 'Draft',
        type: 'standard' as 'standard' | 'poll' | 'qa' | 'Banner',
        imageUrl: '',
        youtubeId: ''
    });

    useEffect(() => {
        if (article) {
            setFormData({
                title: article.title,
                summary: article.summary,
                content: article.content,
                category: article.category,
                status: article.status,
                type: article.type,
                imageUrl: article.imageUrl || '',
                youtubeId: article.youtubeId || ''
            });
        } else {
             setFormData({
                title: '',
                summary: '',
                content: '',
                category: '',
                status: 'Published',
                type: 'standard',
                imageUrl: '',
                youtubeId: ''
            });
        }
    }, [article, isOpen]);
    
    const handleSave = () => {
        if (article) {
            onSave({ ...article, ...formData });
        } else {
            onSave(formData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">{article ? 'Edit Article' : 'Create New Article'}</h2>
                <input type="text" placeholder="Article Title" value={formData.title} onChange={e => setFormData(f => ({...f, title: e.target.value}))} className="w-full p-2 bg-surface-light rounded" />
                {/* Other form fields like content, category, imageUrl would go here */}
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Cancel</button>
                    <button onClick={handleSave} className="btn-primary px-4 py-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
};


const AdminInfoNewsManagement: React.FC = () => {
    const { articles, addArticle, updateArticle, deleteArticle } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const handleOpenModal = (article: Article | null = null) => {
        setEditingArticle(article);
        setIsModalOpen(true);
    };

    const handleSave = (data: Article | Omit<Article, 'id' | 'author' | 'timestamp' | 'likes' | 'comments' | 'pollOptions'>) => {
        if ('id' in data) {
            updateArticle(data);
        } else {
            addArticle(data);
        }
    };

    const handleDelete = (articleId: string) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            deleteArticle(articleId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Info & News Management</h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                    <PlusIcon className="h-5 w-5 mr-2" /> Create Article
                </button>
            </div>
            
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><ArchiveBoxIcon className="h-5 w-5 mr-2" /> All Articles</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Author</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{article.title}</td>
                                    <td className="px-6 py-4">{article.category}</td>
                                    <td className="px-6 py-4">{article.author}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${article.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {article.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleOpenModal(article)} className="p-2 rounded hover:bg-surface-light"><PencilIcon className="h-4 w-4 text-yellow-400"/></button>
                                        <button disabled title="Deletion is locked for stability." className="p-2 rounded cursor-not-allowed">
                                            <LockClosedIcon className="h-4 w-4 text-gray-500"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <ArticleFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                article={editingArticle}
                onSave={handleSave}
            />
        </div>
    );
};

export default AdminInfoNewsManagement;
