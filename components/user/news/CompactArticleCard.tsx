import React from 'react';
import { Article } from '../../../types';
import { Link } from 'react-router-dom';

const CompactArticleCard: React.FC<{ article: Article }> = ({ article }) => {
    return (
        <Link to="/news" className="bg-surface p-3 rounded-lg flex items-center space-x-4 border border-border-color hover:bg-surface-light transition-colors">
            {article.imageUrl ? (
                <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                />
            ) : article.youtubeId ? (
                 <img 
                    src={`https://img.youtube.com/vi/${article.youtubeId}/mqdefault.jpg`} 
                    alt={article.title} 
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-16 h-16 rounded-md bg-surface-light flex-shrink-0"></div>
            )}
            <div className="flex-grow overflow-hidden">
                <span className="text-xs bg-secondary/20 text-secondary font-bold py-0.5 px-2 rounded">{article.category}</span>
                <p className="font-semibold text-text-primary text-sm mt-1 truncate">{article.title}</p>
                <p className="text-xs text-text-secondary truncate">{article.summary}</p>
            </div>
        </Link>
    );
};

export default CompactArticleCard;
