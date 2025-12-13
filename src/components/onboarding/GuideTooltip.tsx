import React from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface GuideTooltipProps {
    stepIndex: number;
    totalSteps: number;
    title: string;
    content: string;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    onFinish: () => void;
    position?: 'top' | 'bottom' | 'left' | 'right';
    style?: React.CSSProperties;
}

export const GuideTooltip: React.FC<GuideTooltipProps> = ({
    stepIndex,
    totalSteps,
    title,
    content,
    onNext,
    onPrev,
    onSkip,
    onFinish,
    style,
}) => {
    const isLast = stepIndex === totalSteps - 1;

    return (
        <div
            className="fixed z-[9999] bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 w-80 p-5 animate-in fade-in zoom-in-95 duration-200"
            style={style}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-blue-900">{title}</h3>
                <button onClick={onSkip} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {content}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full ${i === stepIndex ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {stepIndex > 0 && (
                        <button
                            onClick={onPrev}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={isLast ? onFinish : onNext}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-all"
                    >
                        {isLast ? 'Terminer' : 'Suivant'}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-gray-200"></div>
        </div>
    );
};
