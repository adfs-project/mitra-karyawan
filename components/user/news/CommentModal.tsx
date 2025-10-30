import React, { useState, useRef, useEffect } from 'react';
import { Article } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
// FIX: Replaced useCore with useApp as DataContext is deprecated.
import { useApp } from '../../../contexts/AppContext';
import { XMarkIcon, PaperAirplaneIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';

const CommentModal: React.FC<{ isOpen: boolean; onClose: () => void; article: Article | null; }> = ({ isOpen, onClose, article }) => {
    const { user } = useAuth();
    const { addArticleComment, toggleCommentLike } = useApp();
    const [newComment, setNewComment] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isOpen, article?.comments.length]);

    if (!isOpen || !article) return null;

    const handleAddComment = () => {
        addArticleComment(article.id, newComment);
        setNewComment('');
    };
    
    const sortedComments = article.type === 'qa' 
        ? [...article.comments].sort((a, b) => b.likes.length - a.likes.length)
        : article.comments;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg shadow-lg w-full max-w-lg h-[80vh] border border-border-color flex flex-col">
                <header className="p-4 border-b border-border-color flex justify-between items-center">
                    <h2 className="text-lg font-bold text-primary">Komentar ({article.comments.length})</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light">
                        <XMarkIcon className="h-6 w-6 text-text-secondary" />
                    </button>
                </header>
                
                <main className="flex-grow p-4 overflow-y-auto space-y-4">
                    {sortedComments.map((comment, index) => {
                        const isLiked = user ? comment.likes.includes(user.id) : false;
                        return (
                            <div key={index} className="flex items-start space-x-3">
                                <img src={`https://i.pravatar.cc/150?u=${comment.userId}`} alt={comment.userName} className="w-8 h-8 rounded-full" />
                                <div className="flex-grow bg-surface-light p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-sm text-text-primary">{comment.userName}</p>
                                        <span className="text-xs text-text-secondary">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm mt-1">{comment.comment}</p>
                                    {article.type === 'qa' && (
                                        <button onClick={() => toggleCommentLike(article.id, comment.timestamp)} className="flex items-center space-x-1 text-xs mt-2 text-text-secondary hover:text-primary">
                                            {isLiked ? <HandThumbUpSolidIcon className="h-4 w-4 text-primary" /> : <HandThumbUpIcon className="h-4 w-4" />}
                                            <span>{comment.likes.length} Suka</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={commentsEndRef} />
                </main>

                <footer className="p-4 border-t border-border-color">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                            placeholder="Tulis komentar..."
                            className="w-full bg-surface-light border border-border-color rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={handleAddComment} disabled={!newComment.trim()} className="p-2 btn-secondary rounded-full disabled:opacity-50">
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CommentModal;