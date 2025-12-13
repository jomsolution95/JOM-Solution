import React from 'react';
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { CVtheque as CVthequeContent } from '../pages/CVtheque';

export const CVtheque: React.FC = () => {
    return (
        <PremiumFeatureGuard featureId="cvtheque">
            <CVthequeContent />
        </PremiumFeatureGuard>
    );
};

export default CVtheque;
