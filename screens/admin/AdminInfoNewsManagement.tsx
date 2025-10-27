import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Article } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon, FilmIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { GoogleGenAI, Type } from "@google/genai";

const AILoadingSpinner: React.FC = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => {
    return (
        <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input type="checkbox" checked={checked} onChange={(e) => !disabled && onChange(e.target.checked)} className="sr-only peer" disabled={disabled} />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    );
};

const YouTubeArticleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (article: Omit<Article, 'id' | 'timestamp' | 'likes' | 'comments' | 'author'>) => Promise<any>;
}> = ({ isOpen, onClose, onSave }) => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedArticle, setGeneratedArticle] = useState<{ title: string; summary: string; content: string } | null>(null);

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleGenerate = async () => {
        if (!youtubeUrl.trim()) {
            alert('Please enter a YouTube URL.');
            return;
        }
        setIsLoading(true);
        setGeneratedArticle(null);

        const prompt = `
            Analyze the following YouTube video URL and generate a professional news article suitable for a company's internal employee portal.
            The article should be based on the likely topic and tone of the video.
            Your output MUST be a JSON object containing three keys: "title", "summary", and "content".
            - "title": A catchy and informative headline.
            - "summary": A brief, one or two-sentence summary of the article.
            - "content": The full article text, well-structured with multiple paragraphs.
            
            YouTube URL: ${youtubeUrl}
        `;

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
                        required: ['title', 'summary', 'content'],
                    }
                }
            });

            const articleData = JSON.parse(response.text);
            setGeneratedArticle(articleData);

        } catch (error) {
            console.error("Gemini API call failed:", error);
            alert("Failed to generate article from YouTube URL. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = async (publish: boolean) => {
        if (!generatedArticle) {
            alert("No article has been generated yet.");
            return;
        }
        setIsSaving(true);
        const videoId = getYouTubeId(youtubeUrl);
        const newArticle: Omit<Article, 'id' | 'timestamp' | 'likes' | 'comments' | 'author'> = {
            ...generatedArticle,
            imageUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : `https://picsum.photos/seed/${Date.now()}/800/400`,
            category: 'Video Feature',
            videoUrl: youtubeUrl,
            youtubeId: videoId || undefined,
            status: publish ? 'Published' : 'Draft',
            type: 'standard',
        };
        await onSave(newArticle);
        handleClose();
    };
    
    const handleClose = () => {
        setYoutubeUrl('');
        setGeneratedArticle(null);
        setIsLoading(false);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-2xl border border-border-color max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 flex items-center"><FilmIcon className="h-6 w-6 mr-2 text-primary"/> Create Article from YouTube</h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input type="url" placeholder="Paste YouTube URL here..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="flex-grow p-2 bg-surface-light rounded border border-border-color" />
                        <button onClick={handleGenerate} disabled={isLoading || isSaving} className="btn-primary px-4 py-2 rounded flex items-center space-x-2 text-sm">
                            {isLoading ? <AILoadingSpinner /> : <SparklesIcon className="h-5 w-5" />}
                            <span>Generate Article</span>
                        </button>
                    </div>

                    {isLoading && (
                        <div className="text-center p-8 bg-surface-light rounded-lg">
                            <AILoadingSpinner />
                            <p className="mt-2 text-text-secondary">AI is analyzing the video... this may take a moment.</p>
                        </div>
                    )}
                    
                    {generatedArticle && (
                        <div className="space-y-4 border-t border-border-color pt-4 animate-fade-in-up">
                            <h3 className="text-lg font-bold text-secondary">Review & Edit Generated Content</h3>
                             <div>
                                <label className="text-sm font-bold text-text-secondary">Title</label>
                                <input type="text" value={generatedArticle.title} onChange={e => setGeneratedArticle(g => g && ({...g, title: e.target.value}))} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-secondary">Summary</label>
                                <textarea value={generatedArticle.summary} onChange={e => setGeneratedArticle(g => g && ({...g, summary: e.target.value}))} rows={2} className="w-full p-2 bg-surface-light rounded border border-border-color"></textarea>
                            </div>
                             <div>
                                <label className="text-sm font-bold text-text-secondary">Full Content</label>
                                <textarea value={generatedArticle.content} onChange={e => setGeneratedArticle(g => g && ({...g, content: e.target.value}))} rows={8} className="w-full p-2 bg-surface-light rounded border border-border-color"></textarea>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-4 pt-4 border-t border-border-color">
                        <button type="button" onClick={handleClose} disabled={isSaving} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color disabled:opacity-50">Cancel</button>
                        <button type="button" onClick={() => handleSave(false)} disabled={!generatedArticle || isSaving} className="btn-secondary px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed w-36 flex justify-center">
                           {isSaving ? <AILoadingSpinner /> : 'Save as Draft'}
                        </button>
                        <button type="button" onClick={() => handleSave(true)} disabled={!generatedArticle || isSaving} className="btn-primary px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed w-28 flex justify-center">
                             {isSaving ? <AILoadingSpinner /> : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArticleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    article: Article | null;
    onSave: (article: Omit<Article, 'id' | 'timestamp' | 'likes' | 'comments' | 'author'> | Article) => Promise<any>;
}> = ({ isOpen, onClose, article, onSave }) => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('Umum');
    const [youtubeId, setYoutubeId] = useState('');
    const [type, setType] = useState<Article['type']>('standard');
    const [pollOptions, setPollOptions] = useState<{text: string}[]>([{text: ''}, {text: ''}]);
    const [isSaving, setIsSaving] = useState(false);
    
    const [isGenerating, setIsGenerating] = useState({ draft: false, summary: false, titles: false });

    React.useEffect(() => {
        if (isOpen) {
            setIsSaving(false);
            if (article) {
                setTitle(article.title);
                setSummary(article.summary);
                setContent(article.content);
                setImageUrl(article.imageUrl);
                setCategory(article.category);
                setYoutubeId(article.youtubeId || '');
                setType(article.type || 'standard');
                setPollOptions(article.pollOptions?.map(opt => ({ text: opt.text })) || [{text: ''}, {text: ''}])
            } else {
                setTitle('');
                setSummary('');
                setContent('');
                setImageUrl('https://picsum.photos/seed/' + Date.now() + '/800/400');
                setCategory('Umum');
                setYoutubeId('');
                setType('standard');
                setPollOptions([{text: ''}, {text: ''}]);
            }
        }
    }, [article, isOpen]);
    
    const callGemini = async (prompt: string) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Gemini API call failed:", error);
            alert("An error occurred while contacting the AI. Please check the console for details.");
            return null;
        }
    };

    const handleGenerateDraft = async () => {
        if (!title) {
            alert("Please provide a title first to generate a draft.");
            return;
        }
        setIsGenerating(prev => ({ ...prev, draft: true }));
        const prompt = `Based on the title "${title}", write a draft for a news article for employees. Make it informative and engaging. Structure it with a few paragraphs.`;
        const result = await callGemini(prompt);
        if (result) {
            setContent(result);
        }
        setIsGenerating(prev => ({ ...prev, draft: false }));
    };

    const handleGenerateSummary = async () => {
        if (!content) {
            alert("Please write the full content first to generate a summary.");
            return;
        }
        setIsGenerating(prev => ({ ...prev, summary: true }));
        const prompt = `Summarize the following text in one or two short sentences: "${content}"`;
        const result = await callGemini(prompt);
        if (result) {
            setSummary(result);
        }
        setIsGenerating(prev => ({ ...prev, summary: false }));
    };
    
    const handleSuggestTitles = async () => {
        if (!content && !title) {
            alert("Please provide a title or some content to get title suggestions.");
            return;
        }
        setIsGenerating(prev => ({ ...prev, titles: true }));
        const context = content || `An article with the title: ${title}`;
        const prompt = `Suggest 5 alternative, engaging titles for an article with the following content: "${context}". Return only the titles, each on a new line.`;
        const result = await callGemini(prompt);
        if (result) {
            alert("Suggested Titles:\n\n" + result);
        }
        setIsGenerating(prev => ({ ...prev, titles: false }));
    };
    
    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index].text = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => setPollOptions([...pollOptions, { text: '' }]);
    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const handleSave = async (publish: boolean) => {
        const finalStatus = publish ? 'Published' : 'Draft';
        if (!title || !summary || !content || !imageUrl || !category) {
            alert("Please fill in all required fields.");
            return;
        }
        if (type === 'poll' && pollOptions.some(opt => !opt.text.trim())) {
            alert("Please fill in all poll options or remove empty ones.");
            return;
        }

        setIsSaving(true);
        const articleData: any = { title, summary, content, imageUrl, category, youtubeId, status: finalStatus, type };
        
        if (type === 'poll') {
            articleData.pollOptions = pollOptions.filter(opt => opt.text.trim()).map(opt => ({ text: opt.text, votes: [] }));
        }
        
        const dataToSave = article ? { ...article, ...articleData } : articleData;
        
        await onSave(dataToSave);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-2xl border border-border-color max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{article ? 'Edit Article' : 'Add New Article'}</h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="flex-grow p-2 bg-surface-light rounded border border-border-color" />
                        <button onClick={handleSuggestTitles} disabled={isGenerating.titles} className="btn-secondary px-3 py-2 rounded flex items-center space-x-2 text-sm">
                            {isGenerating.titles ? <AILoadingSpinner /> : <SparklesIcon className="h-4 w-4" />}
                            <span>Suggest</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <input type="text" placeholder="Summary" value={summary} onChange={e => setSummary(e.target.value)} required className="flex-grow p-2 bg-surface-light rounded border border-border-color" />
                         <button onClick={handleGenerateSummary} disabled={isGenerating.summary || !content} className="btn-secondary px-3 py-2 rounded flex items-center space-x-2 text-sm disabled:opacity-50">
                            {isGenerating.summary ? <AILoadingSpinner /> : <SparklesIcon className="h-4 w-4" />}
                            <span>Generate</span>
                        </button>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="text-sm font-bold text-text-secondary">Full Content</label>
                             <button onClick={handleGenerateDraft} disabled={isGenerating.draft || !title} className="btn-secondary px-3 py-1 rounded flex items-center space-x-2 text-xs disabled:opacity-50">
                                {isGenerating.draft ? <AILoadingSpinner /> : <SparklesIcon className="h-4 w-4" />}
                                <span>Generate Draft from Title</span>
                            </button>
                        </div>
                        <textarea placeholder="Full Content" value={content} onChange={e => setContent(e.target.value)} required rows={8} className="w-full p-2 bg-surface-light rounded border border-border-color"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="p-2 bg-surface-light rounded border border-border-color" />
                        <input type="text" placeholder="YouTube Video ID (e.g., dQw4w9WgXcQ)" value={youtubeId} onChange={e => setYoutubeId(e.target.value)} className="p-2 bg-surface-light rounded border border-border-color" />
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color">
                            <option>Umum</option>
                            <option>Kesehatan</option>
                            <option>Keuangan</option>
                            <option>Perusahaan</option>
                            <option>Video Feature</option>
                        </select>
                         <select value={type} onChange={e => setType(e.target.value as Article['type'])} className="w-full p-2 bg-surface-light rounded border border-border-color">
                            <option value="standard">Standard</option>
                            <option value="poll">Polling</option>
                            <option value="qa">Q&A</option>
                        </select>
                    </div>

                    {type === 'poll' && (
                        <div className="space-y-2 p-3 bg-surface-light rounded-lg border border-border-color">
                            <h3 className="text-sm font-bold text-text-secondary mb-2">Poll Options</h3>
                            {pollOptions.map((opt, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input type="text" placeholder={`Option ${index + 1}`} value={opt.text} onChange={e => handlePollOptionChange(index, e.target.value)} className="flex-grow p-2 bg-surface rounded border border-border-color" />
                                    <button onClick={() => removePollOption(index)} disabled={pollOptions.length <= 2} className="p-2 text-red-500 disabled:opacity-50"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            ))}
                            <button onClick={addPollOption} className="text-sm text-primary font-semibold">+ Add Option</button>
                        </div>
                    )}


                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color disabled:opacity-50">Cancel</button>
                        <button type="button" onClick={() => handleSave(false)} disabled={isSaving} className="btn-secondary px-4 py-2 rounded w-36 flex justify-center">
                            {isSaving ? <AILoadingSpinner /> : 'Save as Draft'}
                        </button>
                        <button type="button" onClick={() => handleSave(true)} disabled={isSaving} className="btn-primary px-4 py-2 rounded w-28 flex justify-center">
                             {isSaving ? <AILoadingSpinner /> : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminInfoNewsManagement: React.FC = () => {
    const { articles, addArticle, editArticle, toggleArticleAdMonetization } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [updatingAdId, setUpdatingAdId] = useState<string | null>(null);

    const handleOpenModal = (article: Article | null = null) => {
        setSelectedArticle(article);
        setIsModalOpen(true);
    };
    
    const handleToggleAd = async (articleId: string) => {
        setUpdatingAdId(articleId);
        await toggleArticleAdMonetization(articleId);
        setUpdatingAdId(null);
    };

    const handleSave = async (articleData: Omit<Article, 'id' | 'timestamp' | 'likes' | 'comments' | 'author'> | Article) => {
        const result = 'id' in articleData
            ? await editArticle(articleData)
            : await addArticle(articleData);

        if (!result.success) {
            alert("Failed to save article. Please try again.");
            // Keep modal open on failure to allow user to retry
            if ('id' in articleData) {
                setIsModalOpen(true);
            } else {
                setIsYouTubeModalOpen(true);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Info & News Management</h1>
                <div className="flex space-x-2">
                    <button onClick={() => setIsYouTubeModalOpen(true)} className="btn-secondary flex items-center px-4 py-2 rounded">
                        <FilmIcon className="h-5 w-5 mr-2" /> Create from YouTube
                    </button>
                    <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                        <PlusIcon className="h-5 w-5 mr-2" /> Add Article
                    </button>
                </div>
            </div>
            
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map(article => {
                        const isAdEnabled = article.monetization?.enabled || false;
                        const adRevenue = article.monetization?.revenueGenerated || 0;
                        
                        return (
                            <div key={article.id} className="bg-surface-light p-4 rounded-lg border border-border-color flex flex-col">
                                <div className="relative">
                                    <span className={`absolute top-2 right-2 text-xs font-bold py-1 px-2 rounded ${article.status === 'Published' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-black'}`}>
                                        {article.status}
                                    </span>
                                    <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover rounded-md mb-4" />
                                </div>
                                <h3 className="text-lg font-bold truncate flex-grow">{article.title}</h3>
                                <p className="text-sm text-text-secondary truncate">{article.summary}</p>
                                
                                <div className="mt-4 border-t border-border-color pt-3">
                                    <h4 className="text-sm font-bold text-text-secondary mb-2">Ad Monetization</h4>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            {updatingAdId === article.id ? (
                                                <AILoadingSpinner />
                                            ) : (
                                                <Toggle 
                                                    checked={isAdEnabled}
                                                    onChange={() => handleToggleAd(article.id)}
                                                />
                                            )}
                                            <span className={`text-sm font-semibold ${isAdEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                                {isAdEnabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                         {isAdEnabled && (
                                            <div className="flex items-center text-xs font-bold text-primary">
                                                <BanknotesIcon className="h-4 w-4 mr-1"/>
                                                Est. Revenue: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adRevenue)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end space-x-2 border-t border-border-color pt-3">
                                    <button onClick={() => handleOpenModal(article)} className="p-2 rounded hover:bg-border-color"><PencilIcon className="h-5 w-5 text-yellow-400"/></button>
                                    <button className="p-2 rounded hover:bg-border-color"><TrashIcon className="h-5 w-5 text-red-400"/></button>
                                </div>
                            </div>
                        )
                    })}
                </div>
                 {articles.length === 0 && <p className="text-center text-text-secondary py-8">No articles found. Click "Add Article" to create one.</p>}
            </div>

            <ArticleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} article={selectedArticle} onSave={handleSave} />
            <YouTubeArticleModal isOpen={isYouTubeModalOpen} onClose={() => setIsYouTubeModalOpen(false)} onSave={handleSave} />
        </div>
    );
};

export default AdminInfoNewsManagement;