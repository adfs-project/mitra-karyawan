import React, { useState } from 'react';
import { Article } from '../../../packages/shared/types';
// FIX: Replaced useCore with useApp as DataContext is deprecated.
import { useData } from '../../../packages/shared/contexts/DataContext';
import { useAuth } from '../../../packages/shared/contexts/AuthContext';
import { BookmarkIcon, ChatBubbleBottomCenterTextIcon, HandThumbUpIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const PollComponent: React.FC<{ article: Article }> = ({ article }) => {
    const { voteOnPoll } = useData();
    const { user } = useAuth();

    const totalVotes = article.pollOptions?.reduce((sum, opt) => sum + opt.votes.length, 0) || 0;
    const userHasVoted = article.pollOptions?.some(opt => opt.votes.includes(user!.id));

    return (
        <div className="mt-4 space-y-2">
            {article.pollOptions?.map((option, index) => {
                const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                return (
                    <div key={index}>
                        {userHasVoted ? (
                             <div className="relative w-full bg-surface-light rounded-full h-8 flex items-center justify-between px-3 text-sm">
                                <div className="absolute top-0 left-0 h-full bg-primary/30 rounded-full" style={{ width: `${percentage}%` }}></div>
                                <span className="relative font-semibold">{option.text}</span>
                                <span className="relative font-bold">{percentage.toFixed(0)}%</span>
                            </div>
                        ) : (
                            <button onClick={() => voteOnPoll(article.id, index)} className="w-full text-left p-2 bg-surface-light rounded-full hover:bg-primary hover:text-black font-semibold text-sm">
                                {option.text}
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

const LazyVideo: React.FC<{ youtubeId: string; title: string }> = ({ youtubeId, title }) => {
    const [showVideo, setShowVideo] = useState(false);

    if (showVideo) {
        return (
            <div className="aspect-video">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black cursor-pointer group" onClick={() => setShowVideo(true)}>
            <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 p-4 rounded-full transition-transform group-hover:scale-110">
                    <PlayCircleIcon className="h-12 w-12 text-white" />
                </div>
            </div>
        </div>
    );
};


const ArticleCard: React.FC<{ article: Article; onOpenComments: () => void; }> = ({ article, onOpenComments }) => {
    const { user } = useAuth();
    const { toggleArticleLike, toggleArticleBookmark } = useData();
    
    const isLiked = user ? article.likes.includes(user.id) : false;
    const isBookmarked = user ? user.bookmarkedArticles.includes(article.id) : false;

    return (
        <div className="bg-surface rounded-lg overflow-hidden border border-border-color">
            {article.youtubeId ? (
                <LazyVideo youtubeId={article.youtubeId} title={article.title} />
            ) : (
                 article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover" />
            )}
            
            <div className="p-4">
                <span className="text-xs bg-secondary/20 text-secondary font-bold py-1 px-2 rounded">{article.category}</span>
                <h2 className="text-lg font-bold text-text-primary mt-2">{article.title}</h2>
                <p className="text-sm text-text-secondary mt-1">{article.summary}</p>
                
                {article.type === 'poll' && <PollComponent article={article} />}

                <div className="flex items-center justify-between mt-4 text-text-secondary text-sm">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => toggleArticleLike(article.id)} className="flex items-center space-x-1 hover:text-primary">
                            {isLiked ? <HandThumbUpSolidIcon className="h-5 w-5 text-primary" /> : <HandThumbUpIcon className="h-5 w-5" />}
                            <span>{article.likes.length}</span>
                        </button>
                         <button onClick={onOpenComments} className="flex items-center space-x-1 hover:text-primary">
                            <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                            <span>{article.comments.length}</span>
                        </button>
                    </div>
                     <div className="flex items-center space-x-2">
                        <span className="text-xs">{new Date(article.timestamp).toLocaleDateString()} by {article.author}</span>
                        <button onClick={() => toggleArticleBookmark(article.id)}>
                            {isBookmarked ? <BookmarkSolidIcon className="h-6 w-6 text-primary" /> : <BookmarkIcon className="h-6 w-6 hover:text-primary" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;