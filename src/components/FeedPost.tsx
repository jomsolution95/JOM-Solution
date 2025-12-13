
import React from 'react';
import { Link } from 'react-router-dom';
import { SocialPost } from '../types';
import { MapPin, MoreVertical, Heart, MessageCircle, Share2, Briefcase } from 'lucide-react';

export const FeedPost: React.FC<{ post: SocialPost }> = ({ post }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <Link to={`/profile/${post.author.id}`}>
             <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
          </Link>
          <div>
            <Link to={`/profile/${post.author.id}`} className="font-bold text-gray-900 dark:text-white text-sm hover:underline">{post.author.name}</Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">{post.author.headline}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              {post.timestamp}
              {post.location && <span>• <MapPin className="w-3 h-3 inline" /> {post.location}</span>}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">{post.content}</p>
        
        {post.image && (
          <img src={post.image} alt="Post content" className="rounded-xl w-full object-cover max-h-96 mb-3" />
        )}

        {post.type === 'job_offer' && post.jobDetails && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 mb-3">
             <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
                   <Briefcase className="w-6 h-6" />
                </div>
                <div>
                   <h5 className="font-bold text-gray-900 dark:text-white">{post.jobDetails.title}</h5>
                   <p className="text-sm text-gray-500 dark:text-gray-400">{post.jobDetails.location} • {post.jobDetails.salary}</p>
                   <Link to="/jobs" className="mt-2 text-sm font-bold text-primary-600 hover:underline inline-block">Voir l'offre</Link>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
         <button className={`flex items-center gap-1.5 text-sm font-medium ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}>
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
            {post.likes}
         </button>
         <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
            <MessageCircle className="w-5 h-5" />
            {post.comments}
         </button>
         <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors">
            <Share2 className="w-5 h-5" />
            {post.shares}
         </button>
      </div>
    </div>
  );
};
