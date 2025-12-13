import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper'; // Assuming this exists or is exported from CVBuilder context

interface SortableSectionProps {
    id: string;
    title: string;
    icon: any;
    isHidden: boolean;
    onToggleVisibility: () => void;
    children: React.ReactNode;
}

export const SortableSection: React.FC<SortableSectionProps> = ({
    id,
    title,
    icon: Icon,
    isHidden,
    onToggleVisibility,
    children
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '1rem'
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header with Drag Handle */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <button
                            {...attributes}
                            {...listeners}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing p-1"
                        >
                            <GripVertical className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
                            <Icon className="w-5 h-5" />
                            <span>{title}</span>
                        </div>
                    </div>

                    <button
                        onClick={onToggleVisibility}
                        className={`p-2 rounded-lg transition-colors ${isHidden
                                ? 'text-gray-400 hover:text-gray-600 bg-gray-100'
                                : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                            }`}
                        title={isHidden ? "Afficher" : "Masquer"}
                    >
                        {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {/* Content */}
                {!isHidden && (
                    <div className="p-4">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};
