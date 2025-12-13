import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Mail, Phone, Calendar, FileText, Star, ExternalLink } from 'lucide-react';
import { Application } from '../pages/ATSPage';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationCardProps {
    application: Application;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
    const [showDetails, setShowDetails] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: application._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
        >
            {/* Candidate Info */}
            <div className="flex items-start gap-3 mb-3">
                {application.candidateAvatar ? (
                    <img
                        src={application.candidateAvatar}
                        alt={application.candidateName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {application.candidateName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {application.jobTitle}
                    </p>
                </div>

                {application.rating && (
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {application.rating}
                        </span>
                    </div>
                )}
            </div>

            {/* Quick Info */}
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{application.candidateEmail}</span>
                </div>

                {application.candidatePhone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <span>{application.candidatePhone}</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                        Applied {formatDistanceToNow(new Date(application.appliedDate), { addSuffix: true })}
                    </span>
                </div>

                {application.interviewDate && (
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>
                            Interview: {new Date(application.interviewDate).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                {application.resumeUrl && (
                    <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        <FileText className="w-3 h-3" />
                        Resume
                    </a>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(!showDetails);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded text-xs font-medium text-primary-700 dark:text-primary-400 transition-colors"
                >
                    <ExternalLink className="w-3 h-3" />
                    Details
                </button>
            </div>

            {/* Notes Preview */}
            {application.notes && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                    {application.notes}
                </div>
            )}
        </div>
    );
};
