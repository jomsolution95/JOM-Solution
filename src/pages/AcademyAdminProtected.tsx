import React from 'react';
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { AcademyAdmin as AcademyAdminContent } from '../pages/AcademyAdmin';

export const AcademyAdminProtected: React.FC = () => {
    return (
        <PremiumFeatureGuard featureId="courses">
            <AcademyAdminContent />
        </PremiumFeatureGuard>
    );
};

export default AcademyAdminProtected;
