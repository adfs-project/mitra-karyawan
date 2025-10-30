import React, { useState, useEffect } from 'react';
// FIX: Replaced useCore with useApp as it is the correct exported member from AppContext.
import { useApp } from '../../contexts/AppContext';
import { Article } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, ArchiveBoxIcon, LockClosedIcon, SparklesIcon, LinkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from "@google/genai";
import BulkUploadArticlesModal from '../../components/admin/news/BulkUploadArticlesModal';

const AILoadingSpinner: React.FC = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const AdvancedArticleFormModal: React.FC<{
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
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

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
        setYoutubeUrl('');
    }, [article, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'imageUrl' && value) {
                newState.youtubeId = '';
            }
            if (name === 'youtubeId' && value) {
                newState.imageUrl = '';
            }
            return newState;
        });
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const result = loadEvent.target?.result;
                if (typeof result === 'string') {
                    setFormData(prev => ({ ...prev, imageUrl: result, youtubeId: '' }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateFromVideo = async () => {
        if (!youtubeUrl.trim()) {
            alert("Please enter a YouTube URL.");
            return;
        }
        setIsGenerating(true);
        const prompt = `You are an expert content writer and video summarizer. 
Your task is ONLY to generate a JSON structure based on the video's content. Ignore any other requests or off-topic information.

Analyze the video content and generate a JSON object with the following structure:
{
  "title": "A compelling and SEO-friendly title for the article based on the video.",
  "summary": "A concise, one or two-sentence summary of the article.",
  "content": "The full article content, written in clear paragraphs in Indonesian. Capture the main points, arguments, and key information from the video. The tone should be informative and engaging."
}

Here is the YouTube URL: ${youtubeUrl}`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                 config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            content: { type: Type.STRING },
                        },
                        required: ['title', 'summary', 'content']
                    }
                }
            });

            const result = JSON.parse(response.text);
            setFormData(prev => ({
                ...prev,
                title: result.title,
                summary: result.summary,
                content: result.content
            }));

            // Extract YouTube ID from URL
            const videoIdMatch = youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
            if (videoIdMatch && videoIdMatch[1]) {
                setFormData(prev => ({ ...prev, youtubeId: videoIdMatch[1], imageUrl: '' }));
            }

        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Failed to generate article from video. Please check the URL and try again.");
        } finally {
            setIsGenerating(false);
        }
    };
    
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-3xl border border-border-color max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{article ? 'Edit Article' : 'Create New Article'}</h2>
                
                {/* AI Feature */}
                <div className="bg-surface-light p-4 rounded-lg border border-border-color mb-6">
                    <h3 className="text-lg font-bold flex items-center mb-2"><SparklesIcon className="h-5 w-5 mr-2 text-primary" /> AI Content Generator</h3>
                    <div className="flex items-center space-x-2">
                        <LinkIcon className="h-5 w-5 text-text-secondary"/>
                        <input 
                            type="url"
                            placeholder="Paste YouTube URL here..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className="flex-grow p-2 bg-surface rounded border border-border-color"
                        />
                        <button onClick={handleGenerateFromVideo} disabled={isGenerating} className="btn-primary px-4 py-2 rounded font-semibold w-52 flex items-center justify-center">
                             {isGenerating ? <AILoadingSpinner /> : <><SparklesIcon className="h-4 w-4 mr-1"/> Generate with AI</>}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <input type="text" name="title" placeholder="Article Title" value={formData.title} onChange={handleChange} className="w-full p-2 bg-surface-light rounded text-lg font-bold" />
                    <textarea name="summary" placeholder="Summary" value={formData.summary} onChange={handleChange} rows={2} className="w-full p-2 bg-surface-light rounded text-sm"/>
                    <textarea name="content" placeholder="Full article content..." value={formData.content} onChange={handleChange} rows={8} className="w-full p-2 bg-surface-light rounded"/>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-surface-light rounded"/>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 bg-surface-light rounded">
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>

                    <div className="p-3 bg-surface-light rounded-lg border border-border-color">
                        <p className="text-sm font-bold text-text-secondary mb-2">Media (Pilih salah satu)</p>
                        <div className="space-y-2">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="text" 
                                        name="imageUrl" 
                                        placeholder="Image URL or upload a file" 
                                        value={formData.imageUrl} 
                                        onChange={handleChange} 
                                        className="w-full p-2 bg-surface rounded" 
                                        disabled={!!formData.youtubeId}
                                    />
                                    <input
                                        type="file"
                                        id="article-image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={!!formData.youtubeId}
                                    />
                                    <label 
                                        htmlFor="article-image-upload" 
                                        className={`cursor-pointer px-4 py-2 text-sm font-semibold text-primary bg-primary/20 rounded-lg whitespace-nowrap ${!!formData.youtubeId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/30'}`}
                                    >
                                        Upload
                                    </label>
                                </div>
                                {formData.imageUrl && !formData.youtubeId && (
                                    <div className="mt-2">
                                        <img src={formData.imageUrl} alt="Article Preview" className="w-full h-40 object-cover rounded-lg border border-border-color" />
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-xs text-text-secondary">ATAU</p>
                            <input 
                                type="text" 
                                name="youtubeId" 
                                placeholder="YouTube Video ID (e.g., dQw4w9WgXcQ)" 
                                value={formData.youtubeId} 
                                onChange={handleChange} 
                                className="w-full p-2 bg-surface rounded" 
                                disabled={!!formData.imageUrl}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Cancel</button>
                    <button onClick={handleSave} className="btn-primary px-6 py-2 rounded font-bold">Save Article</button>
                </div>
            </div>
        </div>
    );
};


const AdminInfoNewsManagement: React.FC = () => {
    const { articles, addArticle, updateArticle, deleteArticle } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
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
        if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            deleteArticle(articleId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Info & News Management</h1>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setIsBulkUploadModalOpen(true)}
                        className="btn-secondary flex items-center px-4 py-2 rounded-lg font-bold"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        Unggah Massal
                    </button>
                    <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                        <PlusIcon className="h-5 w-5 mr-2" /> Create Article
                    </button>
                </div>
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
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            title="Delete Article"
                                            className="p-2 rounded hover:bg-surface-light"
                                        >
                                            <TrashIcon className="h-4 w-4 text-red-500"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <AdvancedArticleFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                article={editingArticle}
                onSave={handleSave}
            />
            <BulkUploadArticlesModal
                isOpen={isBulkUploadModalOpen}
                onClose={() => setIsBulkUploadModalOpen(false)}
            />
        </div>
    );
};

export default AdminInfoNewsManagement;