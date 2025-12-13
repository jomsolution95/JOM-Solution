import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
    id: string;
    label: string;
    color: string;
    count: number;
    children: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    id,
    label,
    color,
    count,
    children,
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`rounded-xl border-2 transition-all ${isOver
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
        >
            {/* Column Header */}
            <div className={`${color} px-4 py-3 rounded-t-xl border-b border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">{label}</h3>
                    <span className="px-2 py-1 bg-white dark:bg-gray-900 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
                        {count}
                    </span>
                </div>
            </div>

            {/* Column Content */}
            <div className="p-4 min-h-[500px]">
                {children}
            </div>
        </div>
    );
};
