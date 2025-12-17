
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
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3 text-justify">{post.content}</p>

        {post.image && (
          <img src={post.image} alt="Post content" className="rounded-xl w-full object-cover max-h-96 mb-3" />
        )}

        {/* JOB OFFER CARD */}
        {post.type === 'job_offer' && post.jobDetails && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-900 dark:text-white text-base mb-1">{post.jobDetails.title}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> {post.jobDetails.location}
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="font-medium text-green-600 dark:text-green-400">{post.jobDetails.salary}</span>
                </p>
                <Link to={`/jobs/${post.id}`} className="mt-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-block transition-colors">Postuler</Link>
              </div>
            </div>
          </div>
        )}

        {/* SERVICE OFFER CARD */}
        {post.type === 'service_offer' && post.serviceDetails && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-900 dark:text-white text-base mb-1">{post.serviceDetails.title}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{post.serviceDetails.category}</p>
                <p className="font-bold text-lg text-primary-600 dark:text-primary-400">{post.serviceDetails.price?.toLocaleString()} FCFA</p>
                <Link to={`/services/${post.id}`} className="mt-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg inline-block transition-colors">Commander</Link>
              </div>
            </div>
          </div>
        )}

        {/* TRAINING OFFER CARD */}
        {post.type === 'training_offer' && post.trainingDetails && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-900 dark:text-white text-base mb-1">{post.trainingDetails.title}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{post.trainingDetails.level}</p>
                <p className="font-bold text-lg text-primary-600 dark:text-primary-400">{post.trainingDetails.price === 0 ? 'Gratuit' : `${post.trainingDetails.price?.toLocaleString()} FCFA`}</p>
                <Link to={`/formations/${post.id}`} className="mt-3 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg inline-block transition-colors">S'inscrire</Link>
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
