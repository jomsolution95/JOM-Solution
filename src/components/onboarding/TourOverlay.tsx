import React, { useEffect, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { TOUR_CONFIGS } from './tourConfig';
import { GuideTooltip } from './GuideTooltip';

export const TourOverlay: React.FC = () => {
    const { activeGuide, currentStep, isTourActive, nextStep, prevStep, skipTour, endTour } = useOnboardingStore();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

    const steps = activeGuide ? TOUR_CONFIGS[activeGuide] : [];
    const currentStepConfig = steps[currentStep];

    const updatePosition = () => {
        if (!currentStepConfig) return;

        const element = document.querySelector(currentStepConfig.target);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);

            // Calculate tooltip position
            const tooltipWidth = 320; // approximate
            const tooltipHeight = 200; // approximate
            const gap = 15;

            let top = rect.bottom + gap + window.scrollY;
            let left = rect.left + (rect.width / 2) - (tooltipWidth / 2) + window.scrollX;

            // Simple boundary checks (can be improved)
            if (left < 10) left = 10;
            if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - 10;

            if (currentStepConfig.position === 'right') {
                top = rect.top + (rect.height / 2) - (tooltipHeight / 2) + window.scrollY;
                left = rect.right + gap + window.scrollX;
            }

            setTooltipStyle({
                top: `${top}px`,
                left: `${left}px`
            });

            // Scroll into view if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Element not found - skip step or wait?
            // For now, we'll just not show the highlight
            setTargetRect(null);
        }
    };

    useLayoutEffect(() => {
        if (isTourActive) {
            // Tiny delay to ensure DOM is ready (e.g., after navigation)
            const timer = setTimeout(updatePosition, 100);
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition);
            };
        }
    }, [currentStep, isTourActive, activeGuide]);

    if (!isTourActive || !activeGuide || !currentStepConfig) return null;

    return createPortal(
        <>
            {/* Backdrop / Mask */}
            <div className="fixed inset-0 z-[9998] pointer-events-none">
                {/* This path creates a cutout for the target element */}
                {targetRect && (
                    <div
                        className="absolute inset-0 bg-black/50 transition-all duration-300 ease-in-out"
                        style={{
                            clipPath: `polygon(
                                0% 0%, 
                                0% 100%, 
                                ${targetRect.left}px 100%, 
                                ${targetRect.left}px ${targetRect.top}px, 
                                ${targetRect.right}px ${targetRect.top}px, 
                                ${targetRect.right}px ${targetRect.bottom}px, 
                                ${targetRect.left}px ${targetRect.bottom}px, 
                                ${targetRect.left}px 100%, 
                                100% 100%, 
                                100% 0%
                            )`
                        }}
                    />
                )}
                {/* Highlight Box Border */}
                {targetRect && (
                    <div
                        className="absolute transition-all duration-300 ease-in-out border-2 border-blue-500 rounded shadow-[0_0_0_4px_rgba(59,130,246,0.3)] pointer-events-none"
                        style={{
                            top: targetRect.top + window.scrollY,
                            left: targetRect.left + window.scrollX,
                            width: targetRect.width,
                            height: targetRect.height,
                        }}
                    />
                )}
            </div>

            {/* Tooltip */}
            <GuideTooltip
                stepIndex={currentStep}
                totalSteps={steps.length}
                title={currentStepConfig.title}
                content={currentStepConfig.content}
                onNext={nextStep}
                onPrev={prevStep}
                onSkip={skipTour}
                onFinish={endTour}
                position={currentStepConfig.position}
                style={tooltipStyle}
            />
        </>,
        document.body
    );
};
